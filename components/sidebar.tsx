'use client'

import * as React from 'react'
import { useSession } from '@/components/session-provider'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger
} from '@/components/ui/alert-dialog'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger
} from '@/components/ui/sheet'
import { IconSidebar, IconPlus, IconEdit, IconTrash, IconMessage, IconClose } from '@/components/ui/icons'

export function Sidebar() {
  const [sidebarOpen, setSidebarOpen] = React.useState(false)
  const { profiles, currentProfile, sessionHistory, currentSessionId, addProfile, updateProfile, removeProfile, removeSession, startNewSession } = useSession()
  const [addDialogOpen, setAddDialogOpen] = React.useState(false)
  const [editDialogOpen, setEditDialogOpen] = React.useState(false)
  const [editingProfile, setEditingProfile] = React.useState<{ id: string; focus: string; tech: string; experience: string } | null>(null)
  const [newFocus, setNewFocus] = React.useState('')
  const [newTech, setNewTech] = React.useState('')
  const [newExperience, setNewExperience] = React.useState('')
  const [editFocus, setEditFocus] = React.useState('')
  const [editTech, setEditTech] = React.useState('')
  const [editExperience, setEditExperience] = React.useState('')
  const [addError, setAddError] = React.useState('')
  const [editError, setEditError] = React.useState('')
  const [historyDeleteId, setHistoryDeleteId] = React.useState<string | null>(null)

  const currentSession = currentSessionId ? sessionHistory.find(h => h.id === currentSessionId) : null
  const currentHasMessages = currentSession ? currentSession.messages.length > 0 : false

  const resetAddForm = () => {
    setNewFocus('')
    setNewTech('')
    setNewExperience('')
    setAddError('')
    setEditError('')
  }

  const handleOpenAdd = () => {
    resetAddForm()
    setAddDialogOpen(true)
  }

  const handleOpenEdit = (id: string, name: string, meta?: Record<string, any>) => {
    setEditingProfile({ id, focus: meta?.focus || '', tech: meta?.tech || '', experience: meta?.experience || '' })
    setEditFocus(meta?.focus || '')
    setEditTech(meta?.tech || '')
    setEditExperience(meta?.experience || '')
    setEditError('')
    setEditDialogOpen(true)
  }

  const handleAddProfile = () => {
    const trimmedFocus = newFocus.trim()
    if (!trimmedFocus) return

    const exists = profiles.some(p => {
      const profileName = (p.name || '').toLowerCase()
      const metaFocus = (p.meta?.focus || '').toLowerCase()
      return profileName === trimmedFocus.toLowerCase() || metaFocus === trimmedFocus.toLowerCase()
    })

    if (exists) {
      setAddError('A profile with this interview focus already exists.')
      return
    }

    addProfile(trimmedFocus, {
      focus: trimmedFocus,
      tech: newTech,
      experience: newExperience
    })
    resetAddForm()
    setAddDialogOpen(false)
  }

  const handleSaveEdit = () => {
    if (!editingProfile || !editFocus.trim()) return

    const trimmedFocus = editFocus.trim()
    const exists = profiles.some(p => {
      if (p.id === editingProfile.id) return false
      const profileName = (p.name || '').toLowerCase()
      const metaFocus = (p.meta?.focus || '').toLowerCase()
      return profileName === trimmedFocus.toLowerCase() || metaFocus === trimmedFocus.toLowerCase()
    })

    if (exists) {
      setEditError('A profile with this interview focus already exists.')
      return
    }

    updateProfile(editingProfile.id, editFocus, {
      focus: trimmedFocus,
      tech: editTech,
      experience: editExperience
    })
    setEditingProfile(null)
    setEditDialogOpen(false)
    setEditError('')
  }

  const handleDeleteProfile = (id: string) => {
    if (window.confirm('Are you sure you want to delete this profile?')) {
      removeProfile(id)
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setSidebarOpen(true)}
        aria-label="Open sidebar"
        className="flex size-9 items-center justify-center rounded-lg p-0 transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <IconSidebar className="size-5" />
        <span className="sr-only">Open Sidebar</span>
      </button>
      <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
        <SheetContent className="inset-y-0 flex h-auto w-[300px] flex-col p-0">
          <SheetHeader className="p-4">
            <SheetTitle className="text-sm">Sessions</SheetTitle>
          </SheetHeader>

        <div className="flex-1 overflow-auto px-2 space-y-6">
          <div>
            <div className="flex items-center justify-between px-2 mb-2">
              <h3 className="text-xs font-semibold text-muted-foreground">Profiles</h3>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 p-0"
                onClick={handleOpenAdd}
              >
                <IconPlus className="h-4 w-4" />
              </Button>
            </div>
            <div className="max-h-[200px] overflow-y-auto space-y-1">
              {profiles.length === 0 ? (
                <p className="text-xs text-muted-foreground px-2 py-2">No profiles yet. Create one to start chatting.</p>
              ) : (
                profiles.map(profile => {
                  const isActive = profile.name === currentProfile
                  return (
                    <div
                      key={profile.id}
                      className={`group relative flex items-center rounded-md ${isActive ? 'bg-accent' : ''}`}
                    >
                      <button
                        onClick={() => {
                          window.dispatchEvent(new CustomEvent('start-session', { detail: { profileName: profile.name, mode: 'chat', meta: profile.meta } }))
                        }}
                        className="flex-1 text-left px-2 py-1.5 text-sm hover:bg-accent/50 rounded-md flex items-center gap-2"
                      >
                        <IconMessage className="h-4 w-4" />
                        <span className="truncate">{profile.name}</span>
                      </button>
                      <div className="absolute right-1 hidden group-hover:flex items-center gap-0.5">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 p-0"
                          onClick={() => startNewSession(profile.name, 'chat')}
                          title="Start new session"
                        >
                          <IconPlus className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 p-0"
                          onClick={() => handleOpenEdit(profile.id, profile.name, profile.meta)}
                        >
                          <IconEdit className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 p-0 text-destructive"
                          onClick={() => handleDeleteProfile(profile.id)}
                        >
                          <IconTrash className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  )
                })
              )}
            </div>
          </div>

          <HistorySection />
        </div>
      </SheetContent>

      <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Enter your topic of interview</DialogTitle>
            <DialogDescription>
              This is for training AI with your idea.
            </DialogDescription>
          </DialogHeader>
          <DialogDescription>Interview Focus</DialogDescription>
          <Input
            value={newFocus}
            placeholder="Focus"
            onChange={e => {
              setNewFocus(e.target.value)
              if (addError) setAddError('')
            }}
          />
          {addError && (
            <p className="text-xs text-destructive mt-1">{addError}</p>
          )}
          <DialogDescription className="mt-[10px]">
            Technical Stack: eg : React.js, Asp.Net, Python
          </DialogDescription>
          <Input
            value={newTech}
            placeholder="Technical Stack"
            onChange={e => setNewTech(e.target.value)}
          />
          <DialogDescription className="mt-[10px]">
            Experience/Resume:
          </DialogDescription>
          <Textarea
            className="h-[400px]"
            value={newExperience}
            placeholder="Experience"
            onChange={e => setNewExperience(e.target.value)}
          />
          <DialogFooter className="items-center">
            <Button variant="ghost" onClick={() => setAddDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleAddProfile}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Enter your topic of interview</DialogTitle>
            <DialogDescription>
              This is for training AI with your idea.
            </DialogDescription>
          </DialogHeader>
          <DialogDescription>Interview Focus</DialogDescription>
          <Input
            value={editFocus}
            placeholder="Focus"
            onChange={e => {
              setEditFocus(e.target.value)
              if (editError) setEditError('')
            }}
          />
          {editError && (
            <p className="text-xs text-destructive mt-1">{editError}</p>
          )}
          <DialogDescription className="mt-[10px]">
            Technical Stack: eg : React.js, Asp.Net, Python
          </DialogDescription>
          <Input
            value={editTech}
            placeholder="Technical Stack"
            onChange={e => setEditTech(e.target.value)}
          />
          <DialogDescription className="mt-[10px]">
            Experience/Resume:
          </DialogDescription>
          <Textarea
            className="h-[400px]"
            value={editExperience}
            placeholder="Experience"
            onChange={e => setEditExperience(e.target.value)}
          />
          <DialogFooter className="items-center">
            <Button variant="ghost" onClick={() => setEditDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSaveEdit}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Sheet>
  </>)
}

function HistorySection() {
  const { sessionHistory, historyLimit, setHistoryLimit, loadSession, currentSessionId, removeSession } = useSession()
  const [editingLimit, setEditingLimit] = React.useState(false)
  const [limitInput, setLimitInput] = React.useState(String(historyLimit))
  const [historyDeleteId, setHistoryDeleteId] = React.useState<string | null>(null)
  const historyContainerRef = React.useRef<HTMLDivElement>(null)

  const sortedHistory = React.useMemo(() => {
    return [...sessionHistory].sort((a, b) => b.createdAt - a.createdAt)
  }, [sessionHistory])

  React.useEffect(() => {
    if (historyContainerRef.current) {
      historyContainerRef.current.scrollTop = 0
    }
  }, [sortedHistory])

  React.useEffect(() => {
    if (!editingLimit) {
      setLimitInput(String(historyLimit))
    }
  }, [historyLimit, editingLimit])

  const handleLimitBlur = () => {
    const parsed = parseInt(limitInput, 10)
    if (!isNaN(parsed) && parsed >= 1) {
      setHistoryLimit(parsed)
    } else {
      setLimitInput(String(historyLimit))
    }
    setEditingLimit(false)
  }

  const handleLimitKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleLimitBlur()
    } else if (e.key === 'Escape') {
      setLimitInput(String(historyLimit))
      setEditingLimit(false)
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between px-2 mb-2">
        <h3 className="text-xs font-semibold text-muted-foreground">History</h3>
        {editingLimit ? (
          <Input
            value={limitInput}
            onChange={e => setLimitInput(e.target.value)}
            onBlur={handleLimitBlur}
            onKeyDown={handleLimitKeyDown}
            className="h-6 w-12 text-xs text-right"
            autoFocus
          />
        ) : (
          <button
            onClick={() => setEditingLimit(true)}
            className="text-xs text-muted-foreground hover:text-foreground"
          >
            ({historyLimit})
          </button>
        )}
      </div>

      <div ref={historyContainerRef} className="max-h-[300px] overflow-y-auto space-y-1">
        {sortedHistory.length === 0 ? (
          <p className="text-xs text-muted-foreground px-2 py-2">No history yet</p>
        ) : (
          sortedHistory.map(session => {
            const isActive = session.id === currentSessionId
            return (
              <div
                key={session.id}
                className={`group relative flex items-center rounded-md ${isActive ? 'bg-accent' : ''}`}
              >
                <button
                  onClick={() => loadSession(session.id)}
                  className="flex-1 text-left px-2 py-1.5 text-sm hover:bg-accent/50 rounded-md flex items-center gap-2"
                >
                  <IconMessage className="h-4 w-4 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="truncate">{session.profile || 'Untitled'}</div>
                    <div className="text-xs text-muted-foreground">
                      {session.messages.length} messages · {new Date(session.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                </button>
                <div className="absolute right-1 hidden group-hover:flex items-center gap-0.5">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 p-0 text-destructive"
                    onClick={() => setHistoryDeleteId(session.id)}
                  >
                    <IconTrash className="h-3 w-3" />
                  </Button>
                </div>
                <AlertDialog open={historyDeleteId === session.id} onOpenChange={(open) => !open && setHistoryDeleteId(null)}>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete this session?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This will permanently delete this session from your history.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel onClick={() => setHistoryDeleteId(null)}>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => {
                          removeSession(session.id)
                          setHistoryDeleteId(null)
                        }}
                      >
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
