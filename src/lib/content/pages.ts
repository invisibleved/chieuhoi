// View model của các trang ghép nhiều nguồn: /nghe-det-chieu và /lang-hoi.
// Dùng lại các hàm của createContent; chỉ thêm phần ảnh theo ô và chữ cố định đã áp mode.
import type { Payload } from 'payload'

import type { ArchiveAsset } from '@/payload-types'
import { PAGE_MEDIA_SLOTS, type PageMediaRoute, type PageMediaSlot } from '@/globals/pageMedia'

import { applyMode } from './copy/applyMode'
import { connectCopy } from './copy/connect'
import { craftCompare, craftCopy, craftReadNext, craftTools } from './copy/craft'
import { villageCopy, villageFacts, villageSourceOrder, villageTimelineAdd } from './copy/village'
import { formatDate, readGlobalDoc, type createContent } from './queries'
import type { ConnectPageView, CraftPageView, MediaView, Mode, SourceView, VillagePageView } from './types'
import { isUnverified, showText, toImageView } from './visibility'

type Content = ReturnType<typeof createContent>
type MediaRow = { slot?: string; image?: unknown; caption?: string | null }

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
      const lines = r.mobile.map((l) => ({ text: showText(l, mode), muted: isUnverified(l) })).filter((l): l is { text: string; muted: boolean } => l.text !== null)
      if (hand !== null || machine !== null) {
        rows.push({
          aspect: r.aspect, hand, machine, mobile: lines.map((l) => l.text),
          muted: { hand: isUnverified(r.hand), machine: isUnverified(r.machine), mobile: lines.map((l) => l.muted) },
        })
      }
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
    // Ghi chú "· cần đối chiếu…" chỉ ở preview (R4).
    const noteOf = (f: (typeof villageFacts)[number], k: 'desktop' | 'mobile') => {
      const note = f.note[k]
      return note && mode === 'preview' && f.notePreview[k] ? `${note} · ${f.notePreview[k]}` : note
    }
    const facts = villageFacts.flatMap((f) => {
      const cite = f.cite.filter((id) => visible.has(id))
      // Thông tin có nguồn mà mọi nguồn bị ẩn thì không hiện ở public.
      if (mode === 'public' && cite.length === 0) return []
      return [{
        term: f.term,
        detail: applyMode(f.detail, mode),
        note: applyMode({ desktop: noteOf(f, 'desktop'), mobile: noteOf(f, 'mobile') }, mode),
        cite,
      }]
    })

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
      copy: applyMode(villageCopy, mode, { cites: visible }),
    }
  }

  /** Trống thì null ở cả hai mode (R-P1); có dấu chưa xác minh thì ẩn ở public, nguyên văn ở preview. */
  const contactText = (v: unknown, mode: Mode): string | null => {
    if (typeof v !== 'string' || v.trim() === '') return null
    return mode === 'public' && isUnverified(v) ? null : v
  }

  async function getConnectPage(mode: Mode): Promise<ConnectPageView> {
    const [intro, g] = await Promise.all([
      content.getPageIntro('ket-noi', mode), readGlobalDoc(payload, 'site-settings', mode),
    ])
    const t = (k: string) => contactText(g[k], mode)
    return {
      intro,
      contact: {
        email: t('email'), phone: t('phone'), address: t('address'),
        addressNote: t('addressNote'), visitInfo: t('visitInfo'),
      },
      copy: applyMode(connectCopy, mode),
    }
  }

  return { getPageMedia, getCraftPage, getVillagePage, getConnectPage }
}
