'use client'

import { useTheme } from 'next-themes'

import { Button } from '@/components/ui/button'
import { IconMoon, IconSun } from '@/components/ui/icons'

export function ThemeToggle() {
  const { setTheme, theme } = useTheme()

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => {
        setTheme(theme === 'light' ? 'dark' : 'light')
      }}
    >
      {theme === 'light' ? (
        <IconSun className="transition-all" />
      ) : (
        <IconMoon className="transition-all" />
      )}
      <span className="sr-only">Toggle theme</span>
    </Button>
  )
}
