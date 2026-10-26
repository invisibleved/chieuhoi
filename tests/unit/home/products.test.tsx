import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { PatternTeaser } from '@/components/home/PatternTeaser'
import { ProductsTeaser } from '@/components/home/ProductsTeaser'
import { FootnoteRef } from '@/components/content/Sources'
import { ExhibitCard } from '@/components/content/ExhibitCard'
import type { ImageView, ProductCardView, ProductView } from '@/lib/content'

const img: ImageView = {
  url: '/images/reference/kn8.webp', alt: 'Ảnh sản phẩm', width: 1200, height: 800, sizes: {}, photographer: null, code: null, flags: [],
}
const product: ProductView = {
  slug: 'chieu-cap-dieu', code: 'HIỆN VẬT 01', name: 'Chiếu cạp điều', group: 'traditional', summary: null, image: img,
  typeConfirmed: false, flags: [], images: [img], material: null, technique: null, size: null, care: null, maker: null,
  annotations: [
    { n: 1, title: 'Viền chiếu', x: 30, y: 72, body: 'Phần viền màu đỏ.', sourceId: null },
    { n: 2, title: 'Hoa văn in', x: 52, y: 60, body: 'Hoạ tiết chưa xác định.', sourceId: 'vietnamplus-2026' },
    { n: 3, title: 'Mặt cói dệt', x: 70, y: 82, body: 'Kiểu dệt.', sourceId: null },
  ],
}
const card = (i: number, over: Partial<ProductCardView> = {}): ProductCardView => ({
  slug: `sp-${i}`, code: null, name: `Sản phẩm ${i}`, group: null, summary: `Tóm tắt ${i}`, image: null, typeConfirmed: false, flags: [], ...over,
})
const six = [1, 2, 3, 4, 5, 6].map((i) => card(i))

describe('PatternTeaser', () => {
  it('điểm 1 mở mặc định, aria-pressed, đổi khi bấm điểm khác', () => {
    render(<PatternTeaser product={product} />)
    const b1 = screen.getByRole('button', { name: 'Chi tiết 1: viền chiếu' })
    const b2 = screen.getByRole('button', { name: 'Chi tiết 2: hoa văn in' })
    expect(b1.getAttribute('aria-pressed')).toBe('true')
    fireEvent.click(b2)
    expect(b2.getAttribute('aria-pressed')).toBe('true')
    expect(b1.getAttribute('aria-pressed')).toBe('false')
    expect(screen.getByText('2 · Hoa văn in')).toBeTruthy()
  })
  it('annotation có nguồn: FootnoteRef trỏ trang hiện vật', () => {
    render(<PatternTeaser product={product} />)
    fireEvent.click(screen.getByRole('button', { name: 'Chi tiết 2: hoa văn in' }))
    expect(screen.getByRole('link', { name: 'Nguồn 1' }).getAttribute('href')).toBe('/san-pham/chieu-cap-dieu#nguon-1')
  })
  it('vùng chú thích là aria-live polite', () => {
    const { container } = render(<PatternTeaser product={product} />)
    expect(container.querySelector('[aria-live="polite"]')).not.toBeNull()
  })
  it('mở mặc định là annotations[0] dù n khác 1; title null không vỡ', () => {
    const p = { ...product, annotations: [{ n: 2, title: null, x: 10, y: 10, body: 'Nội dung hai', sourceId: null }] }
    render(<PatternTeaser product={p} />)
    const b = screen.getByRole('button', { name: 'Chi tiết 2' })
    expect(b.getAttribute('aria-pressed')).toBe('true')
    expect(screen.getByText('Nội dung hai')).toBeTruthy()
  })
})

describe('ProductsTeaser', () => {
  it('4 thẻ hiện vật, link Xem toàn bộ sưu tập', () => {
    render(<ProductsTeaser featured={null} products={six} mode="public" />)
    expect(screen.getAllByText(/^HIỆN VẬT \d\d$/)).toHaveLength(4)
    expect(screen.getByRole('link', { name: 'Xem toàn bộ sưu tập' }).getAttribute('href')).toBe('/san-pham')
  })
  it('số HIỆN VẬT là vị trí gốc; tên null bỏ thẻ', () => {
    render(<ProductsTeaser featured={null} products={[card(1, { name: null }), card(2), card(3), card(4)]} mode="public" />)
    expect(screen.getAllByText(/^HIỆN VẬT \d\d$/).map((e) => e.textContent)).toEqual(['HIỆN VẬT 02', 'HIỆN VẬT 03', 'HIỆN VẬT 04'])
  })
  it('ghi chú xác minh mobile chỉ ở preview', () => {
    const { unmount } = render(<ProductsTeaser featured={null} products={six} mode="public" />)
    expect(screen.queryByText('Danh mục đang xác minh với cơ sở dệt.')).toBeNull()
    unmount()
    render(<ProductsTeaser featured={null} products={six} mode="preview" />)
    expect(screen.getByText('Danh mục đang xác minh với cơ sở dệt.')).toBeTruthy()
  })
  it('có featured thì hiện khối điểm; rỗng cả hai thì không render', () => {
    const { unmount } = render(<ProductsTeaser featured={product} products={[]} mode="public" />)
    expect(screen.getByRole('button', { name: 'Chi tiết 1: viền chiếu' })).toBeTruthy()
    unmount()
    const { container } = render(<ProductsTeaser featured={null} products={[]} mode="public" />)
    expect(container.innerHTML).toBe('')
  })
})

describe('Phase 2 prop bổ sung', () => {
  it('FootnoteRef mặc định #nguon-n, href tuỳ chọn', () => {
    const { unmount } = render(<FootnoteRef n={3} />)
    expect(screen.getByRole('link', { name: 'Nguồn 3' }).getAttribute('href')).toBe('#nguon-3')
    unmount()
    render(<FootnoteRef n={3} href="/x#nguon-3" />)
    expect(screen.getByRole('link', { name: 'Nguồn 3' }).getAttribute('href')).toBe('/x#nguon-3')
  })
  it('ExhibitCard note tuỳ chọn, onSecondary đổi màu nhãn', () => {
    render(<ExhibitCard index={1} name="A" note="Ghi chú" onSecondary />)
    expect(screen.getByText('Ghi chú')).toBeTruthy()
    expect(screen.getByText('HIỆN VẬT 01').className).toContain('text-text-muted-alt')
  })
})
