import { NextRequest, NextResponse } from 'next/server'
import { validateTempToken } from '@/lib/temp-link-utils'

const GUEST_COOKIE = 'guest-session'

function clearCookieAndReject(response: NextResponse): NextResponse {
  response.cookies.set(GUEST_COOKIE, '', {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    maxAge: 0
  })
  return response
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  if (pathname === '/temp') {
    return NextResponse.next()
  }

  const guestCookie = request.cookies.get(GUEST_COOKIE)?.value

  if (!guestCookie) {
    return clearCookieAndReject(
      new NextResponse('404 - This page could not be found.', {
        status: 200,
        headers: {
          'Content-Type': 'text/plain; charset=utf-8',
          'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0'
        }
      })
    )
  }

  const result = await validateTempToken(guestCookie)

  if (!result.valid) {
    return clearCookieAndReject(
      new NextResponse('404 - This page could not be found.', {
        status: 200,
        headers: {
          'Content-Type': 'text/plain; charset=utf-8',
          'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0'
        }
      })
    )
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)']
}
