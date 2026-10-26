import { PERSON_CATEGORY_OPTIONS } from '@/collections/People'
import { STORY_CATEGORY_OPTIONS } from '@/collections/Stories'

type Option = { label: string; value: string }

const toMap = (options: readonly Option[]) => new Map(options.map((o) => [o.value, o.label]))
const STORY = toMap(STORY_CATEGORY_OPTIONS)
const PERSON = toMap(PERSON_CATEGORY_OPTIONS)

// Giá trị lạ hoặc rỗng -> null (component ẩn dòng), không để lộ slug tiếng Anh ra giao diện.
export const storyCategoryLabel = (v: string | null | undefined) => (v ? (STORY.get(v) ?? null) : null)
export const personCategoryLabel = (v: string | null | undefined) => (v ? (PERSON.get(v) ?? null) : null)
