import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { checkBasicAuth } from '@/lib/basicAuth'
import { isIndexable, isStaging } from '@/lib/env'

type Env = Record<string, string | undefined>

const NOINDEX = 'noindex, nofollow'

/** STAGING_AUTH hợp lệ khi có dạng user:password với cả hai vế không rỗng. */
function stagingAuth(env: Env): string | null {
  const value = env.STAGING_AUTH ?? ''
  const i = value.indexOf(':')
  return i > 0 && i < value.length - 1 ? value : null
}

/** Cổng staging: mật khẩu Basic Auth và noindex. Thuần để test được. */
export function gate(req: Request | NextRequest, env: Env): NextResponse {
  if (isStaging(env)) {
    const expected = stagingAuth(env)
    if (!expected) {
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
