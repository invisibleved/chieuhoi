import { draftMode } from 'next/headers'

import { safeInternalPath } from '@/lib/routes'

import { privateRedirect } from '../privateRedirect'

export async function GET(request: Request) {
  ;(await draftMode()).disable()
  return privateRedirect(safeInternalPath(new URL(request.url).searchParams.get('path')))
}
