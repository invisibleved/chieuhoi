import { render } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { Icon } from '@/admin/Icon'
import { LoginHelp } from '@/admin/LoginHelp'
import { Logo } from '@/admin/Logo'

describe('nhận diện admin', () => {
  it('Logo có tên và dòng phụ', () => {
    const { container } = render(<Logo />)
    expect(container.textContent).toContain('CHIẾU HỚI')
    expect(container.textContent).toContain('Quản lý nội dung')
    expect(container.querySelector('img')).toBeNull()
  })

  it('Icon hiện CH, ẩn khỏi trình đọc màn hình kèm nhãn Chiếu Hới', () => {
    const { container } = render(<Icon />)
    expect(container.textContent).toContain('CH')
    expect(container.querySelector('[aria-hidden="true"]')).not.toBeNull()
    expect(container.textContent).toContain('Chiếu Hới')
  })

  it('LoginHelp là chữ thường, không có link', () => {
    const { container } = render(<LoginHelp />)
    expect(container.textContent).toBe('Quên mật khẩu? Nhờ người duyệt đặt lại.')
    expect(container.querySelector('a')).toBeNull()
  })
})
