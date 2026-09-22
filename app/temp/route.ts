import { NextRequest, NextResponse } from 'next/server'
import { validateTempToken } from '@/lib/temp-link-utils'

export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get('token')

  if (!token) {
    return new NextResponse(null, { status: 404 })
  }

  const result = await validateTempToken(token)

  if (!result.valid) {
    return new NextResponse(null, { status: 404 })
  }

  const response = NextResponse.redirect(new URL('/', request.url))
  response.cookies.set('guest-session', token, {
    httpOnly: true,
    secure: request.nextUrl.protocol === 'https:',
    sameSite: 'lax',
    path: '/'
  })
  return response
}
