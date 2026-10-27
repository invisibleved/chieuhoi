import { ARCHIVE_CATEGORY_OPTIONS, ARCHIVE_ERA_OPTIONS } from '@/collections/ArchiveAssets'
import { PERSON_CATEGORY_OPTIONS } from '@/collections/People'
import { PRODUCT_GROUP_OPTIONS } from '@/collections/Products'
import { STORY_CATEGORY_OPTIONS } from '@/collections/Stories'

import type { ArchiveCategory } from './types'

type Option = { label: string; value: string }

const toMap = (options: readonly Option[]) => new Map(options.map((o) => [o.value, o.label]))
const STORY = toMap(STORY_CATEGORY_OPTIONS)
const PERSON = toMap(PERSON_CATEGORY_OPTIONS)
const GROUP = toMap(PRODUCT_GROUP_OPTIONS)
const ARCHIVE_CATEGORY = toMap(ARCHIVE_CATEGORY_OPTIONS)
const ERA = toMap(ARCHIVE_ERA_OPTIONS)

// Giá trị lạ hoặc rỗng -> null (component ẩn dòng), không để lộ slug tiếng Anh ra giao diện.
export const storyCategoryLabel = (v: string | null | undefined) => (v ? (STORY.get(v) ?? null) : null)
export const personCategoryLabel = (v: string | null | undefined) => (v ? (PERSON.get(v) ?? null) : null)
export const productGroupLabel = (v: string | null | undefined) => (v ? (GROUP.get(v) ?? null) : null)
export const archiveCategoryLabel = (v: string | null | undefined) => (v ? (ARCHIVE_CATEGORY.get(v) ?? null) : null)
export const archiveEraLabel = (v: string | null | undefined) => (v ? (ERA.get(v) ?? null) : null)

/** Danh sách chủ đề ảnh tư liệu theo thứ tự option, cho bộ lọc (không gồm chip "Tất cả"). */
export const archiveCategoryOptions: { key: ArchiveCategory; label: string }[] = ARCHIVE_CATEGORY_OPTIONS.map((o) => ({
  key: o.value as ArchiveCategory,
  label: o.label,
}))
