'use client'

import * as React from 'react'
import { ThemeProvider } from 'next-themes'

import { TooltipProvider } from '@/components/ui/tooltip'

const NextThemeProvider = ThemeProvider as any

export function Providers({
  children,
  attribute,
  defaultTheme,
  enableSystem
}: React.PropsWithChildren<{
  attribute?: string
  defaultTheme?: string
  enableSystem?: boolean
}>) {
  return (
    <NextThemeProvider
      attribute={attribute}
      defaultTheme={defaultTheme}
      enableSystem={enableSystem}
    >
      <TooltipProvider>{children}</TooltipProvider>
    </NextThemeProvider>
  )
}
