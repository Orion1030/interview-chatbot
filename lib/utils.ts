import { type UIMessage } from 'ai'
import { clsx, type ClassValue } from 'clsx'
import { customAlphabet } from 'nanoid'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const nanoid = customAlphabet(
  '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz',
  7
) // 7-character random string

export async function fetcher<JSON = any>(
  input: RequestInfo,
  init?: RequestInit
): Promise<JSON> {
  const res = await fetch(input, init)

  if (!res.ok) {
    const json = await res.json()
    if (json.error) {
      const error = new Error(json.error) as Error & {
        status: number
      }
      error.status = res.status
      throw error
    } else {
      throw new Error('An unexpected error occurred')
    }
  }

  return res.json()
}

export function formatDate(input: string | number | Date): string {
  const date = new Date(input)
  return date.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  })
}

export function getMessageText(message: UIMessage): string {
  return message.parts
    .filter((part): part is { type: 'text'; text: string } => part.type === 'text')
    .map(part => part.text)
    .join('')
}

export function migrateMessage(message: unknown): UIMessage {
  if (
    typeof message === 'object' &&
    message !== null &&
    'parts' in message &&
    Array.isArray((message as { parts: unknown }).parts)
  ) {
    return message as UIMessage
  }

  if (typeof message === 'object' && message !== null && 'content' in message && 'role' in message) {
    const content = (message as { content: unknown }).content
    const role = (message as { role: unknown }).role
    const id = (message as { id?: unknown }).id
    return {
      id: typeof id === 'string' ? id : nanoid(),
      role: role === 'assistant' ? 'assistant' : 'user',
      parts: [{ type: 'text', text: typeof content === 'string' ? content : '' }]
    }
  }

  return {
    id: nanoid(),
    role: 'user',
    parts: [{ type: 'text', text: '' }]
  }
}
