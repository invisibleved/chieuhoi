import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { FootnoteRef, SourceList, sourceNumbers } from '@/components/content/Sources'
import type { SourceView } from '@/lib/content'

const S: SourceView[] = [
  { id: 'vnp', publisher: 'Vietnam+', author: null, title: 'Giữ hồn nghề dệt chiếu cói làng Hới giữa nhịp sống hiện đại', url: 'https://www.vietnamplus.vn/x', date: '14/08/2026' },
  { id: 'nourl', publisher: null, author: null, title: 'Lời kể người làng', url: null, date: null },
]

describe('Sources', () => {
  it('SourceList đánh số và id neo', () => {
    const { container } = render(<SourceList sources={S} />)
    expect(screen.getByRole('heading', { level: 2, name: 'Nguồn tham khảo' })).toBeTruthy()
    expect(container.querySelector('#nguon-1')?.textContent).toBe('[1]Vietnam+ · Giữ hồn nghề dệt chiếu cói làng Hới giữa nhịp sống hiện đại (mở tab mới) · 14/08/2026')
    expect(container.querySelector('#nguon-2')?.textContent).toBe('[2]Lời kể người làng')
    expect(screen.queryAllByRole('link')).toHaveLength(1)
    const a = screen.getByRole('link', { name: /mở tab mới/ })
    expect(a.getAttribute('target')).toBe('_blank')
    expect(a.getAttribute('rel')).toBe('noopener noreferrer')
  })
  it('SourceList nhận title và headingId tuỳ chọn', () => {
    const { container } = render(<SourceList sources={S} title="Nguồn" headingId="x-h" />)
    expect(container.querySelector('section')?.getAttribute('aria-labelledby')).toBe('x-h')
    expect(container.querySelector('#x-h')?.textContent).toBe('Nguồn')
  })
  it('SourceList variant notes: số "n.", ngăn bằng dấu phẩy, kết thúc bằng dấu chấm', () => {
    const { container } = render(<SourceList sources={S} variant="notes" title="Ghi chú nguồn" />)
    expect(container.querySelector('#nguon-1')?.textContent).toBe('1. Vietnam+, Giữ hồn nghề dệt chiếu cói làng Hới giữa nhịp sống hiện đại (mở tab mới), 14/08/2026.')
    expect(container.querySelector('#nguon-2')?.textContent).toBe('2. Lời kể người làng.')
  })
  it('SourceList chèn tác giả sau đơn vị xuất bản ở cả hai kiểu', () => {
    const ddk: SourceView[] = [
      { id: 'ddk', publisher: 'Đại Đoàn Kết', author: 'Vương Tâm', title: 'Về làng Hới', url: 'https://daidoanket.vn/x', date: '07/08/2021' },
      { id: 'noPub', publisher: null, author: 'Vương Tâm', title: 'Về làng Hới', url: null, date: null },
    ]
    const ref = render(<SourceList sources={ddk} />).container
    expect(ref.querySelector('#nguon-1')?.textContent).toBe('[1]Đại Đoàn Kết · Vương Tâm · Về làng Hới (mở tab mới) · 07/08/2021')
    expect(ref.querySelector('#nguon-2')?.textContent).toBe('[2]Vương Tâm · Về làng Hới')
    const notes = render(<SourceList sources={ddk} variant="notes" idPrefix="n" />).container
    expect(notes.querySelector('#n-1')?.textContent).toBe('1. Đại Đoàn Kết, Vương Tâm, Về làng Hới (mở tab mới), 07/08/2021.')
  })
  it('SourceList idPrefix đổi tiền tố id', () => {
    const { container } = render(<SourceList sources={S} idPrefix="x" />)
    expect(container.querySelector('#x-1')).toBeTruthy()
    expect(container.querySelector('#nguon-1')).toBeNull()
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
