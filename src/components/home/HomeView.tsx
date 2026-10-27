import type {
  ArchiveCategory, ArchiveItemView, CraftStepView, HomeCopyView, HomeMediaView, Mode, PageIntroView, PersonView,
  ProductCardView, ProductView, StoryCardView,
} from '@/lib/content'
import { Reveal } from '@/components/ui/Reveal'
import { ArchiveTeaser } from './ArchiveTeaser'
import { Closing } from './Closing'
import { CraftTeaser } from './CraftTeaser'
import { Hero } from './Hero'
import { PeopleTeaser } from './PeopleTeaser'
import { ProductsTeaser } from './ProductsTeaser'
import { StoriesTeaser } from './StoriesTeaser'
import { VillageIntro } from './VillageIntro'

type HomeViewProps = {
  mode: Mode
  intro: PageIntroView
  media: HomeMediaView
  steps: CraftStepView[]
  people: PersonView[]
  stories: StoryCardView[]
  featured: ProductView | null
  products: ProductCardView[]
  archive: ArchiveItemView[]
  archiveCategories: { key: ArchiveCategory; label: string }[]
  storyHref: string | null
  copy: HomeCopyView
}

/** Ghép các section trang chủ theo thứ tự thiết kế. Thuần, không đọc dữ liệu. */
export function HomeView(p: HomeViewProps) {
  return (
    <>
      <Hero intro={p.intro} media={p.media} storyHref={p.storyHref} copy={p.copy} />
      <Reveal><VillageIntro media={p.media} mode={p.mode} /></Reveal>
      <Reveal><CraftTeaser steps={p.steps} mode={p.mode} copy={p.copy} /></Reveal>
      <Reveal><PeopleTeaser people={p.people} /></Reveal>
      <Reveal><StoriesTeaser stories={p.stories} /></Reveal>
      <Reveal><ProductsTeaser featured={p.featured} products={p.products} mode={p.mode} /></Reveal>
      <Reveal><ArchiveTeaser items={p.archive} categories={p.archiveCategories} docLabel={p.copy.docLabel.mobile} /></Reveal>
      <Reveal><Closing /></Reveal>
    </>
  )
}
