import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { PhotoEssay } from '@/components/content/PhotoEssay'
import { RichText, StoryPlaceholder } from '@/components/content/RichText'
import type { ImageView, Rich } from '@/lib/content'

const image: ImageView = {
  url: '/images/reference/nkc14.webp', alt: 'Đôi tay trên khung dệt', width: 800, height: 600,
  sizes: {}, photographer: null, code: null, docNumber: null, flags: [],
}
const text = (t: string, format = 0) => ({ type: 'text', text: t, format })
const para = (...children: unknown[]) => ({ type: 'paragraph', children })
const doc = (...children: unknown[]): Rich => ({ root: { type: 'root', children } })

describe('RichText', () => {
  it('h2 có id = anchor; đoạn văn render thành p', () => {
    const { container } = render(
      <RichText variant="article" value={doc(para(text('Mở đầu')), { type: 'heading', tag: 'h2', anchor: 'muc-mot', children: [text('Mục một')] })} />,
    )
    const h2 = screen.getByRole('heading', { level: 2, name: 'Mục một' })
    expect(h2.id).toBe('muc-mot')
    expect(container.querySelector('p')?.textContent).toBe('Mở đầu')
  })
  it('variant story: heading là h3, không có id', () => {
    render(<RichText variant="story" value={doc({ type: 'heading', tag: 'h2', anchor: 'x', children: [text('Tuổi thơ')] })} />)
    const h3 = screen.getByRole('heading', { level: 3, name: 'Tuổi thơ' })
    expect(h3.id).toBe('')
  })
  it('cite render FootnoteRef trỏ #nguon-n', () => {
    render(<RichText variant="article" value={doc(para(text('Câu có nguồn.'), { type: 'cite', n: 2 }))} />)
    expect(screen.getByRole('link', { name: 'Nguồn 2' }).getAttribute('href')).toBe('#nguon-2')
  })
  it('figure render <figure> có img và figcaption', () => {
    const { container } = render(<RichText variant="article" value={doc({ type: 'figure', image, caption: 'Đôi tay trên khung dệt.' })} />)
    const fig = container.querySelector('figure')!
    expect(fig.querySelector('img')?.getAttribute('alt')).toBe('Đôi tay trên khung dệt')
    expect(fig.querySelector('figcaption')?.textContent).toBe('Đôi tay trên khung dệt.')
  })
  it('figure không chú thích thì không có figcaption', () => {
    const { container } = render(<RichText variant="story" value={doc({ type: 'figure', image, caption: null })} />)
    expect(container.querySelector('figcaption')).toBeNull()
  })
  it('dropCap thêm first-letter: cho đoạn đầu, không cho đoạn sau', () => {
    const { container } = render(<RichText variant="article" dropCap value={doc(para(text('Ở làng Hới')), para(text('Đoạn hai')))} />)
    const [p1, p2] = Array.from(container.querySelectorAll('p'))
    expect(p1.className).toContain('first-letter:')
    expect(p2.className).not.toContain('first-letter:')
  })
  it('không dropCap thì không có first-letter:', () => {
    const { container } = render(<RichText variant="article" value={doc(para(text('Ở làng Hới')))} />)
    expect(container.querySelector('p')?.className).not.toContain('first-letter:')
  })
  it('blockquote: article dùng PullQuote article, story dùng testimony', () => {
    const q = doc({ type: 'quote', children: [text('Một nghề theo làng.')] })
    const a = render(<RichText variant="article" value={q} />)
    expect(a.container.querySelector('blockquote')?.className).toContain('border-y')
    a.unmount()
    const s = render(<RichText variant="story" value={q} />)
    expect(s.container.querySelector('blockquote')?.className).toContain('border-l-[3px]')
    expect(screen.getByText('Một nghề theo làng.')).toBeTruthy()
  })
  it('quoteNote: dòng ghi chú dưới trích dẫn, chỉ hiện từ md; không truyền thì không có', () => {
    const q = doc({ type: 'quote', children: [text('Một nghề theo làng.')] })
    const a = render(<RichText variant="article" value={q} quoteNote="Trích từ bài viết" />)
    expect(screen.getByText('Trích từ bài viết').className).toContain('max-md:hidden')
    a.unmount()
    const { container } = render(<RichText variant="article" value={q} />)
    expect(container.querySelector('blockquote span')).toBeNull()
  })
  it('chữ đậm/nghiêng, liên kết ngoài, danh sách và xuống dòng', () => {
    const { container } = render(
      <RichText
        variant="article"
        value={doc(
          para(text('đậm', 1), text('nghiêng', 2), { type: 'linebreak' }, { type: 'link', fields: { linkType: 'custom', url: 'https://example.com', newTab: true }, children: [text('liên kết')] }),
          { type: 'list', listType: 'bullet', children: [{ type: 'listitem', children: [text('mục a')] }] },
          { type: 'list', listType: 'number', children: [{ type: 'listitem', children: [text('mục 1')] }] },
        )}
      />,
    )
    expect(container.querySelector('strong')?.textContent).toBe('đậm')
    expect(container.querySelector('em')?.textContent).toBe('nghiêng')
    expect(container.querySelector('br')).not.toBeNull()
    const a = screen.getByRole('link', { name: /^liên kết ?\(mở tab mới\)$/ })
    expect(a.getAttribute('href')).toBe('https://example.com')
    expect(a.getAttribute('target')).toBe('_blank')
    expect(a.getAttribute('rel')).toContain('noopener')
    expect(container.querySelector('ul li')?.textContent).toBe('mục a')
    expect(container.querySelector('ol li')?.textContent).toBe('mục 1')
  })
  it('nút lạ bị bỏ qua mà không lỗi', () => {
    const { container } = render(
      <RichText variant="article" value={doc({ type: 'upload', value: 1 }, para(text('Còn lại'), { type: 'mystery', children: [text('ẩn')] }))} />,
    )
    expect(container.textContent).toBe('Còn lại')
  })
  it('gốc không hợp lệ thì không render gì', () => {
    const { container } = render(<RichText variant="article" value={{ root: {} }} />)
    expect(container.textContent).toBe('')
  })
})

describe('PhotoEssay', () => {
  const items = [
    { image, caption: 'Hai người cùng làm trên một khung.' },
    { image: { ...image, alt: 'Đôi tay ấn go' }, caption: null },
  ]
  it('tiêu đề h2, ghi chú và mỗi ảnh một figure', () => {
    const { container } = render(<PhotoEssay title="Phóng sự ảnh" note="Ảnh cùng buổi chụp" items={items} />)
    expect(screen.getByRole('heading', { level: 2, name: 'Phóng sự ảnh' })).toBeTruthy()
    expect(screen.getByText('Ảnh cùng buổi chụp')).toBeTruthy()
    expect(container.querySelectorAll('figure')).toHaveLength(2)
    expect(container.querySelectorAll('figcaption')).toHaveLength(1)
  })
  it('desktop xếp 8/4, không ghi chú thì không có chỗ ghi chú', () => {
    const { container } = render(<PhotoEssay title="Phóng sự ảnh" items={items} />)
    const figs = container.querySelectorAll('figure')
    expect(figs[0].className).toContain('md:col-span-8')
    expect(figs[1].className).toContain('md:col-span-4')
    expect(screen.queryByText('Ảnh cùng buổi chụp')).toBeNull()
  })
  it('ghi chú hai bản (ReactNode): bản desktop ẩn dưới md, bản mobile ẩn từ md', () => {
    render(<PhotoEssay title="Phóng sự ảnh" note={<><span className="max-md:hidden">Bản dài</span><span className="md:hidden">Bản ngắn</span></>} items={items} />)
    expect(screen.getByText('Bản dài').className).toBe('max-md:hidden')
    expect(screen.getByText('Bản ngắn').className).toBe('md:hidden')
  })
  it('không có ảnh thì không render gì (cả tiêu đề)', () => {
    const { container } = render(<PhotoEssay title="Phóng sự ảnh" items={[]} />)
    expect(container.innerHTML).toBe('')
  })
})

describe('StoryPlaceholder', () => {
  it('h3 tiêu đề, đoạn chữ mờ hai bản desktop/mobile', () => {
    const { container } = render(<StoryPlaceholder title="Một ngày làm chiếu" body={{ desktop: '[Gợi ý dài]', mobile: '[Ngắn]' }} />)
    expect(screen.getByRole('heading', { level: 3, name: 'Một ngày làm chiếu' })).toBeTruthy()
    const p = container.querySelector('p')!
    expect(p.className).toContain('text-text-muted')
    expect(screen.getByText('[Gợi ý dài]').className).toBe('max-md:hidden')
    expect(screen.getByText('[Ngắn]').className).toBe('md:hidden')
  })
  it('không có tiêu đề thì không có h3 rỗng; đoạn dùng cùng kiểu với lời kể, màu mờ', () => {
    const { container } = render(<StoryPlaceholder title={null} body={{ desktop: 'A', mobile: 'A' }} />)
    expect(container.querySelector('h3')).toBeNull()
    const p = container.querySelector('p')!.className
    expect(p).toContain('leading-[1.75]')
    expect(p).not.toContain('text-text-primary')
  })
})
