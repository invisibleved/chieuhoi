import type { RouteKey } from '@/lib/routeKeys'

/** Trường chỉ thuộc một số trang. Trường chung (`eyebrow`, `title`, `lead`, `slug`, `workflow`) không có ở đây. */
export const PAGE_ONLY_FIELDS: Record<RouteKey, readonly string[]> = {
  home: ['heroTitle', 'heroImage', 'heroInset', 'heroCaption', 'villageImages'],
  'lang-hoi': ['media', 'facts', 'founder', 'location', 'heritage', 'pageSources'],
  'nghe-det-chieu': ['media', 'tools', 'hand', 'machine', 'compareRows', 'pageSources'],
  'cau-chuyen': ['media'],
  'con-nguoi': ['media'],
  'san-pham': ['media'],
  'thu-vien': [],
  'ket-noi': [],
}

/** Hợp của mọi trường riêng, không trùng. */
export const ALL_PAGE_ONLY_FIELDS: readonly string[] = [...new Set(Object.values(PAGE_ONLY_FIELDS).flat())]

/** Trường riêng kiểu danh sách: khi xoá thì thành `[]`, còn lại thành `null`. */
export const LIST_PAGE_FIELDS: ReadonlySet<string> = new Set([
  'villageImages', 'media', 'facts', 'tools', 'compareRows', 'pageSources',
])

/** Trường riêng kiểu nhóm: khi xoá thì giữ dạng đối tượng, mọi giá trị con bị xoá. */
export const GROUP_PAGE_FIELDS: ReadonlySet<string> = new Set(['founder', 'location', 'heritage', 'hand', 'machine'])

export const isPageField = (slug: unknown, name: string): boolean =>
  typeof slug === 'string' && Object.hasOwn(PAGE_ONLY_FIELDS, slug) &&
  PAGE_ONLY_FIELDS[slug as RouteKey].includes(name)
