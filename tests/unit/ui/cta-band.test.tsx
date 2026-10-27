import { afterEach, describe, expect, it } from 'vitest'
import { cleanup, render, screen } from '@testing-library/react'
import { CtaBand } from '@/components/ui/CtaBand'

afterEach(cleanup)

const props = { title: 'Muốn tìm đến người làm chiếu?', body: 'Trang này không bán hàng.', action: { href: '/ket-noi', label: 'Kết nối với làng' } }

describe('CtaBand', () => {
  it('có h2, đoạn chữ và link đúng href', () => {
    render(<CtaBand {...props} tone="inverse" />)
    expect(screen.getByRole('heading', { level: 2, name: props.title })).toBeTruthy()
    expect(screen.getByText(props.body)).toBeTruthy()
    expect(screen.getByRole('link', { name: 'Kết nối với làng' }).getAttribute('href')).toBe('/ket-noi')
  })
  it('mặc định chỉ hiện từ md', () => {
    const { container } = render(<CtaBand {...props} tone="inverse" />)
    expect(container.firstElementChild?.className).toContain('max-md:hidden')
  })
  it.each([
    ['inverse', 'bg-bg-inverse'],
    ['secondary', 'bg-bg-secondary'],
    ['primary', 'bg-bg-primary'],
  ] as const)('tone %s dùng nền %s', (tone, cls) => {
    const { container } = render(<CtaBand {...props} tone={tone} />)
    expect(container.firstElementChild?.className).toContain(cls)
  })
  it('inverse: chữ phụ màu on-dark-muted; nút viền sáng', () => {
    render(<CtaBand {...props} tone="inverse" />)
    expect(screen.getByText(props.body).className).toContain('text-text-on-dark-muted')
    expect(screen.getByRole('link').className).toContain('border-text-on-dark')
  })
  it('không có href: không render link, nút không điều hướng', () => {
    render(<CtaBand {...props} action={{ label: 'Giới thiệu một người' }} tone="secondary" />)
    expect(screen.queryByRole('link')).toBeNull()
    expect(screen.getByRole('button', { name: 'Giới thiệu một người' })).toBeTruthy()
  })
  it('nút inverse 52/28 qua size, không có lớp min-h xung đột', () => {
    render(<CtaBand {...props} tone="inverse" />)
    const cls = screen.getByRole('link').className
    expect(cls).toContain('min-h-[52px]')
    expect(cls).not.toContain('min-h-12')
  })
})
