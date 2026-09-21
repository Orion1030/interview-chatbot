// middleware.ts
import { NextRequest, NextResponse } from 'next/server';

function atob(str: string) {
  return Buffer.from(str, 'base64').toString('binary');
}

export function middleware(req: NextRequest) {
  const authHeader = req.headers.get('authorization');

  if (!authHeader || !authHeader.startsWith('Basic ')) {
    return new NextResponse('Authentication required', {
      status: 401,
      headers: {
        'WWW-Authenticate': 'Basic realm="Protected Area"',
      },
    });
  }

  // Decode the credentials (Base64)
  const base64Credentials = authHeader.split(' ')[1];
  const [username, password] = atob(base64Credentials).split(':');

  // Perform your authentication check here
  if ((username !== process.env.AUTH_USERNAME || password !== process.env.AUTH_PASSWORD) && process.env.AUTH_USERNAME) {
    return new NextResponse('Invalid credentials', {
      status: 401,
      headers: {
        'WWW-Authenticate': 'Basic realm="Protected Area"',
      },
    });
  }

  // Allow the request to continue if authenticated
  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api/auth|_next/static|_next/image|favicon.ico).*)'],
};
