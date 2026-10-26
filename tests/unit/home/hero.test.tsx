import { render, screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { Hero } from '@/components/home/Hero'
import { VillageIntro } from '@/components/home/VillageIntro'
import type { HomeMediaView, ImageView } from '@/lib/content'

const intro = {
  eyebrow: 'DI SẢN LÀNG NGHỀ VIỆT NAM',
  title: 'Từ sợi cói quê nhà, dệt nên những câu chuyện.',
  heroTitle: 'Từ sợi cói quê nhà,\ndệt nên những\ncâu chuyện.',
  lead: 'Khám phá làng Hới, nơi nghề dệt chiếu lưu giữ ký ức, sự khéo léo và tâm hồn của bao thế hệ.',
}
const empty: HomeMediaView = { hero: null, heroInset: null, village: [] }
const img = (over: Partial<ImageView> = {}): ImageView => ({
  url: '/images/reference/kn14.webp',
  alt: 'Người thợ in hoa văn',
  width: 800,
  height: 600,
  sizes: {},
  photographer: null,
  code: 'TL-002',
  flags: [],
  ...over,
})
const full: HomeMediaView = {
  hero: { image: img(), title: 'In hoa văn lên chiếu bằng khuôn', caption: 'Ảnh: Bảo tàng' },
  heroInset: img({ url: '/images/reference/kn5.webp', alt: 'Cuộn chiếu dựng đứng', code: null }),
  village: [
    { image: img({ alt: 'Bãi phơi chiếu', url: '/images/reference/hc8.webp' }), caption: 'Chiếu trải phơi.' },
    { image: img({ alt: 'Gấp chiếu', url: '/images/reference/kn11.webp' }), caption: 'Gấp chiếu thành phẩm.' },
  ],
}
const STORY = '/cau-chuyen/chuyen-ve-trang-chieu'

describe('Hero', () => {
  it('h1 theo heroTitle, dòng cuối là em', () => {
    render(<Hero intro={intro} media={empty} storyHref={STORY} />)
    const h1 = screen.getByRole('heading', { level: 1 })
    expect(h1.textContent).toBe('Từ sợi cói quê nhà,dệt nên nhữngcâu chuyện.')
    expect(h1.querySelector('em')?.textContent).toBe('câu chuyện.')
    expect(h1.querySelectorAll('br')).toHaveLength(2)
  })
  it('heroTitle null thì dùng title; cả hai null thì h1 sr-only "Chiếu Hới"', () => {
    const { rerender } = render(<Hero intro={{ ...intro, heroTitle: null }} media={empty} storyHref={STORY} />)
    expect(screen.getByRole('heading', { level: 1 }).textContent).toBe(intro.title)
    rerender(<Hero intro={{ eyebrow: null, title: null, lead: null, heroTitle: null }} media={empty} storyHref={STORY} />)
    const h1 = screen.getByRole('heading', { level: 1 })
    expect(h1.textContent).toBe('Chiếu Hới')
    expect(h1.className).toContain('sr-only')
  })
  it('nút: Khám phá làng nghề và Nghe chuyện làng Hới theo storyHref', () => {
    render(<Hero intro={intro} media={empty} storyHref={STORY} />)
    expect(screen.getByRole('link', { name: 'Khám phá làng nghề' }).getAttribute('href')).toBe('/lang-hoi')
    expect(screen.getByRole('link', { name: 'Nghe chuyện làng Hới' }).getAttribute('href')).toBe(STORY)
  })
  it('storyHref null thì không có link Nghe chuyện làng Hới', () => {
    render(<Hero intro={intro} media={empty} storyHref={null} />)
    expect(screen.queryByRole('link', { name: 'Nghe chuyện làng Hới' })).toBeNull()
  })
  it('không có ảnh hero thì không có figure', () => {
    const { container } = render(<Hero intro={intro} media={empty} storyHref={STORY} />)
    expect(container.querySelector('figure')).toBeNull()
  })
  it('có ảnh: nhãn tư liệu lấy phần số của TL, inset dùng alt thật', () => {
    const { container } = render(<Hero intro={intro} media={full} storyHref={STORY} />)
    expect(container.querySelector('figure')).not.toBeNull()
    expect(container.textContent).toContain('TƯ LIỆU · 002')
    expect(screen.getByAltText('Cuộn chiếu dựng đứng')).toBeTruthy()
    expect(within(container.querySelector('figure')!).getAllByText('In hoa văn lên chiếu bằng khuôn').length).toBeGreaterThan(0)
  })
  it('không có mã, tiêu đề, chú thích thì không có figcaption', () => {
    const media = { ...full, hero: { image: img({ code: null }), title: null, caption: null } }
    const { container } = render(<Hero intro={intro} media={media} storyHref={STORY} />)
    expect(container.querySelector('figure')).not.toBeNull()
    expect(container.querySelector('figcaption')).toBeNull()
  })
  it('h1 chỉ nowrap từ xl và chỉ với heroTitle', () => {
    const { rerender } = render(<Hero intro={intro} media={empty} storyHref={STORY} />)
    const cls = screen.getByRole('heading', { level: 1 }).className
    expect(cls).toContain('xl:whitespace-nowrap')
    expect(cls).not.toMatch(/(^|\s)md:whitespace-nowrap/)
    rerender(<Hero intro={{ ...intro, heroTitle: null }} media={empty} storyHref={STORY} />)
    expect(screen.getByRole('heading', { level: 1 }).className).not.toContain('nowrap')
  })
  it('code không khớp TL-n thì bỏ dòng mã', () => {
    const media = { ...full, hero: { ...full.hero!, image: img({ code: '[cần xác minh]' }) } }
    const { container } = render(<Hero intro={intro} media={media} storyHref={STORY} />)
    expect(container.textContent).not.toContain('TƯ LIỆU')
  })
})

describe('VillageIntro', () => {
  it('public: không có [CẦN XÁC MINH]; preview: có', () => {
    const { container, rerender } = render(<VillageIntro media={empty} mode="public" />)
    expect(container.textContent).not.toContain('CẦN XÁC MINH')
    expect(screen.getByRole('heading', { level: 2, name: 'Có một làng Hới...' })).toBeTruthy()
    expect(screen.getAllByRole('link', { name: 'Đọc về làng Hới' })[0].getAttribute('href')).toBe('/lang-hoi')
    expect(container.textContent).toContain('Có những ngôi làng được nhớ bằng một mái đình, một bến sông.')
    rerender(<VillageIntro media={empty} mode="preview" />)
    expect(container.textContent).toContain('[CẦN XÁC MINH]')
  })
  it('render hai ảnh làng với chú thích', () => {
    render(<VillageIntro media={full} mode="public" />)
    expect(screen.getByAltText('Bãi phơi chiếu')).toBeTruthy()
    expect(screen.getByAltText('Gấp chiếu')).toBeTruthy()
    expect(screen.getByText('Gấp chiếu thành phẩm.')).toBeTruthy()
  })
})
