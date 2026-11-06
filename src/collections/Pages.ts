import type { CollectionBeforeChangeHook, CollectionConfig, Field } from 'payload'

import { guardPublish, previewFor, recordDraftArg, syncWorkflow, workflowField } from '@/access/publishing'
import { ADMIN_GROUPS, isLoggedIn } from '@/access/roles'
import { craftFactsFields, villageFactsFields } from '@/globals/pageFacts'
import { PAGES_MEDIA_SLOTS, PAGE_MEDIA_SLOT_LABELS } from '@/globals/pageMedia'
import { revalidateAfterChange } from '@/hooks/revalidate'
import { pagePageSourcesField } from './pages/checkPageSources'
import { isPageField } from './pages/fields'
import { ROUTE_KEYS, ROUTE_LABELS, type RouteKey } from '@/lib/routeKeys'
import { stripForeignFields } from './pages/stripForeign'

const isRouteKey = (v: unknown): v is RouteKey => typeof v === 'string' && (ROUTE_KEYS as readonly string[]).includes(v)

/** Chỉ hiện trường ở đúng trang của nó. */
const onlyOnOwnPage = (field: Field): Field => {
  const name = (field as { name: string }).name
  return { ...field, admin: { ...field.admin, condition: (data) => isPageField(data?.slug, name) } } as Field
}

const ALL_MEDIA_SLOTS = [...new Set(Object.values(PAGES_MEDIA_SLOTS).flat())] as string[]

const slotsOf = (slug: unknown): readonly string[] =>
  typeof slug === 'string' && Object.hasOwn(PAGES_MEDIA_SLOTS, slug)
    ? PAGES_MEDIA_SLOTS[slug as keyof typeof PAGES_MEDIA_SLOTS]
    : []

const mediaField: Field = {
  name: 'media',
  type: 'array',
  label: 'Ảnh của trang',
  validate: (rows: unknown, { data, siblingData }) => {
    const slug = (data as { slug?: unknown } | undefined)?.slug ?? (siblingData as { slug?: unknown } | undefined)?.slug
    const allowed = slotsOf(slug)
    const slots = ((rows as { slot?: string }[] | null | undefined) ?? []).map((r) => r?.slot)
    if (slots.some((s) => !s || !allowed.includes(s))) return 'Ô ảnh không thuộc trang này.'
    return new Set(slots).size === slots.length ? true : 'Mỗi ô ảnh chỉ được dùng một lần.'
  },
  fields: [
    {
      name: 'slot',
      type: 'select',
      label: 'Ô ảnh',
      required: true,
      options: ALL_MEDIA_SLOTS.map((v) => ({ value: v, label: PAGE_MEDIA_SLOT_LABELS[v] ?? v })),
    },
    { name: 'image', type: 'upload', relationTo: 'archive-assets', label: 'Ảnh' },
    { name: 'caption', type: 'text', label: 'Chú thích', localized: true },
  ],
}

const homeFields: Field[] = [
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
]

// `pageSources` có ở cả hai bộ dữ kiện; collection chỉ giữ một trường.
const craftFields = craftFactsFields().filter(
  (f) => (f as { name?: string }).name !== 'pageSources',
)

const villageFields = villageFactsFields().map((f) =>
  (f as { name?: string }).name === 'pageSources' ? pagePageSourcesField() : f,
)

/** Xoá giá trị các trường không thuộc trang đang lưu; chỉ đụng tới khoá có trong `data`. */
const stripForeignHook: CollectionBeforeChangeHook = ({ data, originalDoc }) => {
  const slug = (originalDoc as { slug?: unknown } | undefined)?.slug ?? (data as { slug?: unknown }).slug
  if (!isRouteKey(slug)) return data
  const stripped = stripForeignFields(slug, data)
  return Object.fromEntries(Object.keys(data).map((k) => [k, stripped[k]]))
}

export const Pages: CollectionConfig = {
  slug: 'pages',
  labels: { singular: 'Trang', plural: 'Các trang' },
  admin: {
    group: ADMIN_GROUPS.pages,
    useAsTitle: 'slug',
    defaultColumns: ['slug', '_status', 'workflow', 'updatedAt'],
    preview: previewFor('pages'),
  },
  versions: { drafts: true },
  access: {
    read: isLoggedIn,
    create: () => false,
    delete: () => false,
    update: isLoggedIn,
  },
  hooks: {
    beforeOperation: [recordDraftArg],
    beforeChange: [guardPublish, syncWorkflow, stripForeignHook],
    afterChange: [revalidateAfterChange],
  },
  fields: [
    {
      name: 'slug',
      type: 'select',
      label: 'Trang',
      options: ROUTE_KEYS.map((k) => ({ value: k, label: ROUTE_LABELS[k] })),
      required: true,
      unique: true,
      access: { update: () => false },
      admin: { readOnly: true, position: 'sidebar' },
    },
    workflowField(),
    { name: 'eyebrow', type: 'text', label: 'Dòng nhỏ phía trên', localized: true },
    { name: 'title', type: 'textarea', label: 'Tiêu đề (giữ ngắt dòng)', localized: true },
    { name: 'lead', type: 'textarea', label: 'Đoạn dẫn', localized: true },
    ...[...homeFields, mediaField, ...villageFields, ...craftFields].map(onlyOnOwnPage),
  ],
}
