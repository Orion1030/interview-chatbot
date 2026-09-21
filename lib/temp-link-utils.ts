import { SignJWT, CompactEncrypt } from 'jose'

const secret = new TextEncoder().encode(process.env.NEXTAUTH_SECRET || 'dev-secret-key')

async function getEncryptionKey(): Promise<Uint8Array> {
  const hash = new Uint8Array(await crypto.subtle.digest('SHA-256', secret))
  return hash
}

export async function generateTempLink(expiryMs: number): Promise<{
  token: string
}> {
  const now = Math.floor(Date.now() / 1000)
  const expiresAt = now + Math.floor(expiryMs / 1000)

  const jwt = await new SignJWT({ sub: 'guest' })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt(now)
    .setExpirationTime(expiresAt)
    .sign(secret)

  const encrypted = await new CompactEncrypt(new TextEncoder().encode(jwt))
    .setProtectedHeader({ alg: 'dir', enc: 'A256GCM' })
    .encrypt(await getEncryptionKey())

  return { token: encrypted }
}
