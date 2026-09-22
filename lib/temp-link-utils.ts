import { SignJWT } from 'jose'

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
