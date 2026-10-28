import type { Metadata } from 'next'

import { ArchiveView } from '@/components/archive/ArchiveView'
import { findArchiveItem, getArchivePage, getMode } from '@/lib/content'

type SearchParams = Promise<{ anh?: string | string[] }>

export async function generateMetadata({ searchParams }: { searchParams: SearchParams }): Promise<Metadata> {
  const { intro, copy, items } = await getArchivePage(await getMode())
  const base = (intro.title ?? copy.breadcrumb.current ?? '').replace(/\n/g, ' ')
  const hit = findArchiveItem(items, (await searchParams).anh)
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
  const page = await getArchivePage(await getMode())
  // Chỉ chuyển xuống mã chuẩn của mục đang hiện: mã khác (kể cả của ảnh bị ẩn) không đi vào payload.
  const initialCode = findArchiveItem(page.items, (await searchParams).anh)?.code ?? null
  return <ArchiveView page={page} initialCode={initialCode} />
}
