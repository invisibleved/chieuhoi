import type { Metadata } from 'next'

import { HomeView } from '@/components/home/HomeView'
import {
  getArchive, getCraftSteps, getHomeMedia, getMode, getPageIntro, getPeople,
  getProduct, getProducts, getStories,
  type ProductView,
} from '@/lib/content'

const STORY_SLUG = 'chuyen-ve-trang-chieu'

export async function generateMetadata(): Promise<Metadata> {
  const intro = await getPageIntro('home', await getMode())
  return intro.lead ? { title: 'Chiếu Hới', description: intro.lead } : { title: 'Chiếu Hới' }
}

export default async function HomePage() {
  const mode = await getMode()
  const [intro, media, steps, people, stories, products, archive] = await Promise.all([
    getPageIntro('home', mode), getHomeMedia(mode), getCraftSteps(mode), getPeople(mode),
    getStories(mode), getProducts(mode), getArchive(mode),
  ])
  // Sản phẩm nổi bật: sản phẩm đầu tiên có đủ ảnh và chú thích.
  let featured: ProductView | null = null
  for (const p of products) {
    const detail = await getProduct(p.slug, mode)
    if (detail?.hasPattern) { featured = detail; break }
  }
  const storyHref = stories.some((s) => s.slug === STORY_SLUG && s.hasDetail) ? `/cau-chuyen/${STORY_SLUG}` : null
  return (
    <HomeView mode={mode} intro={intro} media={media} steps={steps} people={people} stories={stories}
      featured={featured} products={products} archive={archive} storyHref={storyHref} />
  )
}
