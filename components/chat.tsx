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
    clearCurrentSession,
    isResponding,
    setIsResponding
  } = useSession()

  const [focusInput, setFocusInput] = useState('')
  const [techStackInput, setTechStackInput] = useState('')
  const [experienceInput, setExperienceInput] = useState('')
  const [input, setInput] = useState('')
  const [isLoadingSession, setIsLoadingSession] = useState(false)

  const isInitialMount = useRef(true)
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
    clearError,
    status,
    error
  } = useChat({
    messages: initialMessages ?? [],
    id,
    transport,
    throttle: 100,
    onFinish({ messages: finalMessages, isAbort, isError }) {
      if (!isAbort && !isError) {
        saveCurrentSession(finalMessages, {
          focus: focusInput,
          tech: techStackInput,
          experience: experienceInput
        })
      }
    },
    onError(error) {
      if (error.name === 'AbortError') return
      clearError()
      setIsResponding(false)
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
      return
    }

    setIsResponding(status === 'streaming' || status === 'submitted')
  }, [status, setIsResponding])

  useEffect(() => {
    if (currentSessionId === loadedSessionRef.current) return

    const shouldShowLoading = currentSessionId !== null && !isInitialMount.current
    if (shouldShowLoading) {
      setIsLoadingSession(true)
    }
    stop()
    setIsResponding(false)
    loadedSessionRef.current = currentSessionId

    const timerId = setTimeout(() => {
      if (currentSessionId) {
        const session = loadSession(currentSessionId)
        if (session) {
          setMessages(session.messages)
          setFocusInput(session.meta?.focus || '')
          setTechStackInput(session.meta?.tech || '')
          setExperienceInput(session.meta?.experience || '')
        }
      } else {
        setMessages([])
      }
      if (shouldShowLoading) {
        setIsLoadingSession(false)
      }
    }, 0)

    return () => clearTimeout(timerId)
  }, [currentSessionId, loadSession, setMessages, stop, setIsResponding])

  useEffect(() => {
    if (currentSessionId || isInitialMount.current) return

    const profile = profiles.find(p => p.name === currentProfile)
    setFocusInput(profile?.meta?.focus || '')
    setTechStackInput(profile?.meta?.tech || '')
    setExperienceInput(profile?.meta?.experience || '')
  }, [profiles, currentProfile, currentSessionId, setFocusInput, setTechStackInput, setExperienceInput])

  useEffect(() => {
    const handleStartSession = (e: Event) => {
      if (isResponding) return
      const custom = e as CustomEvent<{ profileName: string; mode: 'chat' | 'resume'; meta?: Record<string, any> }>
      const { profileName, mode, meta } = custom.detail
      if (mode === 'chat') {
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
  }, [startNewSession, isResponding, setMessages, setInput, setFocusInput, setTechStackInput, setExperienceInput])

  const handleSend = async (text: string, file?: File) => {
    await sendMessage({
      text,
      files: file
        ? (() => {
            const fileList = new DataTransfer()
            fileList.items.add(file)
            return fileList.files
          })()
        : undefined
    })
  }

  return (
    <>
      <div className={cn('mx-auto w-full max-w-4xl flex-1 pb-[220px] pt-4 md:pt-10', className)}>
        {isLoadingSession ? (
          <div className="flex min-h-64 items-center justify-center px-4" role="status" aria-live="polite">
            <span className="flex items-center gap-2 text-sm text-muted-foreground">
              <span className="size-2 animate-pulse rounded-full bg-current" aria-hidden="true" />
              Loading conversation…
            </span>
          </div>
        ) : !currentProfile ? (
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
            <ChatList messages={messages} onRegenerate={regenerate} isResponding={isResponding} />
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
        regenerate={regenerate}
        onSubmit={handleSend}
        input={input}
        setInput={setInput}
        messages={messages}
        disabled={!currentProfile}
      />
    </>
  )
}
