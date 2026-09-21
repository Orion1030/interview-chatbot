'use client'

import { useChat, type UIMessage } from '@ai-sdk/react'
import { DefaultChatTransport } from 'ai'
import { useMemo, useEffect, useState } from 'react'
import { toast } from 'react-hot-toast'

import { cn } from '@/lib/utils'
import { ChatList } from '@/components/chat-list'
import { ChatPanel } from '@/components/chat-panel'
import { EmptyScreen } from '@/components/empty-screen'
import { ChatScrollAnchor } from '@/components/chat-scroll-anchor'
import { useLocalStorage } from '@/lib/hooks/use-local-storage'
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

interface SenarioType {
  focus: string
  tech: string
  experience: string
  location: string
  education: string
}

const IS_PREVIEW = process.env.VERCEL_ENV === 'preview'
export interface ChatProps extends React.ComponentProps<'div'> {
  initialMessages?: UIMessage[]
  id?: string
}

export function Culture({ id, initialMessages, className }: ChatProps) {
  const [senario, setSenario] = useLocalStorage<string | null>(
    'culture-senario',
    null
  )

  const [senarios, setSenarios] = useState<SenarioType[]>([])
  const [currentSenario, setCurrentSenario] = useState<string>('')
  const [previewTokenDialog, setPreviewTokenDialog] = useState(false)
  const [techStackInput, setTechStackInput] = useState('')
  const [experienceInput, setExperienceInput] = useState('')
  const [focusInput, setFocusInput] = useState('')
  const [locationInput, setLocationInput] = useState('')
  const [educationInput, setEducationInput] = useState('')
  const [input, setInput] = useState('')

  const activeProfile = (focusInput || currentSenario || 'default').trim()
  const sessionStorageKey = activeProfile
    ? `chat:culture:${activeProfile}`
    : 'chat:culture:default'

  const loadProfileMessages = (profileName: string) => {
    if (typeof window === 'undefined') return

    const targetKey = profileName
      ? `chat:culture:${profileName}`
      : 'chat:culture:default'
    const saved = window.localStorage.getItem(targetKey)

    if (saved) {
      try {
        const parsed = JSON.parse(saved)
        if (Array.isArray(parsed)) {
          setMessages(parsed)
          return
        }
      } catch {
        // Ignore invalid saved data; fall through to empty state below.
      }
    }

    setMessages([])
  }

  useEffect(() => {
    if (senario) {
      const storage = JSON.parse(senario)
      const current = storage.current
      const data = storage.data
      const temp: SenarioType[] = []
      for (let i = 0; i < data.length; i++) {
        temp.push({
          focus: data[i].focus,
          tech: data[i].tech,
          experience: data[i].experience,
          location: data[i].location,
          education: data[i].education
        })
        if (current === data[i].focus) {
          setTechStackInput(data[i].tech)
          setExperienceInput(data[i].experience)
          setFocusInput(data[i].focus)
          setLocationInput(data[i].location)
          setEducationInput(data[i].education)
        }
      }
      setSenarios(temp)
      setCurrentSenario(current)
    }
  }, [senario])

  const onChangeSenario = (c: string) => {
    stop()
    setInput('')
    setMessages([])
    setCurrentSenario(c)
    const currentData = senarios.find(item => item.focus === c)
    if (currentData) {
      setTechStackInput(currentData.tech)
      setExperienceInput(currentData.experience)
      setFocusInput(currentData.focus)
      setLocationInput(currentData.location)
      setEducationInput(currentData.education)
    }
    setSenario(
      JSON.stringify({
        current: c,
        data: senarios
      })
    )
  }

  const saveSenario = () => {
    const exit = senarios.findIndex(item => item.focus === focusInput)
    const updated =
      exit >= 0
        ? senarios.map(item =>
            item.focus === focusInput
              ? {
                  ...item,
                  tech: techStackInput || '',
                  experience: experienceInput || '',
                  location: locationInput || '',
                  education: educationInput || ''
                }
              : item
          )
        : [
            ...senarios,
            {
              focus: focusInput,
              tech: techStackInput,
              experience: experienceInput,
              location: locationInput,
              education: educationInput
            }
          ]
    setSenarios(updated)
    setCurrentSenario(focusInput)
    setSenario(
      JSON.stringify({
        current: focusInput,
        data: updated
      })
    )
  }

  const transport = useMemo(
    () =>
      new DefaultChatTransport({
        api: '/api/culture',
        body: {
          id,
          focus: focusInput,
          techStack: techStackInput,
          experience: experienceInput,
          location: locationInput,
          education: educationInput
        }
      }),
    [
      id,
      focusInput,
      techStackInput,
      experienceInput,
      locationInput,
      educationInput
    ]
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
    loadProfileMessages(activeProfile)
  }, [activeProfile])

  useEffect(() => {
    if (typeof window === 'undefined') return
    window.localStorage.setItem(sessionStorageKey, JSON.stringify(messages))
  }, [messages, sessionStorageKey])

  const clearCurrentSession = () => {
    stop()
    setInput('')
    setMessages([])

    if (typeof window !== 'undefined') {
      window.localStorage.removeItem(sessionStorageKey)
    }
  }

  const handleSubmit = async (text: string) => {
    setInput('')
    await sendMessage({ text })
  }

  return (
    <>
      <div className="flex gap-4 justify-center border p-2">
        {senarios.map(item => (
          <div key={item.focus} className="flex gap-2">
            <input
              type="radio"
              id={item.focus}
              name="senario"
              value={item.focus}
              onChange={e => {
                const v = e.target.value
                onChangeSenario(v)
              }}
              defaultChecked={item.focus === focusInput}
            />
            <label>{item.focus}</label>
          </div>
        ))}
      </div>
      <div className={cn('pb-[200px] pt-4 md:pt-10', className)}>
        {messages.length ? (
          <>
            <ChatList messages={messages} />
            <ChatScrollAnchor trackVisibility={status !== 'ready'} />
          </>
        ) : (
          <div className="mx-auto max-w-2xl px-4">
            <div className="rounded-lg border bg-background p-8">
              <h1 className="mb-2 text-lg font-semibold">
                You are on Final Interview now!
              </h1>
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
      />

      <div className="fixed top-[5%] left-[20px] flex gap-2">
        <Button
          variant="outline"
          onClick={() => {
            setPreviewTokenDialog(true)
          }}
        >
          Setting
        </Button>
        <Button variant="outline" onClick={clearCurrentSession}>
          Clear session
        </Button>
      </div>

      <Dialog open={previewTokenDialog} onOpenChange={setPreviewTokenDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Enter your topic of interview</DialogTitle>
            <DialogDescription>
              This is for traning AI with your idea.
            </DialogDescription>
          </DialogHeader>
          <DialogDescription>Interview Focus</DialogDescription>
          <Input
            value={focusInput}
            placeholder="Focus"
            onChange={e => setFocusInput(e.target.value)}
          />
          <DialogDescription className="mt-[10px]">
            Technical Stack: ig : React.js, Asp.Net, Pyton
          </DialogDescription>
          <Input
            value={techStackInput}
            placeholder="Techincal Stack"
            onChange={e => setTechStackInput(e.target.value)}
          />
          <DialogDescription className="mt-[10px]">
            Location : Austin Texas
          </DialogDescription>
          <Input
            value={locationInput}
            placeholder="Location"
            onChange={e => setLocationInput(e.target.value)}
          />
          <DialogDescription className="mt-[10px]">
            Education : I graduated Tarleton State University on 04/2014, I
            gained bachelor degree of computer science.
          </DialogDescription>
          <Input
            value={educationInput}
            placeholder="Education"
            onChange={e => setEducationInput(e.target.value)}
          />
          <DialogDescription className="mt-[10px]">
            Experience/Resume:
          </DialogDescription>
          <Textarea
            className="h-[400px]"
            value={experienceInput}
            placeholder="Experience"
            onChange={e => setExperienceInput(e.target.value)}
          />
          <DialogFooter className="items-center">
            <Button
              onClick={() => {
                stop()
                setInput('')
                setMessages([])
                saveSenario()
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
