// Hàm chuyển dữ liệu seed JSON thành data của Payload. Dùng chung cho `npm run seed` (dev, có ảnh)
// và `import:content` (production, asset = null, không gắn ảnh).
import { readFileSync } from 'fs'
import path from 'path'
import {
  convertMarkdownToLexical,
  editorConfigFactory,
} from '@payloadcms/richtext-lexical'
import type { Payload, RichTextField } from 'payload'

import { FIGURE, injectCitations, injectFigures } from './citations'
import { craftCopy } from './data/craft'
import { productSummary, storyCategory, storyExtras } from './data/extras'
import { timelineCopy } from './data/timeline'

export type SourceIdMap = Record<string, number>
/** `null` nghĩa là không gắn ảnh. */
export type AssetFn = ((p: string | null | undefined) => number | null) | null
export type SeedStatus = 'idea' | 'draft' | 'pending' | undefined
export type Workflow = 'draft' | 'published'

export const isDraft = (s: SeedStatus) => s === 'draft' || s === 'pending'

export const readSeedJson = <T>(file: string): T =>
  JSON.parse(readFileSync(path.resolve(process.cwd(), 'content/seed', file), 'utf8')) as T

type TimelineJson = { label: string; title: string; body: string; confidence: string; sources: string[] }

export function timelineDocs(
  sourceIds: SourceIdMap,
  workflow: Workflow,
): { key: number; data: Record<string, unknown> }[] {
  const timeline = readSeedJson<TimelineJson[]>('timeline.json')
  if (timeline.length !== timelineCopy.length) throw new Error('timeline.json lệch số mốc so với artboard.')
  return timeline.map((t, i) => {
    const copy = timelineCopy[i]
    return {
      key: i + 1,
      data: {
        label: copy.label, title: copy.title, body: copy.body, order: i + 1, confidence: t.confidence,
        sources: t.sources.map((s) => sourceIds[s]), workflow,
      },
    }
  })
}

type StepJson = {
  n: number; title: string; subtitle: string; image: string | null; shotNeeded?: string
  focus: [number, number]; body: string | null; tools: string | null; status?: SeedStatus
}

export function craftStepDocs(
  asset: AssetFn,
  workflow: Workflow,
): { key: number; status?: SeedStatus; data: Record<string, unknown> }[] {
  return readSeedJson<StepJson[]>('craftSteps.json').map((s) => ({
    key: s.n,
    status: s.status,
    data: {
      n: s.n, title: s.title, subtitle: s.subtitle, ...craftCopy[s.n], body: s.body ?? undefined, tools: s.tools ?? undefined,
      ...(asset ? { image: asset(s.image) } : {}),
      shotNeeded: s.shotNeeded, focusX: s.focus[0], focusY: s.focus[1],
      workflow,
    },
  }))
}

type ProductJson = {
  slug: string; code: string; name: string; group: string; images: string[]; typeConfirmed: boolean
  status?: SeedStatus
  context?: string; material?: string; technique?: string; pattern?: string
  annotations?: {
    n: number; title: string; shortTitle?: string; x: number; y: number; body: string; source: string | null
    sourceNote?: string
  }[]
}

export function productDocs(
  sourceIds: SourceIdMap,
  asset: AssetFn,
  workflow: Workflow,
): { key: string; status?: SeedStatus; data: Record<string, unknown> }[] {
  return readSeedJson<ProductJson[]>('products.json').map((p) => ({
    key: p.slug,
    status: p.status,
    data: {
      slug: p.slug, code: p.code, name: p.name, group: p.group, summary: productSummary[p.slug],
      ...(asset ? { images: p.images.map((i) => asset(i)) } : {}),
      typeConfirmed: p.typeConfirmed,
      context: p.context, material: p.material, technique: p.technique, pattern: p.pattern,
      annotations: (p.annotations ?? []).map((a) => ({
        n: a.n, title: a.title, shortTitle: a.shortTitle, x: a.x, y: a.y, body: a.body,
        source: a.source ? sourceIds[a.source] : null, sourceNote: a.sourceNote,
      })),
      workflow,
    },
  }))
}

/** Bỏ mọi dòng chỉ chứa `[[figure:…]]` (cùng regex với `injectFigures`). */
export function stripFigureParagraphs(markdown: string): string {
  return markdown
    .split('\n')
    .filter((line) => !FIGURE.test(line.trim()))
    .join('\n')
}

type StoryJson = { slug: string; title: string; category: string; status?: SeedStatus; sources?: string[] }

export type StoryDocsOptions = {
  /** Ảnh bìa và figure; null thì bỏ `cover` và bỏ các dòng figure trong thân bài. */
  asset: AssetFn
  /** Id ảnh theo tên file, cho `injectFigures`; chỉ dùng khi `asset` khác null. */
  assets?: Record<string, number>
  /** 'draft' ép mọi bài thành bản nháp; 'seed' giữ trạng thái theo JSON. */
  workflow: 'seed' | 'draft'
  /** Bỏ các bài có status 'idea'. */
  skipIdeas?: boolean
}

export function storyDocs(
  payload: Payload,
  sourceIds: SourceIdMap,
  opts: StoryDocsOptions,
): { key: string; status?: SeedStatus; data: Record<string, unknown> }[] {
  const { asset, assets, workflow, skipIdeas } = opts
  const bodyField = payload.collections.stories.config.fields.find(
    (f) => 'name' in f && f.name === 'body',
  ) as RichTextField
  const editorConfig = editorConfigFactory.fromField({ field: bodyField })
  const raw = readFileSync(path.resolve(process.cwd(), 'src/seed/data/chuyen-ve-trang-chieu.md'), 'utf8')
  const markdown = asset ? raw : stripFigureParagraphs(raw)
  const lexical = injectCitations(convertMarkdownToLexical({ editorConfig, markdown }) as never, sourceIds)
  const trangChieuBody = asset ? injectFigures(lexical, assets ?? {}) : lexical

  return readSeedJson<StoryJson[]>('stories.json')
    .filter((s) => !(skipIdeas && s.status === 'idea'))
    .map((s) => {
      const extra = storyExtras[s.slug]
      if (!extra) throw new Error(`Thiếu dữ liệu bổ sung cho bài ${s.slug}`)
      const idea = s.status === 'idea'
      return {
        key: s.slug,
        status: s.status,
        data: {
          slug: s.slug, title: s.title, sapo: extra.sapo, category: storyCategory[s.category],
          ...(asset ? { cover: asset(extra.cover), coverCaption: extra.coverCaption } : {}),
          readingMinutes: extra.readingMinutes,
          reviewChecklist: (extra.reviewChecklist ?? []).map((item) => ({ item })),
          sources: (s.sources ?? []).map((x) => sourceIds[x]),
          ...(s.slug === 'chuyen-ve-trang-chieu' ? { body: trangChieuBody } : {}),
          workflow: workflow === 'draft' ? 'draft' : idea ? 'idea' : isDraft(s.status) ? 'draft' : 'published',
        },
      }
    })
}
