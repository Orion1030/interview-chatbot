'use client'

import { useState } from 'react'
import { useSession } from '@/components/session-provider'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import { toast } from 'react-hot-toast'
import { IconLink, IconCopy, IconCheck } from '@/components/ui/icons'

export function GuestLinkIcon() {
  const { isResponding } = useSession()
  const [open, setOpen] = useState(false)
  const [generatedUrl, setGeneratedUrl] = useState('')
  const [linkLoading, setLinkLoading] = useState(false)
  const [selectedExpiry, setSelectedExpiry] = useState('30')
  const [customMinutes, setCustomMinutes] = useState('')
  const [copied, setCopied] = useState(false)

  const handleGenerate = async () => {
    const finalMinutes =
      selectedExpiry === 'custom'
        ? parseInt(customMinutes)
        : parseInt(selectedExpiry)

    if (isNaN(finalMinutes) || finalMinutes < 1 || finalMinutes > 1440) {
      toast.error('Invalid time. Must be between 1 and 1440 minutes.')
      return
    }

    setLinkLoading(true)
    try {
      const res = await fetch('/api/temp-links', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ expiryMinutes: finalMinutes })
      })

      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || 'Failed to generate link')
      }

      const data = await res.json()
      setGeneratedUrl(data.shareUrl)
      toast.success('Link generated successfully!')
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : 'Failed to generate link'
      )
    } finally {
      setLinkLoading(false)
    }
  }

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setOpen(true)}
        disabled={isResponding}
        title="Generate guest link"
      >
        <IconLink />
        <span className="sr-only">Generate guest link</span>
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Generate Guest Access Link</DialogTitle>
            <DialogDescription>
              Create a temporary link for guest access.
            </DialogDescription>
          </DialogHeader>

          {!generatedUrl ? (
            <>
              <Select value={selectedExpiry} onValueChange={setSelectedExpiry}>
                <SelectTrigger>
                  <SelectValue placeholder="Select expiry" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="30">30 minutes</SelectItem>
                  <SelectItem value="60">1 hour</SelectItem>
                  <SelectItem value="120">2 hours</SelectItem>
                  <SelectItem value="custom">Custom</SelectItem>
                </SelectContent>
              </Select>

              {selectedExpiry === 'custom' && (
                <Input
                  type="number"
                  placeholder="Minutes (1-1440)"
                  value={customMinutes}
                  onChange={e => setCustomMinutes(e.target.value)}
                  min="1"
                  max="1440"
                  className="mt-2"
                />
              )}

              <DialogFooter>
                <Button
                  onClick={handleGenerate}
                  disabled={linkLoading}
                  className="mt-2"
                >
                  {linkLoading ? 'Generating...' : 'Generate'}
                </Button>
              </DialogFooter>
            </>
          ) : (
            <div className="space-y-2">
              <p className="text-sm font-medium">Share this link:</p>
              <div className="flex gap-2">
                <Input readOnly value={generatedUrl} className="text-xs" />
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    navigator.clipboard.writeText(generatedUrl)
                    setCopied(true)
                    toast.success('Link copied to clipboard!')
                    setTimeout(() => setCopied(false), 2000)
                  }}
                >
                  {copied ? (
                    <IconCheck className="h-4 w-4" />
                  ) : (
                    <IconCopy className="h-4 w-4" />
                  )}
                </Button>
              </div>
              <DialogFooter>
                <Button
                  variant="ghost"
                  onClick={() => {
                    setGeneratedUrl('')
                    setCustomMinutes('')
                    setSelectedExpiry('30')
                  }}
                >
                  Generate another
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}
