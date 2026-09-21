import { type UIMessage } from 'ai'
import { type Profile, type SessionEntry } from '@/lib/types'

const PROFILES_KEY = 'profiles'
const HISTORY_KEY = 'history'
const LIMIT_KEY = 'history-limit'

export { Profile, SessionEntry }

export function getProfiles(): Profile[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = window.localStorage.getItem(PROFILES_KEY)
    if (!raw) return []
    return JSON.parse(raw)
  } catch {
    return []
  }
}

export function saveProfiles(profiles: Profile[]): void {
  window.localStorage.setItem(PROFILES_KEY, JSON.stringify(profiles))
}

export function getHistoryLimit(): number {
  if (typeof window === 'undefined') return 10
  const raw = window.localStorage.getItem(LIMIT_KEY)
  if (!raw) return 10
  const parsed = parseInt(raw, 10)
  return isNaN(parsed) ? 10 : Math.max(1, parsed)
}

export function saveHistoryLimit(limit: number): void {
  window.localStorage.setItem(LIMIT_KEY, String(Math.max(1, limit)))
}

export function getHistory(): SessionEntry[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = window.localStorage.getItem(HISTORY_KEY)
    if (!raw) return []
    return JSON.parse(raw)
  } catch {
    return []
  }
}

export function saveHistory(entries: SessionEntry[], limit: number): SessionEntry[] {
  const trimmed = entries.slice(-limit)
  window.localStorage.setItem(HISTORY_KEY, JSON.stringify(trimmed))
  return trimmed
}

export function addSession(entry: SessionEntry, limit: number): SessionEntry[] {
  const history = getHistory()
  const filtered = history.filter(h => h.id !== entry.id)
  filtered.push(entry)
  return saveHistory(filtered, limit)
}

export function updateSession(entry: SessionEntry, limit: number): SessionEntry[] {
  const history = getHistory()
  const updated = history.map(h => h.id === entry.id ? entry : h)
  return saveHistory(updated, limit)
}

export function removeSession(id: string, limit: number): SessionEntry[] {
  const history = getHistory()
  const updated = history.filter(h => h.id !== id)
  return saveHistory(updated, limit)
}
