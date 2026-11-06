import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

import { ProductView } from '@/components/products/ProductView'
import { getMode, getProductPage, getProductSlugs } from '@/lib/content'

type Props = { params: Promise<{ slug: string }> }

// Chỉ hiện vật đã đăng được dựng sẵn; bản nháp mở được ở preview (dynamicParams mặc định true, R21).
export async function generateStaticParams() {
  return (await getProductSlugs()).map((slug) => ({ slug }))
}

// OG chỉ khi ảnh đầu được phép dùng ở mode hiện tại (view model đã lọc).
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const page = await getProductPage(slug, await getMode())
  if (!page) return {}
  const { product } = page
  const image = product.primaryImage
  return {
    title: product.name ?? undefined,
    description: product.summary ?? undefined,
    ...(image ? { openGraph: { images: [{ url: image.url, alt: image.alt }] } } : {}),
  }
}

export default async function ProductPage({ params }: Props) {
  const { slug } = await params
  const page = await getProductPage(slug, await getMode())
  if (!page) notFound()
  return <ProductView page={page} />
}
