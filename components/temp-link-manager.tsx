'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import { toast } from 'react-hot-toast'
import { IconCopy, IconTrash } from '@/components/ui/icons'

interface TempLink {
  key: string
  expiresAt: number
  createdBy: string
}

const PRESET_TIMES = [
  { label: '30 minutes', value: 30 },
  { label: '1 hour', value: 60 },
  { label: '2 hours', value: 120 }
]

export function TempLinkManager() {
  const [expiryMinutes, setExpiryMinutes] = useState(30)
  const [customMinutes, setCustomMinutes] = useState('')
  const [loading, setLoading] = useState(false)
  const [generatedUrl, setGeneratedUrl] = useState('')
  const [links, setLinks] = useState<TempLink[]>([])
  const [showLinks, setShowLinks] = useState(false)

  const handleGenerate = async () => {
    const finalExpiryMinutes = customMinutes
      ? parseInt(customMinutes)
      : expiryMinutes

    if (
      isNaN(finalExpiryMinutes) ||
      finalExpiryMinutes < 1 ||
      finalExpiryMinutes > 1440
    ) {
      toast.error('Invalid time. Must be between 1 and 1440 minutes.')
      return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/temp-links', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ expiryMinutes: finalExpiryMinutes })
      })

      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || 'Failed to generate link')
      }

      const data = await res.json()
      setGeneratedUrl(data.shareUrl)
      toast.success('Link generated successfully!')
      setCustomMinutes('')
      await loadActiveLinks()
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : 'Failed to generate link'
      )
    } finally {
      setLoading(false)
    }
  }

  const loadActiveLinks = async () => {
    try {
      const res = await fetch('/api/temp-links?action=list')
      if (res.ok) {
        const data = await res.json()
        setLinks(data.links)
      }
    } catch (error) {
      console.error('Failed to load links:', error)
    }
  }

  const handleCopyUrl = () => {
    if (generatedUrl) {
      navigator.clipboard.writeText(generatedUrl)
      toast.success('Link copied to clipboard!')
    }
  }

  const handleRevoke = async (key: string) => {
    try {
      const res = await fetch('/api/temp-links', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key })
      })

      if (!res.ok) throw new Error('Failed to revoke link')

      toast.success('Link revoked!')
      await loadActiveLinks()
    } catch (error) {
      toast.error('Failed to revoke link')
    }
  }

  const formatExpiryTime = (expiresAt: number) => {
    const now = Math.floor(Date.now() / 1000)
    const remaining = expiresAt - now
    if (remaining <= 0) return 'Expired'
    if (remaining < 60) return `${remaining}s remaining`
    if (remaining < 3600) return `${Math.floor(remaining / 60)}m remaining`
    return `${Math.floor(remaining / 3600)}h remaining`
  }

  return (
    <div className="space-y-6 p-4 border rounded-lg bg-card">
      <div>
        <h3 className="font-semibold mb-4">Generate Guest Access Link</h3>

        <div className="space-y-4">
          <div className="flex gap-2">
            <Select
              value={String(expiryMinutes)}
              onValueChange={v => {
                if (v === 'custom') {
                  setExpiryMinutes(30)
                } else {
                  setExpiryMinutes(parseInt(v))
                }
              }}
            >
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PRESET_TIMES.map(time => (
                  <SelectItem key={time.value} value={String(time.value)}>
                    {time.label}
                  </SelectItem>
                ))}
                <SelectItem value="custom">Custom</SelectItem>
              </SelectContent>
            </Select>

            {String(expiryMinutes) === 'custom' || customMinutes ? (
              <Input
                type="number"
                placeholder="Minutes (1-1440)"
                value={customMinutes}
                onChange={e => setCustomMinutes(e.target.value)}
                className="w-40"
                min="1"
                max="1440"
              />
            ) : null}

            <Button onClick={handleGenerate} disabled={loading}>
              {loading ? 'Generating...' : 'Generate Link'}
            </Button>
          </div>

          {generatedUrl && (
            <div className="space-y-2 p-3 bg-muted rounded">
              <p className="text-sm font-medium">Share this link:</p>
              <div className="flex gap-2">
                <Input readOnly value={generatedUrl} className="text-xs" />
                <Button size="sm" variant="outline" onClick={handleCopyUrl}>
                  <IconCopy className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      <div>
        <Button
          variant="outline"
          size="sm"
          onClick={async () => {
            setShowLinks(!showLinks)
            if (!showLinks) await loadActiveLinks()
          }}
        >
          {showLinks ? 'Hide' : 'Show'} Active Links ({links.length})
        </Button>

        {showLinks && links.length > 0 && (
          <div className="mt-4 space-y-2">
            {links.map(link => (
              <div
                key={link.key}
                className="flex items-center justify-between p-2 bg-muted rounded text-sm"
              >
                <span className="font-mono text-xs">{link.key}</span>
                <span className="text-xs text-muted-foreground">
                  {formatExpiryTime(link.expiresAt)}
                </span>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => handleRevoke(link.key)}
                >
                  <IconTrash className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
