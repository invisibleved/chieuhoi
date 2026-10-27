import { afterEach, describe, expect, it } from 'vitest'
import { cleanup, render, screen } from '@testing-library/react'
import { Cite } from '@/components/content/Sources'

afterEach(cleanup)
const numbers = new Map([['a', 1], ['c', 3]])

describe('Cite', () => {
  it('render số theo thứ tự tăng dần', () => {
    render(<Cite ids={['c', 'a']} numbers={numbers} />)
    const links = screen.getAllByRole('link')
    expect(links.map((l) => l.textContent)).toEqual(['1', '3'])
  })
  it('id không có số hoặc rỗng thì không render gì', () => {
    const a = render(<Cite ids={['x']} numbers={numbers} />)
    expect(a.container.innerHTML).toBe('')
    const b = render(<Cite ids={[]} numbers={numbers} />)
    expect(b.container.innerHTML).toBe('')
  })
  it('bracket: "[n]" 12px, giãn chữ cite, vẫn có vùng chạm 44px', () => {
    render(<Cite ids={['c', 'a']} numbers={numbers} variant="bracket" />)
    const links = screen.getAllByRole('link')
    expect(links.map((l) => l.textContent)).toEqual(['[1]', '[3]'])
    expect(links[0].getAttribute('aria-label')).toBe('Nguồn 1')
    expect(links[0].className).toContain('text-[12px]')
    expect(links[0].className).toContain('md:tracking-cite')
    expect(links[0].className).toContain('text-text-meta')
    expect(links[0].className).toContain('align-super')
    expect(links[0].className).toContain('before:size-11')
    expect(links[0].className).not.toContain('font-semibold')
  })
})
