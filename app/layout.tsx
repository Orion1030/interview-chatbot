import { Metadata } from 'next'

import '@/app/globals.css'
import { fontMono, fontSans } from '@/lib/fonts'
import { cn } from '@/lib/utils'
import { TailwindIndicator } from '@/components/tailwind-indicator'
import { Providers } from '@/components/providers'
import { ThemeToggle } from '@/components/theme-toggle'
import { SessionProvider } from '@/components/session-provider'
import { GuestLinkIcon } from '@/components/guest-link-icon'
import { Header } from '@/components/header'
import { CurrentProfileBar } from '@/components/current-profile-bar'
import { DynamicTitle } from '@/components/dynamic-title'

export const metadata: Metadata = {
  title: {
    default: 'Interviewer',
    template: `%s - Interviewer`
  },
  description: 'An AI-powered chatbot template built with Next.js and Vercel.',
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon-16x16.png',
    apple: '/apple-touch-icon.png'
  }
}

interface RootLayoutProps {
  children: React.ReactNode
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head />
      <body
        className={cn(
          'font-sans antialiased',
          fontSans.variable,
          fontMono.variable
        )}
        suppressHydrationWarning
      >
        <Providers attribute="class" defaultTheme="dark" enableSystem={false}>
          <SessionProvider>
            <div className="flex flex-col min-h-screen">
              <DynamicTitle />
              <CurrentProfileBar />
              <div className="fixed top-4 right-4 z-50 flex items-center gap-2">
                <GuestLinkIcon />
                <ThemeToggle />
              </div>
              <Header />
              <main className="flex flex-col flex-1 bg-muted/50">{children}</main>
            </div>
          </SessionProvider>
        </Providers>
      </body>
    </html>
  )
}
