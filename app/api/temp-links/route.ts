import { generateTempLink } from '@/lib/temp-link-utils'
import { checkRateLimit } from '@/lib/rate-limit'
import { getBasicAuthUsername } from '@/lib/basic-auth'
import { NextRequest, NextResponse } from 'next/server'

const MAX_TEMP_LINKS_PER_HOUR = 10
const RATE_LIMIT_WINDOW = 60 * 60 * 1000

function getAdminId(req: NextRequest): string | null {
  return getBasicAuthUsername(req.headers.get('authorization'))
}

export async function GET(req: NextRequest) {
  const adminId = getAdminId(req)

  if (!adminId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
}

export async function POST(req: NextRequest) {
  const adminId = getAdminId(req)

  if (!adminId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  if (!checkRateLimit(adminId, MAX_TEMP_LINKS_PER_HOUR, RATE_LIMIT_WINDOW)) {
    return NextResponse.json(
      { error: 'Too many temp links created. Please try again later.' },
      { status: 429 }
    )
  }

  const body = await req.json()
  const { expiryMinutes } = body

  if (!expiryMinutes || expiryMinutes < 1 || expiryMinutes > 1440) {
    return NextResponse.json(
      { error: 'Invalid expiry time. Must be between 1 and 1440 minutes.' },
      { status: 400 }
    )
  }

  const expiryMs = expiryMinutes * 60 * 1000
  const { token } = await generateTempLink(expiryMs)

  const baseUrl = process.env.GUEST_URL || process.env.NEXTAUTH_URL || 'http://localhost:8000'
  const shareUrl = `${baseUrl}/temp?token=${token}`

  return NextResponse.json({
    shareUrl
  })
}
