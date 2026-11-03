// Lớp truy vấn: nhận payload làm tham số để test được. Trang dùng bản gắn sẵn ở index.ts.
import type { CollectionSlug, Payload, Where } from 'payload'

import { publicAssetQuery } from '@/access/assetRules'
import type { RouteKey } from '@/collections/pages/routeKeys'
import type { ArchiveAsset, Maker, Person, Product, Source, Story } from '@/payload-types'
import { fillTemplate } from '@/lib/template'

import { archiveCategoryLabel, archiveEraLabel, archiveRightsLabel, productGroupLabel, storyCategoryLabel } from './categories'
import { applyMode } from './copy/applyMode'
import { archiveCopy } from './copy/archive'
import { peopleCopy } from './copy/people'
import { productsCopy } from './copy/products'
import { storiesCopy } from './copy/stories'
import { nonEmptyRich, sanitizeRich, splitStoryParts } from './rich'
import type {
  ArchiveItemView, CraftStepView, Flag, HomeMediaView, ImageView, Mode, PageIntroView, PersonDetailView, PersonView,
  ProductCardView, ProductView, Rich, SiteSettingsView, SourceView, StoryCardView, StoryView,
  TimelineEventView, Variant,
} from './types'
import { isHttpUrl, isUnverified, optionalText, showText, toImageView, toPersonView, UNVERIFIED } from './visibility'

const sourceOf = (v: unknown): Source | null => (v && typeof v === 'object' ? (v as Source) : null)
const sourcesOf = (v: unknown): Source[] =>
  Array.isArray(v) ? v.map(sourceOf).filter((s): s is Source => s !== null) : []

/**
 * Tiêu đề nguồn là bắt buộc nên không thể để null: ở public, nguồn có tiêu đề chưa xác minh
 * bị bỏ hẳn khỏi danh sách/trích dẫn (không có gì đáng hiện); preview vẫn hiện nguyên văn.
 */
function toSourceView(s: Source, mode: Mode = 'public'): SourceView | null {
  const title = showText(s.title, mode)
  if (title === null) return null
  const url = showText(s.url, mode)
  return {
    id: s.sourceId, publisher: showText(s.publisher, mode), title,
    url: isHttpUrl(url) ? url : null, date: showText(s.date, mode),
  }
}
const viewable = (v: SourceView | null): v is SourceView => v !== null

/** 2024-06-13 -> 13/06/2024; chuỗi không đúng dạng thì giữ nguyên. */
export function formatDate(d: string | null): string | null {
  const m = d?.match(/^(\d{4})-(\d{2})-(\d{2})$/)
  return m ? `${m[3]}/${m[2]}/${m[1]}` : d
}

/** "Nhà xuất bản (dd/mm/yyyy); …" (R8); null khi không có nguồn nào. */
function sourceLine(sources: SourceView[]): string | null {
  const parts = sources.map((s) => {
    const date = formatDate(s.date)
    return `${s.publisher ?? s.title}${date ? ` (${date})` : ''}`
  })
  return parts.length ? parts.join('; ') : null
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

/** Đọc một global; bản công khai của global chưa từng đăng coi như trống. */
export async function readGlobalDoc(
  payload: Payload, slug: 'site-settings' | 'page-intros', mode: Mode, depth = 0,
) {
  const g = ((await payload.findGlobal({
    slug, draft: mode === 'preview', overrideAccess: true, depth,
  })) as unknown) as Record<string, unknown> & Doc
  return mode === 'public' && g._status !== 'published' ? {} : g
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

  async function getSources(mode: Mode): Promise<SourceView[]> {
    const res = await payload.find({
      collection: 'sources', overrideAccess: true, pagination: false, depth: 0, sort: 'sourceId',
    })
    return res.docs.map((s) => toSourceView(s, mode)).filter(viewable)
  }

  async function sourceMap() {
    const res = await payload.find({
      collection: 'sources', overrideAccess: true, pagination: false, depth: 0,
    })
    return new Map(res.docs.map((s) => [s.id, s.sourceId]))
  }

  async function getTimeline(mode: Mode): Promise<TimelineEventView[]> {
    const docs = (await findAll('timeline-events', mode, { sort: 'order' })) as import('@/payload-types').TimelineEvent[]
    return docs.map((d) => {
      // Chỉ những nguồn nhìn thấy được ở mode hiện tại mới được trích.
      const all = sourcesOf(d.sources)
      const visible = all.map((s) => toSourceView(s, mode)).filter(viewable)
      // F1: mốc báo chí/truyền khẩu có nguồn mà mọi nguồn bị ẩn thì ở public coi như chờ xác minh.
      const orphaned = mode === 'public' && all.length > 0 && visible.length === 0
      return {
        label: showText(d.label, mode),
        title: showText(d.title, mode),
        body: showText(d.body, mode),
        confidence: orphaned ? 'pending' : (d.confidence ?? 'pending'),
        sourceIds: visible.map((s) => s.id),
        sourceLine: sourceLine(visible),
        sourceHref: null,
        flags: flagsOf(d, mode, [d.label, d.title, d.body]),
      }
    })
  }

  async function getCraftSteps(mode: Mode): Promise<CraftStepView[]> {
    const docs = (await findAll('craft-steps', mode, { sort: 'n' })) as import('@/payload-types').CraftStep[]
    return docs.map((d) => ({
      n: d.n,
      title: showText(d.title, mode),
      shortTitle: showText(d.shortTitle, mode),
      subtitle: showText(d.subtitle, mode),
      body: showText(d.body, mode),
      tools: showText(d.tools, mode),
      // Việc biên tập cần làm, không phải nội dung: chỉ hiện ở preview.
      toRecord: mode === 'preview' ? showText(d.toRecord, mode) : null,
      image: toImageView(d.image, mode),
      // Hiện công khai dưới nhãn "ẢNH CẦN CHỤP" theo thiết kế (R15).
      shotNeeded: showText(d.shotNeeded, mode),
      focus: [d.focusX ?? 50, d.focusY ?? 50],
      flags: flagsOf(d, mode, [d.title, d.body]),
    }))
  }

  const imageOf = (d: Product, mode: Mode) =>
    toImageView(Array.isArray(d.images) ? d.images.find((i) => toImageView(i, mode)) : null, mode)

  /** Nhãn thẻ (R1): chưa có ảnh, hoặc có ảnh mà chưa xác nhận loại. */
  const productTag = (image: ImageView | null, typeConfirmed: boolean): ProductCardView['tag'] => {
    if (!image) return { text: productsCopy.tag.noImage, style: 'dashed' }
    if (!typeConfirmed) return { text: productsCopy.tag.unconfirmed, style: 'filled' }
    return null
  }

  /** Chữ khung "Ảnh cần chụp" điền tên hiện vật. */
  const productShotNeeded = (name: string | null): Variant | null =>
    name
      ? {
          desktop: fillTemplate(productsCopy.shotNeeded.desktop, { name }),
          mobile: fillTemplate(productsCopy.shotNeeded.mobile, { name }),
        }
      : null

  const productCard = (d: Product, mode: Mode): ProductCardView => {
    const image = imageOf(d, mode)
    return {
      slug: d.slug,
      code: showText(d.code, mode),
      name: showText(d.name, mode),
      group: d.group ?? null,
      groupLabel: productGroupLabel(d.group),
      summary: showText(d.summary, mode),
      image,
      typeConfirmed: !!d.typeConfirmed,
      tag: productTag(image, !!d.typeConfirmed),
      shotNeeded: productShotNeeded(showText(d.name, mode)),
      flags: flagsOf(d, mode, [d.name, d.summary]),
    }
  }

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
    const filled = (v: string | null | undefined) => (v && v.trim() !== '' ? showText(v, mode) : null)

    // R2: chỉ tính chú thích còn hiện và nguồn nhìn thấy được; nguồn đánh số theo lần xuất hiện đầu.
    const sources: SourceView[] = []
    const annotations: ProductView['annotations'] = []
    const explore = productsCopy.detail.explore
    for (const a of d.annotations ?? []) {
      const body = showText(a.body, mode)
      if (body === null) continue
      const rel = sourceOf(a.source)
      const view = rel ? toSourceView(rel, mode) : null
      let sourceN: number | null = null
      if (view) {
        let i = sources.findIndex((s) => s.id === view.id)
        if (i < 0) i = sources.push({ ...view, date: formatDate(view.date) }) - 1
        sourceN = i + 1
      }
      // R3: dòng nguồn tự ghi; trống thì ghép từ nguồn. Nguồn đã chọn mà bị ẩn thì không để lại dòng nguồn ở public.
      const note = filled(a.sourceNote)
      const hiddenSource = mode === 'public' && rel !== null && view === null
      const title = showText(a.title, mode)
      const n = a.n ?? annotations.length + 1
      const shortTitle = filled(a.shortTitle) ?? title
      annotations.push({
        n, title, shortTitle,
        x: a.x ?? 0, y: a.y ?? 0, body, sourceId: view?.id ?? null, sourceN,
        sourceLine: hiddenSource ? null : (note ?? (view ? sourceLine([view]) : null)),
        heading: title ? `${n} · ${title}` : `${n}`,
        markerLabel: title
          ? fillTemplate(explore.markerLabel, { n, title: title.toLocaleLowerCase('vi') })
          : fillTemplate(explore.markerLabelUntitled, { n }),
        pickerLabel: shortTitle ? `${n} · ${shortTitle}` : `${n}`,
      })
    }
    const images = (Array.isArray(d.images) ? d.images : [])
      .map((i) => toImageView(i, mode)).filter((i) => i !== null)
    const primaryImage = toImageView(Array.isArray(d.images) ? d.images[0] : null, mode)
    // R6: "Ảnh i/n · Ảnh: …"; ảnh 1 chưa xác nhận loại thì ghi rõ tên loại (chữ thường).
    const cap = productsCopy.detail.caption
    const kind = !d.typeConfirmed && card.name && !isUnverified(card.name) ? card.name.toLocaleLowerCase('vi') : null
    const imageCaptions = images.map((im, i) =>
      fillTemplate(cap.position, { i: i + 1, n: images.length })
      + (im.photographer ? fillTemplate(cap.photographer, { name: im.photographer }) : '')
      + (i === 0 && kind ? fillTemplate(cap.unconfirmed, { name: kind }) : ''))
    // R5: liên hệ chỉ khi cơ sở đã đăng, được xác minh và đồng ý công khai (preview: thấy hết, trống thì có dấu).
    const contactOk = m && (mode === 'preview' || (m.publicConsent && m.verified && m._status === 'published'))
    return {
      ...card,
      flags,
      primaryImage,
      hasPattern: primaryImage !== null && annotations.length > 0,
      images,
      material: showText(d.material, mode),
      technique: showText(d.technique, mode),
      size: optionalText(d.size, mode),
      care: optionalText(d.care, mode),
      context: showText(d.context, mode),
      pattern: showText(d.pattern, mode),
      eyebrow: [card.code, card.groupLabel].filter(Boolean).join(' · '),
      typeNote: images.length > 0 && !d.typeConfirmed ? productsCopy.detail.typeNote : null,
      imageCaptions,
      annotations,
      sources,
      maker: makerOk
        ? {
            name: showText(m.name, mode), verified: !!m.verified,
            contact: contactOk ? showText(m.contact, mode) : null,
          }
        : null,
      contactLine: makerOk ? (contactOk ? showText(m.contact, mode) : null) : productsCopy.detail.noMaker,
    }
  }

  const storyCard = (d: Story, mode: Mode): StoryCardView => {
    const idea = d.workflow === 'idea'
    return {
      slug: d.slug,
      title: showText(d.title, mode),
      sapo: showText(d.sapo, mode),
      category: storyCategoryLabel(d.category),
      categoryKey: storyCategoryLabel(d.category) ? (d.category ?? null) : null,
      cover: toImageView(d.cover, mode),
      readingMinutes: d.readingMinutes ?? null,
      hasDetail: !idea,
      cta: idea ? storiesCopy.cta.outline : storiesCopy.cta.read,
      // R2: "Chủ đề đề xuất" ở mọi mode; "Bản nháp" chỉ có ở preview (public không có bài chưa đăng).
      status: idea ? 'Chủ đề đề xuất' : d._status !== 'published' ? 'Bản nháp' : null,
      isDraft: !idea && d._status !== 'published',
      sourceCount: sourcesOf(d.sources).map((s) => toSourceView(s, mode)).filter(viewable).length,
      flags: flagsOf(d, mode, [d.title, d.sapo]),
    }
  }

  async function getStories(mode: Mode): Promise<StoryCardView[]> {
    const docs = (await findAll('stories', mode, { sort: 'createdAt' })) as Story[]
    return docs.map((d) => storyCard(d, mode))
  }

  /** Ảnh của các khối figure trong bài, đã áp mode (null: không được dùng ở mode này). */
  async function figureAssets(body: unknown, mode: Mode): Promise<Map<number, ImageView | null>> {
    const ids = new Set<number>()
    const visit = (n: unknown) => {
      if (!n || typeof n !== 'object') return
      const node = n as { type?: unknown; fields?: { blockType?: unknown; image?: unknown }; children?: unknown[] }
      if (node.type === 'block' && node.fields?.blockType === 'figure') {
        const img = node.fields.image
        const id = typeof img === 'number' ? img : (img as { id?: unknown } | null)?.id
        if (typeof id === 'number') ids.add(id)
      }
      if (Array.isArray(node.children)) node.children.forEach(visit)
    }
    visit((body as { root?: unknown } | null)?.root)
    if (ids.size === 0) return new Map()
    const res = await payload.find({
      collection: 'archive-assets', overrideAccess: true, pagination: false, depth: 0,
      where: { id: { in: [...ids] } },
    })
    return new Map(res.docs.map((a) => [a.id, toImageView(a, mode)]))
  }

  /** Ngữ cảnh lọc rich text: nguồn nhìn thấy được ở mode này và ảnh của khối figure. */
  async function richContext(body: unknown, mode: Mode) {
    const [visible, sources, assets] = await Promise.all([getSources(mode), sourceMap(), figureAssets(body, mode)])
    return { visible, ctx: { sources, visibleSourceIds: visible.map((s) => s.id), assets, mode } }
  }

  async function getStory(slug: string, mode: Mode): Promise<StoryView | null> {
    const d = (await findBySlug('stories', slug, mode)) as Story | null
    if (!d || d.workflow === 'idea') return null
    const { visible, ctx } = await richContext(d.body, mode)
    const { rich, citedOrder, toc } = sanitizeRich(d.body, ctx)
    // R4: nguồn được trích theo thứ tự trích đầu tiên, rồi các nguồn còn lại của bài.
    const byId = new Map(visible.map((s) => [s.id, s]))
    const order = [...citedOrder]
    for (const s of sourcesOf(d.sources)) if (!order.includes(s.sourceId)) order.push(s.sourceId)
    const sources = order
      .map((id) => byId.get(id))
      .filter((s): s is SourceView => s !== undefined)
      .map((s) => ({ ...s, date: formatDate(s.date) }))
    return {
      ...storyCard(d, mode),
      body: rich,
      toc,
      sources,
      // Trang chi tiết đếm đúng danh sách "Ghi chú nguồn" (gồm cả nguồn được trích ngoài danh sách của bài).
      sourceCount: sources.length,
      editor: showText(d.editor, mode),
      publishedAt: formatDate(showText(d.publishedAt, mode)),
      coverCaption: showText(d.coverCaption, mode),
      // Việc biên tập: chỉ hiện ở preview.
      reviewChecklist: mode === 'preview'
        ? (d.reviewChecklist ?? []).map((r) => r.item).filter((t): t is string => !!t && t.trim() !== '')
        : null,
    }
  }

  async function getPeople(mode: Mode): Promise<PersonView[]> {
    const docs = (await findAll('people', mode, { sort: 'createdAt' })) as Person[]
    return docs.map((d) => {
      const v = toPersonView(d, mode)
      return { ...v, flags: [...flagsOf(d, mode), ...v.flags.filter((f) => f !== 'unpublished')] }
    })
  }

  async function getPerson(slug: string, mode: Mode): Promise<PersonDetailView | null> {
    return (await getPersonWithLinks(slug, mode))?.person ?? null
  }

  /**
   * Trang chân dung kèm khoá của công đoạn/hiện vật liên quan (để dựng thẻ "Liên quan" ở people.ts).
   * Khoá chưa qua lọc mode: nơi dùng phải tìm lại qua getCraftSteps/getProducts của cùng mode.
   */
  async function getPersonWithLinks(slug: string, mode: Mode): Promise<
    { person: PersonDetailView; stepN: number | null; productSlug: string | null } | null
  > {
    const d = (await findBySlug('people', slug, mode)) as Person | null
    if (!d) return null
    const step = d.relatedStep && typeof d.relatedStep === 'object' ? d.relatedStep : null
    const product = d.relatedProduct && typeof d.relatedProduct === 'object' ? d.relatedProduct : null
    return { person: await personDetail(d, mode), stepN: step?.n ?? null, productSlug: product?.slug ?? null }
  }

  async function personDetail(d: Person, mode: Mode): Promise<PersonDetailView> {
    const { quote: cardQuote, ...v } = toPersonView(d, mode)
    const preview = mode === 'preview'
    const consent = { name: !!d.consent?.name, photo: !!d.consent?.photo, quote: !!d.consent?.quote }
    // Phần mô tả có thể nhận ra người: ở public chỉ hiện khi đã được đồng ý dùng tên (R13).
    const identifying = preview || consent.name
    /** Trường trống là null ở cả hai mode (preview dùng gợi ý trong copy, R14); còn lại theo showText. */
    const filled = (s: string | null | undefined) => (s && s.trim() !== '' ? showText(s, mode) : null)

    // Lọc cả cây trước rồi mới tách (R15): số cite ở hai phần khớp một danh sách nguồn (T2c, R4).
    let story: Rich | null = null
    let sources: SourceView[] = []
    if (identifying) {
      const { visible, ctx } = await richContext(d.story, mode)
      const r = sanitizeRich(d.story, { ...ctx, anchors: false })
      story = nonEmptyRich(r.rich)
      if (story) {
        const byId = new Map(visible.map((s) => [s.id, s]))
        sources = r.citedOrder
          .map((id) => byId.get(id))
          .filter((s): s is SourceView => s !== undefined)
          .map((s) => ({ ...s, date: formatDate(s.date) }))
      }
    }

    // Lời trích: nguồn phải còn nhìn thấy được ở mode này (public), như cite trong bài (R4, R15).
    const qSource = sourceOf(d.quoteSource)
    const qSourceView = qSource ? toSourceView(qSource, mode) : null
    const qLine = qSourceView ? sourceLine([qSourceView]) : null
    const qNote = [
      preview ? peopleCopy.detail.preview.quoteNotePrefix : null,
      qLine ? `${peopleCopy.detail.quoteSource}${qLine}` : null,
    ].filter(Boolean).join(' · ') || null
    const quote: PersonDetailView['quote'] = cardQuote && (preview || qSourceView)
      ? { text: cardQuote.text, sourceLine: qLine, note: qNote }
      : null

    const recordedParts = [filled(d.recordedBy), formatDate(filled(d.recordedAt))].filter((s): s is string => !!s)
    // Như yearsInCraft/hamlet: preview giữ dấu [cần xác minh] cho dòng dữ kiện trống.
    const recorded = identifying ? recordedParts.join(' · ') || (preview ? UNVERIFIED : null) : null

    // Phóng sự ảnh: public cần đồng ý ảnh; chưa đồng ý tên thì bỏ alt và chú thích (có thể chứa tên).
    const gallery: PersonDetailView['gallery'] = []
    if (preview || consent.photo) {
      for (const row of d.gallery ?? []) {
        const image = toImageView(row.image, mode)
        if (!image) continue
        gallery.push(identifying
          ? { image, caption: showText(row.caption, mode) }
          : { image: { ...image, alt: '' }, caption: null })
      }
    }

    const missing = (['name', 'photo', 'quote'] as const)
      .filter((k) => !consent[k])
      .map((k) => peopleCopy.detail.consent.kinds[k])
    const copy = applyMode(peopleCopy, mode)

    const photographer = v.portrait?.photographer ? `${peopleCopy.detail.photoPrefix}${v.portrait.photographer}` : null
    const consentLine = consent.photo ? null : (copy.detail.preview?.consentLine ?? null)

    return {
      ...v,
      flags: [...flagsOf(d, mode), ...v.flags],
      heading: v.name ?? peopleCopy.detail.pendingName,
      storyTitle: v.name ? fillTemplate(peopleCopy.detail.story.title, { name: v.name }) : peopleCopy.detail.story.titleNoName,
      // intro trống là null để preview hiện gợi ý phỏng vấn (R14); yearsInCraft/hamlet là dòng dữ kiện nên
      // giữ dấu [cần xác minh] của showText ở preview, như các bảng dữ kiện khác.
      intro: identifying ? filled(d.intro) : null,
      yearsInCraft: identifying ? showText(d.yearsInCraft, mode) : null,
      hamlet: identifying ? showText(d.hamlet, mode) : null,
      recorded,
      storyParts: splitStoryParts(story),
      sources,
      quote,
      gallery,
      consent: {
        state: missing.length === 0 ? 'full' : missing.length === 3 ? 'none' : 'partial',
        missing,
        reviewedBySubject: !!d.reviewedBySubject,
      },
      portraitCaption: v.portrait
        ? {
            label: peopleCopy.detail.portraitLabel,
            code: v.portrait.docNumber,
            line: { desktop: [photographer, consentLine].filter(Boolean).join(' · ') || null, mobile: consentLine },
          }
        : null,
    }
  }

  /** Nhãn quyền dùng (R14): "Được phép" lấy từ option; nhãn còn lại theo copy artboard. */
  const rightsVariant = (rights: ArchiveAsset['rights']): Variant => {
    if (rights === 'permitted') {
      const l = archiveRightsLabel(rights)
      return { desktop: l, mobile: l }
    }
    return archiveCopy.rights[rights === 'restricted' ? 'restricted' : 'unknown']
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
      // Tư liệu không có mã thì không có khoá ?anh=, bỏ qua.
      if (typeof d.code !== 'string' || d.code.trim() === '') continue
      // Mã thô đi vào ?anh=, key và data-code; mã còn dấu chưa xác minh thì public bỏ hẳn tư liệu.
      if (mode === 'public' && isUnverified(d.code)) continue
      const label = showText(d.relatedLabel, mode)
      // Chỉ nhận đường dẫn nội bộ (bắt đầu bằng một dấu '/'), tránh liên kết ra ngoài/giao thức lạ.
      const href = showText(d.relatedHref, mode)
      const internalHref = href && /^\/(?!\/)/.test(href) ? href : null
      // Mã hiển thị đi qua cùng luật hiện/ẩn như chữ khác (image.code); `code` thô chỉ là khoá tra cứu.
      const displayCode = image.docNumber ?? image.code
      const docLabel = displayCode ? `${archiveCopy.docLabel} · ${displayCode}` : null
      const categoryLabel = archiveCategoryLabel(d.category)
      const title = showText(d.title, mode)
      items.push({
        image,
        title,
        description: showText(d.description, mode),
        category: d.category ?? null,
        categoryLabel,
        era: d.era ?? null,
        eraLabel: archiveEraLabel(d.era),
        related: label && internalHref ? { label, href: internalHref } : null,
        flags: image.flags,
        code: d.code,
        displayCode,
        docLabel,
        chipLabel: [docLabel, categoryLabel].filter(Boolean).join(' · ') || null,
        name: title ?? displayCode,
        takenAt: showText(d.takenAt, mode),
        photographer: showText(d.photographer, mode),
        source: showText(d.source, mode),
        rights: rightsVariant(d.rights),
        sourceVerified: ![d.takenAt, d.photographer, d.source].some((v) => isUnverified(v)),
      })
    }
    return items
  }

  const readGlobal = (slug: 'site-settings' | 'page-intros', mode: Mode, depth = 0) =>
    readGlobalDoc(payload, slug, mode, depth)

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

  async function getHomeMedia(mode: Mode): Promise<HomeMediaView> {
    const g = (await readGlobal('page-intros', mode, 1)) as { home?: Record<string, unknown> }
    const h = g.home ?? {}
    const img = (v: unknown) => toImageView(v as ArchiveAsset | number | null | undefined, mode)
    const heroImage = img(h.heroImage)
    const heroAsset = h.heroImage && typeof h.heroImage === 'object' ? (h.heroImage as ArchiveAsset) : null
    const village: HomeMediaView['village'] = []
    for (const row of (Array.isArray(h.villageImages) ? h.villageImages : []) as
      { image?: unknown; caption?: string | null }[]) {
      const image = img(row.image)
      if (image) village.push({ image, caption: showText(row.caption, mode) })
    }
    return {
      hero: heroImage
        ? {
            image: heroImage, title: showText(heroAsset?.title, mode),
            caption: showText(h.heroCaption as string | null | undefined, mode),
          }
        : null,
      heroInset: img(h.heroInset),
      village,
    }
  }

  return {
    getHomeMedia, getSources, getTimeline, getCraftSteps, getProducts, getProduct, getStories,
    getStory, getPeople, getPerson, getPersonWithLinks, getArchive, getSiteSettings, getPageIntro,
  }
}
