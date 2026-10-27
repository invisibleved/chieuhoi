import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { HomeView } from '@/components/home/HomeView'
import { homeCopy } from '@/lib/content/copy/home'
import type { ArchiveItemView, CraftStepView, HomeMediaView, PageIntroView, PersonView, ProductCardView, StoryCardView } from '@/lib/content'

const intro: PageIntroView = {
  eyebrow: 'DI SẢN LÀNG NGHỀ VIỆT NAM',
  title: 'Từ sợi cói quê nhà, dệt nên những câu chuyện.',
  heroTitle: 'Từ sợi cói quê nhà,\ndệt nên những\ncâu chuyện.',
  lead: 'Khám phá làng Hới.',
}
const media: HomeMediaView = { hero: null, heroInset: null, village: [] }
const base = { intro, media, steps: [], people: [], stories: [], featured: null, products: [], archive: [], archiveCategories: [], storyHref: null, copy: homeCopy }

vi.stubGlobal('IntersectionObserver', undefined)

describe('HomeView', () => {
  it('mọi dữ liệu rỗng: chỉ h1, "Có một làng Hới..." và h2 kết', () => {
    const { container } = render(<HomeView mode="public" {...base} />)
    expect(screen.getAllByRole('heading', { level: 1 })).toHaveLength(1)
    const h2 = screen.getAllByRole('heading', { level: 2 })
    expect(h2).toHaveLength(2)
    expect(h2[0].textContent).toMatch(/Có một làng Hới/)
    expect(h2[1].textContent).toMatch(/Làng vẫn còn đó/)
    expect(container.textContent!.toLowerCase()).not.toContain('cần xác minh')
  })
  it('dữ liệu kiểu public: không chuỗi xác minh, link bài chỉ tới bài có chi tiết', () => {
    const step: CraftStepView = { n: 1, title: 'Chọn cói', shortTitle: null, subtitle: null, body: null, tools: null, toRecord: null, image: null, shotNeeded: null, focus: [50, 50], flags: [] }
    const person: PersonView = { slug: 'a', category: 'Nghệ nhân', categoryKey: 'artisan', role: null, name: 'Tên a', note: null, portrait: null, quote: null, consentPending: false, flags: [] }
    const story = (slug: string, hasDetail: boolean): StoryCardView => ({ slug, title: `Bài ${slug}`, sapo: null, category: null, categoryKey: null, cover: null, readingMinutes: null, hasDetail, status: null, sourceCount: 0, flags: [] })
    const product: ProductCardView = { slug: 'p', code: null, name: 'Chiếu', category: null, image: null, flags: [] } as unknown as ProductCardView
    const archive: ArchiveItemView = {
      image: { url: '/images/reference/a.webp', alt: 'Ảnh', width: 800, height: 600, sizes: {}, photographer: null, code: 'TL-001', docNumber: '001', flags: [] },
      title: null, description: null, category: 'village', categoryLabel: 'Làng quê', era: null, eraLabel: null, related: null, flags: [],
    }
    const { container } = render(
      <HomeView mode="public" {...base} steps={[step]} people={[person]} stories={[story('co', true), story('khong', false)]} products={[product]} archive={[archive]} storyHref="/cau-chuyen/co" />,
    )
    const text = container.textContent!.toLowerCase()
    for (const bad of ['cần xác minh', 'chờ xác minh', 'cần xin phép']) expect(text).not.toContain(bad)
    const hrefs = screen.getAllByRole('link').map((a) => a.getAttribute('href')!).filter((h) => h.startsWith('/cau-chuyen/'))
    expect(hrefs.length).toBeGreaterThan(0)
    expect(hrefs.every((h) => h === '/cau-chuyen/co')).toBe(true)
  })
})
