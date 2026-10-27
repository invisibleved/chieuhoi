// View model của /san-pham và /san-pham/[slug]. Dùng lại createContent và ảnh theo ô của createPages.
import type { Payload } from 'payload'

import { productGroupOptions } from './categories'
import { applyMode } from './copy/applyMode'
import { productsCopy, productsOtherFixed } from './copy/products'
import { createPages } from './pages'
import type { createContent } from './queries'
import type { Mode, ProductPageView, ProductsPageView, ReadNextItem } from './types'

type Content = ReturnType<typeof createContent>

/** Nguồn của khung "VỀ DANH MỤC" (R9). */
const CATALOG_SOURCE_ID = 'vietnamplus-2026'

export function createProducts(payload: Payload, content: Content) {
  const { getPageMedia } = createPages(payload, content)

  async function getProductsPage(mode: Mode): Promise<ProductsPageView> {
    const [intro, products, sources] = await Promise.all([
      content.getPageIntro('san-pham', mode), content.getProducts(mode), content.getSources(mode),
    ])
    const url = sources.find((s) => s.id === CATALOG_SOURCE_ID)?.url ?? null
    return {
      intro,
      products,
      filters: [{ key: 'all', label: productsCopy.filter.all }, ...productGroupOptions],
      // Chỉ nhận http(s), tránh giao thức lạ.
      catalogSourceUrl: url && /^https?:\/\//i.test(url) ? url : null,
      copy: applyMode(productsCopy, mode),
    }
  }

  async function getProductPage(slug: string, mode: Mode): Promise<ProductPageView | null> {
    const product = await content.getProduct(slug, mode)
    if (!product) return null
    const [media, list] = await Promise.all([getPageMedia('san-pham', mode), content.getProducts(mode)])
    // R8: hai hiện vật kế tiếp theo thứ tự danh sách, vòng lại đầu, bỏ hiện vật đang xem.
    const at = list.findIndex((p) => p.slug === slug)
    const next = at < 0 ? list : [...list.slice(at + 1), ...list.slice(0, at)]
    const others: ReadNextItem[] = next
      .filter((p) => p.name)
      .slice(0, 2)
      .map((p) => ({
        href: `/san-pham/${p.slug}`, eyebrow: p.code ?? '', title: p.name as string,
        cta: productsCopy.detail.others.cta, image: p.image,
      }))
    const f = productsOtherFixed
    others.push({
      href: f.href, eyebrow: f.eyebrow, title: f.title, cta: f.cta, image: media[f.slot]?.image ?? null, mobile: false,
    })
    return { product, others, copy: applyMode(productsCopy, mode) }
  }

  /** Slug hiện vật đã đăng cho generateStaticParams (R21). */
  async function getProductSlugs(): Promise<string[]> {
    return (await content.getProducts('public')).map((p) => p.slug)
  }

  return { getProductsPage, getProductPage, getProductSlugs }
}
