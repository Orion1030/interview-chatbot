'use client'

import { redirect } from 'next/navigation'
import { useSession } from 'next-auth/react'

import { LoginButton } from '@/components/login-button'

export default function SignInPage() {
  const { data: session } = useSession()

  if (session?.user) {
    redirect('/')
  }

  return (
    <div className="flex h-[calc(100vh-theme(spacing.16))] items-center justify-center py-10">
      <LoginButton />
    </div>
  )
}
