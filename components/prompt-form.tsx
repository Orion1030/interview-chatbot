import { type UIMessage } from '@ai-sdk/react'
import * as React from 'react'
import Textarea from 'react-textarea-autosize'

import { Button, buttonVariants } from '@/components/ui/button'
import { IconArrowElbow, IconPlus } from '@/components/ui/icons'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger
} from '@/components/ui/tooltip'
import { useEnterSubmit } from '@/lib/hooks/use-enter-submit'
import { cn } from '@/lib/utils'
import { useRouter } from 'next/navigation'

export interface PromptProps {
  onSubmit: (value: string) => Promise<void>
  input: string
  setInput: (value: string) => void
  isLoading: boolean
  disabled?: boolean
}

export function PromptForm({
  onSubmit,
  input,
  setInput,
  isLoading,
  disabled
}: PromptProps) {
  const { formRef, onKeyDown } = useEnterSubmit()
  const inputRef = React.useRef<HTMLTextAreaElement>(null)
  const router = useRouter()

  React.useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus()
    }
  }, [])

  return (
    <form
      onSubmit={async e => {
        e.preventDefault()
        if (!input?.trim()) {
          return
        }
        setInput('')
        await onSubmit(input)
      }}
      ref={formRef as React.RefObject<HTMLFormElement>}
    >
      <div className="relative flex max-h-60 w-full grow flex-col overflow-hidden bg-background px-8 sm:rounded-md sm:border sm:px-12">
        <Tooltip>
          <TooltipTrigger
            type="button"
            className={cn(
              buttonVariants({ size: 'sm', variant: 'outline' }),
              'absolute left-0 top-4 h-8 w-8 rounded-full bg-background p-0 sm:left-4 text-[black]'
            )}
            onClick={() => {
              window.open(
                'http://172.20.107.173:8080/',
                'chat',
                'width=300,height=500'
              )
            }}
          >
            <IconPlus />
          </TooltipTrigger>
          <TooltipContent>New Chat</TooltipContent>
        </Tooltip>
        <Textarea
          ref={inputRef}
          tabIndex={0}
          onKeyDown={onKeyDown}
          rows={1}
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder={disabled ? 'Select a profile to start chatting.' : 'Send a message.'}
          spellCheck={false}
          disabled={disabled}
          className="min-h-[60px] w-full resize-none bg-transparent px-4 py-[1.3rem] focus-within:outline-none sm:text-sm"
        />
        <div className="absolute right-0 top-4 sm:right-4">
          <Tooltip>
            <TooltipTrigger
              type="submit"
              className={cn(
                buttonVariants({ size: 'sm', variant: 'default' }),
                'h-8 w-8 rounded-full p-0 disabled:pointer-events-none'
              )}
              disabled={isLoading || input === '' || disabled}
            >
              <IconArrowElbow />
              <span className="sr-only">Send message</span>
            </TooltipTrigger>
            <TooltipContent>Send message</TooltipContent>
          </Tooltip>
        </div>
      </div>
    </form>
  )
}
