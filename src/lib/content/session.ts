import config from '@payload-config'
import { getPayload } from 'payload'
import { cache } from 'react'

import { createPreview } from './preview'

/** Request hiện tại có phiên admin hợp lệ không (gọi Payload một lần mỗi request). */
export const hasAdminSession = cache(async (headers: Headers): Promise<boolean> =>
  createPreview(await getPayload({ config })).canPreview(headers),
)
