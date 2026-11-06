import { afterEach, describe, expect, it } from 'vitest'
import { cleanup, render, screen, within } from '@testing-library/react'
import type { ImageView, ReadNextItem, Rich, StoryPageView } from '@/lib/content'
import { applyMode } from '@/lib/content/copy/applyMode'
import { storiesCopy } from '@/lib/content/copy/stories'
import { StoryView } from '@/components/stories/StoryView'

afterEach(cleanup)

const image: ImageView = {
  url: '/images/reference/nkc13.webp', alt: 'Hàng răng gỗ của khung dệt', width: 800, height: 600,
  sizes: {}, photographer: 'Nguyễn A', code: null, docNumber: null, flags: [],
}
const text = (t: string) => ({ type: 'text', text: t, format: 0 })
const body: Rich = {
  root: {
    type: 'root',
    children: [
      { type: 'paragraph', children: [text('Ở làng Hới.'), { type: 'cite', n: 2 }] },
      { type: 'heading', tag: 'h2', anchor: 'mot', children: [text('Mục một')] },
      { type: 'paragraph', children: [text('Đoạn một.')] },
      { type: 'heading', tag: 'h2', anchor: 'hai', children: [text('Mục hai')] },
      { type: 'heading', tag: 'h2', anchor: 'ba', children: [text('Mục ba')] },
      { type: 'heading', tag: 'h2', anchor: 'bon', children: [text('Mục bốn')] },
    ],
  },
}
const readNext: ReadNextItem[] = [
  { href: '/lang-hoi', eyebrow: 'LÀNG HỚI', title: 'Dòng thời gian làng Hới', cta: 'Xem các mốc →', image: null },
  { href: '/nghe-det-chieu', eyebrow: 'NGHỀ DỆT CHIẾU', title: 'Một tấm chiếu, muôn công đoạn', cta: 'Đi theo hành trình →', image: null },
  { href: '/cau-chuyen', eyebrow: 'NGHỀ TRUYỀN THỐNG', title: 'Nghề xưa trong nhịp sống mới', cta: 'Xem đề cương →', image: null, mobile: false },
]

function view(over: Partial<StoryPageView['story']> = {}, mode: 'public' | 'preview' = 'preview', meta?: string[]): StoryPageView {
  return {
    story: {
      slug: 'chuyen-ve-trang-chieu', title: 'Chuyện về Trạng Chiếu', sapo: 'Phạm Đôn Lễ và khung dệt.',
      category: 'Lịch sử', categoryKey: 'history', cover: image, readingMinutes: 4, hasDetail: true, cta: 'Đọc bài →',
      status: mode === 'preview' ? 'Bản nháp' : null, isDraft: mode === 'preview', sourceCount: 2, flags: [],
      body,
      toc: [
        { id: 'mot', title: 'Mục một' }, { id: 'hai', title: 'Mục hai' },
        { id: 'ba', title: 'Mục ba' }, { id: 'bon', title: 'Mục bốn' },
      ],
      sources: [
        { id: 'a', publisher: 'Vietnam+', author: null, title: 'Giữ hồn nghề', url: 'https://x.vn/a', date: '14/08/2026' },
        { id: 'b', publisher: 'Dân Việt', author: null, title: 'Lăng mộ', url: null, date: null },
      ],
      editor: null, publishedAt: null, coverCaption: 'Khung dệt thủ công ngày nay.',
      reviewChecklist: mode === 'preview' ? ['Đối chiếu năm sinh.', 'Xác nhận ngày lễ.'] : null,
      ...over,
    },
    meta: meta ?? ['Khoảng 4 phút đọc', '2 nguồn'],
    readNext,
    copy: applyMode(storiesCopy, mode),
  }
}

describe('StoryView', () => {
  it('có đúng một h1 và hai link neo nguồn trong bài', () => {
    render(<StoryView page={view()} />)
    expect(screen.getAllByRole('heading', { level: 1 })).toHaveLength(1)
    expect(screen.getByRole('link', { name: 'Nguồn 2' }).getAttribute('href')).toBe('#nguon-2')
  })

  it('mục lục có 4 link #anchor', () => {
    render(<StoryView page={view()} />)
    const toc = screen.getByRole('navigation', { name: 'Mục lục' })
    const links = within(toc).getAllByRole('link')
    expect(links.map((a) => a.getAttribute('href'))).toEqual(['#mot', '#hai', '#ba', '#bon'])
  })

  it('dòng meta chỉ gồm phần có giá trị, ngăn bằng một dấu · mỗi khoảng', () => {
    const { container } = render(<StoryView page={view()} />)
    const meta = container.querySelector('[data-meta]')!
    expect(meta.textContent).toBe('Khoảng 4 phút đọc·2 nguồn')
    expect(meta.querySelectorAll('[aria-hidden="true"]')).toHaveLength(1)
  })

  it('meta rỗng thì không có dòng meta', () => {
    const { container } = render(<StoryView page={view({}, 'preview', [])} />)
    expect(container.querySelector('[data-meta]')).toBeNull()
  })

  it('public: không có khung thẩm định, không có tag bản nháp', () => {
    const { container } = render(<StoryView page={view({}, 'public')} />)
    expect(container.textContent).not.toContain('CẦN THẨM ĐỊNH')
    expect(container.textContent).not.toContain('Bản nháp')
  })

  it('chủ đề in hoa bằng CSS (Eyebrow uppercase), giữ chữ nhãn option', () => {
    render(<StoryView page={view()} />)
    expect(screen.getByText('Lịch sử').className).toContain('uppercase')
  })

  it('tag bản nháp theo isDraft', () => {
    const { container } = render(<StoryView page={view({ isDraft: false })} />)
    expect(container.textContent).not.toContain('Bản nháp — cần thẩm định')
  })

  it('trích dẫn trong bài: dòng "Trích từ bài viết" chỉ hiện từ md', () => {
    const quoted: Rich = { root: { type: 'root', children: [{ type: 'quote', children: [text('Một nghề theo làng.')] }] } }
    const { container } = render(<StoryView page={view({ body: quoted })} />)
    const note = within(container.querySelector('blockquote')!).getByText('Trích từ bài viết')
    expect(note.className).toContain('max-md:hidden')
  })

  it('preview: tag bản nháp và khung thẩm định dạng danh sách', () => {
    render(<StoryView page={view()} />)
    expect(screen.getByText('Bản nháp — cần thẩm định')).toBeTruthy()
    expect(screen.getByText('CẦN THẨM ĐỊNH TRƯỚC KHI ĐĂNG')).toBeTruthy()
    expect(screen.getByText('Xác nhận ngày lễ.').tagName).toBe('LI')
  })

  it('ghi chú nguồn: id #nguon-n, số dạng "1."', () => {
    const { container } = render(<StoryView page={view()} />)
    expect(container.querySelector('#nguon-1')?.textContent).toBe('1. Vietnam+, Giữ hồn nghề (mở tab mới), 14/08/2026.')
    expect(container.querySelector('#nguon-2')?.textContent).toBe('2. Dân Việt, Lăng mộ.')
  })

  it('thẻ đọc tiếp thứ ba ẩn ở mobile, hai thẻ đầu thì không', () => {
    render(<StoryView page={view()} />)
    const li = (name: string) => screen.getByRole('link', { name: new RegExp(name) }).closest('li')!
    expect(li('Nghề xưa').className).toContain('max-md:hidden')
    expect(li('Dòng thời gian').className).not.toContain('max-md:hidden')
    const all = screen.getByRole('link', { name: 'Tất cả câu chuyện' })
    expect(all.getAttribute('href')).toBe('/cau-chuyen')
    // Copy không kèm mũi tên; LinkArrow thêm một mũi tên duy nhất.
    expect(all.textContent).toBe('Tất cả câu chuyện →')
  })

  it('ảnh bìa: chú thích kèm tác giả; không có ảnh thì không có figure bìa', () => {
    const { container, rerender } = render(<StoryView page={view()} />)
    expect(container.querySelector('figcaption')?.textContent).toContain('Ảnh: Nguyễn A')
    rerender(<StoryView page={view({ cover: null, coverCaption: null })} />)
    expect(container.querySelector('figure')).toBeNull()
  })

  it('có thanh tiến độ trỏ tới bài và nút chia sẻ', () => {
    const { container } = render(<StoryView page={view()} />)
    expect(screen.getByRole('progressbar', { name: 'Tiến độ đọc' })).toBeTruthy()
    expect(container.querySelector('article')?.id).toBeTruthy()
    expect(screen.getAllByText('CHIA SẺ').length).toBeGreaterThan(0)
  })
})
