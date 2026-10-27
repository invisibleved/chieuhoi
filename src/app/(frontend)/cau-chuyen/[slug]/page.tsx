import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

import { StoryView } from '@/components/stories/StoryView'
import { getMode, getStoryPage, getStorySlugs } from '@/lib/content'

type Props = { params: Promise<{ slug: string }> }

// Chỉ các bài đủ điều kiện public được dựng sẵn; bản nháp mở được ở preview (dynamicParams mặc định true, R20).
export async function generateStaticParams() {
  return (await getStorySlugs()).map((slug) => ({ slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const page = await getStoryPage(slug, await getMode())
  if (!page) return {}
  const { story } = page
  return {
    title: story.title ?? undefined,
    description: story.sapo ?? undefined,
    ...(story.cover ? { openGraph: { images: [{ url: story.cover.url, alt: story.cover.alt }] } } : {}),
  }
}

export default async function StoryPage({ params }: Props) {
  const { slug } = await params
  const page = await getStoryPage(slug, await getMode())
  if (!page) notFound()
  return <StoryView page={page} />
}
