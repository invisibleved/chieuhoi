import { afterEach, describe, expect, it } from 'vitest'
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react'
import type { Confidence, TimelineEventView } from '@/lib/content'
import { villageCopy } from '@/lib/content/copy/village'
import { ConfidenceLegend } from '@/components/content/Confidence'
import { Timeline } from '@/components/content/Timeline'

const copy = villageCopy.timeline
const kinds: Confidence[] = ['press', 'press', 'oral', 'press', 'pending', 'press', 'press', 'pending']

function ev(k: number, over: Partial<TimelineEventView> = {}): TimelineEventView {
  return {
    label: `Năm ${k + 1}`,
    title: `Mốc ${k + 1}`,
    body: `Nội dung ${k + 1}`,
    confidence: kinds[k],
    sourceIds: [],
    sourceLine: `Nguồn số ${k + 1}`,
    sourceHref: null,
    flags: [],
    ...over,
  }
}
const events = (over: Record<number, Partial<TimelineEventView>> = {}) => kinds.map((_, k) => ev(k, over[k]))

afterEach(cleanup)

const desktop = (c: HTMLElement) => c.querySelector<HTMLElement>('[data-layout="desktop"]')!
const mobile = (c: HTMLElement) => c.querySelector<HTMLElement>('[data-layout="mobile"]')!

describe('Timeline desktop', () => {
  it('mốc đầu aria-current; Mốc sau tới cuối thì aria-disabled và vẫn focus', () => {
    const { container } = render(<Timeline events={events()} copy={copy} />)
    const d = within(desktop(container))
    const nodes = d.getAllByRole('button', { name: /Mốc \d/ }).filter((b) => b.hasAttribute('aria-current') || b.closest('ol'))
    expect(nodes[0].getAttribute('aria-current')).toBe('true')
    const next = d.getByRole('button', { name: 'Mốc sau' })
    for (let i = 0; i < 9; i++) fireEvent.click(next)
    expect(nodes[7].getAttribute('aria-current')).toBe('true')
    next.focus()
    expect(next.getAttribute('aria-disabled')).toBe('true')
    expect(document.activeElement).toBe(next)
  })

  it('mark oral xoay 45°, pending nét đứt', () => {
    const { container } = render(<Timeline events={events()} copy={copy} />)
    const marks = desktop(container).querySelectorAll('ol [data-confidence]')
    expect(marks[2].className).toContain('rotate-45')
    expect(marks[4].className).toContain('border-dashed')
    expect(marks[0].className).not.toContain('border-dashed')
  })

  it('sourceLine null thì không có dòng NGUỒN', () => {
    const { container } = render(<Timeline events={events({ 0: { sourceLine: null } })} copy={copy} />)
    expect(desktop(container).textContent).not.toContain('NGUỒN ·')
    fireEvent.click(within(desktop(container)).getByRole('button', { name: 'Mốc sau' }))
    expect(desktop(container).textContent).toContain('NGUỒN ·')
  })

  it('sourceHref biến dòng nguồn thành liên kết', () => {
    const { container } = render(<Timeline events={events({ 0: { sourceHref: '/ket-noi' } })} copy={copy} />)
    expect(within(desktop(container)).getByRole('link', { name: 'Nguồn số 1' }).getAttribute('href')).toBe('/ket-noi')
  })
})

describe('Timeline mobile', () => {
  it('accordion: mở một mốc một lúc, bấm lại thì đóng hết', () => {
    const { container } = render(<Timeline events={events()} copy={copy} />)
    const rows = within(mobile(container)).getAllByRole('button')
    expect(rows).toHaveLength(8)
    expect(rows[0].getAttribute('aria-expanded')).toBe('true')
    fireEvent.click(rows[2])
    expect(rows[2].getAttribute('aria-expanded')).toBe('true')
    expect(rows[0].getAttribute('aria-expanded')).toBe('false')
    fireEvent.click(rows[2])
    rows.forEach((r) => expect(r.getAttribute('aria-expanded')).toBe('false'))
  })

  it('panel mở có "Nguồn: …", sourceLine null thì không có', () => {
    const { container } = render(<Timeline events={events({ 0: { sourceLine: null } })} copy={copy} />)
    const m = mobile(container)
    expect(m.textContent).not.toContain('Nguồn: Nguồn số 1')
    const rows = within(m).getAllByRole('button')
    const panel = document.getElementById(rows[0].getAttribute('aria-controls')!)!
    expect(panel.textContent).not.toContain('Nguồn:')
    fireEvent.click(rows[1])
    const p2 = document.getElementById(rows[1].getAttribute('aria-controls')!)!
    expect(p2.hasAttribute('hidden')).toBe(false)
    expect(p2.textContent).toContain('Nguồn: Nguồn số 2')
  })
})

describe('ConfidenceLegend', () => {
  it('3 mục đúng nhãn', () => {
    render(<ConfidenceLegend label={copy.legendLabel.desktop} labels={copy.confidence} />)
    const list = screen.getByRole('list', { name: 'Chú giải độ tin cậy' })
    const items = within(list).getAllByRole('listitem')
    expect(items.map((i) => i.textContent)).toEqual(['Có nguồn báo chí', 'Truyền khẩu', 'Chờ xác minh'])
  })
})
