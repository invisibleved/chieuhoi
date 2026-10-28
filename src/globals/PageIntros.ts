import type { Field, GlobalConfig } from 'payload'

import { guardPublish, recordDraftArg } from '@/access/publishing'
import { ADMIN_GROUPS, isLoggedIn } from '@/access/roles'
import { PAGE_MEDIA_SLOTS, PAGE_MEDIA_SLOT_LABELS, isPageMediaRoute } from './pageMedia'

export const ROUTE_KEYS = [
  'home',
  'lang-hoi',
  'cau-chuyen',
  'nghe-det-chieu',
  'con-nguoi',
  'san-pham',
  'thu-vien',
  'ket-noi',
] as const

export type RouteKey = (typeof ROUTE_KEYS)[number]

const ROUTE_LABELS: Record<RouteKey, string> = {
  home: 'Trang chủ',
  'lang-hoi': 'Làng Hới',
  'cau-chuyen': 'Câu chuyện',
  'nghe-det-chieu': 'Nghề dệt chiếu',
  'con-nguoi': 'Con người',
  'san-pham': 'Sản phẩm',
  'thu-vien': 'Thư viện',
  'ket-noi': 'Kết nối',
}

const pageMediaField = (key: keyof typeof PAGE_MEDIA_SLOTS): Field => ({
  name: 'media',
  type: 'array',
  label: 'Ảnh của trang',
  maxRows: PAGE_MEDIA_SLOTS[key].length,
  validate: (rows: unknown) => {
    const slots = ((rows as { slot?: string }[] | null | undefined) ?? []).map((r) => r?.slot)
    return new Set(slots).size === slots.length ? true : 'Mỗi ô ảnh chỉ được dùng một lần.'
  },
  fields: [
    {
      name: 'slot',
      type: 'select',
      label: 'Ô ảnh',
      required: true,
      options: PAGE_MEDIA_SLOTS[key].map((v) => ({ value: v, label: PAGE_MEDIA_SLOT_LABELS[v] })),
    },
    { name: 'image', type: 'upload', relationTo: 'archive-assets', label: 'Ảnh' },
    { name: 'caption', type: 'text', label: 'Chú thích', localized: true },
  ],
})

const routeGroup = (key: RouteKey): Field => ({
  name: key,
  type: 'group',
  label: ROUTE_LABELS[key],
  fields: [
    { name: 'eyebrow', type: 'text', label: 'Dòng nhỏ phía trên', localized: true },
    { name: 'title', type: 'textarea', label: 'Tiêu đề (giữ ngắt dòng)', localized: true },
    { name: 'lead', type: 'textarea', label: 'Đoạn dẫn', localized: true },
    ...(key === 'home'
      ? ([
          { name: 'heroTitle', type: 'textarea', label: 'Tiêu đề hero (giữ ngắt dòng)', localized: true },
          { name: 'heroImage', type: 'upload', relationTo: 'archive-assets', label: 'Ảnh hero' },
          { name: 'heroInset', type: 'upload', relationTo: 'archive-assets', label: 'Ảnh nhỏ cạnh hero' },
          { name: 'heroCaption', type: 'text', label: 'Chú thích ảnh hero', localized: true },
          {
            name: 'villageImages', type: 'array', label: 'Ảnh mục Làng Hới', maxRows: 2,
            fields: [
              { name: 'image', type: 'upload', relationTo: 'archive-assets', label: 'Ảnh' },
              { name: 'caption', type: 'text', label: 'Chú thích', localized: true },
            ],
          },
        ] as Field[])
      : []),
    ...(isPageMediaRoute(key) ? [pageMediaField(key)] : []),
  ],
})

export const PageIntros: GlobalConfig = {
  slug: 'page-intros',
  label: 'Phần mở đầu trang',
  admin: { group: ADMIN_GROUPS.pages },
  versions: { drafts: true },
  access: { read: isLoggedIn, update: isLoggedIn },
  hooks: { beforeOperation: [recordDraftArg], beforeChange: [guardPublish] },
  fields: ROUTE_KEYS.map(routeGroup),
}
