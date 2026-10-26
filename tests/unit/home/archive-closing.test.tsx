import { fireEvent, render, screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { ArchiveTeaser } from '@/components/home/ArchiveTeaser'
import { Closing } from '@/components/home/Closing'
import type { ArchiveItemView } from '@/lib/content'

const item = (n: number, category: string | null, code: string | null = `TL-${String(n).padStart(3, '0')}`): ArchiveItemView => ({
  image: { url: `/images/reference/a${n}.webp`, alt: `Ảnh ${n}`, width: 800, height: 600, sizes: {}, photographer: null, code, flags: [] },
  title: null, description: null, category, era: null, related: null, flags: [],
})
const items = [item(1, 'village'), item(2, 'weaving'), item(3, 'weaving'), item(4, 'products'), item(5, 'village'), item(6, 'memory')]
const tenItems = Array.from({ length: 10 }, (_, i) => item(i + 1, 'weaving'))

describe('ArchiveTeaser', () => {
  it('chip lọc đủ 7 nhóm nguyên văn, Tất cả đang chọn', () => {
    render(<ArchiveTeaser items={items} />)
    const g = screen.getByRole('group', { name: 'Lọc theo nhóm ảnh' })
    expect(within(g).getAllByRole('button').map((b) => b.textContent)).toEqual(['Tất cả', 'Làng quê', 'Nghề dệt', 'Con người', 'Sản phẩm', 'Ký ức', 'Tư liệu lịch sử'])
    expect(within(g).getByRole('button', { name: 'Tất cả' }).getAttribute('aria-pressed')).toBe('true')
  })
  it('lọc Làng quê chỉ còn ảnh village; ô chờ tư liệu luôn ở cuối', () => {
    render(<ArchiveTeaser items={items} />)
    fireEvent.click(screen.getByRole('button', { name: 'Làng quê' }))
    const tiles = screen.getAllByRole('link', { name: /TL · / })
    expect(tiles).toHaveLength(2)
    expect(tiles.every((t) => t.textContent!.includes('LÀNG QUÊ'))).toBe(true)
    expect(screen.getByText('Ảnh xưa của làng')).toBeTruthy()
  })
  it('ô ảnh trỏ /thu-vien?anh=TL-xxx, tối đa 5 ô', () => {
    render(<ArchiveTeaser items={tenItems} />)
    const tiles = screen.getAllByRole('link', { name: /TL · / })
    expect(tiles.length).toBe(5)
    expect(tiles[0].getAttribute('href')).toBe('/thu-vien?anh=TL-001')
  })
  it('bỏ ảnh không có mã TL hợp lệ', () => {
    render(<ArchiveTeaser items={[item(1, 'village', 'xyz'), item(2, 'village', null), item(3, 'village')]} />)
    expect(screen.getAllByRole('link', { name: /TL · / })).toHaveLength(1)
  })
  it('ghi chú phải chỉ hiện khi chưa có ảnh history', () => {
    const note = /Chưa có ảnh tư liệu lịch sử/
    const { unmount } = render(<ArchiveTeaser items={items} />)
    expect(screen.getByText(note)).toBeTruthy()
    unmount()
    render(<ArchiveTeaser items={[...items, item(7, 'history')]} />)
    expect(screen.queryByText(note)).toBeNull()
  })
  it('link Mở thư viện ảnh và rỗng thì không render', () => {
    const { container, unmount } = render(<ArchiveTeaser items={[]} />)
    expect(container.innerHTML).toBe('')
    unmount()
    render(<ArchiveTeaser items={items} />)
    expect(screen.getByRole('link', { name: 'Mở thư viện ảnh' }).getAttribute('href')).toBe('/thu-vien')
  })
})

describe('ArchiveTeaser ảnh preview', () => {
  it('ảnh có flag: wrapper lấp đầy ô, nhãn TL ở góc trên, ghi chú ở góc dưới', () => {
    const flagged = item(1, 'village')
    flagged.image.flags = ['rights-not-permitted']
    render(<ArchiveTeaser items={[flagged]} />)
    const link = screen.getByRole('link', { name: /TL · / })
    expect(link.className).not.toContain('h-full')
    const wrapper = link.querySelector('img')!.parentElement!
    expect(wrapper.className).toContain('relative')
    expect(wrapper.className).toContain('h-full')
    const label = screen.getByText(/^TL · 001/)
    expect(label.className).not.toContain('h-full')
    expect(label.className).toContain('top-')
    expect(label.className).not.toContain('bottom-')
    expect(screen.getByText('Ảnh chưa được phép đăng').parentElement!.className).toContain('bottom-3')
  })
})

describe('Closing', () => {
  it('tiêu đề hai dòng, nút Góp một ký ức → /ket-noi', () => {
    render(<Closing />)
    expect(screen.getByRole('heading', { level: 2 }).querySelector('em')?.textContent).toBe('Chuyện nghề vẫn được kể tiếp.')
    expect(screen.getByRole('link', { name: 'Góp một ký ức' }).getAttribute('href')).toBe('/ket-noi')
    expect(screen.getByRole('link', { name: 'Kết nối với cơ sở dệt' }).getAttribute('href')).toBe('/ket-noi')
  })
})
