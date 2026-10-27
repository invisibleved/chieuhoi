import { afterEach, describe, expect, it } from 'vitest'
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react'
import { renderToString } from 'react-dom/server'
import { PatternExplorer } from '@/components/content/PatternExplorer'
import { productsCopy } from '@/lib/content/copy/products'
import { applyMode } from '@/lib/content/copy/applyMode'
import type { ImageView, ProductPageView, ProductView } from '@/lib/content'

afterEach(cleanup)

const copy = applyMode(productsCopy, 'public') as ProductPageView['copy']
const img = (i: number): ImageView => ({
  url: `/images/reference/p${i}.webp`, alt: `Ảnh ${i}`, width: 1200, height: 800, sizes: {}, photographer: null, code: null, docNumber: null, flags: [],
})
const product: ProductView = {
  slug: 'chieu-cap-dieu', code: 'HIỆN VẬT 01', name: 'Chiếu cạp điều', group: 'traditional', groupLabel: null, summary: null, image: img(1),
  typeConfirmed: false, tag: null, flags: [], images: [1, 2, 3, 4].map(img), primaryImage: img(1), hasPattern: true,
  material: null, technique: null, size: null, care: null, maker: null, context: null, pattern: null, typeNote: null,
  imageCaptions: ['Ảnh 1/4', 'Ảnh 2/4', 'Ảnh 3/4', 'Ảnh 4/4'],
  sources: [],
  annotations: [
    { n: 1, title: 'Viền chiếu', shortTitle: 'Viền', x: 30, y: 72, body: 'Phần viền đỏ.', sourceId: null, sourceN: null, sourceLine: 'Quan sát từ ảnh' },
    { n: 2, title: 'Hoa văn in', shortTitle: 'Hoa văn', x: 52, y: 60, body: 'Hoạ tiết chưa xác định.', sourceId: 'vietnamplus-2026', sourceN: 1, sourceLine: 'Vietnam+ (14/08/2026)' },
    { n: 3, title: 'Mặt cói dệt', shortTitle: null, x: 70, y: 82, body: 'Kiểu dệt.', sourceId: null, sourceN: null, sourceLine: null },
  ],
}
const detail = copy.detail
const marker = (n: number, title: string) => screen.getByRole('button', { name: `Chi tiết ${n}: ${title}` })
const stageImg = () => screen.getByAltText('Ảnh 1') as HTMLImageElement
const thumb = (n: number) => screen.getByRole('button', { name: `Xem ảnh ${n}` })

describe('PatternExplorer', () => {
  it('3 điểm có aria-label đầy đủ, chưa chọn thì hiện câu idle', () => {
    render(<PatternExplorer product={product} copy={detail} />)
    expect(marker(1, 'Viền chiếu').getAttribute('aria-pressed')).toBe('false')
    expect(marker(2, 'Hoa văn in')).toBeTruthy()
    expect(marker(3, 'Mặt cói dệt')).toBeTruthy()
    expect(stageImg().style.transform).toBe('scale(1)')
    expect(screen.getAllByText(/Chọn một điểm trên ảnh/).length).toBeGreaterThan(0)
  })

  it('bấm điểm 2: phóng 2.2 quanh toạ độ, ẩn điểm khác, region có chú thích và link nguồn', () => {
    render(<PatternExplorer product={product} copy={detail} />)
    fireEvent.click(marker(2, 'Hoa văn in'))
    expect(marker(2, 'Hoa văn in').getAttribute('aria-pressed')).toBe('true')
    expect(stageImg().style.transform).toContain('scale(2.2)')
    expect(stageImg().style.transformOrigin).toBe('52% 60%')
    expect(marker(1, 'Viền chiếu').tabIndex).toBe(-1)
    expect(marker(3, 'Mặt cói dệt').tabIndex).toBe(-1)
    const region = screen.getByRole('region', { name: detail.explore.regionLabel! })
    expect(region.getAttribute('aria-live')).toBe('polite')
    expect(within(region).getByText('Hoạ tiết chưa xác định.')).toBeTruthy()
    expect(within(region).getByRole('link', { name: 'Nguồn 1' }).getAttribute('href')).toBe('#nguon-1')
    expect(screen.getByRole('button', { name: detail.explore.close! })).toBeTruthy()
  })

  it('bấm lại điểm, nút Đóng hoặc Esc thì thu nhỏ', () => {
    render(<PatternExplorer product={product} copy={detail} />)
    fireEvent.click(marker(2, 'Hoa văn in'))
    fireEvent.click(marker(2, 'Hoa văn in'))
    expect(stageImg().style.transform).toBe('scale(1)')
    fireEvent.click(marker(2, 'Hoa văn in'))
    fireEvent.click(screen.getByRole('button', { name: detail.explore.close! }))
    expect(stageImg().style.transform).toBe('scale(1)')
    fireEvent.click(marker(2, 'Hoa văn in'))
    fireEvent.keyDown(document, { key: 'Escape' })
    expect(stageImg().style.transform).toBe('scale(1)')
    expect(screen.queryByRole('button', { name: detail.explore.close! })).toBeNull()
  })

  it('chọn từ danh sách (desktop) và nhóm nút (mobile) đều chọn điểm', () => {
    render(<PatternExplorer product={product} copy={detail} />)
    fireEvent.click(screen.getByRole('button', { name: /^3\s*Mặt cói dệt$/ }))
    expect(marker(3, 'Mặt cói dệt').getAttribute('aria-pressed')).toBe('true')
    fireEvent.click(screen.getByRole('button', { name: '1 · Viền' }))
    expect(marker(1, 'Viền chiếu').getAttribute('aria-pressed')).toBe('true')
    // shortTitle null thì dùng title
    expect(screen.getByRole('button', { name: '3 · Mặt cói dệt' })).toBeTruthy()
  })

  it('bấm ảnh nhỏ 3: điểm biến mất, hint đổi; chọn điểm từ danh sách thì về ảnh 1', () => {
    render(<PatternExplorer product={product} copy={detail} />)
    fireEvent.click(marker(2, 'Hoa văn in'))
    fireEvent.click(thumb(3))
    expect(screen.queryByRole('button', { name: /^Chi tiết 1/ })).toBeNull()
    expect(screen.getByText('Chọn ảnh 1 để khám phá đường dệt')).toBeTruthy()
    expect(thumb(3).getAttribute('aria-pressed')).toBe('true')
    expect(screen.getByText('Ảnh 3/4')).toBeTruthy()
    fireEvent.click(screen.getByRole('button', { name: /^1\s*Viền chiếu$/ }))
    expect(thumb(1).getAttribute('aria-pressed')).toBe('true')
    expect(marker(1, 'Viền chiếu').getAttribute('aria-pressed')).toBe('true')
    expect(screen.getByText(detail.explore.hint!)).toBeTruthy()
  })

  it('hasPattern false: không điểm, không danh sách; vẫn hiện ảnh', () => {
    render(<PatternExplorer product={{ ...product, hasPattern: false }} copy={detail} />)
    expect(screen.queryByRole('button', { name: /^Chi tiết/ })).toBeNull()
    expect(screen.queryByText(detail.explore.title!)).toBeNull()
    expect(stageImg()).toBeTruthy()
  })

  it('không có ảnh: hiện khung ảnh cần chụp', () => {
    render(<PatternExplorer product={{ ...product, images: [], primaryImage: null, hasPattern: false, imageCaptions: [] }} copy={detail} />)
    expect(screen.getAllByRole('img', { name: /Ảnh cần chụp/ }).length).toBeGreaterThan(0)
  })

  it('aside hiện trong cột phải', () => {
    render(<PatternExplorer product={product} copy={detail} aside={<h1>Tiêu đề</h1>} />)
    expect(screen.getByRole('heading', { name: 'Tiêu đề' })).toBeTruthy()
  })

  it('server render có noscript chứa đủ 3 tiêu đề', () => {
    const html = renderToString(<PatternExplorer product={product} copy={detail} />)
    const m = /<noscript>(.*?)<\/noscript>/s.exec(html)
    expect(m).not.toBeNull()
    for (const t of ['Viền chiếu', 'Hoa văn in', 'Mặt cói dệt']) expect(m![1]).toContain(t)
  })
})

describe('PatternMarker, StageHint, AnnotationNote', () => {
  it('PatternMarker: đặt theo %, hidden thì tabIndex -1 và không nhận chuột', async () => {
    const { PatternMarker } = await import('@/components/ui/PatternMarker')
    render(<PatternMarker n={4} x={10} y={20} pressed={false} hidden label="Chi tiết 4" onClick={() => {}} />)
    const b = screen.getByRole('button', { name: 'Chi tiết 4' })
    expect(b.style.left).toBe('10%')
    expect(b.style.top).toBe('20%')
    expect(b.tabIndex).toBe(-1)
    expect(b.className).toContain('pointer-events-none')
    expect(b.className).toContain('opacity-0')
  })
  it('StageHint: chữ kèm ô check ẩn với trợ năng', async () => {
    const { StageHint } = await import('@/components/content/StageHint')
    const { container } = render(<StageHint>Gợi ý</StageHint>)
    expect(screen.getByText('Gợi ý')).toBeTruthy()
    expect(container.querySelector('.check[aria-hidden="true"]')).not.toBeNull()
  })
  it('AnnotationNote: panel có dòng nguồn, teaser thì không và link về trang hiện vật', async () => {
    const { AnnotationNote } = await import('@/components/content/AnnotationNote')
    const a = product.annotations[1]
    const { unmount } = render(<AnnotationNote annotation={a} productSlug="x" variant="panel" />)
    expect(screen.getByText('Vietnam+ (14/08/2026)')).toBeTruthy()
    expect(screen.getByRole('link', { name: 'Nguồn 1' }).getAttribute('href')).toBe('#nguon-1')
    unmount()
    render(<AnnotationNote annotation={a} productSlug="x" variant="teaser" />)
    expect(screen.queryByText('Vietnam+ (14/08/2026)')).toBeNull()
    expect(screen.getByRole('link', { name: 'Nguồn 1' }).getAttribute('href')).toBe('/san-pham/x#nguon-1')
  })
})
