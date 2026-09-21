import { NextRequest, NextResponse } from 'next/server'

const realm = 'Interview Chatbot'

function unauthorized(message: string) {
  return new NextResponse(message, {
    status: 401,
    headers: {
      'WWW-Authenticate': `Basic realm="${realm}"`,
      'Cache-Control': 'no-store'
    }
  })
}

export function middleware(request: NextRequest) {
  const expectedUsername = process.env.AUTH_USERNAME
  const expectedPassword = process.env.AUTH_PASSWORD

  if (!expectedUsername || !expectedPassword) {
    return new NextResponse('Basic authentication is not configured.', { status: 503 })
  }

  const authorization = request.headers.get('authorization')
  if (!authorization?.startsWith('Basic ')) {
    return unauthorized('Authentication required')
  }

  try {
    const encodedCredentials = authorization.slice('Basic '.length).trim()
    const credentials = atob(encodedCredentials)
    const separator = credentials.indexOf(':')
    const username = separator >= 0 ? credentials.slice(0, separator) : ''
    const password = separator >= 0 ? credentials.slice(separator + 1) : ''

    if (username !== expectedUsername || password !== expectedPassword) {
      return unauthorized('Invalid credentials')
    }
  } catch {
    return unauthorized('Invalid credentials')
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)']
}
