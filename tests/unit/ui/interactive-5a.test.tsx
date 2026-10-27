import { act, fireEvent, render, screen, within } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { FilterableList } from '@/components/ui/FilterableList'
import { ReadingProgress } from '@/components/ui/ReadingProgress'
import { SearchField } from '@/components/ui/SearchField'
import { ShareButtons } from '@/components/ui/ShareButtons'
import { TableOfContents } from '@/components/ui/TableOfContents'

afterEach(() => {
  vi.unstubAllGlobals()
  vi.restoreAllMocks()
})

describe('SearchField', () => {
  it('có label thật trỏ tới input type=search và gọi onChange', () => {
    const onChange = vi.fn()
    render(<SearchField id="q" label="Tìm trong câu chuyện" placeholder={{ desktop: 'Ví dụ: khung dệt', mobile: 'Ví dụ: Trạng Chiếu' }} value="" onChange={onChange} />)
    const input = screen.getByLabelText('Tìm trong câu chuyện') as HTMLInputElement
    expect(input.type).toBe('search')
    expect(input.id).toBe('q')
    fireEvent.change(input, { target: { value: 'abc' } })
    expect(onChange).toHaveBeenCalledWith('abc')
  })
})

type Item = { id: string; cat: string | null; text: string }
const ITEMS: Item[] = [
  { id: 'a', cat: 'history', text: 'Chuyện về Trạng Chiếu' },
  { id: 'b', cat: 'craft', text: 'Khung dệt tay' },
  { id: 'c', cat: 'history', text: 'Làng Hới xưa' },
  { id: 'd', cat: 'craft', text: 'Cói và sợi' },
  { id: 'e', cat: null, text: 'Đời sống hôm nay' },
]
const FILTERS = [
  { key: 'all', label: 'Tất cả' },
  { key: 'history', label: 'Lịch sử' },
  { key: 'craft', label: 'Nghề' },
]

function renderList(props: Partial<React.ComponentProps<typeof FilterableList<Item>>> = {}) {
  return render(
    <FilterableList<Item>
      items={ITEMS}
      getKey={(t) => t.id}
      getCategory={(t) => t.cat}
      getSearchText={(t) => t.text}
      filters={FILTERS}
      filterLabel={{ desktop: 'Lọc theo chủ đề', mobile: 'Lọc' }}
      search={{ id: 'q', label: 'Tìm', placeholder: { desktop: 'x', mobile: 'x' } }}
      status={(shown) => ({ desktop: `${shown.length} bài`, mobile: `${shown.length} bài` })}
      empty={<p>Chưa có bài</p>}
      renderItem={(t) => <article data-testid="item">{t.text}</article>}
      listClassName="grid"
      {...props}
    />,
  )
}

describe('FilterableList', () => {
  it('mặc định hiện hết, chip Tất cả bật', () => {
    renderList()
    expect(screen.getAllByTestId('item')).toHaveLength(5)
    expect(screen.getByRole('button', { name: 'Tất cả' }).getAttribute('aria-pressed')).toBe('true')
    expect(screen.getByRole('status').textContent).toContain('5 bài')
  })
  it('bấm chip đổi aria-pressed và lọc', () => {
    renderList()
    fireEvent.click(screen.getByRole('button', { name: 'Lịch sử' }))
    expect(screen.getByRole('button', { name: 'Lịch sử' }).getAttribute('aria-pressed')).toBe('true')
    expect(screen.getByRole('button', { name: 'Tất cả' }).getAttribute('aria-pressed')).toBe('false')
    expect(screen.getAllByTestId('item')).toHaveLength(2)
    expect(screen.getByRole('status').textContent).toContain('2 bài')
  })
  it('gõ không dấu vẫn khớp có dấu', () => {
    renderList()
    fireEvent.change(screen.getByLabelText('Tìm'), { target: { value: 'trang chieu' } })
    const items = screen.getAllByTestId('item')
    expect(items).toHaveLength(1)
    expect(items[0].textContent).toContain('Chuyện về Trạng Chiếu')
  })
  it('0 kết quả hiện empty và status 0 bài', () => {
    renderList()
    fireEvent.change(screen.getByLabelText('Tìm'), { target: { value: 'zzz' } })
    expect(screen.queryAllByTestId('item')).toHaveLength(0)
    expect(screen.getByText('Chưa có bài')).toBeTruthy()
    expect(screen.getByRole('status').textContent).toContain('0 bài')
  })
  it('không có search thì không có ô tìm', () => {
    renderList({ search: undefined })
    expect(screen.queryByRole('searchbox')).toBeNull()
  })
  it('pageSize giới hạn; Xem thêm thêm từng trang; hết thì aria-disabled + chữ done', () => {
    renderList({ pageSize: 2, more: { label: 'Xem thêm', done: 'Đã hiện hết' } })
    expect(screen.getAllByTestId('item')).toHaveLength(2)
    expect(screen.queryByText('Đã hiện hết')).toBeNull()
    const more = screen.getByRole('button', { name: 'Xem thêm' })
    expect(more.getAttribute('aria-disabled')).not.toBe('true')
    fireEvent.click(more)
    expect(screen.getAllByTestId('item')).toHaveLength(4)
    fireEvent.click(screen.getByRole('button', { name: 'Xem thêm' }))
    expect(screen.getAllByTestId('item')).toHaveLength(5)
    const done = screen.getByRole('button', { name: 'Xem thêm' })
    expect(done.getAttribute('aria-disabled')).toBe('true')
    expect(screen.getByText('Đã hiện hết')).toBeTruthy()
    fireEvent.click(done)
    expect(screen.getAllByTestId('item')).toHaveLength(5)
  })
  it('đổi bộ lọc đặt lại phân trang', () => {
    renderList({ pageSize: 1, more: { label: 'Xem thêm', done: 'Hết' } })
    fireEvent.click(screen.getByRole('button', { name: 'Xem thêm' }))
    expect(screen.getAllByTestId('item')).toHaveLength(2)
    fireEvent.click(screen.getByRole('button', { name: 'Nghề' }))
    expect(screen.getAllByTestId('item')).toHaveLength(1)
  })
})

describe('TableOfContents', () => {
  let cb: IntersectionObserverCallback
  beforeEach(() => {
    class IO {
      constructor(c: IntersectionObserverCallback) {
        cb = c
      }
      observe() {}
      unobserve() {}
      disconnect() {}
    }
    vi.stubGlobal('IntersectionObserver', IO)
    for (const id of ['s1', 's2']) {
      const el = document.createElement('h2')
      el.id = id
      document.body.appendChild(el)
    }
  })
  afterEach(() => {
    document.body.innerHTML = ''
  })
  it('nav có tên, mục giao cắt nhận aria-current', () => {
    render(<TableOfContents label="Mục lục" title="TRONG BÀI" items={[{ id: 's1', title: 'Một' }, { id: 's2', title: 'Hai' }]} />)
    const nav = screen.getByRole('navigation', { name: 'Mục lục' })
    expect(within(nav).getByText('TRONG BÀI')).toBeTruthy()
    expect(within(nav).getByRole('link', { name: 'Hai' }).getAttribute('href')).toBe('#s2')
    act(() => cb([{ target: document.getElementById('s2')!, isIntersecting: true } as unknown as IntersectionObserverEntry], {} as IntersectionObserver))
    expect(screen.getByRole('link', { name: 'Hai' }).getAttribute('aria-current')).toBe('true')
    expect(screen.getByRole('link', { name: 'Một' }).getAttribute('aria-current')).toBeNull()
  })
})

describe('ReadingProgress', () => {
  function setup(scrollY: number) {
    const el = document.createElement('article')
    el.id = 'bai'
    // bài cao 2000px, bắt đầu ở 500px trên trang; viewport 800px
    el.getBoundingClientRect = () => ({ top: 500 - scrollY, height: 2000, bottom: 2500 - scrollY, left: 0, right: 0, width: 0, x: 0, y: 0, toJSON() {} })
    document.body.appendChild(el)
    vi.stubGlobal('innerHeight', 800)
    vi.stubGlobal('scrollY', scrollY)
    vi.stubGlobal('requestAnimationFrame', (fn: FrameRequestCallback) => {
      fn(0)
      return 1
    })
    vi.stubGlobal('cancelAnimationFrame', () => {})
    render(<ReadingProgress label="Tiến độ đọc" targetId="bai" />)
  }
  afterEach(() => {
    document.body.innerHTML = ''
  })
  it.each([
    [0, '0'],
    [100, '0'],
    [500 + 600, '50'],
    [500 + 1200, '100'],
    [5000, '100'],
  ])('scrollY=%i cho aria-valuenow=%s', (y, expected) => {
    setup(y)
    const bar = screen.getByRole('progressbar', { name: 'Tiến độ đọc' })
    expect(bar.getAttribute('aria-valuenow')).toBe(expected)
    expect(bar.getAttribute('aria-valuemin')).toBe('0')
    expect(bar.getAttribute('aria-valuemax')).toBe('100')
  })
})

const COPY = {
  label: 'CHIA SẺ',
  copy: { desktop: 'Sao chép đường dẫn', mobile: 'Sao chép link' },
  facebook: { desktop: 'Chia sẻ qua Facebook', mobile: 'Facebook' },
  zalo: { desktop: 'Chia sẻ qua Zalo', mobile: 'Zalo' },
  copied: 'Đã sao chép đường dẫn',
  zaloFallback: 'Đã sao chép đường dẫn, dán vào Zalo để chia sẻ',
}

describe('ShareButtons', () => {
  it('Sao chép gọi clipboard với location.href và báo copied trong vùng status', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined)
    vi.stubGlobal('navigator', { clipboard: { writeText } })
    render(<ShareButtons copy={COPY} />)
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /Sao chép đường dẫn/ }))
    })
    expect(writeText).toHaveBeenCalledWith(window.location.href)
    expect(screen.getByRole('status').textContent).toContain('Đã sao chép đường dẫn')
  })
  it('Facebook mở sharer.php với url đã encode', () => {
    const open = vi.fn()
    vi.stubGlobal('open', open)
    render(<ShareButtons copy={COPY} />)
    fireEvent.click(screen.getByRole('button', { name: /Chia sẻ qua Facebook/ }))
    expect(open).toHaveBeenCalledTimes(1)
    expect(open.mock.calls[0][0]).toBe(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`)
    expect(open.mock.calls[0][1]).toBe('_blank')
  })
  it('Zalo không có navigator.share thì sao chép và báo zaloFallback', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined)
    vi.stubGlobal('navigator', { clipboard: { writeText } })
    render(<ShareButtons copy={COPY} />)
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /Chia sẻ qua Zalo/ }))
    })
    expect(writeText).toHaveBeenCalledWith(window.location.href)
    expect(screen.getByRole('status').textContent).toContain(COPY.zaloFallback)
  })
  it('Zalo có navigator.share thì dùng nó', async () => {
    const share = vi.fn().mockResolvedValue(undefined)
    const writeText = vi.fn()
    vi.stubGlobal('navigator', { share, clipboard: { writeText } })
    render(<ShareButtons copy={COPY} />)
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /Chia sẻ qua Zalo/ }))
    })
    expect(share).toHaveBeenCalledWith({ url: window.location.href })
    expect(writeText).not.toHaveBeenCalled()
  })
})
