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
})
