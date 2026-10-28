import { draftMode } from 'next/headers'
import { redirect } from 'next/navigation'

import { canPreview } from '@/lib/content'
import { safeInternalPath } from '@/lib/routes'

export async function GET(request: Request) {
  if (!(await canPreview(request.headers))) {
    return new Response('Cần đăng nhập trang quản trị để xem trước.', {
      status: 401,
      headers: { 'Cache-Control': 'no-store' },
    })
  }
  ;(await draftMode()).enable()
  redirect(safeInternalPath(new URL(request.url).searchParams.get('path')))
}
