import { afterEach, describe, expect, it, vi } from 'vitest'
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { Segmented } from '@/components/ui/Segmented'

afterEach(cleanup)

const options = [
  { key: 'all', label: 'Mọi thời kỳ' },
  { key: 'old', label: 'Xưa' },
  { key: 'now', label: 'Nay' },
] as const

describe('Segmented', () => {
  it('nhóm có nhãn; đúng một nút aria-pressed=true', () => {
    render(<Segmented label="Thời kỳ" options={[...options]} value="old" onChange={() => {}} />)
    expect(screen.getByRole('group', { name: 'Thời kỳ' })).toBeTruthy()
    const pressed = screen.getAllByRole('button').filter((b) => b.getAttribute('aria-pressed') === 'true')
    expect(pressed).toHaveLength(1)
    expect(pressed[0].textContent).toBe('Xưa')
  })
  it('bấm nút gọi onChange với key', () => {
    const onChange = vi.fn()
    render(<Segmented label="Thời kỳ" options={[...options]} value="all" onChange={onChange} />)
    fireEvent.click(screen.getByRole('button', { name: 'Nay' }))
    expect(onChange).toHaveBeenCalledWith('now')
  })
  it('stretch: mỗi nút flex-1 cao 48', () => {
    render(<Segmented label="Thời kỳ" options={[...options]} value="all" onChange={() => {}} stretch />)
    for (const b of screen.getAllByRole('button')) {
      expect(b.className).toContain('flex-1')
      expect(b.className).toContain('min-h-12')
    }
  })
  it('không stretch thì không flex-1', () => {
    render(<Segmented label="Thời kỳ" options={[...options]} value="all" onChange={() => {}} />)
    expect(screen.getAllByRole('button')[0].className).not.toContain('flex-1')
  })
})
