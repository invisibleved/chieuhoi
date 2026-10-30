// Seed dữ liệu khởi đầu từ gói bàn giao. Chạy bằng `npm run seed`.
// `payload run` chỉ đợi top-level await nên main() phải được await ở cuối file.
import { readdirSync } from 'fs'
import path from 'path'
import type { Payload, TypedUser } from 'payload'

import {
  craftStepDocs, isDraft, productDocs, readSeedJson, storyDocs, timelineDocs,
  type SourceIdMap,
} from './content'
import { archiveAlt, archiveItems, otherImageAlts } from './data/archive'
import { peopleSamples } from './data/extras'
import { homeMedia, pageIntros, pageMedia, siteSettings } from './data/site'
import { assertSeedAllowed } from './guard'
import { importPageFacts } from './pageFacts'

export { assertSeedAllowed } from './guard'
export { injectCitations, injectFigures } from './citations'

const root = process.cwd()

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
  const sourceIds: SourceIdMap = {}
  for (const s of readSeedJson<SourceJson[]>('sources.json')) {
    sourceIds[s.id] = await upsert(
      payload, user, 'sources', { field: 'sourceId', value: s.id },
      { sourceId: s.id, publisher: s.publisher, title: s.title, url: s.url, date: s.date },
      'published',
    )
  }

  // Dòng thời gian
  for (const t of timelineDocs(sourceIds, 'published')) {
    await upsert(payload, user, 'timeline-events', { field: 'order', value: t.key }, t.data, 'published')
  }

  // Công đoạn
  for (const s of craftStepDocs(asset, 'draft')) {
    await upsert(
      payload, user, 'craft-steps', { field: 'n', value: s.key }, s.data,
      isDraft(s.status) ? 'draft' : 'published',
    )
  }

  // Sản phẩm
  for (const p of productDocs(sourceIds, asset, 'published')) {
    await upsert(
      payload, user, 'products', { field: 'slug', value: p.key }, p.data,
      isDraft(p.status) ? 'draft' : 'published',
    )
  }

  // Con người (mẫu): tên null, mọi consent false
  const stepIds = new Map(
    (await payload.find({ collection: 'craft-steps', pagination: false, depth: 0, overrideAccess: true, draft: true })).docs
      .map((s) => [s.n, s.id]),
  )
  for (const p of peopleSamples) {
    const relatedStep = p.relatedStep === undefined ? null : stepIds.get(p.relatedStep)
    if (relatedStep === undefined) throw new Error(`Không có công đoạn ${p.relatedStep}`)
    await upsert(
      payload, user, 'people', { field: 'slug', value: p.slug },
      {
        slug: p.slug, name: null, category: p.category, note: p.note,
        portrait: asset(p.portrait),
        gallery: (p.gallery ?? []).map((g) => ({ image: asset(g.file), caption: g.caption })),
        relatedStep,
        consent: { name: false, photo: false, quote: false }, reviewedBySubject: false,
        workflow: 'published',
      },
      'published',
    )
  }

  // Bài viết
  for (const s of storyDocs(payload, sourceIds, { asset, assets, workflow: 'seed' })) {
    await upsert(
      payload, user, 'stories', { field: 'slug', value: s.key }, s.data,
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
  const mediaFor = (route: keyof typeof pageMedia) => ({
    media: pageMedia[route].map((m) => ({ slot: m.slot, image: byFile(m.file), caption: m.caption })),
  })
  const force = process.env.SEED_FORCE_GLOBALS === 'true'
  const globals: [slug: 'site-settings' | 'page-intros', data: object][] = [
    ['site-settings', siteSettings],
    ['page-intros', {
      ...pageIntros,
      home: { ...pageIntros.home, ...homeMediaData },
      'nghe-det-chieu': { ...pageIntros['nghe-det-chieu'], ...mediaFor('nghe-det-chieu') },
      'lang-hoi': { ...pageIntros['lang-hoi'], ...mediaFor('lang-hoi') },
      'cau-chuyen': { ...pageIntros['cau-chuyen'], ...mediaFor('cau-chuyen') },
      'con-nguoi': { ...pageIntros['con-nguoi'], ...mediaFor('con-nguoi') },
      'san-pham': { ...pageIntros['san-pham'], ...mediaFor('san-pham') },
    } as object],
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

  // Dữ kiện trang Làng Hới / Nghề dệt: chỉ điền nhóm trống (hoặc mọi nhóm khi force).
  const factsReport = await importPageFacts(payload, { publish: 'when-no-draft', force, user })
  console.log('Dữ kiện trang:', factsReport)
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
