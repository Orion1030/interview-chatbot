'use client'

import { type UIMessage } from 'ai'

import { Button } from '@/components/ui/button'
import { IconCheck, IconCopy, IconRefresh } from '@/components/ui/icons'
import { useCopyToClipboard } from '@/lib/hooks/use-copy-to-clipboard'
import { cn, getMessageText } from '@/lib/utils'

interface ChatMessageActionsProps extends React.ComponentProps<'div'> {
  message: UIMessage
  onRegenerate?: () => void
  showRegenerate?: boolean
  align?: 'start' | 'center'
}

export function ChatMessageActions({
  message,
  className,
  onRegenerate,
  showRegenerate,
  align = 'start',
  ...props
}: ChatMessageActionsProps) {
  const { isCopied, copyToClipboard } = useCopyToClipboard({ timeout: 2000 })

  const onCopy = () => {
    if (isCopied) return
    copyToClipboard(getMessageText(message))
  }

  return (
    <div
      className={cn(
        'flex items-center gap-1 transition-opacity md:opacity-0 md:group-hover:opacity-100',
        align === 'center' ? 'justify-center' : 'justify-end',
        className
      )}
      {...props}
    >
      <Button variant="ghost" className="h-6 w-6 p-0" onClick={onCopy}>
        {isCopied ? (
          <IconCheck className="size-2" />
        ) : (
          <IconCopy className="size-2" />
        )}
        <span className="sr-only">Copy message</span>
      </Button>
      {showRegenerate && onRegenerate && (
        <Button
          variant="ghost"
          className="h-6 w-6 p-0 mr-3"
          onClick={onRegenerate}
        >
          <IconRefresh className="size-2" />
          <span className="sr-only">Try Again</span>
        </Button>
      )}
    </div>
  )
}
