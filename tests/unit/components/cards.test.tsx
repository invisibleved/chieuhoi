import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { ExhibitCard } from '@/components/content/ExhibitCard'
import { ProductCard } from '@/components/content/ProductCard'
import { StoryCard } from '@/components/content/StoryCard'
import type { ProductCardView, StoryCardView } from '@/lib/content'

const story: StoryCardView = { slug: 'chuyen-ve-trang-chieu', title: 'Chuyện về Trạng Chiếu', sapo: 'Mô tả ngắn', category: 'Lịch sử', categoryKey: 'history', cover: null, readingMinutes: null, hasDetail: true, status: 'Bản nháp', sourceCount: 0, flags: ['unpublished'] }

describe('StoryCard', () => {
  it('grid: nhãn Bản nháp, CTA Đọc bài →, không có ảnh thì không có img', () => {
    const { container } = render(<StoryCard story={story} href="/cau-chuyen/chuyen-ve-trang-chieu" variant="grid" />)
    expect(screen.getByText('Bản nháp')).toBeTruthy()
    expect(screen.getByText('LỊCH SỬ')).toBeTruthy()
    expect(screen.getByText('Đọc bài →')).toBeTruthy()
    expect(container.querySelector('img')).toBeNull()
  })
  it('chủ đề đề xuất: CTA Xem đề cương →', () => {
    render(<StoryCard story={{ ...story, hasDetail: false, status: 'Chủ đề đề xuất' }} href="#" variant="grid" />)
    expect(screen.getByText('Chủ đề đề xuất')).toBeTruthy()
    expect(screen.getByText('Xem đề cương →')).toBeTruthy()
  })
  it('featured có số phút đọc khi có', () => {
    render(<StoryCard story={{ ...story, readingMinutes: 6, flags: [] }} href="#" variant="featured" />)
    expect(screen.getByText('LỊCH SỬ · 6 PHÚT ĐỌC')).toBeTruthy()
  })
  it('compact và trường null không in null', () => {
    const { container } = render(<StoryCard story={{ ...story, title: null, sapo: null, category: null, flags: [] }} href="#" variant="compact" />)
    expect(container.textContent).not.toContain('null')
    expect(screen.getByText('Đọc bài →')).toBeTruthy()
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
