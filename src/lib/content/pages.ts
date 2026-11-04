// View model của các trang ghép nhiều nguồn: /nghe-det-chieu và /lang-hoi.
// Dùng lại các hàm của createContent; chỉ thêm phần ảnh theo ô và chữ cố định đã áp mode.
import type { Payload } from 'payload'

import type { ArchiveAsset } from '@/payload-types'
import { PAGES_MEDIA_SLOTS } from '@/globals/pageMedia'

import { applyMode } from './copy/applyMode'
import { connectCopy } from './copy/connect'
import { craftCopy, craftReadNext } from './copy/craft'
import { villageCopy, villageTimelineAdd } from './copy/village'
import { craftCompareRows, craftToolCards, craftWayCard } from './craftMerge'
import { craftFactsFrom, villageFactsFrom } from './pageFacts'
import { pageSourcesInOrder } from './pageSources'
import { mergeVillageCopy, villageFactRows } from './villageMerge'
import { readGlobalDoc, readPageDoc, type createContent } from './queries'
import { buildConnectContact } from './connectContact'
import type { ConnectPageView, CraftPageView, MediaView, Mode, VillagePageView } from './types'
import { optionalText, showText, toImageView } from './visibility'

type Content = ReturnType<typeof createContent>
type MediaRow = { slot?: string; image?: unknown; caption?: string | null }
type MediaRoute = keyof typeof PAGES_MEDIA_SLOTS
type MediaSlot<R extends MediaRoute> = (typeof PAGES_MEDIA_SLOTS)[R][number]
type MediaOf<R extends MediaRoute> = Partial<Record<MediaSlot<R>, MediaView>>

/** Ảnh theo ô của một tài liệu trang; chỉ nhận ô thuộc trang đó. */
function mediaFrom<R extends MediaRoute>(page: Record<string, unknown>, route: R, mode: Mode): MediaOf<R> {
  const allowed: readonly string[] = PAGES_MEDIA_SLOTS[route]
  const out: Partial<Record<string, MediaView>> = {}
  for (const row of (Array.isArray(page.media) ? page.media : []) as MediaRow[]) {
    if (!row.slot || !allowed.includes(row.slot)) continue
    const image = toImageView(row.image as ArchiveAsset | number | null | undefined, mode)
    if (image) out[row.slot] = { image, caption: showText(row.caption, mode) }
  }
  return out as MediaOf<R>
}

export function createPages(payload: Payload, content: Content) {
  async function getPageMedia<R extends MediaRoute>(route: R, mode: Mode): Promise<MediaOf<R>> {
    return mediaFrom(await readPageDoc(payload, route, mode, 1), route, mode)
  }

  async function getCraftPage(mode: Mode): Promise<CraftPageView> {
    const [intro, page, steps, allSources] = await Promise.all([
      content.getPageIntro('nghe-det-chieu', mode),
      readPageDoc(payload, 'nghe-det-chieu', mode, 1),
      content.getCraftSteps(mode),
      content.getSources(mode),
    ])
    const media = mediaFrom(page, 'nghe-det-chieu', mode)
    const f = craftFactsFrom(page)
    const sources = pageSourcesInOrder(allSources, f.sourceOrder)
    const visible = new Set(sources.map((s) => s.id))
    return {
      intro,
      hero: media.hero ?? null,
      steps,
      tools: craftToolCards(f.tools, mode, visible),
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
    const [intro, page, events, allSources] = await Promise.all([
      content.getPageIntro('lang-hoi', mode),
      readPageDoc(payload, 'lang-hoi', mode, 1),
      content.getTimeline(mode),
      content.getSources(mode),
    ])
    const media = mediaFrom(page, 'lang-hoi', mode)
    const f = villageFactsFrom(page)
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
