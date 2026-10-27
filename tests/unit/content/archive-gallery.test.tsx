import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react'
import { ArchiveGallery } from '@/components/content/ArchiveGallery'
import { applyMode } from '@/lib/content/copy/applyMode'
import { archiveCopy } from '@/lib/content/copy/archive'
import type { ArchiveItemView, ArchivePageView } from '@/lib/content'

afterEach(cleanup)

function item(n: number, over: Partial<ArchiveItemView> & { cat: 'village' | 'weaving' }): ArchiveItemView {
  const { cat, ...rest } = over
  const code = `TL-00${n}`
  return {
    image: { url: `/images/reference/x${n}.webp`, alt: `Alt ${code}`, width: 800, height: 600, sizes: {}, photographer: null, code, docNumber: `00${n}`, flags: [] },
    title: `Tiêu đề ${code}`,
    description: `Mô tả ${code}`,
    category: cat,
    categoryLabel: cat === 'village' ? 'Làng quê' : 'Nghề dệt',
    era: 'now',
    eraLabel: 'Nay',
    related: { label: 'Trang Làng Hới', href: '/lang-hoi' },
    flags: [],
    code,
    takenAt: '1990',
    photographer: 'Nguyễn A',
    source: 'Gia đình B',
    rights: { desktop: 'Được phép', mobile: 'Được phép' },
    sourceVerified: false,
    ...rest,
  } as ArchiveItemView
}

const copy = applyMode(archiveCopy, 'public')

function page(items: ArchiveItemView[]): ArchivePageView {
  return {
    intro: {} as ArchivePageView['intro'],
    items,
    stats: { total: items.length, verified: 0 },
    categories: [
      { key: 'all', label: 'Tất cả' },
      { key: 'village', label: 'Làng quê' },
      { key: 'weaving', label: 'Nghề dệt' },
    ],
    eras: [
      { key: 'all', label: 'Mọi thời kỳ' },
      { key: 'old', label: 'Xưa' },
      { key: 'now', label: 'Nay' },
    ],
    hasOld: false,
    copy,
  } as ArchivePageView
}

const three = () => [item(1, { cat: 'village' }), item(2, { cat: 'weaving' }), item(3, { cat: 'weaving' })]
const tiles = () => screen.getAllByRole('link', { name: /^Mở ảnh:/ })

let replaceState: ReturnType<typeof vi.spyOn>
beforeEach(() => {
  vi.spyOn(HTMLElement.prototype, 'getClientRects').mockImplementation(() => [{}] as unknown as DOMRectList)
  replaceState = vi.spyOn(window.history, 'replaceState')
  window.history.replaceState(null, '', '/thu-vien?x=1')
  replaceState.mockClear()
})
afterEach(() => vi.restoreAllMocks())

describe('ArchiveGallery', () => {
  it('ô ảnh là liên kết thật tới ?anh=, ảnh có alt rỗng', () => {
    render(<ArchiveGallery page={page(three())} initialCode={null} />)
    expect(tiles()).toHaveLength(3)
    const first = screen.getByRole('link', { name: /^Mở ảnh: Tiêu đề TL-001, TL · 001 · Làng quê$/ })
    expect(first.getAttribute('href')).toBe('/thu-vien?anh=TL-001')
    expect(first.querySelector('img')?.getAttribute('alt')).toBe('')
    expect(screen.getByRole('status').textContent).toBe('3 tư liệu')
    expect(screen.queryByRole('dialog')).toBeNull()
  })
  it('lọc "Nghề dệt" còn 2 ô, status "2 tư liệu"', () => {
    render(<ArchiveGallery page={page(three())} initialCode={null} />)
    fireEvent.click(screen.getByRole('button', { name: 'Nghề dệt' }))
    expect(tiles()).toHaveLength(2)
    expect(screen.getByRole('status').textContent).toBe('2 tư liệu')
  })
  it('chọn "Xưa" thì "0 tư liệu · chưa có ảnh xưa" và hiện khung trống', () => {
    render(<ArchiveGallery page={page(three())} initialCode={null} />)
    fireEvent.click(screen.getByRole('button', { name: 'Xưa' }))
    expect(screen.getByRole('status').textContent).toBe('0 tư liệu · chưa có ảnh xưa')
    expect(screen.queryAllByRole('link', { name: /^Mở ảnh:/ })).toHaveLength(0)
    expect(screen.getByText('Chưa có tư liệu trong nhóm này')).toBeTruthy()
  })
  it('initialCode không phân biệt hoa thường mở sẵn dialog ở render đầu', () => {
    render(<ArchiveGallery page={page(three())} initialCode="tl-002" />)
    const dialog = screen.getByRole('dialog')
    expect(within(dialog).getByRole('heading', { level: 2, name: 'Tiêu đề TL-002' })).toBeTruthy()
    expect(within(dialog).getByText('2 / 3', { exact: false })).toBeTruthy()
  })
  it('initialCode lọc về "Tất cả" dù mã thuộc nhóm khác', () => {
    render(<ArchiveGallery page={page(three())} initialCode="TL-002" />)
    expect(screen.getByRole('button', { name: 'Tất cả' }).getAttribute('aria-pressed')).toBe('true')
    expect(tiles()).toHaveLength(3)
  })
  it('initialCode lạ thì không có dialog', () => {
    render(<ArchiveGallery page={page(three())} initialCode="TL-999" />)
    expect(screen.queryByRole('dialog')).toBeNull()
  })
  it('bấm ô mở dialog, cập nhật URL, Ảnh tiếp sang ảnh sau, đóng thì bỏ ?anh= và trả focus về ô đã mở', () => {
    render(<ArchiveGallery page={page(three())} initialCode={null} />)
    const tile = screen.getByRole('link', { name: /^Mở ảnh: Tiêu đề TL-001, TL · 001 · Làng quê$/ })
    expect(fireEvent.click(tile)).toBe(false)
    const dialog = screen.getByRole('dialog')
    expect(within(dialog).getByRole('heading', { level: 2 }).textContent).toBe('Tiêu đề TL-001')
    expect(String(replaceState.mock.calls.at(-1)?.[2])).toBe('/thu-vien?x=1&anh=TL-001')

    fireEvent.click(within(dialog).getByRole('link', { name: 'Ảnh tiếp' }))
    expect(within(dialog).getByRole('heading', { level: 2 }).textContent).toBe('Tiêu đề TL-002')
    expect(String(replaceState.mock.calls.at(-1)?.[2])).toContain('anh=TL-002')

    fireEvent.click(within(dialog).getByRole('link', { name: 'Đóng' }))
    expect(screen.queryByRole('dialog')).toBeNull()
    const last = String(replaceState.mock.calls.at(-1)?.[2])
    expect(last).toBe('/thu-vien?x=1')
    expect(last).not.toContain('anh=')
    expect(document.activeElement).toBe(tile)
  })
  it('Ảnh trước / Ảnh tiếp vòng trong danh sách; href tính từ danh sách đang lọc', () => {
    render(<ArchiveGallery page={page(three())} initialCode="TL-001" />)
    const dialog = screen.getByRole('dialog')
    expect(within(dialog).getByRole('link', { name: 'Ảnh trước' }).getAttribute('href')).toBe('/thu-vien?anh=TL-003')
    expect(within(dialog).getByRole('link', { name: 'Ảnh tiếp' }).getAttribute('href')).toBe('/thu-vien?anh=TL-002')
    expect(within(dialog).getByRole('link', { name: 'Đóng' }).getAttribute('href')).toBe('/thu-vien')
    fireEvent.click(within(dialog).getByRole('link', { name: 'Ảnh trước' }))
    expect(within(screen.getByRole('dialog')).getByRole('heading', { level: 2 }).textContent).toBe('Tiêu đề TL-003')
  })
  it('phím mũi tên chuyển ảnh, Esc đóng', () => {
    render(<ArchiveGallery page={page(three())} initialCode="TL-001" />)
    fireEvent.keyDown(document.activeElement as Element, { key: 'ArrowRight' })
    expect(screen.getByRole('heading', { level: 2 }).textContent).toBe('Tiêu đề TL-002')
    fireEvent.keyDown(document.activeElement as Element, { key: 'Escape' })
    expect(screen.queryByRole('dialog')).toBeNull()
  })
  it('còn một ảnh: Ảnh tiếp giữ nguyên ảnh đó', () => {
    const items = [item(1, { cat: 'village' })]
    render(<ArchiveGallery page={page(items)} initialCode="TL-001" />)
    fireEvent.click(screen.getByRole('link', { name: 'Ảnh tiếp' }))
    expect(screen.getByRole('heading', { level: 2 }).textContent).toBe('Tiêu đề TL-001')
  })
  it('đổi bộ lọc thì đóng dialog và bỏ ?anh=', () => {
    render(<ArchiveGallery page={page(three())} initialCode="TL-001" />)
    fireEvent.click(screen.getByRole('button', { name: 'Nghề dệt' }))
    expect(screen.queryByRole('dialog')).toBeNull()
    expect(String(replaceState.mock.calls.at(-1)?.[2])).not.toContain('anh=')
  })
  it('chỉ hiện dòng metadata có giá trị: photographer null thì không có "Người chụp"', () => {
    const items = [item(1, { cat: 'village', photographer: null })]
    render(<ArchiveGallery page={page(items)} initialCode="TL-001" />)
    const dialog = screen.getByRole('dialog')
    expect(within(dialog).queryByText('Người chụp')).toBeNull()
    expect(within(dialog).getByText('Thời gian')).toBeTruthy()
    expect(within(dialog).getByRole('link', { name: 'Trang Làng Hới' }).getAttribute('href')).toBe('/lang-hoi')
  })
  it('eyebrow dùng mã và chủ đề (in hoa bằng CSS)', () => {
    render(<ArchiveGallery page={page(three())} initialCode="TL-002" />)
    const dialog = screen.getByRole('dialog')
    const eyebrow = within(dialog).getByText('TL · 002 · Nghề dệt')
    expect(eyebrow.className).toContain('uppercase')
  })
})
