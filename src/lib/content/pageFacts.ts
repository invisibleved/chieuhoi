// Ánh xạ global `page-intros` → dữ kiện trang Làng Hới và Nghề dệt chiếu.
// Hàm thuần, chịu được dữ liệu thiếu; không áp mode (pages.ts áp sau).
import type { Variant } from './types'

export type CitedText = { text: Variant; cite: string[] }

export type SentenceRow = {
  text?: string | null
  mobileText?: string | null
  hideOnMobile?: boolean | null
  sources?: unknown
}

export type Way = { title: string; text: Variant; note: Variant; cite: string[] }

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
  tools: { n: number; name: string; note: Variant; cite: string[] }[]
  hand: Way
  machine: Way
  rows: { aspect: string; hand: string; machine: string; mobile: string[]; cite: string[] }[]
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

export function compareMobileLines(r: { hand?: string | null; machine?: string | null; mobile?: string | null }): string[] {
  const lines = (r.mobile ?? '').split('\n').map((l) => l.trim()).filter(Boolean)
  return lines.length ? lines : [`Thủ công: ${r.hand ?? ''} · Máy: ${r.machine ?? ''}`]
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
  const text = toCited(rec(w.text))
  const note = toCited(rec(w.note))
  return { title: str(w.title), text: text.text, note: note.text, cite: dedupe([...text.cite, ...note.cite]) }
}

export function craftFactsFrom(g: Record<string, unknown> | undefined): CraftFacts {
  const src = rec(g)
  const tools = arr(src.tools).slice(0, 3).map((t, i) => {
    const note = toCited(rec(t.note))
    return { n: i + 1, name: str(t.name), note: note.text, cite: note.cite }
  })
  const hand = wayFrom(src.hand)
  const machine = wayFrom(src.machine)
  const rows = arr(src.compareRows).map((r) => ({
    aspect: str(r.aspect),
    hand: str(r.hand),
    machine: str(r.machine),
    mobile: compareMobileLines({ hand: str(r.hand), machine: str(r.machine), mobile: str(r.mobile) }),
    cite: sourceIdsOf(r.sources),
  }))
  const cited = [...tools.flatMap((t) => t.cite), ...hand.cite, ...machine.cite, ...rows.flatMap((r) => r.cite)]
  return { tools, hand, machine, rows, sourceOrder: orderSources(sourceIdsOf(src.pageSources), cited) }
}
