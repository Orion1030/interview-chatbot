import { notFound } from 'next/navigation'

import { auth } from '@/auth'
import { getChat } from '@/app/actions'
import { Chat } from '@/components/chat'
import { migrateMessage } from '@/lib/utils'

export interface ChatPageProps {
  params: Promise<{
    id: string
  }>
}

export default async function ChatPage({ params }: ChatPageProps) {
  const session = await auth()
  const { id } = await params

  if (!session?.user?.id) {
    notFound()
  }

  const chat = await getChat(id, session.user.id)

  if (!chat || chat.userId !== session.user.id) {
    notFound()
  }

  const initialMessages = (chat.messages ?? []).map(m => migrateMessage(m as unknown))

  return <Chat id={chat.id} initialMessages={initialMessages} />
}
