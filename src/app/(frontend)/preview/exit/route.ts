import { draftMode } from 'next/headers'
import { redirect } from 'next/navigation'

import { safeInternalPath } from '@/lib/routes'

export async function GET(request: Request) {
  ;(await draftMode()).disable()
  redirect(safeInternalPath(new URL(request.url).searchParams.get('path')))
}
