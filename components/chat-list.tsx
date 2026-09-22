import { memo } from 'react'
import { type UIMessage } from 'ai'

import { Separator } from '@/components/ui/separator'
import { ChatMessage } from '@/components/chat-message'

export interface ChatList {
  messages: UIMessage[]
  onRegenerate?: () => void
  isResponding?: boolean
}

export const ChatList = memo(function ChatList({ messages, onRegenerate, isResponding }: ChatList) {
  if (!messages.length) {
    return null
  }

  const lastMessage = messages[messages.length - 1]

  return (
    <div className="relative mx-auto max-w-2xl px-4">
      {messages.map((message, index) => (
        <div key={message.id}>
          <ChatMessage
            message={message}
            onRegenerate={onRegenerate}
            showRegenerate={
              message.role === 'assistant' &&
              index === messages.length - 1 &&
              !isResponding
            }
          />
          {index < messages.length - 1 && (
            <Separator className="my-4 md:my-8" />
          )}
        </div>
      ))}
    </div>
  )
})
