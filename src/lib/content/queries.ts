// Lớp truy vấn: nhận payload làm tham số để test được. Trang dùng bản gắn sẵn ở index.ts.
import type { CollectionSlug, Payload, Where } from 'payload'

import { publicAssetQuery } from '@/access/assetRules'
import type { RouteKey } from '@/globals/PageIntros'
import type { Maker, Product, Source, Story } from '@/payload-types'

import { sanitizeRich } from './rich'
import type {
  ArchiveItemView, CraftStepView, Flag, Mode, PageIntroView, PersonDetailView, PersonView,
  ProductCardView, ProductView, SiteSettingsView, SourceView, StoryCardView, StoryView,
  TimelineEventView,
} from './types'
import { isUnverified, showText, toImageView, toPersonView } from './visibility'

const sourceOf = (v: unknown): Source | null => (v && typeof v === 'object' ? (v as Source) : null)
const sourcesOf = (v: unknown): Source[] =>
  Array.isArray(v) ? v.map(sourceOf).filter((s): s is Source => s !== null) : []

function toSourceView(s: Source, mode: Mode = 'public'): SourceView {
  return {
    id: s.sourceId, publisher: showText(s.publisher, mode), title: s.title,
    url: showText(s.url, mode), date: showText(s.date, mode),
  }
}

type Doc = { _status?: string | null }

/** Cờ chung: chưa đăng, và (preview) có trường trống/cần xác minh. */
function flagsOf(doc: Doc, mode: Mode, texts: (string | null | undefined)[] = []): Flag[] {
  const flags: Flag[] = []
  if (mode === 'preview') {
    if (doc._status !== 'published') flags.push('unpublished')
    if (texts.some((t) => isUnverified(t))) flags.push('unverified')
  }
  return flags
}

export function createContent(payload: Payload) {
  async function findAll(
    collection: CollectionSlug, mode: Mode, opts: { where?: Where; sort?: string; depth?: number } = {},
  ) {
    const and: Where[] = []
    if (mode === 'public') and.push({ _status: { equals: 'published' } })
    if (opts.where) and.push(opts.where)
    const res = await payload.find({
      collection, draft: mode === 'preview', overrideAccess: true, pagination: false,
      depth: opts.depth ?? 1, sort: opts.sort, where: and.length ? { and } : undefined,
    })
    return res.docs as unknown[]
  }

  async function findBySlug(collection: CollectionSlug, slug: string, mode: Mode) {
    const docs = await findAll(collection, mode, { where: { slug: { equals: slug } }, depth: 1 })
    return (docs[0] as never) ?? null
  }

  async function allSources(mode: Mode = 'public'): Promise<SourceView[]> {
    const res = await payload.find({
      collection: 'sources', overrideAccess: true, pagination: false, depth: 0, sort: 'sourceId',
    })
    return res.docs.map((s) => toSourceView(s, mode))
  }

  async function sourceMap() {
    const res = await payload.find({
      collection: 'sources', overrideAccess: true, pagination: false, depth: 0,
    })
    return new Map(res.docs.map((s) => [s.id, s.sourceId]))
  }

  async function getTimeline(mode: Mode): Promise<TimelineEventView[]> {
    const docs = (await findAll('timeline-events', mode, { sort: 'order' })) as import('@/payload-types').TimelineEvent[]
    return docs.map((d) => ({
      label: showText(d.label, mode),
      title: showText(d.title, mode),
      body: showText(d.body, mode),
      confidence: d.confidence ?? null,
      sourceIds: sourcesOf(d.sources).map((s) => s.sourceId),
      flags: flagsOf(d, mode, [d.label, d.title, d.body]),
    }))
  }

  async function getCraftSteps(mode: Mode): Promise<CraftStepView[]> {
    const docs = (await findAll('craft-steps', mode, { sort: 'n' })) as import('@/payload-types').CraftStep[]
    return docs.map((d) => ({
      n: d.n,
      title: showText(d.title, mode),
      subtitle: showText(d.subtitle, mode),
      body: showText(d.body, mode),
      tools: showText(d.tools, mode),
      image: toImageView(d.image, mode),
      // Hiện công khai dưới nhãn "ẢNH CẦN CHỤP" theo thiết kế (R15).
      shotNeeded: showText(d.shotNeeded, mode),
      focus: [d.focusX ?? 50, d.focusY ?? 50],
      flags: flagsOf(d, mode, [d.title, d.body]),
    }))
  }

  const productCard = (d: Product, mode: Mode): ProductCardView => ({
    slug: d.slug,
    code: showText(d.code, mode),
    name: showText(d.name, mode),
    group: d.group ?? null,
    summary: showText(d.summary, mode),
    image: toImageView(Array.isArray(d.images) ? d.images.find((i) => toImageView(i, mode)) : null, mode),
    flags: flagsOf(d, mode, [d.name, d.summary]),
  })

  async function getProducts(mode: Mode): Promise<ProductCardView[]> {
    const docs = (await findAll('products', mode, { sort: 'createdAt' })) as Product[]
    return docs.map((d) => productCard(d, mode))
  }

  async function getProduct(slug: string, mode: Mode): Promise<ProductView | null> {
    const d = (await findBySlug('products', slug, mode)) as Product | null
    if (!d) return null
    const card = productCard(d, mode)
    const m = d.maker && typeof d.maker === 'object' ? (d.maker as Maker) : null
    const makerOk = m && (mode === 'preview' || (m.publicConsent && m._status === 'published'))
    const flags = [...card.flags]
    if (m && mode === 'preview' && !m.publicConsent) flags.push('consent-pending')
    const annotations: ProductView['annotations'] = []
    for (const a of d.annotations ?? []) {
      const body = showText(a.body, mode)
      if (body === null) continue
      annotations.push({
        n: a.n ?? annotations.length + 1, title: showText(a.title, mode), x: a.x ?? 0, y: a.y ?? 0,
        body, sourceId: sourceOf(a.source)?.sourceId ?? null,
      })
    }
    return {
      ...card,
      flags,
      images: (Array.isArray(d.images) ? d.images : [])
        .map((i) => toImageView(i, mode)).filter((i) => i !== null),
      material: showText(d.material, mode),
      technique: showText(d.technique, mode),
      size: showText(d.size, mode),
      care: showText(d.care, mode),
      annotations,
      typeConfirmed: !!d.typeConfirmed,
      maker: makerOk ? { name: showText(m.name, mode), verified: !!m.verified } : null,
    }
  }

  const storyCard = (d: Story, mode: Mode): StoryCardView => {
    const flags = flagsOf(d, mode, [d.title, d.sapo])
    if (d.workflow === 'idea' && mode === 'preview') flags.push('idea')
    return {
      slug: d.slug,
      title: showText(d.title, mode),
      sapo: showText(d.sapo, mode),
      category: d.category ?? null,
      cover: toImageView(d.cover, mode),
      readingMinutes: d.readingMinutes ?? null,
      hasDetail: d.workflow !== 'idea',
      flags,
    }
  }

  async function getStories(mode: Mode): Promise<StoryCardView[]> {
    const docs = (await findAll('stories', mode, { sort: '-updatedAt' })) as Story[]
    return docs.map((d) => storyCard(d, mode))
  }

  async function getStory(slug: string, mode: Mode): Promise<StoryView | null> {
    const d = (await findBySlug('stories', slug, mode)) as Story | null
    if (!d || d.workflow === 'idea') return null
    const published = d._status === 'published'
    return {
      ...storyCard(d, mode),
      body: mode === 'public' && !published ? null : sanitizeRich(d.body, await sourceMap()),
      editor: showText(d.editor, mode),
      sources: sourcesOf(d.sources).map((s) => toSourceView(s, mode)),
    }
  }

  async function getPeople(mode: Mode): Promise<PersonView[]> {
    const docs = (await findAll('people', mode, { sort: 'createdAt' })) as import('@/payload-types').Person[]
    return docs.map((d) => {
      const v = toPersonView(d, mode)
      return { ...v, flags: [...flagsOf(d, mode), ...v.flags.filter((f) => f !== 'unpublished')] }
    })
  }

  async function getPerson(slug: string, mode: Mode): Promise<PersonDetailView | null> {
    const d = (await findBySlug('people', slug, mode)) as import('@/payload-types').Person | null
    if (!d) return null
    const v = toPersonView(d, mode)
    // Phần mô tả có thể nhận ra người: ở public chỉ hiện khi đã được đồng ý dùng tên.
    const identifying = mode === 'preview' || !!d.consent?.name
    return {
      ...v,
      flags: [...flagsOf(d, mode), ...v.flags],
      note: identifying ? showText(d.note, mode) : null,
      yearsInCraft: identifying ? showText(d.yearsInCraft, mode) : null,
      story: identifying ? sanitizeRich(d.story, await sourceMap()) : null,
    }
  }

  async function getArchive(mode: Mode): Promise<ArchiveItemView[]> {
    const and: Where[] = [{ inArchive: { equals: true } }]
    if (mode === 'public') and.push(publicAssetQuery)
    const res = await payload.find({
      collection: 'archive-assets', overrideAccess: true, pagination: false, depth: 0,
      sort: 'code', where: { and },
    })
    const items: ArchiveItemView[] = []
    for (const d of res.docs) {
      const image = toImageView(d, mode)
      if (!image) continue
      const label = showText(d.relatedLabel, mode)
      items.push({
        image,
        title: showText(d.title, mode),
        description: showText(d.description, mode),
        category: d.category ?? null,
        era: d.era ?? null,
        related: label && d.relatedHref ? { label, href: d.relatedHref } : null,
        flags: image.flags,
      })
    }
    return items
  }

  async function readGlobal(slug: 'site-settings' | 'page-intros', mode: Mode) {
    const g = ((await payload.findGlobal({
      slug, draft: mode === 'preview', overrideAccess: true, depth: 0,
    })) as unknown) as Record<string, unknown> & Doc
    // Chưa từng đăng thì bản công khai coi như trống.
    return mode === 'public' && g._status !== 'published' ? {} : g
  }

  async function getSiteSettings(mode: Mode): Promise<SiteSettingsView> {
    const g = (await readGlobal('site-settings', mode)) as Record<string, string | null | undefined>
    const t = (k: string) => showText(g[k], mode)
    return {
      tagline: t('tagline'), description: t('description'), address: t('address'),
      addressNote: t('addressNote'), email: t('email'), phone: t('phone'),
      visitInfo: t('visitInfo'), copyright: t('copyright'),
    }
  }

  async function getPageIntro(route: RouteKey, mode: Mode): Promise<PageIntroView> {
    const g = (await readGlobal('page-intros', mode)) as Record<string, Record<string, string | null> | undefined>
    const r = g[route] ?? {}
    return {
      eyebrow: showText(r.eyebrow, mode), title: showText(r.title, mode),
      lead: showText(r.lead, mode), heroTitle: showText(r.heroTitle, mode),
    }
  }

  return {
    getSources: allSources, getTimeline, getCraftSteps, getProducts, getProduct, getStories,
    getStory, getPeople, getPerson, getArchive, getSiteSettings, getPageIntro,
  }
}
