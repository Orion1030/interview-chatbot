import { NextRequest, NextResponse } from 'next/server'
import { validateTempToken } from '@/lib/temp-link-utils'

const GUEST_COOKIE = 'guest-session'

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  if (pathname === '/temp') {
    return NextResponse.next()
  }

  if (pathname.startsWith('/_next') || pathname.startsWith('/favicon.ico')) {
    return NextResponse.next()
  }

  const guestCookie = request.cookies.get(GUEST_COOKIE)?.value

  if (!guestCookie) {
    return new NextResponse(null, { status: 404 })
  }

  const result = await validateTempToken(guestCookie)

  if (!result.valid) {
    return new NextResponse(null, { status: 404 })
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)']
}
