import { NextRequest, NextResponse } from 'next/server'
import { validateTempToken } from '@/lib/temp-link-utils'

export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get('token')

  if (!token) {
    return new NextResponse('404 - This page could not be found.', {
      status: 200,
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0'
      }
    })
  }

  const result = await validateTempToken(token)

  if (!result.valid) {
    const response = new NextResponse('404 - This page could not be found.', {
      status: 200,
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0'
      }
    })
    response.cookies.set('guest-session', '', {
      httpOnly: true,
      secure: request.nextUrl.protocol === 'https:',
      sameSite: 'lax',
      path: '/',
      maxAge: 0
    })
    return response
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
