'use client'

import { XCircle } from 'lucide-react'

export default function TempLinkExpiredPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="w-full max-w-md rounded-xl border bg-card p-8 text-center shadow-sm">
        <div className="mx-auto mb-4 flex size-12 items-center justify-center rounded-full text-destructive">
          <XCircle className="size-6" />
        </div>
        <h1 className="mb-2 text-2xl font-semibold">Link Expired or Invalid</h1>
        <p className="mb-1 text-muted-foreground">
          This temporary access link has expired or is invalid.
        </p>
        <p className="text-sm text-muted-foreground">
          Please ask the admin to generate a new link for you.
        </p>
      </div>
    </div>
  )
}
