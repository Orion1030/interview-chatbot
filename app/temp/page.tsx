import { cookies } from 'next/headers'
import { validateTempToken } from '@/lib/temp-link-utils'

export default async function TempPage({
  searchParams
}: {
  searchParams: Promise<{ token?: string }>
}) {
  const params = await searchParams
  const token = params.token

  if (!token) {
    return (
      <div>
        <script
          dangerouslySetInnerHTML={{
            __html: `window.location.href = '/temp-link-expired';`
          }}
        />
      </div>
    )
  }

  const result = await validateTempToken(token)

  if (!result.valid) {
    return (
      <div>
        <script
          dangerouslySetInnerHTML={{
            __html: `window.location.href = '/temp-link-expired';`
          }}
        />
      </div>
    )
  }

  const cookieStore = await cookies()
  cookieStore.set('guest-session', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/'
  })

  return (
    <div>
      <script
        dangerouslySetInnerHTML={{
          __html: `window.location.href = '/';`
        }}
      />
    </div>
  )
}
