interface RateLimitEntry {
  count: number
  resetAt: number
}

const rateLimitMap = new Map<string, RateLimitEntry>()

export function checkRateLimit(
  userId: string,
  maxRequests: number,
  windowMs: number
): boolean {
  const now = Date.now()
  const entry = rateLimitMap.get(userId)

  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(userId, {
      count: 1,
      resetAt: now + windowMs
    })
    return true
  }

  if (entry.count < maxRequests) {
    entry.count++
    return true
  }

  return false
}

export function getRateLimitRemaining(
  userId: string,
  maxRequests: number
): number {
  const entry = rateLimitMap.get(userId)
  if (!entry || Date.now() > entry.resetAt) {
    return maxRequests
  }
  return Math.max(0, maxRequests - entry.count)
}
