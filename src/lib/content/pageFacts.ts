// Ánh xạ tài liệu trang (collection `pages`) → dữ kiện trang Làng Hới và Nghề dệt chiếu.
// Hàm thuần, chịu được dữ liệu thiếu; không áp mode (pages.ts áp sau).
import type { Variant } from './types'

export type CitedText = { text: Variant; cite: string[] }

export type SentenceRow = {
  text?: string | null
  mobileText?: string | null
  hideOnMobile?: boolean | null
  sources?: unknown
}

/** Thẻ một cách dệt: mô tả và ghi chú giữ nguồn riêng, áp mode theo từng câu. */
export type Way = { title: string; text: CitedText; note: CitedText }

export type VillageFacts = {
  facts: { term: string; detail: Variant; note: Variant; editorNote: string | null; cite: string[] }[]
  founder: {
    paragraphs: { parts: CitedText[] }[]
    conflict: { parts: CitedText[]; closing: Variant }
    noPortrait: Variant
  }
  location: { body: { text: string; cite: string[] }; note: Variant }
  heritage: { paragraphs: CitedText[]; note: Variant }
  sourceOrder: string[]
}

export type CraftFacts = {
  /** `image`: giá trị thô của ô ảnh trong dòng dụng cụ (asset đã nạp, id, hoặc null); craftMerge áp luật ảnh. */
  tools: { n: number; name: string; note: Variant; cite: string[]; image: unknown }[]
  hand: Way
  machine: Way
  /** `mobileAuto`: dòng điện thoại tự ghép từ hai ô (biên tập viên để trống), dựng lại sau khi áp mode. */
  rows: { aspect: string; hand: string; machine: string; mobile: string[]; mobileAuto: boolean; cite: string[] }[]
  sourceOrder: string[]
}

type Rec = Record<string, unknown>
const rec = (v: unknown): Rec => (v && typeof v === 'object' ? (v as Rec) : {})
const arr = (v: unknown): Rec[] => (Array.isArray(v) ? v.map(rec) : [])
const str = (v: unknown): string => (typeof v === 'string' ? v : '')
const desktopOnly = (v: unknown): Variant => ({ desktop: str(v) || null, mobile: null })
const dedupe = (xs: string[]): string[] => [...new Set(xs)]

export function sourceIdsOf(v: unknown): string[] {
  if (!Array.isArray(v)) return []
  return v.flatMap((x) => {
    const id = rec(x).sourceId
    return typeof id === 'string' && id ? [id] : []
  })
}

export function toCited(row: SentenceRow | null | undefined): CitedText {
  const r = rec(row)
  const text = typeof r.text === 'string' && r.text ? r.text : null
  const mobileText = str(r.mobileText)
  return {
    text: { desktop: text, mobile: r.hideOnMobile ? null : mobileText || text },
    cite: sourceIdsOf(r.sources),
  }
}

export function orderSources(listed: string[], cited: string[]): string[] {
  return dedupe([...listed, ...cited])
}

const editorLines = (mobile: string | null | undefined): string[] =>
  (mobile ?? '').split('\n').map((l) => l.trim()).filter(Boolean)

/** Ghép dòng điện thoại tự động từ hai ô; ô nào null thì bỏ phần đó. */
export function composeMobileLine(hand: string | null, machine: string | null): string {
  return [hand !== null ? `Thủ công: ${hand}` : null, machine !== null ? `Máy: ${machine}` : null]
    .filter((x): x is string => x !== null)
    .join(' · ')
}

export function compareMobileLines(r: { hand?: string | null; machine?: string | null; mobile?: string | null }): string[] {
  const lines = editorLines(r.mobile)
  return lines.length ? lines : [composeMobileLine(r.hand ?? '', r.machine ?? '')]
}

export function villageFactsFrom(g: Record<string, unknown> | undefined): VillageFacts {
  const src = rec(g)
  const founder = rec(src.founder)
  const location = rec(src.location)
  const heritage = rec(src.heritage)

  const facts = arr(src.facts).map((f) => ({
    term: str(f.term),
    detail: { desktop: str(f.detail), mobile: str(f.detailMobile) || str(f.detail) },
    note: { desktop: str(f.note) || null, mobile: str(f.noteMobile) || str(f.note) || null } as Variant,
    editorNote: str(f.editorNote) || null,
    cite: sourceIdsOf(f.sources),
  }))
  const paragraphs = arr(founder.paragraphs).map((p) => ({ parts: arr(p.sentences).map(toCited) }))
  const conflictParts = arr(founder.conflict).map(toCited)
  const locCite = sourceIdsOf(location.sources)
  const heritageParas = arr(heritage.sentences).map(toCited)

  const cited = [
    ...facts.flatMap((f) => f.cite),
    ...paragraphs.flatMap((p) => p.parts.flatMap((c) => c.cite)),
    ...conflictParts.flatMap((c) => c.cite),
    ...locCite,
    ...heritageParas.flatMap((c) => c.cite),
  ]
  return {
    facts,
    founder: {
      paragraphs,
      conflict: { parts: conflictParts, closing: desktopOnly(founder.conflictEditorNote) },
      noPortrait: desktopOnly(founder.noPortrait),
    },
    location: { body: { text: str(location.text), cite: locCite }, note: desktopOnly(location.editorNote) },
    heritage: { paragraphs: heritageParas, note: desktopOnly(heritage.editorNote) },
    sourceOrder: orderSources(sourceIdsOf(src.pageSources), cited),
  }
}

function wayFrom(v: unknown): Way {
  const w = rec(v)
  return { title: str(w.title), text: toCited(rec(w.text)), note: toCited(rec(w.note)) }
}

const wayCite = (w: Way): string[] => [...w.text.cite, ...w.note.cite]

export function craftFactsFrom(g: Record<string, unknown> | undefined): CraftFacts {
  const src = rec(g)
  const tools = arr(src.tools).slice(0, 3).map((t, i) => {
    const note = toCited(rec(t.note))
    return { n: i + 1, name: str(t.name), note: note.text, cite: note.cite, image: t.image ?? null }
  })
  const hand = wayFrom(src.hand)
  const machine = wayFrom(src.machine)
  const rows = arr(src.compareRows).map((r) => ({
    aspect: str(r.aspect),
    hand: str(r.hand),
    machine: str(r.machine),
    mobile: compareMobileLines({ hand: str(r.hand), machine: str(r.machine), mobile: str(r.mobile) }),
    mobileAuto: editorLines(str(r.mobile)).length === 0,
    cite: sourceIdsOf(r.sources),
  }))
  const cited = [...tools.flatMap((t) => t.cite), ...wayCite(hand), ...wayCite(machine), ...rows.flatMap((r) => r.cite)]
  return { tools, hand, machine, rows, sourceOrder: orderSources(sourceIdsOf(src.pageSources), cited) }
}
