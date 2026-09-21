import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { validateTempToken } from '@/lib/temp-link-utils'

export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get('token')
  console.log('[temp-page] token?', !!token, 'prefix:', token?.slice(0, 30))

  if (!token) {
    console.log('[temp-page] no token -> expired')
    return NextResponse.redirect(new URL('/temp-link-expired', request.url))
  }

  const result = await validateTempToken(token)
  console.log('[temp-page] validation:', result)

  if (!result.valid) {
    console.log('[temp-page] invalid -> expired')
    return NextResponse.redirect(new URL('/temp-link-expired', request.url))
  }

  const response = NextResponse.redirect(new URL('/', request.url))
  response.cookies.set('guest-session', token, {
    httpOnly: true,
    secure: request.nextUrl.protocol === 'https:',
    sameSite: 'lax',
    path: '/'
  })
  console.log('[temp-page] cookie set, redirecting to /')
  return response
}
