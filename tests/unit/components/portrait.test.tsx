import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { ContentImage } from '@/components/content/ContentImage'
import { PortraitCard } from '@/components/content/PortraitCard'
import type { ImageView, PersonView } from '@/lib/content'

const base: PersonView = { slug: 'nghe-nhan-1', category: 'Nghệ nhân', role: 'Dệt chiếu tay', name: null, portrait: null, quote: null, consentPending: true, flags: [] }

describe('PortraitCard', () => {
  it('chưa đồng ý: có nhãn Chờ đồng ý, không in null, link vẫn có tên', () => {
    const { container } = render(<PortraitCard person={base} href="/con-nguoi/nghe-nhan-1" />)
    expect(screen.getAllByText('Chờ đồng ý').length).toBeGreaterThan(0)
    expect(container.textContent).not.toContain('null')
    const link = screen.getByRole('link')
    expect(link.getAttribute('href')).toBe('/con-nguoi/nghe-nhan-1')
    expect(link.textContent).toContain('Xem chân dung →')
    expect(link.textContent).toContain('NGHỆ NHÂN')
  })
  it('category null: ẩn dòng nhóm', () => {
    render(<PortraitCard person={{ ...base, category: null }} href="#" />)
    expect(screen.getByRole('link').textContent).not.toContain('NGHỆ NHÂN')
  })
  it('đã đồng ý: hiện tên, không có nhãn', () => {
    render(<PortraitCard person={{ ...base, name: 'Bà A', consentPending: false }} href="#" />)
    expect(screen.getByText('Bà A')).toBeTruthy()
    expect(screen.queryByText('Chờ đồng ý')).toBeNull()
  })
  it('preview: hiện ghi chú từ flags', () => {
    render(<PortraitCard person={{ ...base, flags: ['unverified'] }} href="#" />)
    expect(screen.getByText('[cần xác minh]')).toBeTruthy()
  })
})

const img = (flags: ImageView['flags']): ImageView => ({
  url: '/api/archive-assets/file/a.webp', alt: 'Ảnh thử', width: 800, height: 600,
  sizes: {}, photographer: null, code: null, docNumber: null, flags,
})

describe('ContentImage', () => {
  it('ảnh công khai đi qua bộ tối ưu của Next', () => {
    render(<ContentImage image={img([])} />)
    expect(screen.getByAltText('Ảnh thử').getAttribute('src')).toMatch(/^\/_next\/image/)
  })
  it('ảnh chưa được phép (preview) dùng URL gốc, không qua bộ tối ưu', () => {
    render(<ContentImage image={img(['rights-not-permitted'])} />)
    const src = screen.getByAltText('Ảnh thử').getAttribute('src')
    expect(src).toBe('/api/archive-assets/file/a.webp')
    expect(screen.getByText('Ảnh chưa được phép đăng')).toBeTruthy()
  })
  it('dùng đúng kích thước được chọn', () => {
    render(<ContentImage image={{ ...img([]), sizes: { card: '/api/archive-assets/file/c.webp' } }} size="card" unoptimized />)
    expect(screen.getByAltText('Ảnh thử').getAttribute('src')).toBe('/api/archive-assets/file/c.webp')
  })
})

describe('PortraitCard ghi chú ảnh', () => {
  it('không lặp nhãn đã hiện trên ảnh chân dung', () => {
    const portrait = img(['rights-not-permitted'])
    render(<PortraitCard person={{ ...base, portrait, flags: ['rights-not-permitted', 'unverified'] }} href="#" />)
    expect(screen.getAllByText('Ảnh chưa được phép đăng')).toHaveLength(1)
    expect(screen.getByText('[cần xác minh]')).toBeTruthy()
  })
})
