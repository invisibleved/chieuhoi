// View model của các trang ghép nhiều nguồn: /nghe-det-chieu và /lang-hoi.
// Dùng lại các hàm của createContent; chỉ thêm phần ảnh theo ô và chữ cố định đã áp mode.
import type { Payload } from 'payload'

import type { ArchiveAsset } from '@/payload-types'
import { PAGE_MEDIA_SLOTS, type PageMediaRoute, type PageMediaSlot } from '@/globals/pageMedia'

import { applyMode } from './copy/applyMode'
import { connectCopy } from './copy/connect'
import { craftCopy, craftReadNext } from './copy/craft'
import { villageCopy, villageTimelineAdd } from './copy/village'
import { craftCompareRows, craftToolCards, craftWayCard } from './craftMerge'
import { craftFactsFrom, villageFactsFrom } from './pageFacts'
import { pageSourcesInOrder } from './pageSources'
import { mergeVillageCopy, villageFactRows } from './villageMerge'
import { readGlobalDoc, type createContent } from './queries'
import { buildConnectContact } from './connectContact'
import type { ConnectPageView, CraftPageView, MediaView, Mode, VillagePageView } from './types'
import { optionalText, showText, toImageView } from './visibility'

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
    const [intro, media, steps, allSources, intros] = await Promise.all([
      content.getPageIntro('nghe-det-chieu', mode),
      getPageMedia('nghe-det-chieu', mode),
      content.getCraftSteps(mode),
      content.getSources(mode),
      readGlobalDoc(payload, 'page-intros', mode, 1),
    ])
    const f = craftFactsFrom(intros['nghe-det-chieu'] as Record<string, unknown> | undefined)
    const sources = pageSourcesInOrder(allSources, f.sourceOrder)
    const visible = new Set(sources.map((s) => s.id))
    return {
      intro,
      hero: media.hero ?? null,
      steps,
      tools: craftToolCards(f.tools, mode, visible, (n) => media[`tool-${n}` as 'tool-1']?.image ?? null),
      compare: {
        hand: craftWayCard(f.hand, mode, visible, media.hand?.image ?? null),
        machine: craftWayCard(f.machine, mode, visible, media.machine?.image ?? null),
        rows: craftCompareRows(f.rows, mode, visible),
      },
      readNext: craftReadNext.map((r) => ({
        href: r.href, eyebrow: r.eyebrow, title: r.title, cta: r.cta, image: media[r.slot]?.image ?? null,
      })),
      sources,
      copy: applyMode(craftCopy, mode),
    }
  }

  async function getVillagePage(mode: Mode): Promise<VillagePageView> {
    const [intro, media, events, allSources, intros] = await Promise.all([
      content.getPageIntro('lang-hoi', mode),
      getPageMedia('lang-hoi', mode),
      content.getTimeline(mode),
      content.getSources(mode),
      readGlobalDoc(payload, 'page-intros', mode, 1),
    ])
    const f = villageFactsFrom(intros['lang-hoi'] as Record<string, unknown> | undefined)
    const sources = pageSourcesInOrder(allSources, f.sourceOrder)
    const visible = new Set(sources.map((s) => s.id))

    const add = applyMode(villageTimelineAdd, mode)
    const facts = villageFactRows(f.facts, mode, visible)
    const merged = mergeVillageCopy(villageCopy, f)

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
      copy: applyMode(merged, mode, { cites: visible }),
    }
  }

  async function getConnectPage(mode: Mode): Promise<ConnectPageView> {
    const [intro, g] = await Promise.all([
      content.getPageIntro('ket-noi', mode), readGlobalDoc(payload, 'site-settings', mode),
    ])
    const t = (k: string) => optionalText(g[k], mode)
    const copy = applyMode(connectCopy, mode)
    return {
      intro,
      contact: buildConnectContact({
        email: t('email'), phone: t('phone'), address: t('address'),
        addressNote: t('addressNote'), visitInfo: t('visitInfo'),
      }, copy),
      copy,
    }
  }

  return { getPageMedia, getCraftPage, getVillagePage, getConnectPage }
}
