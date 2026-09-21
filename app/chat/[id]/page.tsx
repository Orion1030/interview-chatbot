'use client'

import { notFound, redirect } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { useEffect, useState } from 'react'

import { getChat } from '@/app/actions'
import { Chat } from '@/components/chat'
import { migrateMessage } from '@/lib/utils'

export interface ChatPageProps {
  params: {
    id: string
  }
}

export default function ChatPage({ params }: ChatPageProps) {
  const { data: session, status } = useSession()
  const [chat, setChat] = useState<Awaited<ReturnType<typeof getChat>> | null>(null)

  useEffect(() => {
    if (status !== 'authenticated' || !session?.user?.id) {
      return
    }

    getChat(params.id, session.user.id).then(setChat)
  }, [status, session?.user?.id, params.id])

  if (status === 'loading') {
    return null
  }

  if (!session?.user) {
    redirect(`/sign-in?next=/chat/${params.id}`)
  }

  if (!chat) {
    return null
  }

  if (chat.userId !== session.user.id) {
    notFound()
  }

  const initialMessages = (chat.messages ?? []).map(m => migrateMessage(m as unknown))

  return <Chat id={chat.id} initialMessages={initialMessages} />
}
