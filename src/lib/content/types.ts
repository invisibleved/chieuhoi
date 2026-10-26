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
  category: string
  role: string | null
  name: string | null
  portrait: ImageView | null
  quote: { text: string; sourceId: string } | null
  consentPending: boolean
  flags: Flag[]
}
