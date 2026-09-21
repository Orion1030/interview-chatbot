'use client'

import {
  ArrowDown,
  ArrowRight,
  Check,
  ChevronDown,
  CircleStop,
  Copy,
  Download,
  ExternalLink,
  GitBranch,
  Link,
  MessageCircle,
  Moon,
  Pencil,
  Plus,
  RefreshCw,
  Send,
  Settings,
  Share2,
  Sidebar,
  Sparkles,
  Sun,
  Trash2,
  User,
  Users,
  X,
  type LucideProps
} from 'lucide-react'

export function IconNextChat({ inverted: _inverted, ...props }: LucideProps & { inverted?: boolean }) {
  return <MessageCircle {...props} />
}

export function IconOpenAI(props: LucideProps) {
  return <Sparkles {...props} />
}

export function IconVercel(props: LucideProps) {
  return <svg viewBox="0 0 24 24" fill="currentColor" aria-label="Vercel" role="img" {...props}><path d="M12 2 24 22H0L12 2Z" /></svg>
}

export function IconGitHub(props: LucideProps) {
  return <GitBranch {...props} />
}

export function IconSeparator(props: LucideProps) {
  return <span aria-hidden="true" className={props.className}>/</span>
}

export function IconArrowDown(props: LucideProps) {
  return <ArrowDown {...props} />
}

export function IconArrowRight(props: LucideProps) {
  return <ArrowRight {...props} />
}

export function IconUser(props: LucideProps) {
  return <User {...props} />
}

export function IconPlus(props: LucideProps) {
  return <Plus {...props} />
}

export function IconArrowElbow(props: LucideProps) {
  return <Send {...props} />
}

export function IconSpinner({ className, ...props }: LucideProps) {
  return <RefreshCw className={`animate-spin ${className ?? ''}`} {...props} />
}

export function IconMessage(props: LucideProps) {
  return <MessageCircle {...props} />
}

export function IconTrash(props: LucideProps) {
  return <Trash2 {...props} />
}

export function IconRefresh(props: LucideProps) {
  return <RefreshCw {...props} />
}

export function IconStop(props: LucideProps) {
  return <CircleStop {...props} />
}

export function IconRemove(props: LucideProps) {
  return <X {...props} />
}

export function IconSidebar(props: LucideProps) {
  return <Sidebar {...props} />
}

export function IconMoon(props: LucideProps) {
  return <Moon {...props} />
}

export function IconSun(props: LucideProps) {
  return <Sun {...props} />
}

export function IconCopy(props: LucideProps) {
  return <Copy {...props} />
}

export function IconCheck(props: LucideProps) {
  return <Check {...props} />
}

export function IconDownload(props: LucideProps) {
  return <Download {...props} />
}

export function IconClose(props: LucideProps) {
  return <X {...props} />
}

export function IconEdit(props: LucideProps) {
  return <Pencil {...props} />
}

export function IconShare(props: LucideProps) {
  return <Share2 {...props} />
}

export function IconUsers(props: LucideProps) {
  return <Users {...props} />
}

export function IconExternalLink(props: LucideProps) {
  return <ExternalLink {...props} />
}

export function IconChevronUpDown(props: LucideProps) {
  return <ChevronDown {...props} />
}

export function IconSettings(props: LucideProps) {
  return <Settings {...props} />
}

export function IconLink(props: LucideProps) {
  return <Link {...props} />
}

export type IconProps = LucideProps

export const iconClassName = 'stroke-[1.8]'
