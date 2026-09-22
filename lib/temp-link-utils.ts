import { jwtVerify, SignJWT } from 'jose'

const secret = new TextEncoder().encode(process.env.NEXTAUTH_SECRET || 'dev-secret-key')

export async function generateTempLink(expiryMs: number): Promise<{
  token: string
}> {
  const now = Math.floor(Date.now() / 1000)
  const expiresAt = now + Math.floor(expiryMs / 1000)

  const token = await new SignJWT({ sub: 'guest' })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt(now)
    .setExpirationTime(expiresAt)
    .sign(secret)

  const encoded = Buffer.from(token).toString('base64url')

  return { token: encoded }
}

export async function validateTempToken(
  token: string
): Promise<{ valid: boolean; error?: string }> {
  try {
    const jwt = Buffer.from(token, 'base64url').toString('utf-8')

    const verified = await jwtVerify(jwt, secret)

    if (verified.payload.sub !== 'guest') {
      return { valid: false, error: 'Invalid token type' }
    }

    return { valid: true }
  } catch (error) {
    return {
      valid: false,
      error: error instanceof Error ? error.message : 'Invalid token'
    }
  }
}
