import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { FootnoteRef, SourceList, sourceNumbers } from '@/components/content/Sources'
import type { SourceView } from '@/lib/content'

const S: SourceView[] = [
  { id: 'vnp', publisher: 'Vietnam+', title: 'Giữ hồn nghề dệt chiếu cói làng Hới giữa nhịp sống hiện đại', url: 'https://www.vietnamplus.vn/x', date: '14/08/2026' },
  { id: 'nourl', publisher: null, title: 'Lời kể người làng', url: null, date: null },
]

describe('Sources', () => {
  it('SourceList đánh số và id neo', () => {
    const { container } = render(<SourceList sources={S} />)
    expect(screen.getByRole('heading', { level: 2, name: 'Nguồn tham khảo' })).toBeTruthy()
    expect(container.querySelector('#nguon-1')?.textContent).toBe('[1]Vietnam+ · Giữ hồn nghề dệt chiếu cói làng Hới giữa nhịp sống hiện đại · 14/08/2026')
    expect(container.querySelector('#nguon-2')?.textContent).toBe('[2]Lời kể người làng')
    expect(screen.queryAllByRole('link')).toHaveLength(1)
  })
  it('SourceList nhận title và headingId tuỳ chọn', () => {
    const { container } = render(<SourceList sources={S} title="Nguồn" headingId="x-h" />)
    expect(container.querySelector('section')?.getAttribute('aria-labelledby')).toBe('x-h')
    expect(container.querySelector('#x-h')?.textContent).toBe('Nguồn')
  })
  it('FootnoteRef trỏ tới nguồn', () => {
    render(<FootnoteRef n={2} />)
    const a = screen.getByRole('link', { name: 'Nguồn 2' })
    expect(a.getAttribute('href')).toBe('#nguon-2')
  })
  it('sourceNumbers', () => {
    expect(sourceNumbers(S).get('nourl')).toBe(2)
  })
})

describe('SourceList rỗng', () => {
  it('không render gì khi không có nguồn', () => {
    const { container } = render(<SourceList sources={[]} />)
    expect(container.innerHTML).toBe('')
  })
})
