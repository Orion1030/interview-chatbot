import { type UseChatHelpers, type UIMessage } from '@ai-sdk/react'

import { Button } from '@/components/ui/button'
import { PromptForm } from '@/components/prompt-form'
import { ButtonScrollToBottom } from '@/components/button-scroll-to-bottom'
import { IconRefresh, IconStop } from '@/components/ui/icons'
import { FooterText } from '@/components/footer'

export interface ChatPanelProps
  extends Pick<
    UseChatHelpers<UIMessage>,
    | 'regenerate'
    | 'status'
    | 'messages'
    | 'stop'
  > {
  id?: string
  input: string
  setInput: (value: string) => void
  onSubmit: (value: string, file?: File) => Promise<void>
  disabled?: boolean
}

export function ChatPanel({
  id,
  status,
  stop,
  regenerate,
  onSubmit,
  input,
  setInput,
  messages,
  disabled
}: ChatPanelProps) {
  const isLoading = status !== 'ready'

  return (
    <div className="fixed inset-x-0 bottom-0 z-40 bg-gradient-to-t from-background via-background/95 to-transparent px-3 pb-3 pt-10 md:pb-5">
      <ButtonScrollToBottom />
      <div className="mx-auto max-w-3xl sm:px-4">
        <div className="flex h-10 items-center justify-center">
          {isLoading ? (
            <Button
              variant="outline"
              onClick={() => stop()}
              className="bg-background"
            >
              <IconStop className="mr-2" />
              Stop generating
            </Button>
          ) : (
            messages?.length > 0 && (
              <Button
                variant="outline"
                onClick={() => regenerate()}
                className="bg-background"
              >
                <IconRefresh className="mr-2" />
                Regenerate response
              </Button>
            )
          )}
        </div>
        <div className="space-y-3 rounded-2xl border bg-background/95 px-3 py-3 shadow-lg backdrop-blur-xl sm:px-4 md:py-4">
          <PromptForm
            onSubmit={onSubmit}
            input={input}
            setInput={setInput}
            isLoading={isLoading}
            disabled={disabled}
          />
          <FooterText className="hidden sm:block" />
        </div>
      </div>
    </div>
  )
}
