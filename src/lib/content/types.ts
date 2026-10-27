import type { ArchiveAsset } from '@/payload-types'

import type { CraftCopyView } from './copy/craft'
import type { StoriesCopyView } from './copy/stories'
import type { VillageCopyView } from './copy/village'

export type Mode = 'public' | 'preview'
export type Flag = 'unpublished' | 'rights-not-permitted' | 'consent-pending' | 'unverified'

export interface ImageView {
  url: string
  alt: string
  width: number
  height: number
  sizes: Partial<Record<'thumb' | 'card' | 'wide' | 'full', string>>
  photographer: string | null
  code: string | null
  /** Phần số của mã `TL-<số>`; null khi mã không đúng dạng đó. */
  docNumber: string | null
  flags: Flag[]
}

export interface PersonView {
  slug: string
  category: string | null
  role: string | null
  name: string | null
  portrait: ImageView | null
  quote: { text: string; sourceId: string } | null
  consentPending: boolean
  flags: Flag[]
}

export interface SourceView {
  id: string
  publisher: string | null
  title: string
  url: string | null
  date: string | null
}

export type Confidence = 'press' | 'oral' | 'pending'

export interface TimelineEventView {
  label: string | null
  title: string | null
  body: string | null
  /** Thiếu mức tin cậy thì coi là 'pending'. */
  confidence: Confidence
  sourceIds: string[]
  /** "Nhà xuất bản (dd/mm/yyyy); …" ghép từ các nguồn nhìn thấy được; null khi không còn nguồn nào. */
  sourceLine: string | null
  /** Liên kết nội bộ của dòng nguồn (chỉ mốc tĩnh "Mốc của bạn" có). */
  sourceHref: string | null
  flags: Flag[]
}

export interface CraftStepView {
  n: number
  title: string | null
  shortTitle: string | null
  subtitle: string | null
  body: string | null
  tools: string | null
  /** Việc biên tập cần ghi lại thêm: luôn null ở public. */
  toRecord: string | null
  image: ImageView | null
  shotNeeded: string | null
  focus: [number, number]
  flags: Flag[]
}

export interface ProductCardView {
  slug: string
  code: string | null
  name: string | null
  group: 'traditional' | 'contemporary' | null
  groupLabel: string | null
  summary: string | null
  image: ImageView | null
  typeConfirmed: boolean
  flags: Flag[]
}

export interface ProductView extends ProductCardView {
  images: ImageView[]
  /** Ảnh CMS đầu tiên (nơi các điểm annotation đặt toạ độ); null khi ảnh đó chưa được dùng ở mode hiện tại. */
  primaryImage: ImageView | null
  /** Đủ ảnh đầu tiên và ít nhất một chú thích để dựng khối hoa văn. */
  hasPattern: boolean
  material: string | null
  technique: string | null
  size: string | null
  care: string | null
  annotations: { n: number; title: string | null; x: number; y: number; body: string; sourceId: string | null }[]
  maker: { name: string | null; verified: boolean } | null
}

/**
 * Cây Lexical đã lọc (xem rich.ts). Nút đặc biệt:
 * - heading h2 có thêm `anchor: string` (R5);
 * - `{ type: 'cite', n: number }`: số chú thích, trỏ tới `sources[n - 1]` (R4);
 * - `{ type: 'figure', image: ImageView, caption: string | null }` (R3).
 */
export type RichNode = Record<string, unknown>
export type Rich = { root: RichNode }

export interface StoryCardView {
  slug: string
  title: string | null
  sapo: string | null
  category: string | null
  cover: ImageView | null
  readingMinutes: number | null
  hasDetail: boolean
  /** "Chủ đề đề xuất" cho bài idea ở mọi mode; "Bản nháp" chỉ ở preview (R2). */
  status: 'Bản nháp' | 'Chủ đề đề xuất' | null
  /** Số nguồn nhìn thấy được ở mode hiện tại. */
  sourceCount: number
  flags: Flag[]
}

export interface StoryView extends StoryCardView {
  body: Rich | null
  /** Các h2 của bài, theo thứ tự (R5). */
  toc: { id: string; title: string }[]
  /** Đánh số theo lần trích đầu tiên, nguồn không được trích xếp sau (R4); date dạng dd/mm/yyyy. */
  sources: SourceView[]
  editor: string | null
  /** dd/mm/yyyy */
  publishedAt: string | null
  coverCaption: string | null
  /** Việc cần thẩm định trước khi đăng: luôn null ở public. */
  reviewChecklist: string[] | null
}

export type ReadNextItem = {
  href: string
  eyebrow: string
  title: string
  cta: string
  image: ImageView | null
  /** false: không hiện ở mobile (R8). */
  mobile?: boolean
}

export interface StoriesPageView {
  intro: PageIntroView
  stories: StoryCardView[]
  /** Chip "Tất cả" (key all) rồi các chủ đề theo thứ tự option. */
  filters: { key: string; label: string }[]
  copy: StoriesCopyView
}

export interface StoryPageView {
  story: StoryView
  /** Hai thẻ cố định và một bài khác (R8). */
  readNext: ReadNextItem[]
  copy: StoriesCopyView
}

export interface PersonDetailView extends PersonView {
  note: string | null
  yearsInCraft: string | null
  story: Rich | null
}

/** Giá trị chủ đề ảnh tư liệu, lấy từ kiểu Payload (nguồn là ARCHIVE_CATEGORY_OPTIONS). */
export type ArchiveCategory = NonNullable<ArchiveAsset['category']>

export interface ArchiveItemView {
  image: ImageView
  title: string | null
  description: string | null
  category: ArchiveCategory | null
  categoryLabel: string | null
  era: NonNullable<ArchiveAsset['era']> | null
  eraLabel: string | null
  related: { label: string; href: string } | null
  flags: Flag[]
}

export interface SiteSettingsView {
  tagline: string | null
  description: string | null
  address: string | null
  addressNote: string | null
  email: string | null
  phone: string | null
  visitInfo: string | null
  copyright: string | null
}

export interface HomeMediaView {
  hero: { image: ImageView; title: string | null; caption: string | null } | null
  heroInset: ImageView | null
  village: { image: ImageView; caption: string | null }[]
}

export interface PageIntroView {
  eyebrow: string | null
  title: string | null
  lead: string | null
  heroTitle: string | null
}

export type MediaView = { image: ImageView; caption: string | null }
export type Variant = { desktop: string | null; mobile: string | null }

export interface CraftPageView {
  /** title giữ nguyên '\n' */
  intro: PageIntroView
  hero: MediaView | null
  steps: CraftStepView[]
  tools: { n: number; name: string; note: Variant; image: ImageView | null }[]
  compare: {
    hand: { title: string; image: ImageView | null; text: Variant; note: Variant }
    machine: { title: string; image: ImageView | null; text: Variant; note: Variant }
    /** Ô desktop bị ẩn để null; hàng cả hai ô null đã bị bỏ. `mobile`: các dòng mobile còn hiện được. */
    rows: {
      aspect: string
      hand: string | null
      machine: string | null
      mobile: string[]
      /** Ô/dòng còn chờ xác minh (hiện mờ ở preview); `mobile` song song với `mobile` ở trên. */
      muted: { hand: boolean; machine: boolean; mobile: boolean[] }
    }[]
  }
  readNext: ReadNextItem[]
  copy: CraftCopyView
}

export interface VillagePageView {
  intro: PageIntroView
  hero: MediaView | null
  /** Mục có nguồn mà mọi nguồn bị ẩn thì bị bỏ ở public. */
  facts: { term: string; detail: Variant; note: Variant; cite: string[] }[]
  /** Mốc từ CMS, mốc tĩnh '+' ở cuối. */
  timeline: TimelineEventView[]
  life: MediaView[]
  /** Nguồn mà trang trích, theo thứ tự đánh số [1][2][3], đã lọc theo mode. */
  sources: SourceView[]
  copy: VillageCopyView
}

export type { CraftCopyView, StoriesCopyView, VillageCopyView }
