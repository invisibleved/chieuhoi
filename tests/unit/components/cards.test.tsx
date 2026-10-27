import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { ExhibitCard } from '@/components/content/ExhibitCard'
import { ProductCard } from '@/components/content/ProductCard'
import { StoryCard } from '@/components/content/StoryCard'
import type { ProductCardView, StoryCardView } from '@/lib/content'

const story: StoryCardView = { slug: 'chuyen-ve-trang-chieu', title: 'Chuyện về Trạng Chiếu', sapo: 'Mô tả ngắn', category: 'Lịch sử', categoryKey: 'history', cover: null, readingMinutes: null, hasDetail: true, cta: 'Đọc bài →', status: 'Bản nháp', isDraft: true, sourceCount: 0, flags: ['unpublished'] }

describe('StoryCard', () => {
  it('grid: nhãn Bản nháp, CTA Đọc bài →, không có ảnh thì không có img', () => {
    const { container } = render(<StoryCard story={story} href="/cau-chuyen/chuyen-ve-trang-chieu" variant="grid" />)
    expect(screen.getByText('Bản nháp')).toBeTruthy()
    // Chủ đề giữ chữ của nhãn option; in hoa bằng CSS.
    expect(screen.getByText('Lịch sử').className).toContain('uppercase')
    expect(screen.getByText('Đọc bài →')).toBeTruthy()
    expect(container.querySelector('img')).toBeNull()
  })
  it('chủ đề đề xuất: CTA Xem đề cương →', () => {
    render(<StoryCard story={{ ...story, hasDetail: false, cta: 'Xem đề cương →', status: 'Chủ đề đề xuất', isDraft: false }} href="#" variant="grid" />)
    expect(screen.getByText('Chủ đề đề xuất')).toBeTruthy()
    expect(screen.getByText('Xem đề cương →')).toBeTruthy()
  })
  it('featured có số phút đọc khi có', () => {
    render(<StoryCard story={{ ...story, readingMinutes: 6, flags: [] }} href="#" variant="featured" />)
    expect(screen.getByText('Lịch sử · 6 PHÚT ĐỌC').className).toContain('uppercase')
  })
  it('compact và trường null không in null', () => {
    const { container } = render(<StoryCard story={{ ...story, title: null, sapo: null, category: null, flags: [] }} href="#" variant="compact" />)
    expect(container.textContent).not.toContain('null')
    expect(screen.getByText('Đọc bài →')).toBeTruthy()
  })
})

describe('StoryCard: nhãn trạng thái theo isDraft', () => {
  it('isDraft: nhãn viền đứt; không phải nháp: nhãn nền, kể cả khi chữ nhãn giống nhau', () => {
    const { rerender } = render(<StoryCard story={story} href="#" variant="grid" />)
    const draft = screen.getByText('Bản nháp').className
    rerender(<StoryCard story={{ ...story, isDraft: false }} href="#" variant="grid" />)
    expect(screen.getByText('Bản nháp').className).not.toBe(draft)
  })
})

describe('StoryCard: hero và thẻ không link', () => {
  it('hero: eyebrow ghi đè, meta, link, CTA từ story.cta', () => {
    const { container } = render(<StoryCard story={{ ...story, readingMinutes: 4, sourceCount: 3, flags: [] }} href="/cau-chuyen/x" variant="hero" eyebrow="BÀI NỔI BẬT · LỊCH SỬ" meta="3 nguồn báo chí · khoảng 4 phút đọc" />)
    expect(screen.getByText('BÀI NỔI BẬT · LỊCH SỬ')).toBeTruthy()
    expect(screen.queryByText('Lịch sử · 4 PHÚT ĐỌC')).toBeNull()
    expect(screen.getByText('3 nguồn báo chí · khoảng 4 phút đọc')).toBeTruthy()
    expect(screen.getByText('Đọc bài →')).toBeTruthy()
    expect(container.querySelector('a')?.getAttribute('href')).toBe('/cau-chuyen/x')
    expect(container.querySelector('a')?.className).toContain('md:grid-cols-12')
  })
  it('meta chỉ hiện ở hero', () => {
    render(<StoryCard story={{ ...story, flags: [] }} href="#" variant="grid" meta="Dòng meta" />)
    expect(screen.queryByText('Dòng meta')).toBeNull()
  })
  it('không có href: <article>, không <a>, không CTA', () => {
    const { container } = render(<StoryCard story={{ ...story, hasDetail: false, cta: 'Xem đề cương →', status: 'Chủ đề đề xuất' }} variant="grid" />)
    expect(container.querySelector('article')).toBeTruthy()
    expect(container.querySelector('a')).toBeNull()
    expect(screen.queryByText('Xem đề cương →')).toBeNull()
    expect(screen.getByText('Chủ đề đề xuất')).toBeTruthy()
  })
  it('compact không href cũng là article', () => {
    const { container } = render(<StoryCard story={{ ...story, flags: [] }} variant="compact" />)
    expect(container.querySelector('article')).toBeTruthy()
    expect(container.querySelector('a')).toBeNull()
  })
})

const product: ProductCardView = { slug: 'chieu-tron', code: 'HIỆN VẬT 01', name: 'Chiếu trơn', group: 'traditional', groupLabel: 'Chiếu cói truyền thống', summary: null, image: null, typeConfirmed: false, flags: [] }

describe('ProductCard', () => {
  it('không ảnh: khung ẢNH CẦN CHỤP + nhãn Chưa có ảnh', () => {
    render(<ProductCard product={product} href="/san-pham/chieu-tron" />)
    expect(screen.getByText('ẢNH CẦN CHỤP')).toBeTruthy()
    expect(screen.getByText('Chưa có ảnh')).toBeTruthy()
    expect(screen.getByRole('link').getAttribute('href')).toBe('/san-pham/chieu-tron')
  })
})

describe('ExhibitCard', () => {
  it('active', () => {
    const { container } = render(<ExhibitCard index={4} name="Chiếu cạp điều" active />)
    expect(screen.getByText('HIỆN VẬT 04')).toBeTruthy()
    expect(container.firstElementChild?.className).toContain('border-accent')
  })
  it('có href thì là link', () => {
    render(<ExhibitCard index={1} name="A" href="/x" />)
    expect(screen.getByRole('link').getAttribute('href')).toBe('/x')
  })
})

describe('ProductCard không tên', () => {
  it('không bịa tên: chỉ ẢNH CẦN CHỤP, aria-label ngắn', () => {
    const { container } = render(<ProductCard product={{ ...product, name: null }} href="#" />)
    expect(screen.getByText('ẢNH CẦN CHỤP')).toBeTruthy()
    expect(container.textContent).not.toContain('Sản phẩm')
    expect(screen.getByRole('img').getAttribute('aria-label')).toBe('Ảnh cần chụp')
  })
})
