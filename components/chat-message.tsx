// Inspired by Chatbot-UI and modified to fit the needs of this project
// @see https://github.com/mckaywrigley/chatbot-ui/blob/main/components/Chat/ChatMessage.tsx

import { type UIMessage } from 'ai'
import remarkGfm from 'remark-gfm'
import remarkMath from 'remark-math'

import { cn, getMessageText } from '@/lib/utils'
import { CodeBlock } from '@/components/ui/codeblock'
import { MemoizedReactMarkdown } from '@/components/markdown'
import { IconOpenAI } from '@/components/ui/icons'
import { ChatMessageActions } from '@/components/chat-message-actions'

export interface ChatMessageProps {
  message: UIMessage
}

export function ChatMessage({ message, ...props }: ChatMessageProps) {
  return (
    <div
      className={cn(
        'group relative mb-8 flex items-start gap-3 px-4 md:mb-10 md:px-0',
        message.role === 'user' && 'justify-end'
      )}
      {...props}
    >
      {message.role === 'assistant' && (
        <div className="mt-1 flex size-8 shrink-0 select-none items-center justify-center rounded-full bg-foreground text-background shadow-sm">
          <IconOpenAI />
        </div>
      )}
      <div className={cn(
        'min-w-0 overflow-hidden text-[15px] leading-7',
        message.role === 'user'
          ? 'max-w-[85%] rounded-3xl bg-muted px-5 py-3 text-foreground md:max-w-[72%]'
          : 'flex-1'
      )}>
        {message.role === 'assistant' && (
          <div className="mb-1 text-xs font-semibold tracking-wide text-muted-foreground">Interview Coach</div>
        )} 
        <div className="space-y-2">
        <MemoizedReactMarkdown
          className="prose break-words dark:prose-invert prose-p:leading-relaxed prose-pre:p-0"
          remarkPlugins={[remarkGfm, remarkMath]}
          components={{
            p({ children }) {
              return <p className="mb-2 last:mb-0">{children}</p>
            },
            code({ node, inline, className, children, ...props }) {
              if (children.length) {
                if (children[0] == '▍') {
                  return (
                    <span className="mt-1 cursor-default animate-pulse">▍</span>
                  )
                }

                children[0] = (children[0] as string).replace('`▍`', '▍')
              }

              const match = /language-(\w+)/.exec(className || '')

              if (inline) {
                return (
                  <code className={className} {...props}>
                    {children}
                  </code>
                )
              }

              return (
                <CodeBlock
                  key={Math.random()}
                  language={(match && match[1]) || ''}
                  value={String(children).replace(/\n$/, '')}
                  {...props}
                />
              )
            }
          }}
        >
          {getMessageText(message)}
        </MemoizedReactMarkdown>
        <ChatMessageActions message={message} />
        </div>
      </div>
    </div>
  )
}
