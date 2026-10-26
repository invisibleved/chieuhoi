// Seed dữ liệu khởi đầu từ gói bàn giao. Chạy bằng `npm run seed`.
// `payload run` chỉ đợi top-level await nên main() phải được await ở cuối file.
import { readFileSync, readdirSync } from 'fs'
import path from 'path'
import {
  convertMarkdownToLexical,
  editorConfigFactory,
} from '@payloadcms/richtext-lexical'
import type { Payload, RichTextField, TypedUser } from 'payload'

import { injectCitations } from './citations'
import { archiveAlt, archiveItems, otherImageAlts } from './data/archive'
import { peopleSamples, productSummary, storyCategory, storyExtras } from './data/extras'
import { timelineCopy } from './data/timeline'
import { homeMedia, pageIntros, siteSettings } from './data/site'
import { assertSeedAllowed } from './guard'

export { assertSeedAllowed } from './guard'
export { injectCitations } from './citations'

const root = process.cwd()
const readJson = <T>(p: string): T => JSON.parse(readFileSync(path.resolve(root, p), 'utf8')) as T

type Status = 'idea' | 'draft' | 'pending' | undefined
const isDraft = (s: Status) => s === 'draft' || s === 'pending'

const imageFile = (p: string | null | undefined) => (p ? path.basename(p) : null)

/** Tạo hoặc cập nhật theo khoá tự nhiên; trả về id. */
async function upsert(
  payload: Payload,
  user: TypedUser,
  collection: string,
  key: { field: string; value: string | number },
  data: Record<string, unknown>,
  status: 'published' | 'draft',
): Promise<number> {
  const found = await payload.find({
    collection: collection as 'sources',
    where: { [key.field]: { equals: key.value } },
    limit: 1,
    depth: 0,
    overrideAccess: true,
    user,
  })
  const base = {
    collection: collection as 'sources',
    data: (status === 'published' ? { ...data, _status: 'published' } : data) as never,
    draft: status === 'draft',
    overrideAccess: true,
    user,
  }
  const doc = found.docs[0]
    ? await payload.update({ ...base, id: found.docs[0].id })
    : await payload.create(base)
  return doc.id as number
}

async function ensureReviewer(payload: Payload): Promise<TypedUser> {
  const email = process.env.SEED_REVIEWER_EMAIL
  const password = process.env.SEED_REVIEWER_PASSWORD
  if (!email || !password) throw new Error('Thiếu SEED_REVIEWER_EMAIL / SEED_REVIEWER_PASSWORD.')
  const found = await payload.find({
    collection: 'users',
    where: { email: { equals: email } },
    limit: 1,
    overrideAccess: true,
  })
  if (found.docs[0]) return { ...found.docs[0], collection: 'users' } as TypedUser
  const created = await payload.create({
    collection: 'users',
    data: { email, password, name: 'Người duyệt (seed)', role: 'reviewer' },
    overrideAccess: true,
    context: { skipFirstUserBootstrap: true },
  })
  return { ...created, collection: 'users' } as TypedUser
}

async function seedAssets(payload: Payload, user: TypedUser): Promise<Record<string, number>> {
  const dir = path.resolve(root, 'design/reference-images')
  const files = readdirSync(dir).filter((f) => f.endsWith('.webp'))
  const archiveByFile = new Map(archiveItems.map((i) => [i.file, i]))
  const ids: Record<string, number> = {}
  for (const file of files) {
    const item = archiveByFile.get(file)
    const other = otherImageAlts[file]
    if (!item && !other) throw new Error(`Ảnh ${file} chưa có alt trong dữ liệu seed.`)
    const data = {
      alt: item ? archiveAlt(item) : other.alt,
      sourceFile: file,
      rights: 'unknown',
      subjectConsent: 'pending',
      ...(item
        ? {
            code: item.code,
            title: item.title,
            description: item.description,
            category: item.category,
            era: 'now',
            relatedLabel: item.relatedLabel,
            relatedHref: item.relatedHref,
            inArchive: true,
          }
        : { inArchive: false }),
    }
    const found = await payload.find({
      collection: 'archive-assets',
      where: { or: [{ sourceFile: { equals: file } }, { filename: { equals: file } }] },
      limit: 1,
      depth: 0,
      overrideAccess: true,
      user,
    })
    if (found.docs[0]) {
      const doc = await payload.update({
        collection: 'archive-assets',
        id: found.docs[0].id,
        data: data as never,
        overrideAccess: true,
        user,
      })
      ids[file] = doc.id
    } else {
      const doc = await payload.create({
        collection: 'archive-assets',
        data: data as never,
        filePath: path.join(dir, file),
        overrideAccess: true,
        user,
      })
      ids[file] = doc.id
    }
  }
  return ids
}

export async function seed(payload: Payload): Promise<void> {
  assertSeedAllowed(process.env)
  const user = await ensureReviewer(payload)
  const assets = await seedAssets(payload, user)
  const asset = (p: string | null | undefined) => {
    const f = imageFile(p)
    if (!f) return null
    if (!assets[f]) throw new Error(`Không có ảnh ${f}`)
    return assets[f]
  }

  // Nguồn
  type SourceJson = { id: string; publisher?: string; title: string; url?: string; date?: string }
  const sourceIds: Record<string, number> = {}
  for (const s of readJson<SourceJson[]>('content/seed/sources.json')) {
    sourceIds[s.id] = await upsert(
      payload, user, 'sources', { field: 'sourceId', value: s.id },
      { sourceId: s.id, publisher: s.publisher, title: s.title, url: s.url, date: s.date },
      'published',
    )
  }

  // Dòng thời gian
  type TimelineJson = { label: string; title: string; body: string; confidence: string; sources: string[] }
  const timeline = readJson<TimelineJson[]>('content/seed/timeline.json')
  if (timeline.length !== timelineCopy.length) throw new Error('timeline.json lệch số mốc so với artboard.')
  for (const [i, t] of timeline.entries()) {
    const copy = timelineCopy[i]
    await upsert(
      payload, user, 'timeline-events', { field: 'order', value: i + 1 },
      {
        label: copy.label, title: copy.title, body: copy.body, order: i + 1, confidence: t.confidence,
        sources: t.sources.map((s) => sourceIds[s]), workflow: 'published',
      },
      'published',
    )
  }

  // Công đoạn
  type StepJson = {
    n: number; title: string; subtitle: string; image: string | null; shotNeeded?: string
    focus: [number, number]; body: string | null; tools: string | null; status?: Status
  }
  for (const s of readJson<StepJson[]>('content/seed/craftSteps.json')) {
    await upsert(
      payload, user, 'craft-steps', { field: 'n', value: s.n },
      {
        n: s.n, title: s.title, subtitle: s.subtitle, body: s.body ?? undefined, tools: s.tools ?? undefined,
        image: asset(s.image), shotNeeded: s.shotNeeded, focusX: s.focus[0], focusY: s.focus[1],
        workflow: 'draft',
      },
      isDraft(s.status) ? 'draft' : 'published',
    )
  }

  // Sản phẩm
  type ProductJson = {
    slug: string; code: string; name: string; group: string; images: string[]; typeConfirmed: boolean
    status?: Status
    annotations?: { n: number; title: string; x: number; y: number; body: string; source: string | null }[]
  }
  for (const p of readJson<ProductJson[]>('content/seed/products.json')) {
    await upsert(
      payload, user, 'products', { field: 'slug', value: p.slug },
      {
        slug: p.slug, code: p.code, name: p.name, group: p.group, summary: productSummary[p.slug],
        images: p.images.map((i) => asset(i)),
        typeConfirmed: p.typeConfirmed,
        annotations: (p.annotations ?? []).map((a) => ({
          n: a.n, title: a.title, x: a.x, y: a.y, body: a.body, source: a.source ? sourceIds[a.source] : null,
        })),
        workflow: 'published',
      },
      isDraft(p.status) ? 'draft' : 'published',
    )
  }

  // Con người (mẫu): tên null, mọi consent false
  for (const p of peopleSamples) {
    await upsert(
      payload, user, 'people', { field: 'slug', value: p.slug },
      {
        slug: p.slug, name: null, category: p.category, note: p.note,
        portrait: asset(p.portrait),
        consent: { name: false, photo: false, quote: false }, reviewedBySubject: false,
        workflow: 'published',
      },
      'published',
    )
  }

  // Bài viết
  const bodyField = payload.collections.stories.config.fields.find(
    (f) => 'name' in f && f.name === 'body',
  ) as RichTextField
  const editorConfig = editorConfigFactory.fromField({ field: bodyField })
  const markdown = readFileSync(path.resolve(root, 'src/seed/data/chuyen-ve-trang-chieu.md'), 'utf8')
  const trangChieuBody = injectCitations(
    convertMarkdownToLexical({ editorConfig, markdown }) as never,
    sourceIds,
  )
  type StoryJson = { slug: string; title: string; category: string; status?: Status; sources?: string[] }
  for (const s of readJson<StoryJson[]>('content/seed/stories.json')) {
    const extra = storyExtras[s.slug]
    if (!extra) throw new Error(`Thiếu dữ liệu bổ sung cho bài ${s.slug}`)
    const idea = s.status === 'idea'
    await upsert(
      payload, user, 'stories', { field: 'slug', value: s.slug },
      {
        slug: s.slug, title: s.title, sapo: extra.sapo, category: storyCategory[s.category],
        cover: asset(extra.cover), readingMinutes: extra.readingMinutes,
        sources: (s.sources ?? []).map((x) => sourceIds[x]),
        ...(s.slug === 'chuyen-ve-trang-chieu' ? { body: trangChieuBody } : {}),
        workflow: idea ? 'idea' : isDraft(s.status) ? 'draft' : 'published',
      },
      isDraft(s.status) ? 'draft' : 'published',
    )
  }

  // Globals: không ghi đè bản đã đăng (có thể đã được biên tập) trừ khi SEED_FORCE_GLOBALS=true.
  const byFile = (f: string) => {
    if (!assets[f]) throw new Error(`Không có ảnh ${f}`)
    return assets[f]
  }
  const homeMediaData = {
    heroImage: byFile(homeMedia.heroImage),
    heroInset: byFile(homeMedia.heroInset),
    heroCaption: homeMedia.heroCaption,
    villageImages: homeMedia.villageImages.map((v) => ({ image: byFile(v.file), caption: v.caption })),
  }
  const force = process.env.SEED_FORCE_GLOBALS === 'true'
  const globals: [slug: 'site-settings' | 'page-intros', data: object][] = [
    ['site-settings', siteSettings],
    ['page-intros', { ...pageIntros, home: { ...pageIntros.home, ...homeMediaData } } as object],
  ]
  for (const [slug, data] of globals) {
    if (!force) {
      const current = (await payload.findGlobal({
        slug, draft: false, depth: 0, overrideAccess: true,
      })) as { _status?: string | null }
      if (current._status === 'published') continue
    }
    await payload.updateGlobal({
      slug, data: { ...data, _status: 'published' } as never, overrideAccess: true, user,
    })
  }
}

async function main() {
  assertSeedAllowed(process.env)
  const { default: config } = await import('../payload.config')
  const { getPayload } = await import('payload')
  const payload = await getPayload({ config: await config })
  await seed(payload)
  const counts: Record<string, number> = {}
  for (const c of payload.config.collections) {
    counts[c.slug] = (await payload.count({ collection: c.slug, overrideAccess: true })).totalDocs
  }
  console.log('Seed xong:', counts)
  await payload.destroy()
  process.exit(0)
}

if (!process.env.VITEST) {
  await main().catch((err) => {
    console.error(err)
    process.exit(1)
  })
}
