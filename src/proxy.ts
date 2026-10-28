import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { checkBasicAuth } from '@/lib/basicAuth'
import { isIndexable, isStaging, isValidStagingAuth } from '@/lib/env'

type Env = Record<string, string | undefined>

const NOINDEX = 'noindex, nofollow'

/** Cổng staging: mật khẩu Basic Auth và noindex. Thuần để test được. */
export function gate(req: Request | NextRequest, env: Env): NextResponse {
  if (isStaging(env)) {
    const expected = env.STAGING_AUTH
    if (!isValidStagingAuth(expected) || !expected) {
      return new NextResponse('Staging chưa đặt mật khẩu.', {
        status: 503,
        headers: { 'Cache-Control': 'no-store', 'X-Robots-Tag': NOINDEX },
      })
    }
    if (!checkBasicAuth(req.headers.get('authorization'), expected)) {
      return new NextResponse('Cần mật khẩu để xem bản thử nghiệm.', {
        status: 401,
        headers: {
          'WWW-Authenticate': 'Basic realm="Chieu Hoi staging", charset="UTF-8"',
          'Cache-Control': 'no-store',
          'X-Robots-Tag': NOINDEX,
        },
      })
    }
  }
  const res = NextResponse.next()
  // APP_ENV sai hoặc thiếu coi như không phải production: vẫn noindex.
  if (!isIndexable(env)) res.headers.set('X-Robots-Tag', NOINDEX)
  return res
}

export function proxy(req: NextRequest): NextResponse {
  return gate(req, process.env)
}

// Chặn mọi đường dẫn trừ /_next/static (JS/CSS/font của build, không chứa dữ liệu).
export const config = {
  matcher: ['/((?!_next/static/).*)'],
}
