import { useState } from 'react'
import { describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import { FilterChips } from '@/components/ui/FilterChips'
import { Tabs } from '@/components/ui/Tabs'

describe('interactive', () => {
  it('FilterChips: aria-pressed và gọi onChange', () => {
    const onChange = vi.fn()
    render(
      <FilterChips
        label="Lọc theo chủ đề"
        options={[
          { key: 'all', label: 'Tất cả' },
          { key: 'ls', label: 'Lịch sử' },
        ]}
        value="all"
        onChange={onChange}
      />,
    )
    expect(screen.getByRole('group', { name: 'Lọc theo chủ đề' })).toBeTruthy()
    expect(screen.getByRole('button', { name: 'Tất cả' }).getAttribute('aria-pressed')).toBe('true')
    expect(screen.getByRole('button', { name: 'Lịch sử' }).getAttribute('aria-pressed')).toBe('false')
    fireEvent.click(screen.getByRole('button', { name: 'Lịch sử' }))
    expect(onChange).toHaveBeenCalledWith('ls')
  })

  function TabsHarness() {
    const [v, setV] = useState<'hand' | 'machine' | 'compare'>('hand')
    return (
      <Tabs
        label="Cách dệt"
        value={v}
        onChange={setV}
        tabs={[
          { key: 'hand', label: 'Dệt thủ công', panel: <p>P1</p> },
          { key: 'machine', label: 'Dệt bằng máy', panel: <p>P2</p> },
          { key: 'compare', label: 'So sánh', panel: <p>P3</p> },
        ]}
      />
    )
  }

  it('Tabs: roving tabindex, mũi tên, Home/End, panel liên kết', () => {
    render(<TabsHarness />)
    const tabs = screen.getAllByRole('tab')
    expect(tabs.map((t) => t.tabIndex)).toEqual([0, -1, -1])
    fireEvent.keyDown(tabs[0], { key: 'ArrowRight' })
    expect(screen.getByRole('tab', { name: 'Dệt bằng máy' }).getAttribute('aria-selected')).toBe('true')
    expect(document.activeElement?.textContent).toBe('Dệt bằng máy')
    expect(screen.getByRole('tabpanel').textContent).toBe('P2')
    fireEvent.keyDown(document.activeElement!, { key: 'End' })
    expect(document.activeElement?.textContent).toBe('So sánh')
    fireEvent.keyDown(document.activeElement!, { key: 'ArrowRight' })
    expect(document.activeElement?.textContent).toBe('Dệt thủ công')
    const panel = screen.getByRole('tabpanel')
    expect(panel.getAttribute('aria-labelledby')).toBe(document.activeElement?.id)
    expect(panel.tabIndex).toBe(0)
    fireEvent.keyDown(document.activeElement!, { key: 'ArrowLeft' })
    expect(document.activeElement?.textContent).toBe('So sánh')
    fireEvent.keyDown(document.activeElement!, { key: 'Home' })
    expect(document.activeElement?.textContent).toBe('Dệt thủ công')
  })
})

describe('Tabs rỗng', () => {
  it('không throw, không render', () => {
    const { container } = render(<Tabs label="x" tabs={[]} value={'a' as never} onChange={() => {}} />)
    expect(container.innerHTML).toBe('')
  })
})
