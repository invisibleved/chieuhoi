import { describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import { EmptyState, ErrorState, Skeleton, SuccessState } from '@/components/ui/Feedback'

describe('feedback', () => {
  it('EmptyState với link hành động', () => {
    render(
      <EmptyState
        title="Chưa có tư liệu trong nhóm này"
        body="Nếu gia đình bạn còn giữ ảnh cũ của làng, hãy góp cùng chúng tôi."
        action={{ href: '/ket-noi', label: 'Góp một ký ức' }}
      />,
    )
    expect(screen.getByRole('link', { name: 'Góp một ký ức →' }).getAttribute('href')).toBe(
      '/ket-noi',
    )
  })

  it('ErrorState role=alert, SuccessState role=status', () => {
    render(
      <>
        <ErrorState title="Không tải được ảnh" body="x" />
        <SuccessState title="Cảm ơn bạn" body="y" />
      </>,
    )
    expect(screen.getByRole('alert').textContent).toContain('Không tải được ảnh')
    expect(screen.getByRole('status').textContent).toContain('Cảm ơn bạn')
  })

  it('ErrorState retry: button gọi onClick, link khi có href', () => {
    const onClick = vi.fn()
    const { unmount } = render(
      <ErrorState title="t" body="b" retry={{ label: 'Thử tải lại', onClick }} />,
    )
    fireEvent.click(screen.getByRole('button', { name: 'Thử tải lại' }))
    expect(onClick).toHaveBeenCalledTimes(1)
    unmount()
    render(<ErrorState title="t" body="b" retry={{ label: 'Thử tải lại', href: '/x' }} />)
    expect(screen.getByRole('link', { name: 'Thử tải lại →' }).getAttribute('href')).toBe('/x')
  })

  it('Skeleton ẩn khỏi trình đọc màn hình và dùng motion-safe', () => {
    const { container } = render(<Skeleton lines={3} />)
    const root = container.firstElementChild!
    expect(root.getAttribute('aria-hidden')).toBe('true')
    expect(root.innerHTML).toContain('motion-safe:animate-weave-pulse')
  })
})
