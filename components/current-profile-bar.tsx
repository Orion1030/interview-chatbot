'use client'

import { useState, useEffect } from 'react'
import { getMessageText } from '@/lib/utils'
import { useSession } from '@/components/session-provider'
import { Button } from '@/components/ui/button'
import { IconPlus, IconMessage } from '@/components/ui/icons'

export function CurrentProfileBar() {
  const [mounted, setMounted] = useState(false)
  const { currentProfile, sessionHistory, currentSessionId, startNewSession } =
    useSession()

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  const currentSession = currentSessionId
    ? sessionHistory.find(h => h.id === currentSessionId)
    : null
  const hasMessages = currentSession
    ? currentSession.messages.length > 0
    : false

  if (!currentProfile) return null

  const firstUserMessage = currentSession?.messages.find(m => m.role === 'user')
  const sessionName = firstUserMessage
    ? getMessageText(firstUserMessage).slice(0, 50)
    : 'New Session'

  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50">
      <div className="flex items-center gap-2 bg-background/80 backdrop-blur-sm border rounded-md px-3 py-1.5 shadow-sm">
        <span className="text-sm font-medium whitespace-nowrap">
          {currentProfile} - {sessionName}
        </span>
        {hasMessages && (
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 p-0 ml-1"
            onClick={() => startNewSession(currentProfile, 'chat')}
            title="Start new session with this profile"
          >
            <IconPlus className="h-3 w-3" />
          </Button>
        )}
      </div>
    </div>
  )
}
