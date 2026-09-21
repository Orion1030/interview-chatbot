'use client'

import * as React from 'react'
import { useChat, type UIMessage } from '@ai-sdk/react'
import { DefaultChatTransport } from 'ai'
import { useMemo, useEffect, useState, useRef } from 'react'

import { cn } from '@/lib/utils'
import { getHistory } from '@/lib/session-history'
import { ChatList } from '@/components/chat-list'
import { ChatPanel } from '@/components/chat-panel'
import { ChatScrollAnchor } from '@/components/chat-scroll-anchor'
import { useSession } from '@/components/session-provider'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Textarea } from './ui/textarea'
import { toast } from 'react-hot-toast'

const IS_PREVIEW = process.env.VERCEL_ENV === 'preview'
export interface ChatProps extends React.ComponentProps<'div'> {
  initialMessages?: UIMessage[]
  id?: string
}

export function Resume({ id, initialMessages, className }: ChatProps) {
  const {
    currentSessionId,
    currentProfile,
    sessionHistory,
    loadSession,
    startNewSession,
    saveCurrentSession,
    clearCurrentSession
  } = useSession()

  const [previewTokenDialog, setPreviewTokenDialog] = useState(false)
  const [techStack, setTechStack] = useState('')
  const [profile, setProfile] = useState('')
  const [input, setInput] = useState('')

  const isInitialMount = useRef(true)
  const prevStatusRef = useRef<string | undefined>(undefined)

  const transport = useMemo(
    () =>
      new DefaultChatTransport({
        api: '/api/resume',
        body: {
          id,
          techStack,
          profile
        }
      }),
    [id, techStack, profile]
  )

  const {
    messages,
    setMessages,
    sendMessage,
    regenerate,
    stop,
    status,
    error
  } = useChat({
    messages: initialMessages ?? [],
    id,
    transport,
    onError(error) {
      if (error.message.includes('401')) {
        toast.error('Unauthorized')
      }
    }
  })

  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false
      prevStatusRef.current = status
      return
    }

    const prevStatus = prevStatusRef.current
    if (prevStatus === 'streaming' && status === 'ready') {
      saveCurrentSession(messages, {
        techStack,
        profileTitle: profile
      })
    }

    prevStatusRef.current = status
  }, [status, messages, techStack, profile, saveCurrentSession])

  useEffect(() => {
    if (currentSessionId) {
      stop()
      const session = sessionHistory.find(h => h.id === currentSessionId) || getHistory().find(h => h.id === currentSessionId)
      if (session) {
        setMessages(session.messages)
        setTechStack(session.meta?.techStack || '')
        setProfile(session.meta?.profileTitle || '')
      }
    } else if (!isInitialMount.current) {
      stop()
      setMessages([])
      setTechStack('')
      setProfile('')
    }
  }, [currentSessionId, sessionHistory, setMessages, stop])

  useEffect(() => {
    const handleStartSession = (e: Event) => {
      const custom = e as CustomEvent<{ profileName: string; mode: 'chat' | 'resume' }>
      const { profileName, mode } = custom.detail
      if (mode === 'resume') {
        if (currentSessionId && messages.length > 0) {
          saveCurrentSession(messages, {
            techStack,
            profileTitle: profile
          })
        }
        startNewSession(profileName, 'resume')
        setMessages([])
        setInput('')
        setTechStack('')
        setProfile('')
      }
    }
    window.addEventListener('start-session', handleStartSession)
    return () => window.removeEventListener('start-session', handleStartSession)
  }, [startNewSession, saveCurrentSession, currentSessionId, messages, techStack, profile, setMessages])

  const handleSubmit = async (text: string) => {
    setInput('')
    await sendMessage({ text })
  }

  return (
    <>
      <div className={cn('pb-[200px] pt-4 md:pt-10', className)}>
        {!currentProfile ? (
          <div className="mx-auto max-w-2xl px-4">
            <div className="rounded-lg border bg-background p-8 text-center">
              <h1 className="mb-2 text-lg font-semibold">No Profile Selected</h1>
              <p className="mb-4 leading-normal text-muted-foreground">
                Please create or select a profile from the sidebar to start.
              </p>
            </div>
          </div>
        ) : messages.length ? (
          <>
            <ChatList messages={messages} />
            <ChatScrollAnchor trackVisibility={status !== 'ready'} />
          </>
        ) : (
          <div className="mx-auto max-w-2xl px-4">
            <div className="rounded-lg border bg-background p-8">
              <h1 className="mb-2 text-lg font-semibold">
                Welcome to TR Internal Resume Builder!
              </h1>
              <p className="mb-2 leading-normal text-muted-foreground">
                This is AI Resume builder.
              </p>
            </div>
          </div>
        )}
      </div>
      <ChatPanel
        id={id}
        status={status}
        stop={stop}
        sendMessage={sendMessage}
        regenerate={regenerate}
        input={input}
        setInput={setInput}
        messages={messages}
        disabled={!currentProfile}
      />

      <div className="fixed top-[15%] left-[20px] flex gap-2">
        <Button variant="outline" onClick={() => setPreviewTokenDialog(true)}>
          Setting
        </Button>
      </div>

      <Dialog open={previewTokenDialog} onOpenChange={setPreviewTokenDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Enter Information for Resume</DialogTitle>
            <DialogDescription>This is for AI resume writer.</DialogDescription>
          </DialogHeader>

          <DialogDescription className="mt-[10px]">
            Profile Title: eg : FullStack developer
          </DialogDescription>
          <Input
            value={profile}
            placeholder="Profile title"
            onChange={e => setProfile(e.target.value)}
          />

          <DialogDescription className="mt-[10px]">
            Technical Stack: eg : React.js, Asp.Net, Python
          </DialogDescription>
          <Input
            value={techStack}
            placeholder="Technical Stack"
            onChange={e => setTechStack(e.target.value)}
          />
          <DialogFooter className="items-center">
            <Button
              onClick={() => {
                saveCurrentSession(messages, {
                  techStack,
                  profileTitle: profile
                })
                setPreviewTokenDialog(false)
              }}
            >
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
