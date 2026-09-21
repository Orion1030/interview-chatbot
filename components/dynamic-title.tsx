'use client'

import { useEffect } from 'react'
import { useSession } from '@/components/session-provider'
import { getMessageText } from '@/lib/utils'

export function DynamicTitle() {
  const { currentProfile, sessionHistory, currentSessionId } = useSession()

  useEffect(() => {
    const currentSession = currentSessionId ? sessionHistory.find(h => h.id === currentSessionId) : null
    const profile = currentProfile || 'Interviewer'
    const firstUserMessage = currentSession?.messages.find(m => m.role === 'user')
    const sessionName = firstUserMessage ? getMessageText(firstUserMessage).slice(0, 50) : null
    const title = sessionName ? `${profile} - ${sessionName}` : profile
    document.title = title
  }, [currentProfile, sessionHistory, currentSessionId])

  return null
}
