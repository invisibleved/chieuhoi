import type { MetadataRoute } from 'next'
import { isIndexable } from '@/lib/env'

/** Chỉ production cho lập chỉ mục; mọi môi trường khác chặn tất cả. */
export function robotsFor(env: Record<string, string | undefined>): MetadataRoute.Robots {
  if (!isIndexable(env)) return { rules: { userAgent: '*', disallow: '/' } }
  return { rules: { userAgent: '*', allow: '/', disallow: ['/admin', '/api', '/preview', '/styleguide'] } }
}

export default function robots(): MetadataRoute.Robots {
  return robotsFor(process.env)
}
