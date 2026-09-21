import { NextRequest, NextResponse } from 'next/server'
import { validateTempToken } from '@/lib/temp-link-utils'

const GUEST_COOKIE = 'guest-session'

function redirectToExpired(request: NextRequest) {
  const url = request.nextUrl.clone()
  url.pathname = '/temp-link-expired'
  return NextResponse.redirect(url)
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  if (pathname === '/temp') {
    return NextResponse.next()
  }

  if (pathname === '/temp-link-expired') {
    const token = request.nextUrl.searchParams.get('token')
    if (token) {
      const url = request.nextUrl.clone()
      url.pathname = '/temp'
      return NextResponse.redirect(url)
    }
    return NextResponse.next()
  }

  if (pathname.startsWith('/_next') || pathname.startsWith('/favicon.ico')) {
    return NextResponse.next()
  }

  const guestCookie = request.cookies.get(GUEST_COOKIE)?.value

  if (!guestCookie) {
    return redirectToExpired(request)
  }

  const result = await validateTempToken(guestCookie)

  if (!result.valid) {
    const response = redirectToExpired(request)
    response.cookies.delete(GUEST_COOKIE)
    return response
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)']
}
