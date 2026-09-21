import { type UIMessage } from '@ai-sdk/react'
import * as React from 'react'
import Textarea from 'react-textarea-autosize'

import { Button, buttonVariants } from '@/components/ui/button'
import { IconArrowElbow, IconPaperclip } from '@/components/ui/icons'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger
} from '@/components/ui/tooltip'
import { useEnterSubmit } from '@/lib/hooks/use-enter-submit'
import { cn } from '@/lib/utils'
import { useRouter } from 'next/navigation'

export interface PromptProps {
  onSubmit: (value: string, file?: File) => Promise<void>
  input: string
  setInput: (value: string) => void
  isLoading: boolean
  disabled?: boolean
  onFileSelect?: (file: File | null) => void
}

export function PromptForm({
  onSubmit,
  input,
  setInput,
  isLoading,
  disabled,
  onFileSelect
}: PromptProps) {
  const fileInputRef = React.useRef<HTMLInputElement>(null)
  const [selectedFile, setSelectedFile] = React.useState<File | null>(null)
  const { formRef, onKeyDown } = useEnterSubmit()
  const inputRef = React.useRef<HTMLTextAreaElement>(null)
  const router = useRouter()

  const handleFormSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!input?.trim() || isLoading) {
      return
    }
    setInput('')
    await onSubmit(input, selectedFile ?? undefined)
    setSelectedFile(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (isLoading) return
    onKeyDown(e)
  }

  return (
    <form
      onSubmit={handleFormSubmit}
      ref={formRef as React.RefObject<HTMLFormElement>}
    >
      <div className="relative flex max-h-60 w-full grow flex-col overflow-hidden bg-background px-8 sm:rounded-md sm:border sm:px-12">
        <input
          ref={fileInputRef}
          type="file"
          className="sr-only"
          onChange={event => {
            const file = event.target.files?.[0] ?? null
            setSelectedFile(file)
            onFileSelect?.(file)
          }}
          disabled={disabled || isLoading}
        />
        <Tooltip>
          <TooltipTrigger
            type="button"
            aria-label="Attach a file"
            className={cn(
              buttonVariants({ size: 'sm', variant: 'ghost' }),
              'absolute left-2 top-4 h-8 w-8 rounded-full p-0 sm:left-4'
            )}
            onClick={() => fileInputRef.current?.click()}
            disabled={disabled || isLoading}
          >
            <IconPaperclip />
          </TooltipTrigger>
          <TooltipContent>Attach a file</TooltipContent>
        </Tooltip>
        <Textarea
          ref={inputRef}
          tabIndex={0}
          onKeyDown={handleKeyDown}
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
