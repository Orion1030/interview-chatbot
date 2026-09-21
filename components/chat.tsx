'use client'

import * as React from 'react'
import { useChat, type UIMessage } from '@ai-sdk/react'
import { DefaultChatTransport } from 'ai'
import { useMemo, useEffect, useState, useRef } from 'react'
import { toast } from 'react-hot-toast'

import { cn } from '@/lib/utils'
import { ChatList } from '@/components/chat-list'
import { ChatPanel } from '@/components/chat-panel'
import { EmptyScreen } from '@/components/empty-screen'
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import { IconCopy, IconCheck } from '@/components/ui/icons'

const IS_PREVIEW = process.env.VERCEL_ENV === 'preview'
export interface ChatProps extends React.ComponentProps<'div'> {
  initialMessages?: UIMessage[]
  id?: string
}

export function Chat({ id, initialMessages, className }: ChatProps) {
  const {
    currentSessionId,
    currentProfile,
    profiles,
    loadSession,
    startNewSession,
    saveCurrentSession,
    clearCurrentSession
  } = useSession()

  const [focusInput, setFocusInput] = useState('')
  const [techStackInput, setTechStackInput] = useState('')
  const [experienceInput, setExperienceInput] = useState('')
  const [input, setInput] = useState('')
  const [linkDialogOpen, setLinkDialogOpen] = useState(false)
  const [generatedUrl, setGeneratedUrl] = useState('')
  const [linkLoading, setLinkLoading] = useState(false)
  const [selectedExpiry, setSelectedExpiry] = useState('30')
  const [customMinutes, setCustomMinutes] = useState('')
  const [copied, setCopied] = useState(false)

  const isInitialMount = useRef(true)
  const prevStatusRef = useRef<string | undefined>(undefined)
  const loadedSessionRef = useRef<string | null | undefined>(undefined)

  const transport = useMemo(
    () =>
      new DefaultChatTransport({
        api: '/api/chat',
        body: {
          id,
          focus: focusInput,
          techStack: techStackInput,
          experience: experienceInput
        }
      }),
    [id, focusInput, techStackInput, experienceInput]
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
      if (error.name === 'AbortError') return
      toast.error(
        error.message.includes('401')
          ? 'Unauthorized'
          : 'The response could not be generated. Please try again.'
      )
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
        focus: focusInput,
        tech: techStackInput,
        experience: experienceInput
      })
    }

    prevStatusRef.current = status
  }, [status, messages, focusInput, techStackInput, experienceInput, saveCurrentSession])

  useEffect(() => {
    if (currentSessionId === loadedSessionRef.current) return

    stop()
    loadedSessionRef.current = currentSessionId

    if (currentSessionId) {
      // Load the selected transcript from persistent storage instead of using
      // the provider's in-memory history state as a transcript cache.
      const session = loadSession(currentSessionId)
      if (session) {
        setMessages(session.messages)
        setFocusInput(session.meta?.focus || '')
        setTechStackInput(session.meta?.tech || '')
        setExperienceInput(session.meta?.experience || '')
      }
    } else if (!isInitialMount.current) {
      setMessages([])
      const profile = profiles.find(p => p.name === currentProfile)
      setFocusInput(profile?.meta?.focus || '')
      setTechStackInput(profile?.meta?.tech || '')
      setExperienceInput(profile?.meta?.experience || '')
    }
  }, [currentSessionId, currentProfile, profiles, loadSession, setMessages, stop])

  useEffect(() => {
    const handleStartSession = (e: Event) => {
      const custom = e as CustomEvent<{ profileName: string; mode: 'chat' | 'resume'; meta?: Record<string, any> }>
      const { profileName, mode, meta } = custom.detail
      if (mode === 'chat') {
        // Do not persist an in-progress transcript when switching sessions.
        // History is written only after the assistant finishes its response.
        startNewSession(profileName, 'chat')
        setMessages([])
        setInput('')
        if (meta) {
          setFocusInput(meta.focus || '')
          setTechStackInput(meta.tech || '')
          setExperienceInput(meta.experience || '')
        } else {
          setFocusInput('')
          setTechStackInput('')
          setExperienceInput('')
        }
      }
    }
    window.addEventListener('start-session', handleStartSession)
    return () => window.removeEventListener('start-session', handleStartSession)
  }, [startNewSession, saveCurrentSession, currentSessionId, messages, focusInput, techStackInput, experienceInput, setMessages])

  const handleSubmit = async (text: string) => {
    setInput('')
    await sendMessage({ text })
  }

  return (
    <>
      <div className={cn('mx-auto w-full max-w-4xl flex-1 pb-[220px] pt-4 md:pt-10', className)}>
        {!currentProfile ? (
          <div className="mx-auto max-w-2xl px-4">
            <div className="rounded-lg border bg-background p-8 text-center">
              <h1 className="mb-2 text-lg font-semibold">No Profile Selected</h1>
              <p className="mb-4 leading-normal text-muted-foreground">
                Please create or select a profile from the sidebar to start chatting.
              </p>
            </div>
          </div>
        ) : messages.length ? (
          <>
            <ChatList messages={messages} />
            <ChatScrollAnchor trackVisibility={status !== 'ready'} />
          </>
        ) : (
          <EmptyScreen setInput={setInput} />
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

      <Dialog open={linkDialogOpen} onOpenChange={setLinkDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Generate Guest Access Link</DialogTitle>
            <DialogDescription>
              Create a temporary link for guest access.
            </DialogDescription>
          </DialogHeader>

          {!generatedUrl ? (
            <>
              <Select value={selectedExpiry} onValueChange={setSelectedExpiry}>
                <SelectTrigger>
                  <SelectValue placeholder="Select expiry" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="30">30 minutes</SelectItem>
                  <SelectItem value="60">1 hour</SelectItem>
                  <SelectItem value="120">2 hours</SelectItem>
                  <SelectItem value="custom">Custom</SelectItem>
                </SelectContent>
              </Select>

              {selectedExpiry === 'custom' && (
                <Input
                  type="number"
                  placeholder="Minutes (1-1440)"
                  value={customMinutes}
                  onChange={e => setCustomMinutes(e.target.value)}
                  min="1"
                  max="1440"
                />
              )}

              <DialogFooter>
                <Button
                  onClick={async () => {
                    const finalMinutes =
                      selectedExpiry === 'custom'
                        ? parseInt(customMinutes)
                        : parseInt(selectedExpiry)

                    if (
                      isNaN(finalMinutes) ||
                      finalMinutes < 1 ||
                      finalMinutes > 1440
                    ) {
                      toast.error('Invalid time. Must be between 1 and 1440 minutes.')
                      return
                    }

                    setLinkLoading(true)
                    try {
                      const res = await fetch('/api/temp-links', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ expiryMinutes: finalMinutes })
                      })

                      if (!res.ok) {
                        const error = await res.json()
                        throw new Error(error.error || 'Failed to generate link')
                      }

                      const data = await res.json()
                      setGeneratedUrl(data.shareUrl)
                      toast.success('Link generated successfully!')
                    } catch (error) {
                      toast.error(
                        error instanceof Error ? error.message : 'Failed to generate link'
                      )
                    } finally {
                      setLinkLoading(false)
                    }
                  }}
                  disabled={linkLoading}
                >
                  {linkLoading ? 'Generating...' : 'Generate'}
                </Button>
              </DialogFooter>
            </>
          ) : (
            <div className="space-y-2">
              <p className="text-sm font-medium">Share this link:</p>
              <div className="flex gap-2">
                <Input readOnly value={generatedUrl} className="text-xs" />
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    navigator.clipboard.writeText(generatedUrl)
                    setCopied(true)
                    toast.success('Link copied to clipboard!')
                    setTimeout(() => setCopied(false), 2000)
                  }}
                >
                  {copied ? <IconCheck className="h-4 w-4" /> : <IconCopy className="h-4 w-4" />}
                </Button>
              </div>
              <DialogFooter>
                <Button
                  variant="ghost"
                  onClick={() => {
                    setGeneratedUrl('')
                    setCustomMinutes('')
                    setSelectedExpiry('30')
                  }}
                >
                  Generate another
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}
