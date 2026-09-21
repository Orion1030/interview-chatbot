import { ThemeToggle } from '@/components/theme-toggle'
import { Header } from '@/components/header'
import { CurrentProfileBar } from '@/components/current-profile-bar'
import { DynamicTitle } from '@/components/dynamic-title'
import { TailwindIndicator } from '@/components/tailwind-indicator'

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <DynamicTitle />
      <CurrentProfileBar />
      <div className="fixed left-3 right-3 top-3 z-50 flex items-center justify-between pointer-events-none">
        <div className="pointer-events-auto rounded-xl border bg-background/80 p-1 shadow-sm backdrop-blur-xl">
          <Header />
        </div>
        <div className="pointer-events-auto flex items-center gap-1 rounded-xl border bg-background/80 p-1 shadow-sm backdrop-blur-xl">
          <ThemeToggle />
        </div>
      </div>
      <main className="flex min-h-screen flex-1 flex-col bg-muted/20 pt-16">{children}</main>
      <TailwindIndicator />
    </div>
  )
}
