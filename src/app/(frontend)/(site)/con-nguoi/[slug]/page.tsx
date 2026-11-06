import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

import { PersonView } from '@/components/people/PersonView'
import { getMode, getPersonPage, getPersonSlugs } from '@/lib/content'

type Props = { params: Promise<{ slug: string }> }

// Chỉ người đã đăng được dựng sẵn; bản nháp mở được ở preview (dynamicParams mặc định true, R20).
export async function generateStaticParams() {
  return (await getPersonSlugs()).map((slug) => ({ slug }))
}

// View model đã lọc theo đồng ý: tên chưa đồng ý thì heading là "Chờ đồng ý", intro và chân dung là null,
// nên metadata không có mô tả hay ảnh OG nhận ra người.
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const page = await getPersonPage(slug, await getMode())
  if (!page) return {}
  const { person } = page
  return {
    title: person.heading,
    description: person.intro ?? undefined,
    ...(person.portrait ? { openGraph: { images: [{ url: person.portrait.url, alt: person.portrait.alt }] } } : {}),
  }
}

export default async function PersonPage({ params }: Props) {
  const { slug } = await params
  const page = await getPersonPage(slug, await getMode())
  if (!page) notFound()
  return <PersonView page={page} />
}
