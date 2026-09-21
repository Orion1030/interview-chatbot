import { Metadata } from 'next'

import '@/app/globals.css'
import { fontMono, fontSans } from '@/lib/fonts'
import { cn } from '@/lib/utils'
import { Providers } from '@/components/providers'
import { SessionProvider } from '@/components/session-provider'

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
            {children}
          </SessionProvider>
        </Providers>
      </body>
    </html>
  )
}
