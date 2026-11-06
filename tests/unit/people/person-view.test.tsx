import { afterEach, describe, expect, it } from 'vitest'
import { cleanup, render, screen, within } from '@testing-library/react'
import type { ImageView, PersonDetailView, PersonPageView, ReadNextItem, Rich } from '@/lib/content'
import { applyMode } from '@/lib/content/copy/applyMode'
import { peopleCopy } from '@/lib/content/copy/people'
import { PersonView } from '@/components/people/PersonView'

afterEach(cleanup)

const image = (alt: string): ImageView => ({
  url: '/images/reference/nkc10.webp', alt, width: 800, height: 600,
  sizes: {}, photographer: null, code: 'TL-001', docNumber: '001', flags: ['rights-not-permitted'],
})
const text = (t: string) => ({ type: 'text', text: t, format: 0 })
const part = (h: string, p: string, cite?: number): Rich => ({
  root: {
    type: 'root',
    children: [
      { type: 'heading', tag: 'h3', children: [text(h)] },
      { type: 'paragraph', children: [text(p), ...(cite ? [{ type: 'cite', n: cite }] : [])] },
    ],
  },
})
/** Thứ tự h3/lời trích nhìn thấy ở một khổ: bỏ lời trích nằm trong khối ẩn ở khổ đó. */
const orderAt = (container: HTMLElement, hiddenAt: 'md:hidden' | 'max-md:hidden') =>
  [...container.querySelectorAll('h3, blockquote')]
    .filter((e) => !e.parentElement?.classList.contains(hiddenAt))
    .map((e) => (e.tagName === 'H3' ? e.textContent : 'QUOTE'))

const related: ReadNextItem[] = [
  { href: '/con-nguoi', eyebrow: 'CON NGƯỜI', title: 'Những chân dung khác', cta: 'Xem tất cả →', image: null, mobile: false },
]

// Bản public của mẫu seed: chưa có đồng ý nào, lib đã bỏ mọi phần nhận ra người.
const publicPerson: PersonDetailView = {
  slug: 'mau-nghe-nhan', category: 'Nghệ nhân', categoryKey: 'artisan', role: null, name: null, note: null,
  portrait: null, consentPending: true, flags: [],
  heading: 'Chờ đồng ý', storyTitle: 'Câu chuyện',
  intro: null, yearsInCraft: null, hamlet: null, recorded: null,
  storyParts: [null, null, null], sources: [], quote: null, gallery: [],
  consent: { state: 'none', missing: ['tên', 'ảnh', 'lời trích'], reviewedBySubject: false },
  portraitCaption: null,
}

const previewPerson: PersonDetailView = {
  ...publicPerson,
  role: '[cần xác minh]', name: '[cần xác minh]', note: 'Dệt chiếu tay · vai trò cần xác minh',
  portrait: image('Người phụ nữ ngồi dệt chiếu'), flags: ['consent-pending'],
  heading: '[cần xác minh]', storyTitle: 'Câu chuyện của [cần xác minh]',
  yearsInCraft: '[cần xác minh]', hamlet: '[cần xác minh]', recorded: '[cần xác minh]',
  gallery: [
    { image: image('Hai người cùng dệt'), caption: 'Hai người cùng làm trên một khung.' },
    { image: image('Đôi tay trên khung'), caption: 'Đôi tay trên khung dệt.' },
  ],
  portraitCaption: {
    label: 'CHÂN DUNG', code: '001',
    line: { desktop: 'Đồng ý của người trong ảnh: [chưa có]', mobile: 'Đồng ý của người trong ảnh: [chưa có]' },
  },
}

const page = (person: PersonDetailView, mode: 'public' | 'preview'): PersonPageView => ({
  person, related, copy: applyMode(peopleCopy, mode),
})

describe('PersonView public, chưa đồng ý', () => {
  it('h1 "Chờ đồng ý", breadcrumb cuối cũng vậy; không có ảnh, banner hay chữ quy trình', () => {
    const { container } = render(<PersonView page={page(publicPerson, 'public')} />)
    const h1s = screen.getAllByRole('heading', { level: 1 })
    expect(h1s).toHaveLength(1)
    expect(h1s[0].textContent).toBe('Chờ đồng ý')
    expect(screen.getByRole('navigation', { name: 'Đường dẫn' }).textContent).toContain('Chờ đồng ý')
    expect(container.querySelector('img')).toBeNull()
    expect(container.querySelector('[role="note"]')).toBeNull()
    expect(container.textContent).not.toContain('Mẫu trang')
    expect(container.textContent).not.toMatch(/\[[^\]]*\]/)
  })

  it('không có section câu chuyện, phóng sự ảnh hay bảng dữ kiện khi không có dữ liệu', () => {
    const { container } = render(<PersonView page={page(publicPerson, 'public')} />)
    expect(screen.queryByRole('heading', { level: 2, name: /Câu chuyện/ })).toBeNull()
    expect(screen.queryByRole('heading', { name: 'Phóng sự ảnh' })).toBeNull()
    expect(container.querySelector('dl')).toBeNull()
    expect(container.querySelector('blockquote')).toBeNull()
  })

  it('nhóm in hoa bằng CSS (Eyebrow uppercase), giữ chữ nhãn option', () => {
    render(<PersonView page={page(publicPerson, 'public')} />)
    expect(screen.getByText('Nghệ nhân').className).toContain('uppercase')
  })

  it('khung đồng ý "Chưa có" vẫn hiện; liên quan chỉ có thẻ cố định', () => {
    render(<PersonView page={page(publicPerson, 'public')} />)
    expect(screen.getByRole('region', { name: 'TRẠNG THÁI ĐỒNG Ý' }).textContent).toContain('Chưa có')
    expect(screen.getByRole('heading', { level: 2, name: 'Liên quan' })).toBeTruthy()
    expect(screen.getByRole('link', { name: /Những chân dung khác/ }).getAttribute('href')).toBe('/con-nguoi')
  })

  it('đã đồng ý: có câu chuyện, lời trích kèm dòng nguồn, danh sách nguồn khớp chú thích số', () => {
    const p: PersonDetailView = {
      ...publicPerson, name: 'Bà Lan', heading: 'Bà Lan', storyTitle: 'Câu chuyện của Bà Lan',
      role: 'Thợ dệt', yearsInCraft: '40 năm', consentPending: false,
      storyParts: [part('Tuổi thơ', 'Đoạn một.', 1), part('Một ngày', 'Đoạn hai.'), part('Điều muốn giữ', 'Đoạn ba.', 1)],
      sources: [{ id: 'a', publisher: 'Vietnam+', author: null, title: 'Giữ hồn nghề', url: null, date: '14/08/2026' }],
      quote: { text: 'Nghề là hồn làng.', sourceLine: 'Vietnam+ (14/08/2026)', note: 'Nguồn: Vietnam+ (14/08/2026)' },
    }
    const { container } = render(<PersonView page={page(p, 'public')} />)
    expect(screen.getByRole('heading', { level: 2, name: 'Câu chuyện của Bà Lan' })).toBeTruthy()
    const h3s = screen.getAllByRole('heading', { level: 3 }).map((h) => h.textContent)
    expect(h3s).toEqual(['Tuổi thơ', 'Một ngày', 'Điều muốn giữ'])
    // Lời trích: sau phần 1 ở mobile (PersonMobile), sau phần 2 từ md (PersonDetail) (R15, F1).
    const quotes = container.querySelectorAll('blockquote')
    expect(quotes).toHaveLength(2)
    for (const q of quotes) {
      expect(q.textContent).toContain('Nghề là hồn làng.')
      expect(q.textContent).toContain('Nguồn: Vietnam+ (14/08/2026)')
    }
    expect(quotes[0].parentElement!.className).toBe('md:hidden')
    expect(quotes[1].parentElement!.className).toBe('max-md:hidden')
    expect(orderAt(container, 'md:hidden')).toEqual(['Tuổi thơ', 'Một ngày', 'QUOTE', 'Điều muốn giữ'])
    expect(orderAt(container, 'max-md:hidden')).toEqual(['Tuổi thơ', 'QUOTE', 'Một ngày', 'Điều muốn giữ'])
    // Số chú thích giữ nguyên qua các phần (lib đánh số trên cả cây rồi mới tách).
    expect(screen.getAllByRole('link', { name: 'Nguồn 1' }).map((a) => a.getAttribute('href'))).toEqual(['#nguon-1', '#nguon-1'])
    expect(container.querySelector('#nguon-1')).not.toBeNull()
    expect(container.querySelectorAll('dl')[0].textContent).toContain('Thợ dệt')
  })
})

describe('PersonView preview', () => {
  it('có băng "Mẫu trang", chân dung và chú thích đè, ba mục gợi ý phỏng vấn', () => {
    const { container } = render(<PersonView page={page(previewPerson, 'preview')} />)
    expect(container.querySelector('[role="note"]')?.textContent).toContain('Mẫu trang chân dung.')
    expect(container.querySelector('figure figcaption')?.textContent).toContain('CHÂN DUNG · 001')
    const h3s = screen.getAllByRole('heading', { level: 3 }).map((h) => h.textContent)
    expect(h3s).toEqual(['Tuổi thơ bên khung dệt', 'Một ngày làm chiếu', 'Điều muốn giữ lại'])
    expect(container.querySelector('blockquote')?.textContent).toContain('[Trích nguyên văn lời kể]')
    expect(container.textContent).toContain('[Một câu giới thiệu ngắn, do chính người được kể duyệt.]')
  })

  it('ba mục gợi ý: lời trích sau mục 1 ở mobile, sau mục 2 từ md', () => {
    const { container } = render(<PersonView page={page(previewPerson, 'preview')} />)
    expect(orderAt(container, 'md:hidden')).toEqual(['Tuổi thơ bên khung dệt', 'Một ngày làm chiếu', 'QUOTE', 'Điều muốn giữ lại'])
    expect(orderAt(container, 'max-md:hidden')).toEqual(['Tuổi thơ bên khung dệt', 'QUOTE', 'Một ngày làm chiếu', 'Điều muốn giữ lại'])
  })

  it('câu chuyện chỉ một phần: lời trích render một lần ngay sau phần đó', () => {
    const p: PersonDetailView = {
      ...publicPerson, name: 'Bà Lan', heading: 'Bà Lan', storyTitle: 'Câu chuyện của Bà Lan', consentPending: false,
      storyParts: [part('Tuổi thơ', 'Đoạn một.'), null, null],
      quote: { text: 'Nghề là hồn làng.', sourceLine: null, note: null },
    }
    const { container } = render(<PersonView page={page(p, 'public')} />)
    expect(container.querySelectorAll('blockquote')).toHaveLength(1)
    expect([...container.querySelectorAll('h3, blockquote')].map((e) => e.tagName)).toEqual(['H3', 'BLOCKQUOTE'])
  })

  it('chú thích chân dung: nhánh desktop chỉ render khi có mã hoặc dòng desktop', () => {
    const p: PersonDetailView = { ...previewPerson, portraitCaption: { label: 'CHÂN DUNG', code: null, line: { desktop: null, mobile: 'Chỉ mobile' } } }
    const { container } = render(<PersonView page={page(p, 'preview')} />)
    const blocks = container.querySelectorAll('figcaption > div')
    expect(blocks).toHaveLength(1)
    expect(blocks[0].className).toContain('md:hidden')
    expect(blocks[0].textContent).toBe('Chỉ mobile')
  })

  it('mobile chỉ Vai trò và Năm làm nghề, theo khoá dòng (không theo chữ nhãn)', () => {
    const p: PersonDetailView = { ...previewPerson, role: null }
    const { container } = render(<PersonView page={page(p, 'preview')} />)
    const dls = container.querySelectorAll('dl')
    expect([...dls[0].querySelectorAll('dt')].map((e) => e.textContent)).toEqual(['Năm làm nghề', 'Xóm, thôn', 'Ghi lại bởi'])
    expect([...dls[1].querySelectorAll('dt')].map((e) => e.textContent)).toEqual(['Năm làm nghề'])
  })

  it('Liên quan: khoảng cách trên nằm trong section ReadNext (ẩn cùng khối ở mobile)', () => {
    const { container } = render(<PersonView page={page(publicPerson, 'public')} />)
    const rn = container.querySelector('section[aria-labelledby="read-next-h"]')!
    expect(rn.className).toContain('mt-10')
    expect(rn.className).toContain('max-md:hidden')
  })

  it('bảng dữ kiện: desktop 4 dòng, mobile 2 dòng', () => {
    const { container } = render(<PersonView page={page(previewPerson, 'preview')} />)
    const dls = container.querySelectorAll('dl')
    expect(dls).toHaveLength(2)
    expect(dls[0].querySelectorAll('dt')).toHaveLength(4)
    expect(dls[1].querySelectorAll('dt')).toHaveLength(2)
  })

  it('có "Phóng sự ảnh" với 2 ảnh và ghi chú quy trình', () => {
    const { container } = render(<PersonView page={page(previewPerson, 'preview')} />)
    expect(screen.getByRole('heading', { level: 2, name: 'Phóng sự ảnh' })).toBeTruthy()
    expect(container.textContent).toContain('Ảnh cùng buổi chụp · cần xác minh tác giả và quyền dùng')
    expect(screen.getByAltText('Hai người cùng dệt')).toBeTruthy()
    expect(screen.getByAltText('Đôi tay trên khung')).toBeTruthy()
  })

  it('preview: nhãn "Ảnh chưa được phép đăng" ở góc trên phải, không cùng góc với figcaption', () => {
    const p: PersonDetailView = { ...previewPerson, portraitCaption: { label: 'CHÂN DUNG', code: 'TL-001', line: { desktop: 'Dòng', mobile: 'Dòng' } } }
    const { container } = render(<PersonView page={page(p, 'preview')} />)
    const notes = within(container.querySelector('figure')!).getByText('Ảnh chưa được phép đăng').parentElement!
    expect(notes.className).toContain('top-3')
    expect(notes.className).toContain('right-3')
    expect(container.querySelector('figcaption')!.className).toContain('bottom-3')
  })
})
