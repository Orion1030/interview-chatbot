'use client'

import { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react'
import { type UIMessage } from 'ai'
import {
  getProfiles,
  saveProfiles,
  getHistory,
  getHistoryLimit,
  saveHistoryLimit,
  addSession,
  updateSession,
  removeSession as removeSessionFromHistory,
  saveHistory,
  type Profile,
  type SessionEntry
} from '@/lib/session-history'

interface SessionContextValue {
  profiles: Profile[]
  addProfile: (name: string, meta?: Record<string, any>) => Profile
  updateProfile: (id: string, name: string, meta?: Record<string, any>) => void
  removeProfile: (id: string) => void

  sessionHistory: SessionEntry[]
  historyLimit: number
  setHistoryLimit: (limit: number) => void

  currentSessionId: string | null
  currentProfile: string | null
  currentMode: 'chat' | 'resume'

  loadSession: (sessionId: string) => SessionEntry | null
  startNewSession: (profileName: string, mode: 'chat' | 'resume') => void
  saveCurrentSession: (messages: UIMessage[], meta?: Record<string, any>) => void
  clearCurrentSession: () => void
  removeSession: (id: string) => void

  isResponding: boolean
  setIsResponding: (responding: boolean) => void
}

const SessionContext = createContext<SessionContextValue | null>(null)

export function useSession(): SessionContextValue {
  const ctx = useContext(SessionContext)
  if (!ctx) throw new Error('useSession must be used within SessionProvider')
  return ctx as SessionContextValue
}

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const [profiles, setProfiles] = useState<Profile[]>([])
  const [sessionHistory, setSessionHistory] = useState<SessionEntry[]>([])
  const [historyLimit, setHistoryLimitState] = useState(getHistoryLimit())
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null)
  const [currentProfile, setCurrentProfile] = useState<string | null>(null)
  const [currentMode, setCurrentMode] = useState<'chat' | 'resume'>('chat')
  const [isResponding, setIsResponding] = useState(false)

  const limitRef = useRef(historyLimit)
  const historyRef = useRef(sessionHistory)
  const sessionIdRef = useRef(currentSessionId)
  const profileRef = useRef(currentProfile)
  const modeRef = useRef(currentMode)
  limitRef.current = historyLimit
  historyRef.current = sessionHistory
  sessionIdRef.current = currentSessionId
  profileRef.current = currentProfile
  modeRef.current = currentMode

  useEffect(() => {
    setProfiles(getProfiles())
    setSessionHistory(getHistory())
    setHistoryLimitState(getHistoryLimit())
  }, [])

  useEffect(() => {
    if (profiles.length > 0 && currentProfile === null && currentSessionId === null) {
      setCurrentProfile(profiles[0].name)
    }
  }, [profiles, currentProfile, currentSessionId])

  useEffect(() => {
    if (profiles.length > 0 || typeof window === 'undefined') {
      saveProfiles(profiles)
    }
  }, [profiles])

  const setHistoryLimit = useCallback((limit: number) => {
    const clamped = Math.max(1, Math.min(100, limit))
    setHistoryLimitState(clamped)
    saveHistoryLimit(clamped)
  }, [])

  const addProfile = useCallback((name: string, meta?: Record<string, any>): Profile => {
    const newProfile: Profile = {
      id: crypto.randomUUID(),
      name: name.trim() || 'Untitled',
      meta: meta || {}
    }
    setProfiles(prev => [...prev, newProfile])
    return newProfile
  }, [])

  const updateProfile = useCallback((id: string, name: string, meta?: Record<string, any>) => {
    const profileToUpdate = profiles.find(p => p.id === id)
    const oldName = profileToUpdate?.name || null
    const newName = name.trim() || 'Untitled'

    setProfiles(prev => prev.map(p => p.id === id ? { ...p, name: newName, meta: meta ?? p.meta } : p))

    if (oldName && oldName !== newName) {
      setSessionHistory(prev => {
        const updated = prev.map(h => h.profile === oldName ? { ...h, profile: newName } : h)
        saveHistory(updated, limitRef.current)
        return updated
      })
    }
  }, [profiles])

  const removeProfile = useCallback((id: string) => {
    const profileToRemove = profiles.find(p => p.id === id)
    const profileName = profileToRemove?.name || null

    setProfiles(prev => {
      const next = prev.filter(p => p.id !== id)
      if (profileName && next.length === 0) {
        setCurrentProfile(null)
        setCurrentSessionId(null)
        setCurrentMode('chat')
      }
      return next
    })

    if (profileName) {
      const updatedHistory = sessionHistory.filter(h => h.profile !== profileName)
      setSessionHistory(updatedHistory)
      saveHistory(updatedHistory, limitRef.current)

      if (currentProfile === profileName) {
        setCurrentProfile(null)
        setCurrentSessionId(null)
        setCurrentMode('chat')
      }
    }
  }, [profiles, sessionHistory, currentProfile])

  const startNewSession = useCallback((profileName: string, mode: 'chat' | 'resume') => {
    setCurrentProfile(profileName)
    setCurrentMode(mode)
    setCurrentSessionId(null)
  }, [])

  const loadSession = useCallback((sessionId: string): SessionEntry | null => {
    // The transcript is always loaded from persistent storage. React state only
    // drives the sidebar index and must not become an in-memory transcript cache.
    const session = getHistory().find(h => h.id === sessionId) || null
    if (session) {
      setCurrentProfile(session.profile)
      setCurrentMode(session.mode || 'chat')
      setCurrentSessionId(session.id)
    }
    return session
  }, [])

  const saveCurrentSession = useCallback((messages: UIMessage[], meta?: Record<string, any>) => {
    if (messages.length === 0) return

    const limit = limitRef.current
    const existingSessionId = sessionIdRef.current
    const existingHistory = historyRef.current
    const profile = profileRef.current
    const mode = modeRef.current

    if (existingSessionId) {
      const existing = existingHistory.find(h => h.id === existingSessionId)
      const updated: SessionEntry = {
        id: existingSessionId,
        profile,
        messages,
        createdAt: existing?.createdAt || Date.now(),
        mode,
        meta: meta || {}
      }
      const newHistory = updateSession(updated, limit)
      historyRef.current = newHistory
      setSessionHistory(newHistory)
    } else {
      const newSession: SessionEntry = {
        id: crypto.randomUUID(),
        profile,
        messages,
        createdAt: Date.now(),
        mode,
        meta: meta || {}
      }
      const newHistory = addSession(newSession, limit)
      historyRef.current = newHistory
      setSessionHistory(newHistory)
      sessionIdRef.current = newSession.id
      setCurrentSessionId(newSession.id)
    }

    setIsResponding(false)
  }, [])


  const clearCurrentSession = useCallback(() => {
    setCurrentSessionId(null)
    setCurrentProfile(null)
    setCurrentMode('chat')
  }, [])

  const removeSession = useCallback((id: string) => {
    const newHistory = removeSessionFromHistory(id, limitRef.current)
    setSessionHistory(newHistory)
    if (currentSessionId === id) {
      setCurrentSessionId(null)
      setCurrentProfile(null)
      setCurrentMode('chat')
    }
  }, [currentSessionId])

  return (
    <SessionContext.Provider value={{
      profiles,
      addProfile,
      updateProfile,
      removeProfile,
      sessionHistory,
      historyLimit,
      setHistoryLimit,
      currentSessionId,
      currentProfile,
      currentMode,
      loadSession,
      startNewSession,
      saveCurrentSession,
      clearCurrentSession,
      removeSession,
      isResponding,
      setIsResponding
    }}>
      {children}
    </SessionContext.Provider>
  )
}
