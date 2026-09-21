import { type UIMessage } from 'ai'

export interface Profile {
  id: string
  name: string
  meta?: Record<string, any>
}

export interface SessionEntry {
  id: string
  profile: string | null
  messages: UIMessage[]
  createdAt: number
  mode?: 'chat' | 'resume'
  meta?: Record<string, any>
}

export interface Chat extends Record<string, any> {
  id: string
  title: string
  createdAt: Date
  userId: string
  path: string
  messages: UIMessage[]
  sharePath?: string
}

export type ServerActionResult<Result> = Promise<
  | Result
  | {
      error: string
    }
>
