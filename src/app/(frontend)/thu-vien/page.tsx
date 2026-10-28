import type { Metadata } from 'next'

import { ArchiveView } from '@/components/archive/ArchiveView'
import { getArchivePage, getMode } from '@/lib/content'

type SearchParams = Promise<{ anh?: string | string[] }>

// Chỉ lấy giá trị đầu; rỗng thì coi như không có.
async function firstCode(searchParams: SearchParams): Promise<string | null> {
  const { anh } = await searchParams
  const code = Array.isArray(anh) ? anh[0] : anh
  return code ? code : null
}

export async function generateMetadata({ searchParams }: { searchParams: SearchParams }): Promise<Metadata> {
  const { intro, copy, items } = await getArchivePage(await getMode())
  const base = (intro.title ?? copy.breadcrumb.current ?? '').replace(/\n/g, ' ')
  const wanted = (await firstCode(searchParams))?.toLowerCase()
  // Chỉ các mục trong view model (đã lọc quyền) mới được khớp.
  const hit = wanted ? items.find((i) => i.code.toLowerCase() === wanted) : undefined
  if (hit?.title) {
    return {
      title: `${hit.title} · ${copy.breadcrumb.current}`,
      ...(hit.description ? { description: hit.description } : {}),
      openGraph: { images: [{ url: hit.image.url, width: hit.image.width, height: hit.image.height }] },
    }
  }
  return intro.lead ? { title: base, description: intro.lead } : { title: base }
}

export default async function ArchivePage({ searchParams }: { searchParams: SearchParams }) {
  const mode = await getMode()
  const page = await getArchivePage(mode)
  // Chỉ chuyển xuống mã khớp một mục đang hiện: mã khác (kể cả của ảnh bị ẩn) không đi vào payload.
  const wanted = (await firstCode(searchParams))?.toLowerCase()
  const initialCode = page.items.find((i) => i.code.toLowerCase() === wanted)?.code ?? null
  return <ArchiveView page={page} initialCode={initialCode} />
}
