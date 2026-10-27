import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { Lightbox } from '@/components/ui/Lightbox'

// jsdom không có bố cục: getClientRects luôn rỗng. Giả lập mọi phần tử đều hiển thị, trừ khi test nói khác.
beforeEach(() => {
  vi.spyOn(HTMLElement.prototype, 'getClientRects').mockImplementation(() => [{}] as unknown as DOMRectList)
})
afterEach(() => {
  cleanup()
  vi.restoreAllMocks()
})

function setup(extra: Partial<React.ComponentProps<typeof Lightbox>> = {}) {
  const fns = { onClose: vi.fn(), onPrev: vi.fn(), onNext: vi.fn() }
  const utils = render(
    <Lightbox
      label="Xem ảnh"
      position="1 / 3"
      closeHref="/thu-vien"
      prevHref="/thu-vien?anh=TL-003"
      nextHref="/thu-vien?anh=TL-002"
      closeLabel="Đóng"
      prevLabel="Ảnh trước"
      nextLabel="Ảnh tiếp"
      image={<span role="img" aria-label="Ảnh thử" />}
      {...fns}
      {...extra}
    >
      <h2>Tiêu đề</h2>
      <a href="/lien-quan">Liên quan</a>
    </Lightbox>,
  )
  return { ...fns, ...utils }
}

const swipe = (el: Element, from: number, to: number, y = 0) => {
  fireEvent.pointerDown(el, { clientX: from, clientY: 100, pointerId: 1 })
  fireEvent.pointerUp(el, { clientX: to, clientY: 100 + y, pointerId: 1 })
}

describe('Lightbox', () => {
  it('là dialog modal có nhãn; mở thì focus nút Đóng', () => {
    setup()
    const dialog = screen.getByRole('dialog', { name: 'Xem ảnh' })
    expect(dialog.getAttribute('aria-modal')).toBe('true')
    const close = screen.getByRole('link', { name: 'Đóng' })
    expect(close.getAttribute('href')).toBe('/thu-vien')
    expect(document.activeElement).toBe(close)
  })
  it('Trước / Tiếp là liên kết thật; bấm thường bị chặn và gọi callback, bấm kèm phím bổ trợ thì để trình duyệt', () => {
    const { onPrev, onNext } = setup()
    const next = screen.getByRole('link', { name: 'Ảnh tiếp' })
    expect(next.getAttribute('href')).toBe('/thu-vien?anh=TL-002')
    expect(fireEvent.click(next)).toBe(false)
    expect(onNext).toHaveBeenCalledTimes(1)
    expect(fireEvent.click(screen.getByRole('link', { name: 'Ảnh trước' }))).toBe(false)
    expect(onPrev).toHaveBeenCalledTimes(1)
    expect(fireEvent.click(next, { ctrlKey: true })).toBe(true)
    expect(onNext).toHaveBeenCalledTimes(1)
  })
  it('Tab từ phần tử cuối quay về nút Đóng; Shift+Tab từ nút Đóng sang phần tử cuối', () => {
    setup()
    const close = screen.getByRole('link', { name: 'Đóng' })
    const last = screen.getByRole('link', { name: 'Liên quan' })
    last.focus()
    fireEvent.keyDown(last, { key: 'Tab' })
    expect(document.activeElement).toBe(close)
    fireEvent.keyDown(close, { key: 'Tab', shiftKey: true })
    expect(document.activeElement).toBe(last)
  })
  it('bỏ qua phần tử đang ẩn khi vòng Tab (ví dụ liên kết chỉ hiện từ md)', () => {
    setup()
    const close = screen.getByRole('link', { name: 'Đóng' })
    const next = screen.getByRole('link', { name: 'Ảnh tiếp' })
    const hidden = screen.getByRole('link', { name: 'Liên quan' })
    vi.spyOn(HTMLElement.prototype, 'getClientRects').mockImplementation(function (this: HTMLElement) {
      return this === hidden ? ([] as unknown as DOMRectList) : ([{}] as unknown as DOMRectList)
    })
    // aside là phần tử cuối thật sự hiển thị? Ở đây Liên quan ẩn nên phần tử cuối hiển thị là Ảnh tiếp.
    next.focus()
    fireEvent.keyDown(next, { key: 'Tab' })
    expect(document.activeElement).toBe(close)
    fireEvent.keyDown(close, { key: 'Tab', shiftKey: true })
    expect(document.activeElement).toBe(next)
  })
  it('Tab khi focus lạc ra ngoài hộp thì đưa focus về trong hộp', () => {
    setup()
    ;(document.activeElement as HTMLElement).blur()
    fireEvent.keyDown(document.body, { key: 'Tab' })
    expect(document.activeElement).toBe(screen.getByRole('link', { name: 'Đóng' }))
  })
  it('← → Esc gọi onPrev / onNext / onClose', () => {
    const { onPrev, onNext, onClose } = setup()
    fireEvent.keyDown(document.activeElement as Element, { key: 'ArrowRight' })
    fireEvent.keyDown(document.activeElement as Element, { key: 'ArrowLeft' })
    fireEvent.keyDown(document.activeElement as Element, { key: 'Escape' })
    expect(onNext).toHaveBeenCalledTimes(1)
    expect(onPrev).toHaveBeenCalledTimes(1)
    expect(onClose).toHaveBeenCalledTimes(1)
  })
  it('vuốt trái ≥ 40px gọi onNext, vuốt phải gọi onPrev, vuốt 20px hoặc lệch dọc nhiều thì không gọi gì', () => {
    const { onPrev, onNext, container } = setup()
    const stage = container.querySelector('[data-lightbox-stage]') as Element
    swipe(stage, 20, 70)
    expect(onPrev).toHaveBeenCalledTimes(1)
    swipe(stage, 200, 120)
    expect(onNext).toHaveBeenCalledTimes(1)
    swipe(stage, 200, 180)
    swipe(stage, 200, 140, 90)
    expect(onNext).toHaveBeenCalledTimes(1)
    expect(onPrev).toHaveBeenCalledTimes(1)
  })
  it('không đổi overflow của body', () => {
    document.body.style.overflow = ''
    const { unmount } = setup()
    expect(document.body.style.overflow).toBe('')
    unmount()
    expect(document.body.style.overflow).toBe('')
  })
  it('đóng (gỡ khỏi cây) thì trả focus về returnFocusRef', () => {
    const opener = document.createElement('button')
    document.body.appendChild(opener)
    const { unmount } = setup({ returnFocusRef: { current: opener } })
    expect(document.activeElement).not.toBe(opener)
    unmount()
    expect(document.activeElement).toBe(opener)
    opener.remove()
  })
  it('hiện vị trí, ảnh và nội dung metadata', () => {
    setup()
    expect(screen.getByText('1 / 3')).toBeTruthy()
    expect(screen.getByRole('img', { name: 'Ảnh thử' })).toBeTruthy()
    expect(screen.getByRole('heading', { name: 'Tiêu đề' })).toBeTruthy()
  })
})
