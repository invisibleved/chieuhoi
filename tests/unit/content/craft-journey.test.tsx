import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react'
import type { CraftPageView, CraftStepView } from '@/lib/content'
import { craftCopy } from '@/lib/content/copy/craft'
import { CraftJourney } from '@/components/content/CraftJourney'

const journeyPreview: CraftPageView['copy']['journey'] = craftCopy.journey
const journeyPublic: CraftPageView['copy']['journey'] = { ...journeyPreview, preview: null }

function step(n: number, over: Partial<CraftStepView> = {}): CraftStepView {
  return {
    n,
    title: `Công đoạn ${n}`,
    shortTitle: `Ngắn ${n}`,
    subtitle: null,
    body: `Mô tả ${n}`,
    tools: `Dụng cụ ${n}`,
    toRecord: `Ghi lại ${n}`,
    image: {
      url: `/x${n}.webp`, alt: `Ảnh ${n}`, width: 800, height: 600, sizes: {}, photographer: n === 1 ? 'Tác giả' : null,
      code: `TL-0${n}`, docNumber: `0${n}`, flags: [],
    },
    shotNeeded: null,
    focus: [35, 60],
    flags: [],
    ...over,
  }
}

const steps = Array.from({ length: 7 }, (_, i) => {
  const n = i + 1
  if (n === 3) return step(n, { image: null, shotNeeded: 'Bó cói phơi nắng' })
  return step(n)
})

const rail = () => within(screen.getByRole('list', { name: 'Các công đoạn' }))
const strip = () => within(screen.getByRole('group', { name: 'Chọn công đoạn' }))

describe('CraftJourney', () => {
  beforeEach(() => {
    Element.prototype.scrollIntoView = vi.fn()
  })
  afterEach(cleanup)

  it('mặc định ở công đoạn 01, nút Tiếp dừng ở cuối và giữ focus', () => {
    render(<CraftJourney steps={steps} copy={journeyPreview} />)
    expect(rail().getByRole('button', { name: /^01/ }).getAttribute('aria-current')).toBe('step')
    expect(screen.getByRole('progressbar').getAttribute('aria-valuenow')).toBe('1')
    const next = screen.getByRole('button', { name: 'Công đoạn tiếp' })
    next.focus()
    for (let i = 0; i < 10; i++) fireEvent.click(next)
    expect(screen.getByRole('progressbar').getAttribute('aria-valuenow')).toBe('7')
    expect(next.getAttribute('aria-disabled')).toBe('true')
    expect(document.activeElement).toBe(next)
  })

  it('công đoạn không ảnh: khung "Ảnh cần chụp", nút phóng aria-disabled', () => {
    render(<CraftJourney steps={steps} copy={journeyPreview} />)
    fireEvent.click(rail().getByRole('button', { name: /^03/ }))
    expect(screen.getByRole('img', { name: 'Ảnh cần chụp: Bó cói phơi nắng' })).toBeTruthy()
    const zooms = screen.getAllByRole('button', { name: 'Xem cận cảnh' })
    expect(zooms.length).toBeGreaterThan(0)
    for (const z of zooms) {
      expect(z.getAttribute('aria-disabled')).toBe('true')
      fireEvent.click(z)
      expect(z.getAttribute('aria-pressed')).toBe('false')
    }
  })

  it('phóng ảnh: scale(1.9) quanh điểm nhấn, đổi công đoạn thì thu lại', () => {
    render(<CraftJourney steps={steps} copy={journeyPreview} />)
    fireEvent.click(rail().getByRole('button', { name: /^05/ }))
    const zoom = screen.getAllByRole('button', { name: 'Xem cận cảnh' })[0]
    fireEvent.click(zoom)
    const stage = screen.getByTestId('stage-zoom')
    expect(stage.style.transform).toContain('scale(1.9)')
    expect(stage.style.transformOrigin).toBe('35% 60%')
    expect(screen.getAllByRole('button', { name: /Thu nhỏ/ })[0].getAttribute('aria-pressed')).toBe('true')
    fireEvent.click(screen.getByRole('button', { name: 'Công đoạn tiếp' }))
    expect(screen.getByTestId('stage-zoom').style.transform).toContain('scale(1)')
    for (const z of screen.getAllByRole('button', { name: 'Xem cận cảnh' })) expect(z.getAttribute('aria-pressed')).toBe('false')
  })

  it('chọn qua dải mobile cuộn nút vào giữa', () => {
    render(<CraftJourney steps={steps} copy={journeyPreview} />)
    fireEvent.click(strip().getByRole('button', { name: '04 Ngắn 4' }))
    expect(Element.prototype.scrollIntoView).toHaveBeenCalledWith(expect.objectContaining({ inline: 'center' }))
  })

  it('khối "CẦN GHI LẠI" chỉ khi có toRecord và copy.preview', () => {
    const { rerender } = render(<CraftJourney steps={steps} copy={journeyPreview} />)
    expect(screen.getByText('CẦN GHI LẠI')).toBeTruthy()
    rerender(<CraftJourney steps={steps.map((s) => ({ ...s, toRecord: null }))} copy={journeyPreview} />)
    expect(screen.queryByText('CẦN GHI LẠI')).toBeNull()
    rerender(<CraftJourney steps={steps} copy={journeyPublic} />)
    expect(screen.queryByText('CẦN GHI LẠI')).toBeNull()
  })

  it('nhãn tư liệu lấy từ CMS; rỗng thì không render', () => {
    const { container } = render(<CraftJourney steps={steps} copy={journeyPreview} />)
    expect(screen.getByText('TƯ LIỆU · 01')).toBeTruthy()
    expect(screen.getAllByText(/Công đoạn 1 · Ảnh: Tác giả/).length).toBeGreaterThan(0)
    cleanup()
    const empty = render(<CraftJourney steps={[]} copy={journeyPreview} />)
    expect(empty.container.innerHTML).toBe('')
    void container
  })
})
