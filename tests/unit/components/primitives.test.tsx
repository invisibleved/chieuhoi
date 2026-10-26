import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import { Button } from '@/components/ui/Button'
import { LinkArrow } from '@/components/ui/LinkArrow'
import { SectionHeading } from '@/components/ui/SectionHeading'

describe('primitives', () => {
  afterEach(cleanup)
  it('Button có href render thẻ a, không có href render button type=button', () => {
    render(
      <>
        <Button href="/lang-hoi">Khám phá làng nghề</Button>
        <Button>Gửi</Button>
      </>,
    )
    expect(screen.getByRole('link', { name: 'Khám phá làng nghề' }).getAttribute('href')).toBe('/lang-hoi')
    expect(screen.getByRole('button', { name: 'Gửi' }).getAttribute('type')).toBe('button')
  })
  it('Button disabled', () => {
    render(<Button disabled>Đang gửi...</Button>)
    expect((screen.getByRole('button') as HTMLButtonElement).disabled).toBe(true)
  })
  it('Button secondary có icon play aria-hidden', () => {
    const { container } = render(
      <Button variant="secondary" icon="play" href="#">
        Nghe chuyện làng Hới
      </Button>,
    )
    expect(container.querySelector('svg')?.getAttribute('aria-hidden')).toBe('true')
  })
  it('Button nối className sau class mặc định', () => {
    render(<Button className="extra-x">A</Button>)
    expect(screen.getByRole('button').className.endsWith('extra-x')).toBe(true)
  })
  it('LinkArrow thêm mũi tên', () => {
    render(<LinkArrow href="/lang-hoi">Đọc về làng Hới</LinkArrow>)
    expect(screen.getByRole('link').textContent).toBe('Đọc về làng Hới →')
  })
  it('SectionHeading: eyebrow, h2, ghi chú', () => {
    render(<SectionHeading eyebrow="LÀNG HỚI" title="Có một làng Hới..." note="Ghi chú" />)
    expect(screen.getByRole('heading', { level: 2, name: 'Có một làng Hới...' })).toBeTruthy()
    expect(screen.getByText('LÀNG HỚI')).toBeTruthy()
    expect(screen.getByText('Ghi chú')).toBeTruthy()
  })
})
