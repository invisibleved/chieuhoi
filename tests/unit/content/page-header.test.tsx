import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { PageHeader } from '@/components/content/PageHeader'

const intro = { eyebrow: '03 — NGHỀ DỆT CHIẾU', title: 'A,\nB.', lead: 'Lead', heroTitle: null }

describe('PageHeader', () => {
  it('h1 có đúng một <br> cho tiêu đề hai dòng', () => {
    render(<PageHeader crumbs={[{ label: 'Trang chủ', href: '/' }, { label: 'Nghề dệt chiếu' }]} intro={intro} />)
    expect(screen.getByRole('heading', { level: 1 }).querySelectorAll('br')).toHaveLength(1)
  })

  it('breadcrumb: link Trang chủ, crumb cuối aria-current=page', () => {
    render(<PageHeader crumbs={[{ label: 'Trang chủ', href: '/' }, { label: 'Nghề dệt chiếu' }]} intro={intro} note={<p>Ghi chú</p>} aside={<p>Cột phải</p>} />)
    expect(screen.getByRole('link', { name: 'Trang chủ' }).getAttribute('href')).toBe('/')
    expect(screen.getByText('Nghề dệt chiếu').getAttribute('aria-current')).toBe('page')
    expect(screen.getByText('Ghi chú')).toBeTruthy()
    expect(screen.getByText('Cột phải')).toBeTruthy()
  })

  it('leadClassName thêm vào lead; wideIntro mở cột chữ thành 8 cột', () => {
    const { container } = render(<PageHeader crumbs={[{ label: 'Trang chủ', href: '/' }, { label: 'Câu chuyện' }]} intro={intro} leadClassName="md:hidden" wideIntro />)
    const lead = screen.getByText('Lead')
    expect(lead.className).toContain('md:hidden')
    expect(lead.className).toContain('font-serif')
    expect(screen.getByRole('heading', { level: 1 }).parentElement?.className).toContain('md:col-span-8')
    expect(container.innerHTML).not.toContain('md:col-span-7 md:gap-6')
  })

  it('mặc định cột chữ 7 cột và lead không có lớp thêm', () => {
    render(<PageHeader crumbs={[{ label: 'Trang chủ', href: '/' }, { label: 'Câu chuyện' }]} intro={intro} />)
    expect(screen.getByRole('heading', { level: 1 }).parentElement?.className).toContain('md:col-span-7')
    expect(screen.getByText('Lead').className).not.toContain('md:hidden')
  })

  it('titleClassName ghi đè cỡ chữ mặc định', () => {
    render(<PageHeader crumbs={[{ label: 'Trang chủ', href: '/' }, { label: 'Làng Hới' }]} intro={intro} titleClassName="text-[40px] md:text-[76px]" />)
    const h1 = screen.getByRole('heading', { level: 1 })
    expect(h1.className).toContain('md:text-[76px]')
    expect(h1.className).not.toContain('md:text-[70px]')
  })
})
