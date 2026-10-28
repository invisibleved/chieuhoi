import { afterEach, describe, expect, it } from 'vitest'
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import type { ProductCardView, ProductsPageView } from '@/lib/content'
import { applyMode } from '@/lib/content/copy/applyMode'
import { productsCopy } from '@/lib/content/copy/products'
import { productGroupOptions } from '@/lib/content/categories'
import { ProductsView } from '@/components/products/ProductsView'

afterEach(cleanup)

const card = (i: number, over: Partial<ProductCardView> = {}): ProductCardView => ({
  slug: `sp-${i}`,
  code: `HIỆN VẬT 0${i}`,
  name: `Chiếu ${i}`,
  group: 'traditional',
  groupLabel: 'Chiếu cói truyền thống',
  summary: `Tóm tắt ${i}`,
  image: null,
  typeConfirmed: false,
  tag: { text: 'Chưa có ảnh', style: 'dashed' },
  shotNeeded: { desktop: `Chiếu ${i} chụp phẳng`, mobile: `Chiếu ${i}` },
  flags: [],
  ...over,
})
const products = [card(1), card(2), card(3, { group: 'contemporary', groupLabel: 'Chiếu đương đại' })]

function view(over: Partial<ProductsPageView> = {}): ProductsPageView {
  return {
    intro: { eyebrow: '05 — SẢN PHẨM', title: 'Nét đẹp từ\nnhững đường dệt.', lead: 'Bộ sưu tập để hiểu.', heroTitle: null },
    products,
    filters: [{ key: 'all', label: 'Tất cả' }, ...productGroupOptions],
    catalogSourceUrl: 'https://www.vietnamplus.vn/x',
    copy: applyMode(productsCopy, 'public'),
    ...over,
  }
}

describe('ProductsView', () => {
  it('một h1, 3 chip lọc', () => {
    render(<ProductsView page={view()} />)
    expect(screen.getAllByRole('heading', { level: 1 })).toHaveLength(1)
    const chips = [...screen.getAllByRole('button', { pressed: false }), ...screen.getAllByRole('button', { pressed: true })]
    expect(chips).toHaveLength(3)
  })

  it('lọc "Chiếu đương đại" còn 1 thẻ và đếm theo desktop/mobile', () => {
    render(<ProductsView page={view()} />)
    expect(screen.getAllByRole('link').filter((a) => a.getAttribute('href')?.startsWith('/san-pham/'))).toHaveLength(3)
    fireEvent.click(screen.getByRole('button', { name: 'Chiếu đương đại' }))
    expect(screen.getAllByRole('link').filter((a) => a.getAttribute('href')?.startsWith('/san-pham/'))).toHaveLength(1)
    const status = screen.getByRole('status').textContent
    expect(status).toContain('1 hiện vật · danh mục theo Vietnam+')
    expect(status).toContain('1 hiện vật')
  })

  it('nhóm không có thẻ hiện khung trống', () => {
    render(<ProductsView page={view({ products: [card(1)] })} />)
    fireEvent.click(screen.getByRole('button', { name: 'Chiếu đương đại' }))
    expect(screen.getByText('Chưa có hiện vật trong nhóm này')).toBeTruthy()
  })

  it('thẻ không ảnh có "ẢNH CẦN CHỤP" với tên đã điền từ view model', () => {
    render(<ProductsView page={view({ products: [card(1)] })} />)
    expect(screen.getAllByText('ẢNH CẦN CHỤP').length).toBeGreaterThan(0)
    expect(screen.getByText('Chiếu 1 chụp phẳng')).toBeTruthy()
  })

  it('khung "VỀ DANH MỤC" có link "Xem nguồn" khi có URL', () => {
    render(<ProductsView page={view()} />)
    const link = screen.getByRole('link', { name: /Xem nguồn/ })
    expect(link.getAttribute('href')).toBe('https://www.vietnamplus.vn/x')
  })

  it('catalogSourceUrl null thì không có link "Xem nguồn", vẫn giữ chữ', () => {
    render(<ProductsView page={view({ catalogSourceUrl: null })} />)
    expect(screen.queryByRole('link', { name: /Xem nguồn/ })).toBeNull()
    expect(screen.getByText('VỀ DANH MỤC')).toBeTruthy()
  })

  it('khối kêu gọi dùng CtaBand (chỉ desktop) trỏ tới /ket-noi', () => {
    render(<ProductsView page={view()} />)
    expect(screen.getByRole('heading', { level: 2, name: 'Muốn tìm đến người làm chiếu?' })).toBeTruthy()
    expect(screen.getByRole('link', { name: 'Kết nối với làng' }).getAttribute('href')).toBe('/ket-noi')
  })

  it('không có ô tìm và nút "Xem thêm"', () => {
    render(<ProductsView page={view()} />)
    expect(screen.queryByRole('searchbox')).toBeNull()
    expect(screen.queryByRole('button', { name: /Xem thêm/ })).toBeNull()
  })
})
