import { afterEach, describe, expect, it } from 'vitest'
import { cleanup, render, screen, within } from '@testing-library/react'
import type { ImageView, ProductPageView, ProductView as ProductVM, ReadNextItem } from '@/lib/content'
import { applyMode } from '@/lib/content/copy/applyMode'
import { productsCopy } from '@/lib/content/copy/products'
import { ProductView } from '@/components/products/ProductView'

afterEach(cleanup)

const img = (i: number): ImageView => ({
  url: `/images/reference/p${i}.webp`, alt: `Ảnh ${i}`, width: 1200, height: 800, sizes: {}, photographer: null, code: null, docNumber: null, flags: [],
})
const base: ProductVM = {
  slug: 'chieu-cap-dieu', code: 'HIỆN VẬT 01', name: 'Chiếu cạp điều', group: 'traditional', groupLabel: 'Chiếu cói', summary: null, image: null,
  typeConfirmed: false, tag: null, shotNeeded: null, flags: [], images: [], primaryImage: null, hasPattern: false,
  material: null, technique: null, pattern: null, size: null, care: null, maker: null, contactLine: 'Chưa có cơ sở được xác minh và đồng ý công khai', context: null,
  eyebrow: 'HIỆN VẬT 01 · Chiếu cói', typeNote: null, imageCaptions: [], annotations: [], sources: [],
}
const others: ReadNextItem[] = [
  { href: '/san-pham/chieu-hoa-cai', eyebrow: 'HIỆN VẬT 02', title: 'Chiếu hoa cài', cta: 'Xem hiện vật →', image: null },
  { href: '/san-pham/chieu-tron', eyebrow: '', title: 'Chiếu trơn', cta: 'Xem hiện vật →', image: null },
  { href: '/nghe-det-chieu', eyebrow: 'CÁCH LÀM', title: 'Công đoạn tạo hoa văn', cta: 'Xem công đoạn →', image: null, mobile: false },
]
const page = (mode: 'public' | 'preview', product: Partial<ProductVM> = {}): ProductPageView => ({
  product: { ...base, ...product }, others, copy: applyMode(productsCopy, mode),
})

const publicProduct: Partial<ProductVM> = { material: 'Cói', context: 'Một đoạn bối cảnh.' }
const previewProduct: Partial<ProductVM> = {
  images: [1, 2].map(img), primaryImage: img(1), image: img(1), hasPattern: true,
  imageCaptions: ['Ảnh 1/2', 'Ảnh 2/2'],
  typeNote: 'Ảnh cần cơ sở dệt xác nhận đúng loại',
  material: 'Cói [cần xác minh]', technique: '[cần xác minh]', pattern: 'In bằng khuôn [cần xác minh]', context: 'Bối cảnh.',
  annotations: [1, 2, 3].map((n) => ({
    n, title: `Điểm ${n}`, shortTitle: `Đ${n}`, x: 10 * n, y: 20 * n, body: `Chú thích ${n}.`,
    sourceId: n === 2 ? 's1' : null, sourceN: n === 2 ? 1 : null, sourceLine: null,
    heading: `${n} · Điểm ${n}`, markerLabel: `Chi tiết ${n}: điểm ${n}`, pickerLabel: `${n} · Đ${n}`,
  })),
  sources: [{ id: 's1', title: 'Danh sách hoạ tiết', publisher: 'Vietnam+', url: 'https://example.vn/x', date: '14/08/2026' } as ProductVM['sources'][number]],
}

describe('ProductView (public)', () => {
  it('không ảnh: không có nút điểm, không có placeholder, không có khối Nguồn, có câu chưa có cơ sở', () => {
    render(<ProductView page={page('public', publicProduct)} />)
    expect(screen.queryByRole('button', { name: /Chi tiết 1/ })).toBeNull()
    expect(screen.queryByText('KHÁM PHÁ ĐƯỜNG DỆT')).toBeNull()
    expect(screen.getAllByText('Chưa có cơ sở được xác minh và đồng ý công khai').length).toBeGreaterThan(0)
    expect(document.body.textContent).not.toContain('[chỉ ghi khi đã đo]')
    expect(document.body.textContent).not.toContain('[hướng dẫn từ cơ sở dệt]')
    expect(screen.queryByRole('heading', { name: 'Nguồn' })).toBeNull()
    expect(screen.getAllByText('ẢNH CẦN CHỤP').length).toBeGreaterThan(0)
  })

  it('một h1 đứng trước sân khấu; dòng Kích thước bị bỏ khi trống', () => {
    render(<ProductView page={page('public', publicProduct)} />)
    const h1s = screen.getAllByRole('heading', { level: 1 })
    expect(h1s).toHaveLength(1)
    expect(h1s[0].textContent).toBe('Chiếu cạp điều')
    expect(screen.queryByText('Kích thước')).toBeNull()
    expect(screen.queryByText('Nơi làm')).toBeNull()
  })

  it('maker có tên và liên hệ thì hiện, không còn câu chưa có cơ sở', () => {
    const maker = { name: 'Cơ sở Hới', verified: true, contact: '0900 000 000' }
    render(<ProductView page={page('public', { ...publicProduct, maker, contactLine: '0900 000 000' })} />)
    expect(screen.getAllByText('Cơ sở Hới').length).toBeGreaterThan(0)
    expect(screen.getByText('0900 000 000')).toBeTruthy()
    expect(screen.queryByText('Chưa có cơ sở được xác minh và đồng ý công khai')).toBeNull()
  })

  it('maker được hiện nhưng chưa có liên hệ (contactLine null): không có câu chưa có cơ sở, vẫn có link Kết nối', () => {
    const maker = { name: 'Cơ sở Hới', verified: true, contact: null }
    render(<ProductView page={page('public', { ...publicProduct, maker, contactLine: null })} />)
    expect(screen.getAllByText('Cơ sở Hới').length).toBeGreaterThan(0)
    expect(screen.queryByText('Chưa có cơ sở được xác minh và đồng ý công khai')).toBeNull()
    expect(screen.getByRole('link', { name: /^Kết nối với làng/ }).getAttribute('href')).toBe('/ket-noi')
  })

  it('R5: không có dòng nào và không có context vẫn hiện câu chưa có cơ sở, link Kết nối với làng và nút mobile; không có cột Bối cảnh', () => {
    render(<ProductView page={page('public')} />)
    expect(screen.getByText('Chưa có cơ sở được xác minh và đồng ý công khai')).toBeTruthy()
    expect(screen.getByRole('link', { name: /^Kết nối với làng/ }).getAttribute('href')).toBe('/ket-noi')
    expect(screen.getByRole('link', { name: 'Kết nối với người làm chiếu' })).toBeTruthy()
    expect(screen.queryByText('BỐI CẢNH')).toBeNull()
    expect(screen.queryByText('Một tấm chiếu trong đời sống làng')).toBeNull()
  })

  it('liên hệ: LinkArrow desktop và nút viền mobile cùng trỏ /ket-noi', () => {
    render(<ProductView page={page('public', publicProduct)} />)
    expect(screen.getByRole('link', { name: /^Kết nối với làng/ }).getAttribute('href')).toBe('/ket-noi')
    expect(screen.getByRole('link', { name: 'Kết nối với người làm chiếu' }).getAttribute('href')).toBe('/ket-noi')
  })
})

describe('ProductView (preview)', () => {
  it('3 điểm, chú thích nguồn có id nguon-1, Kích thước hiện placeholder', () => {
    const { container } = render(<ProductView page={page('preview', previewProduct)} />)
    expect(screen.getAllByRole('button', { name: /^Chi tiết \d: / })).toHaveLength(3)
    const dts = [...container.querySelectorAll('dt')].filter((dt) => dt.textContent === 'Kích thước')
    expect(dts.length).toBeGreaterThan(0)
    expect(dts[0].parentElement?.textContent).toContain('[chỉ ghi khi đã đo]')
    expect(container.querySelector('#nguon-1')).not.toBeNull()
    expect(screen.getAllByText('[hướng dẫn từ cơ sở dệt]').length).toBeGreaterThan(0)
    expect(screen.getAllByText('[tên cơ sở, nếu được đồng ý]').length).toBeGreaterThan(0)
  })

  it('Hiện vật khác: 3 thẻ, thẻ thứ 3 max-md:hidden, thẻ eyebrow rỗng không có span rỗng', () => {
    const { container } = render(<ProductView page={page('preview', previewProduct)} />)
    const section = screen.getByRole('heading', { name: 'Hiện vật khác' }).closest('section') as HTMLElement
    const items = within(section).getAllByRole('listitem')
    expect(items).toHaveLength(3)
    expect(items[2].className).toContain('max-md:hidden')
    expect(items[0].className).not.toContain('max-md:hidden')
    expect([...container.querySelectorAll('li a span')].filter((s) => s.textContent === '')).toHaveLength(0)
    expect(within(section).getByRole('link', { name: 'Toàn bộ sưu tập' }).getAttribute('href')).toBe('/san-pham')
  })

  it('typeNote và eyebrow nằm trong khối tiêu đề; breadcrumb có tên ở mục cuối', () => {
    render(<ProductView page={page('preview', previewProduct)} />)
    expect(screen.getByText('Ảnh cần cơ sở dệt xác nhận đúng loại')).toBeTruthy()
    expect(screen.getByText('HIỆN VẬT 01 · Chiếu cói')).toBeTruthy()
    const nav = screen.getByRole('navigation', { name: 'Đường dẫn' })
    expect(nav.textContent).toContain('Chiếu cạp điều')
  })
})
