import { Metadata } from 'next'

import '@/app/globals.css'
import { fontMono, fontSans } from '@/lib/fonts'
import { cn } from '@/lib/utils'
import { TailwindIndicator } from '@/components/tailwind-indicator'
import { Providers } from '@/components/providers'
import { ThemeToggle } from '@/components/theme-toggle'
import { SessionProvider } from '@/components/session-provider'
import { Header } from '@/components/header'
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
            <div className="flex min-h-screen flex-col bg-background">
              <DynamicTitle />
              <div className="fixed left-3 right-3 top-3 z-50 flex items-center justify-between pointer-events-none">
                <div className="pointer-events-auto rounded-xl border bg-background/80 p-1 shadow-sm backdrop-blur-xl">
                  <Header />
                </div>
              </div>
              <main className="flex min-h-screen flex-1 flex-col bg-muted/20 pt-16">{children}</main>
            </div>
          </SessionProvider>
        </Providers>
      </body>
    </html>
  )
}
