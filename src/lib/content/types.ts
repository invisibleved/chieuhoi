export type Mode = 'public' | 'preview'
export type Flag = 'unpublished' | 'rights-not-permitted' | 'consent-pending' | 'unverified' | 'idea'

export interface ImageView {
  url: string
  alt: string
  width: number
  height: number
  sizes: Partial<Record<'thumb' | 'card' | 'wide' | 'full', string>>
  photographer: string | null
  code: string | null
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

export interface TimelineEventView {
  label: string | null
  title: string | null
  body: string | null
  confidence: 'press' | 'oral' | 'pending' | null
  sourceIds: string[]
  flags: Flag[]
}

export interface CraftStepView {
  n: number
  title: string | null
  subtitle: string | null
  body: string | null
  tools: string | null
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
  summary: string | null
  image: ImageView | null
  typeConfirmed: boolean
  flags: Flag[]
}

export interface ProductView extends ProductCardView {
  images: ImageView[]
  /** Ảnh CMS đầu tiên (nơi các điểm annotation đặt toạ độ); null khi ảnh đó chưa được dùng ở mode hiện tại. */
  primaryImage: ImageView | null
  material: string | null
  technique: string | null
  size: string | null
  care: string | null
  annotations: { n: number; title: string | null; x: number; y: number; body: string; sourceId: string | null }[]
  maker: { name: string | null; verified: boolean } | null
}

export interface StoryCardView {
  slug: string
  title: string | null
  sapo: string | null
  category: string | null
  cover: ImageView | null
  readingMinutes: number | null
  hasDetail: boolean
  flags: Flag[]
}

export interface StoryView extends StoryCardView {
  /** Lexical JSON; khối cite chỉ còn sourceId. Hiển thị ở Phase 5. */
  body: unknown | null
  editor: string | null
  sources: SourceView[]
}

export interface PersonDetailView extends PersonView {
  note: string | null
  yearsInCraft: string | null
  story: unknown | null
}

export interface ArchiveItemView {
  image: ImageView
  title: string | null
  description: string | null
  category: string | null
  era: 'old' | 'now' | null
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
