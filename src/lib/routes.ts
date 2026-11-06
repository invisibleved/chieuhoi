/** Đường dẫn xem trước. File này chỉ import file không import gì, để dùng được ở mọi tầng. */
import { ROUTE_PATHS } from '@/lib/routeKeys'

export const PREVIEW_ROUTE = '/preview'
export const PREVIEW_EXIT_ROUTE = '/preview/exit'

export type PreviewCollection =
  | 'stories'
  | 'people'
  | 'products'
  | 'craft-steps'
  | 'timeline-events'
  | 'makers'
  | 'archive-assets'
  | 'site-settings'
  | 'pages'

function slugOf(doc: Record<string, unknown>): string | null {
  return typeof doc.slug === 'string' && doc.slug ? encodeURIComponent(doc.slug) : null
}

/** Trang công khai tương ứng với một bản ghi, hoặc null nếu không có. */
export function previewPathFor(slug: PreviewCollection, doc: Record<string, unknown>): string | null {
  const s = slugOf(doc)
  switch (slug) {
    case 'stories':
      return doc.workflow === 'idea' || !s ? '/cau-chuyen' : `/cau-chuyen/${s}`
    case 'people':
      return s ? `/con-nguoi/${s}` : '/con-nguoi'
    case 'products':
      return s ? `/san-pham/${s}` : '/san-pham'
    case 'craft-steps':
      return '/nghe-det-chieu'
    case 'timeline-events':
      return '/lang-hoi'
    case 'makers':
      return '/san-pham'
    case 'archive-assets':
      return doc.inArchive === true && typeof doc.code === 'string' && doc.code
        ? `/thu-vien?anh=${encodeURIComponent(doc.code)}`
        : null
    case 'site-settings':
      return '/'
    case 'pages':
      return typeof doc.slug === 'string' && Object.hasOwn(ROUTE_PATHS, doc.slug)
        ? ROUTE_PATHS[doc.slug as keyof typeof ROUTE_PATHS]
        : null
  }
}

function isSafe(p: string): boolean {
  if (!p.startsWith('/') || p.startsWith('//')) return false
  if (p.includes('\\')) return false
  if (/[\u0000-\u001f\u007f]/.test(p)) return false
  if (/^\/(admin|api)(?=[/?#]|$)/.test(p)) return false
  return true
}

/** Chỉ cho phép đường dẫn nội bộ; mọi thứ khác về '/'. */
export function safeInternalPath(raw: string | null | undefined): string {
  if (!raw) return '/'
  let decoded: string
  try {
    decoded = decodeURIComponent(raw)
  } catch {
    return '/'
  }
  return isSafe(raw) && isSafe(decoded) ? raw : '/'
}

export function previewUrl(path: string): string {
  return `${PREVIEW_ROUTE}?path=${encodeURIComponent(path)}`
}
