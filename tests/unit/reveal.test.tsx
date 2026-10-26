import { act, render } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { Reveal } from '@/components/ui/Reveal'

type IOCallback = (entries: { isIntersecting: boolean; target: Element }[]) => void
let ioCallbacks: IOCallback[] = []
let observed: Element[] = []
const disconnect = vi.fn()

function installIO() {
  ioCallbacks = []
  observed = []
  class FakeIO {
    constructor(cb: IOCallback) { ioCallbacks.push(cb) }
    observe(el: Element) { observed.push(el) }
    unobserve() {}
    disconnect() { disconnect() }
  }
  vi.stubGlobal('IntersectionObserver', FakeIO)
}
const mockMatchMedia = (reduce: boolean) =>
  vi.stubGlobal('matchMedia', (q: string) => ({ matches: reduce && q.includes('reduce'), media: q, addEventListener() {}, removeEventListener() {} }))
const rect = (top: number) =>
  vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockReturnValue({ top, bottom: top + 100, left: 0, right: 100, width: 100, height: 100, x: 0, y: top, toJSON() {} })

beforeEach(() => { disconnect.mockClear() })
afterEach(() => { vi.unstubAllGlobals(); vi.restoreAllMocks() })

describe('Reveal', () => {
  it('không có IntersectionObserver (SSR/không JS): nội dung hiện, không có opacity-0', () => {
    vi.stubGlobal('IntersectionObserver', undefined)
    const { container } = render(<Reveal><p>Nội dung</p></Reveal>)
    expect(container.innerHTML).not.toContain('opacity-0')
    expect(container.firstElementChild?.tagName).toBe('DIV')
  })
  it('không có matchMedia vẫn chạy, không ném lỗi', () => {
    installIO()
    vi.stubGlobal('matchMedia', undefined)
    rect(5000)
    const { container } = render(<Reveal><p>x</p></Reveal>)
    expect(container.innerHTML).toContain('opacity-0')
  })
  it('phần tử ngoài khung nhìn: ẩn, rồi hiện khi giao nhau, chỉ một lần', () => {
    installIO(); mockMatchMedia(false); rect(5000)
    const { container } = render(<Reveal><p>x</p></Reveal>)
    const el = container.firstElementChild as HTMLElement
    expect(el.className).toContain('opacity-0')
    expect(observed).toContain(el)
    act(() => ioCallbacks[0]([{ isIntersecting: true, target: el }]))
    expect(el.className).not.toContain('opacity-0')
    expect(el.className).toContain('opacity-100')
    expect(disconnect).toHaveBeenCalled()
    act(() => ioCallbacks[0]([{ isIntersecting: false, target: el }]))
    expect(el.className).toContain('opacity-100')
  })
  it('giảm chuyển động: không ẩn gì', () => {
    installIO(); mockMatchMedia(true); rect(5000)
    const { container } = render(<Reveal><p>x</p></Reveal>)
    expect(container.innerHTML).not.toContain('opacity-0')
  })
  it('đã trong khung nhìn lúc mount: không bao giờ bị ẩn', () => {
    installIO(); mockMatchMedia(false); rect(10)
    const { container } = render(<Reveal><p>x</p></Reveal>)
    expect(container.innerHTML).not.toContain('opacity-0')
  })
})
