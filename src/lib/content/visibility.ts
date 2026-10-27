// Hàm thuần: quyết định bản công khai được phép hiện gì. Không import runtime Payload ngoài luật ảnh.
import { isAssetPubliclyAllowed } from '@/access/assetRules'
import type { ArchiveAsset, Person } from '@/payload-types'

import { personCategoryLabel } from './categories'
import type { Flag, ImageView, Mode, PersonView } from './types'

export const UNVERIFIED = '[cần xác minh]'

const UNVERIFIED_MARK = /\[[^\]]*(?:cần|chờ)\s[^\]]*\]/iu

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

/** Mã tư liệu chỉ hiện khi dạng TL-<số>; trả về phần số. */
export function docNumber(code: string | null | undefined): string | null {
  const m = code?.match(/^TL-(\d+)$/)
  return m ? m[1] : null
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

  const code = showText(asset.code, mode)
  return {
    url: asset.url ?? '',
    // Ảnh bắt buộc có alt; nếu alt chưa xác minh ở public thì để '' (ảnh trang trí).
    alt: showText(asset.alt, mode) ?? '',
    width: asset.width ?? 0,
    height: asset.height ?? 0,
    sizes,
    photographer: showText(asset.photographer, mode),
    code,
    docNumber: docNumber(code),
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
  let portrait = consent.photo || isPreview ? portraitView : null
  // Alt chân dung có thể chứa tên: ở public, không có đồng ý tên thì bỏ alt.
  if (portrait && !isPreview && !consent.name) portrait = { ...portrait, alt: '' }
  if (isPreview && !consent.photo) addFlag(flags, 'consent-pending')
  portraitView?.flags.forEach((f) => isPreview && addFlag(flags, f))

  const source = p.quoteSource && typeof p.quoteSource === 'object' ? p.quoteSource : null
  let quote: PersonView['quote'] = null
  if (isPreview) {
    if (!isUnverified(p.quote) || (typeof p.quote === 'string' && p.quote.trim() !== '')) {
      quote = { text: showText(p.quote, mode) as string, sourceId: source?.sourceId ?? '' }
      if (!source || isUnverified(p.quote)) addFlag(flags, 'unverified')
    } else {
      addFlag(flags, 'unverified')
    }
    if (!consent.quote) addFlag(flags, 'consent-pending')
  } else if (consent.quote && source && !isUnverified(p.quote)) {
    quote = { text: p.quote as string, sourceId: source.sourceId }
  }

  return {
    slug: p.slug,
    category: personCategoryLabel(p.category),
    role: showText(p.role, mode),
    name,
    portrait,
    quote,
    consentPending: !(consent.name && consent.photo),
    flags,
  }
}
