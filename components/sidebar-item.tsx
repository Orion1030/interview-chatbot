'use client'

import { type SessionEntry } from '@/lib/session-history'
import { cn } from '@/lib/utils'
import { buttonVariants } from '@/components/ui/button'
import { IconMessage } from '@/components/ui/icons'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger
} from '@/components/ui/tooltip'

interface SidebarItemProps {
  session: SessionEntry
  onSelect: (id: string) => void
}

export function SidebarItem({ session, onSelect }: SidebarItemProps) {
  return (
    <div className="relative">
      <div className="absolute left-2 top-1 flex h-6 w-6 items-center justify-center">
        <IconMessage className="mr-2" />
      </div>
      <button
        onClick={() => onSelect(session.id)}
        className={cn(
          buttonVariants({ variant: 'ghost' }),
          'group w-full pl-8 pr-4 text-left'
        )}
      >
        <div
          className="relative max-h-5 flex-1 select-none overflow-hidden text-ellipsis break-all"
          title={session.profile ?? undefined}
        >
          <span className="whitespace-nowrap">{session.profile || 'Untitled'}</span>
        </div>
      </button>
    </div>
  )
}
