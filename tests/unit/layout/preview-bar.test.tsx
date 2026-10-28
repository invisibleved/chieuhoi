import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import { PreviewBar } from '@/components/layout/PreviewBar'
import { previewCopy } from '@/lib/content/copy/preview'

vi.mock('next/navigation', () => ({
  usePathname: () => '/cau-chuyen/a',
  useSearchParams: () => new URLSearchParams(''),
}))

const view = { label: previewCopy.label, exitLabel: previewCopy.exit, exitRoute: '/preview/exit' }

describe('PreviewBar', () => {
  it('hiện nhãn xem trước', () => {
    render(<PreviewBar view={view} />)
    expect(screen.getByText(previewCopy.label)).toBeTruthy()
  })
  it('link thoát mang đường dẫn hiện tại', () => {
    render(<PreviewBar view={view} />)
    expect(screen.getByRole('link', { name: 'Thoát xem trước' }).getAttribute('href')).toBe('/preview/exit?path=%2Fcau-chuyen%2Fa')
  })
  it('gốc là aside có aria-label', () => {
    const { container } = render(<PreviewBar view={view} />)
    const root = container.firstElementChild!
    expect(root.tagName).toBe('ASIDE')
    expect(root.getAttribute('aria-label')).toBe('Chế độ xem trước')
  })
})
