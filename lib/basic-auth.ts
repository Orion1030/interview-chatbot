export function getBasicAuthUsername(
  authHeader: string | null
): string | null {
  if (!authHeader || !authHeader.startsWith('Basic ')) {
    return null
  }

  const base64Credentials = authHeader.split(' ')[1]
  const [username] = Buffer.from(base64Credentials, 'base64')
    .toString('binary')
    .split(':')

  return username || null
}
