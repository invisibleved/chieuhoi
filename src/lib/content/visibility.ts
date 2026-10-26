// Hàm thuần: quyết định bản công khai được phép hiện gì. Không import runtime Payload ngoài luật ảnh.
import { isAssetPubliclyAllowed } from '@/collections/ArchiveAssets'
import type { ArchiveAsset, Person } from '@/payload-types'

import type { Flag, ImageView, Mode, PersonView } from './types'

export const UNVERIFIED = '[cần xác minh]'

const UNVERIFIED_MARK = /\[\s*cần xác minh\s*\]/iu

export function isUnverified(v: unknown): boolean {
  if (v === null || v === undefined) return true
  if (typeof v !== 'string') return false
  const s = v.normalize('NFC')
  return s.trim() === '' || UNVERIFIED_MARK.test(s)
}

export function showText(v: string | null | undefined, mode: Mode): string | null {
  if (mode === 'public') return isUnverified(v) ? null : (v as string)
  return v === null || v === undefined || v.trim() === '' ? UNVERIFIED : v
}

const addFlag = (flags: Flag[], f: Flag) => {
  if (!flags.includes(f)) flags.push(f)
}

export function toImageView(
  asset: ArchiveAsset | number | null | undefined,
  mode: Mode,
): ImageView | null {
  if (asset === null || asset === undefined || typeof asset === 'number') return null
  const allowed = isAssetPubliclyAllowed(asset)
  if (mode === 'public' && !allowed) return null

  const flags: Flag[] = []
  if (asset.rights !== 'permitted') addFlag(flags, 'rights-not-permitted')
  if (asset.subjectConsent === 'pending') addFlag(flags, 'consent-pending')

  const sizes: ImageView['sizes'] = {}
  for (const k of ['thumb', 'card', 'wide', 'full'] as const) {
    const u = asset.sizes?.[k]?.url
    if (u) sizes[k] = u
  }

  return {
    url: asset.url ?? '',
    // Ảnh bắt buộc có alt; nếu alt chưa xác minh ở public thì để '' (ảnh trang trí).
    alt: showText(asset.alt, mode) ?? '',
    width: asset.width ?? 0,
    height: asset.height ?? 0,
    sizes,
    photographer: asset.photographer ?? null,
    code: asset.code ?? null,
    flags,
  }
}

export function toPersonView(p: Person, mode: Mode): PersonView {
  const consent = p.consent ?? {}
  const flags: Flag[] = []
  const isPreview = mode === 'preview'

  const name = consent.name || isPreview ? showText(p.name, mode) : null
  if (isPreview && !consent.name) addFlag(flags, 'consent-pending')
  if (isPreview && isUnverified(p.name)) addFlag(flags, 'unverified')

  const portraitView = toImageView(p.portrait, mode)
  const portrait = consent.photo || isPreview ? portraitView : null
  if (isPreview && !consent.photo) addFlag(flags, 'consent-pending')
  portraitView?.flags.forEach((f) => isPreview && addFlag(flags, f))

  const source = p.quoteSource && typeof p.quoteSource === 'object' ? p.quoteSource : null
  let quote: PersonView['quote'] = null
  if (source && !isUnverified(p.quote) && (consent.quote || isPreview)) {
    quote = { text: p.quote as string, sourceId: source.sourceId }
  }
  if (isPreview) {
    if (!consent.quote) addFlag(flags, 'consent-pending')
    if (isUnverified(p.quote)) addFlag(flags, 'unverified')
  }

  return {
    slug: p.slug,
    category: p.category ?? '',
    role: showText(p.role, mode),
    name,
    portrait,
    quote,
    consentPending: !(consent.name && consent.photo),
    flags,
  }
}
