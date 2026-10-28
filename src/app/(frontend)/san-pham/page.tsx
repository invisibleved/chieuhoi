import type { Metadata } from 'next'

import { ProductsView } from '@/components/products/ProductsView'
import { getMode, getProductsPage } from '@/lib/content'

export async function generateMetadata(): Promise<Metadata> {
  const { intro, copy } = await getProductsPage(await getMode())
  const title = (intro.title ?? copy.breadcrumb.current ?? '').replace(/\n/g, ' ')
  return intro.lead ? { title, description: intro.lead } : { title }
}

export default async function ProductsPage() {
  const mode = await getMode()
  const page = await getProductsPage(mode)
  return <ProductsView page={page} />
}
