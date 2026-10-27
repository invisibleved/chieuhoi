import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { ConsentPanel } from '@/components/content/ConsentPanel'
import { StatusDot } from '@/components/content/StatusDot'
import { applyMode } from '@/lib/content/copy/applyMode'
import { peopleCopy } from '@/lib/content/copy/people'

const copy = applyMode(peopleCopy, 'public').detail.consent

describe('StatusDot', () => {
  it('ba trạng thái khác nhau bằng hình, aria-hidden', () => {
    const { container, rerender } = render(<StatusDot state="none" />)
    const dot = () => container.firstElementChild as HTMLElement
    expect(dot().getAttribute('aria-hidden')).toBe('true')
    expect(dot().className).toContain('border-dashed')
    rerender(<StatusDot state="partial" />)
    expect(dot().className).toContain('border-solid')
    expect(dot().className).not.toContain('bg-text-secondary')
    rerender(<StatusDot state="full" size={8} />)
    expect(dot().className).toContain('bg-text-secondary')
    expect(dot().style.width).toBe('8px')
  })
})

describe('ConsentPanel', () => {
  it.each([
    ['none', 'Chưa có'],
    ['partial', 'Một phần'],
    ['full', 'Đã có'],
  ] as const)('trạng thái %s luôn có chữ %s', (state, label) => {
    render(<ConsentPanel copy={copy} consent={{ state, missing: [], reviewedBySubject: false }} />)
    expect(screen.getAllByText(label).length).toBeGreaterThan(0)
    expect(screen.getAllByText('TRẠNG THÁI ĐỒNG Ý').length).toBeGreaterThan(0)
  })
  it('dòng "Cần" nối missing bằng ", "; không thiếu thì không có dòng này', () => {
    const { rerender } = render(<ConsentPanel copy={copy} consent={{ state: 'none', missing: ['tên', 'ảnh', 'lời trích'], reviewedBySubject: false }} />)
    expect(screen.getByText('Cần: đồng ý đăng tên, ảnh, lời trích')).toBeTruthy()
    rerender(<ConsentPanel copy={copy} consent={{ state: 'full', missing: [], reviewedBySubject: true }} />)
    expect(screen.queryByText(/^Cần:/)).toBeNull()
  })
  it('thẻ duyệt bài theo reviewedBySubject; yêu cầu chỉnh sửa có liên kết', () => {
    const { container, rerender } = render(<ConsentPanel copy={copy} consent={{ state: 'none', missing: [], reviewedBySubject: false }} />)
    expect(screen.getByText('NGƯỜI ĐƯỢC KỂ ĐÃ DUYỆT BÀI')).toBeTruthy()
    expect(screen.getByText('Chưa')).toBeTruthy()
    expect(screen.getByRole('link', { name: 'Gửi yêu cầu →' }).getAttribute('href')).toBe('/ket-noi')
    expect(screen.getByRole('link', { name: 'Yêu cầu sửa hoặc gỡ bài →' }).getAttribute('href')).toBe('/ket-noi')
    rerender(<ConsentPanel copy={copy} consent={{ state: 'full', missing: [], reviewedBySubject: true }} />)
    expect(screen.getByText('Đã duyệt')).toBeTruthy()
    expect(container.querySelector('section')?.getAttribute('aria-label')).toBe('TRẠNG THÁI ĐỒNG Ý')
  })
  it('bản mobile gọn: một dòng tóm tắt', () => {
    render(<ConsentPanel copy={copy} consent={{ state: 'none', missing: ['tên'], reviewedBySubject: false }} />)
    expect(screen.getByText('Chưa có · Người được kể chưa')).toBeTruthy()
  })
})
