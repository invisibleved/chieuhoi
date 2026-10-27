// View model của các trang ghép nhiều nguồn: /nghe-det-chieu và /lang-hoi.
// Dùng lại các hàm của createContent; chỉ thêm phần ảnh theo ô và chữ cố định đã áp mode.
import type { Payload } from 'payload'

import type { ArchiveAsset } from '@/payload-types'
import { PAGE_MEDIA_SLOTS, type PageMediaRoute, type PageMediaSlot } from '@/globals/pageMedia'

import { applyMode } from './copy/applyMode'
import { craftCompare, craftCopy, craftReadNext, craftTools } from './copy/craft'
import { villageCopy, villageFacts, villageSourceOrder, villageTimelineAdd } from './copy/village'
import { formatDate, readGlobalDoc, type createContent } from './queries'
import type { CraftPageView, MediaView, Mode, SourceView, VillagePageView } from './types'
import { showText, toImageView } from './visibility'

type Content = ReturnType<typeof createContent>
type MediaRow = { slot?: string; image?: unknown; caption?: string | null }

/** Bỏ các sourceId không có trong `allowed` ở mọi mảng `cite` của một cây copy. */
function filterCites<T>(value: T, allowed: Set<string>): T {
  const walk = (v: unknown, key?: string): unknown => {
    if (key === 'cite' && Array.isArray(v)) return v.filter((id) => allowed.has(id))
    if (Array.isArray(v)) return v.map((x) => walk(x))
    if (v && typeof v === 'object') {
      return Object.fromEntries(Object.entries(v).map(([k, x]) => [k, walk(x, k)]))
    }
    return v
  }
  return walk(value) as T
}

export function createPages(payload: Payload, content: Content) {
  async function getPageMedia<R extends PageMediaRoute>(
    route: R, mode: Mode,
  ): Promise<Partial<Record<PageMediaSlot<R>, MediaView>>> {
    const g = (await readGlobalDoc(payload, 'page-intros', mode, 1)) as Record<string, { media?: MediaRow[] } | undefined>
    const allowed: readonly string[] = PAGE_MEDIA_SLOTS[route]
    const out: Partial<Record<string, MediaView>> = {}
    for (const row of g[route]?.media ?? []) {
      if (!row.slot || !allowed.includes(row.slot)) continue
      const image = toImageView(row.image as ArchiveAsset | number | null | undefined, mode)
      if (image) out[row.slot] = { image, caption: showText(row.caption, mode) }
    }
    return out as Partial<Record<PageMediaSlot<R>, MediaView>>
  }

  async function getCraftPage(mode: Mode): Promise<CraftPageView> {
    const [intro, media, steps] = await Promise.all([
      content.getPageIntro('nghe-det-chieu', mode),
      getPageMedia('nghe-det-chieu', mode),
      content.getCraftSteps(mode),
    ])
    const rows: CraftPageView['compare']['rows'] = []
    for (const r of craftCompare.rows) {
      const hand = showText(r.hand, mode)
      const machine = showText(r.machine, mode)
      if (hand !== null || machine !== null) rows.push({ aspect: r.aspect, hand, machine })
    }
    const card = (c: typeof craftCompare.hand, slot: 'hand' | 'machine') => ({
      title: c.title, image: media[slot]?.image ?? null,
      text: applyMode(c.text, mode), note: applyMode(c.note, mode),
    })
    return {
      intro,
      hero: media.hero ?? null,
      steps,
      tools: craftTools.map((t) => ({
        n: t.n, name: t.name, note: applyMode(t.note, mode),
        image: media[`tool-${t.n}` as 'tool-1']?.image ?? null,
      })),
      compare: { hand: card(craftCompare.hand, 'hand'), machine: card(craftCompare.machine, 'machine'), rows },
      readNext: craftReadNext.map((r) => ({
        href: r.href, eyebrow: r.eyebrow, title: r.title, cta: r.cta, image: media[r.slot]?.image ?? null,
      })),
      copy: applyMode(craftCopy, mode),
    }
  }

  async function getVillagePage(mode: Mode): Promise<VillagePageView> {
    const [intro, media, events, allSources] = await Promise.all([
      content.getPageIntro('lang-hoi', mode),
      getPageMedia('lang-hoi', mode),
      content.getTimeline(mode),
      content.getSources(mode),
    ])
    // Chỉ các nguồn trang trích, theo thứ tự đánh số (R9); nguồn bị ẩn thì cite tương ứng cũng bị bỏ.
    const byId = new Map(allSources.map((s) => [s.id, s]))
    const sources = villageSourceOrder
      .map((id) => byId.get(id))
      .filter((s): s is SourceView => s !== undefined)
      .map((s) => ({ ...s, date: formatDate(s.date) }))
    const visible = new Set(sources.map((s) => s.id))

    const add = applyMode(villageTimelineAdd, mode)
    const facts = villageFacts.map((f) => ({
      term: f.term,
      detail: f.detail,
      note: f.note ? (mode === 'preview' && f.notePreview ? `${f.note} · ${f.notePreview}` : f.note) : null,
      cite: f.cite.filter((id) => visible.has(id)),
    }))

    return {
      intro,
      hero: media.hero ?? null,
      facts,
      timeline: [
        ...events,
        {
          label: add.label, title: add.title, body: add.body, confidence: 'pending', sourceIds: [],
          sourceLine: add.sourceLine, sourceHref: villageTimelineAdd.sourceHref, flags: [],
        },
      ],
      life: (['life-1', 'life-2', 'life-3'] as const).flatMap((s) => (media[s] ? [media[s]] : [])),
      sources,
      copy: filterCites(applyMode(villageCopy, mode), visible),
    }
  }

  return { getPageMedia, getCraftPage, getVillagePage }
}
