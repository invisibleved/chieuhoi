import { fireEvent, render, screen } from '@testing-library/react'
import { beforeAll, describe, expect, it, vi } from 'vitest'
import { CraftTeaser } from '@/components/home/CraftTeaser'
import type { CraftStepView, ImageView } from '@/lib/content'
import { homeCopy } from '@/lib/content/copy/home'

const img = (n: number, over: Partial<ImageView> = {}): ImageView => ({
  url: `/images/reference/nkc${n}.webp`,
  alt: `Ảnh ${n}`,
  width: 800,
  height: 600,
  sizes: {},
  photographer: null,
  code: `TL-0${n}4`,
  docNumber: `0${n}4`,
  flags: [],
  ...over,
})
const steps: CraftStepView[] = [1, 2, 3].map((n) => ({
  n,
  title: `Bước ${n}`,
  shortTitle: null,
  subtitle: null,
  body: n === 1 ? 'Mô tả bước một' : null,
  tools: null,
  toRecord: null,
  image: n === 3 ? null : img(n, n === 2 ? { photographer: 'Nguyễn A', code: '[cần xác minh]', docNumber: null } : {}),
  shotNeeded: n === 3 ? 'Phơi cói ngoài sân' : null,
  focus: [50, 50] as [number, number],
  flags: [],
}))

beforeAll(() => {
  Element.prototype.scrollIntoView = vi.fn()
  Element.prototype.scrollTo = vi.fn() as unknown as typeof Element.prototype.scrollTo
})

describe('CraftTeaser', () => {
  it('mặc định chọn công đoạn đầu; progress và bộ đếm', () => {
    render(<CraftTeaser steps={steps} mode="public" copy={homeCopy} />)
    expect(screen.getAllByRole('button', { current: 'step' })[0].textContent).toContain('Bước 1')
    const pb = screen.getAllByRole('progressbar', { name: 'Tiến trình công đoạn' })[0]
    expect(pb.getAttribute('aria-valuenow')).toBe('1')
    expect(pb.getAttribute('aria-valuemax')).toBe('3')
    expect(screen.getAllByText('01').length).toBeGreaterThan(0)
  })
  it('chọn công đoạn không có ảnh: hiện ẢNH CẦN CHỤP + shotNeeded', () => {
    render(<CraftTeaser steps={steps} mode="public" copy={homeCopy} />)
    fireEvent.click(screen.getAllByRole('button', { name: /Bước 3/ })[0])
    expect(screen.getAllByText('ẢNH CẦN CHỤP').length).toBeGreaterThan(0)
    expect(screen.getAllByText('Phơi cói ngoài sân').length).toBeGreaterThan(0)
    expect(screen.getAllByRole('progressbar')[0].getAttribute('aria-valuenow')).toBe('3')
  })
  it('nhãn sân khấu: TƯ LIỆU chỉ khi mã TL-n; thêm tên ảnh khi có photographer', () => {
    const { container } = render(<CraftTeaser steps={steps} mode="public" copy={homeCopy} />)
    expect(container.textContent).toContain('TƯ LIỆU · 014')
    fireEvent.click(screen.getAllByRole('button', { name: /Bước 2/ })[0])
    expect(container.textContent).not.toContain('TƯ LIỆU')
    expect(container.textContent).toContain('Bước 2 · Ảnh: Nguyễn A')
  })
  it('Trước/Tiếp mobile: tăng tiến trình, aria-disabled ở hai đầu', () => {
    render(<CraftTeaser steps={steps} mode="public" copy={homeCopy} />)
    const prev = screen.getByRole('button', { name: 'Công đoạn trước' })
    const next = screen.getByRole('button', { name: 'Công đoạn tiếp' })
    expect(prev.getAttribute('aria-disabled')).toBe('true')
    fireEvent.click(next)
    expect(screen.getAllByRole('progressbar')[0].getAttribute('aria-valuenow')).toBe('2')
    fireEvent.click(next)
    expect(next.getAttribute('aria-disabled')).toBe('true')
    expect(prev.getAttribute('aria-disabled')).toBeNull()
    fireEvent.click(prev)
    expect(screen.getAllByRole('progressbar')[0].getAttribute('aria-valuenow')).toBe('2')
  })
  it('Trước/Tiếp mobile chỉ cuộn dải công đoạn, không scrollIntoView (trang không nhảy)', () => {
    render(<CraftTeaser steps={steps} mode="public" copy={homeCopy} />)
    const group = screen.getByRole('group', { name: 'Chọn công đoạn' })
    vi.mocked(Element.prototype.scrollTo).mockClear()
    fireEvent.click(screen.getByRole('button', { name: 'Công đoạn tiếp' }))
    expect(vi.mocked(Element.prototype.scrollTo).mock.contexts).toEqual([group])
    expect(Element.prototype.scrollIntoView).not.toHaveBeenCalled()
  })
  it('sân khấu dùng CraftStage: không có nút phóng, tiền tố ảnh lấy từ copy', () => {
    render(<CraftTeaser steps={steps} mode="public" copy={{ ...homeCopy, photoPrefix: 'Photo: ' }} />)
    fireEvent.click(screen.getAllByRole('button', { name: /Bước 2/ })[0])
    expect(screen.getByTestId('stage-zoom').style.transform).toContain('scale(1)')
    expect(screen.queryByRole('button', { name: /cận cảnh/ })).toBeNull()
    expect(screen.getByText(/Bước 2 · Photo: Nguyễn A/)).toBeTruthy()
  })
  it('link desktop và mobile', () => {
    render(<CraftTeaser steps={steps} mode="public" copy={homeCopy} />)
    expect(screen.getByRole('link', { name: /Đi theo hành trình một tấm chiếu/ }).getAttribute('href')).toBe('/nghe-det-chieu')
    expect(screen.getByRole('link', { name: /Xem cả hành trình/ }).getAttribute('href')).toBe('/nghe-det-chieu')
  })
  it('ghi chú xác minh chỉ ở preview', () => {
    const note = 'Trình tự và tên gọi các công đoạn sẽ được xác minh với nghệ nhân trước khi đăng.'
    const { container, rerender } = render(<CraftTeaser steps={steps} mode="public" copy={homeCopy} />)
    expect(container.textContent).not.toContain(note)
    rerender(<CraftTeaser steps={steps} mode="preview" copy={homeCopy} />)
    expect(container.textContent).toContain(note)
  })
  it('thumbnail dùng số cột inline', () => {
    const { container } = render(<CraftTeaser steps={steps} mode="public" copy={homeCopy} />)
    expect(container.querySelector<HTMLElement>('[data-thumbs]')!.style.gridTemplateColumns).toBe('repeat(3, minmax(0, 1fr))')
  })
  it('rỗng thì không render', () => {
    const { container } = render(<CraftTeaser steps={[]} mode="public" copy={homeCopy} />)
    expect(container.innerHTML).toBe('')
  })
  it('ảnh thu nhỏ có transition opacity thì tắt khi giảm chuyển động', () => {
    const { container } = render(<CraftTeaser steps={steps} mode="public" copy={homeCopy} />)
    const withTransition = [...container.querySelectorAll('img')].filter((i) => i.className.includes('transition-opacity'))
    expect(withTransition.length).toBeGreaterThan(0)
    for (const i of withTransition) expect(i.className).toContain('motion-reduce:transition-none')
  })
})
