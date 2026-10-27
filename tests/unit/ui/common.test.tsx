import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { ReadNext } from '@/components/content/ReadNext'
import { ShotNeeded } from '@/components/content/ShotNeeded'
import { Callout } from '@/components/ui/Callout'
import { BackLink } from '@/components/ui/BackLink'
import { VariantText } from '@/components/ui/VariantText'
import { EmptyState } from '@/components/ui/Feedback'
import { NoteBanner } from '@/components/ui/NoteBanner'
import { StatusDot } from '@/components/ui/StatusDot'
import { PullQuote } from '@/components/ui/PullQuote'
import { Eyebrow } from '@/components/ui/Eyebrow'
import { DetailTitle, Lede } from '@/components/ui/DetailTitle'
import { FactList } from '@/components/ui/FactList'
import { PagerButton } from '@/components/ui/PagerButton'
import { PlaceholderFrame } from '@/components/ui/PlaceholderFrame'
import { PillButton } from '@/components/ui/PillButton'
import { ScrollStrip } from '@/components/ui/ScrollStrip'
import { StepProgress } from '@/components/ui/StepProgress'
import { ThreadsDivider } from '@/components/ui/ThreadsDivider'

describe('Eyebrow', () => {
  it('tone quyết định màu, rule thêm vạch aria-hidden', () => {
    const { container, rerender } = render(<Eyebrow>LÀNG HỚI</Eyebrow>)
    expect(screen.getByText('LÀNG HỚI').className).toContain('text-accent')
    expect(screen.getByText('LÀNG HỚI').className).not.toContain('text-accent-on-dark')
    expect(container.querySelector('[aria-hidden="true"]')).toBeNull()
    rerender(<Eyebrow tone="dark" rule>LÀNG HỚI</Eyebrow>)
    expect(screen.getByText('LÀNG HỚI').className).toContain('text-accent-on-dark')
    expect(container.querySelector('span[aria-hidden="true"]')).not.toBeNull()
  })
  it('uppercase: in hoa bằng CSS, giữ nguyên chữ trong DOM; mặc định không in hoa', () => {
    const { rerender } = render(<Eyebrow>Lịch sử</Eyebrow>)
    expect(screen.getByText('Lịch sử').className).not.toContain('uppercase')
    rerender(<Eyebrow uppercase>Lịch sử</Eyebrow>)
    expect(screen.getByText('Lịch sử').className).toContain('uppercase')
  })
  it('as="p" render thẻ p và nhận id', () => {
    render(<Eyebrow as="p" id="e">X</Eyebrow>)
    const el = screen.getByText('X')
    expect(el.tagName).toBe('P')
    expect(el.id).toBe('e')
  })
})

describe('ScrollStrip', () => {
  it('có label thì là nhóm có tên; không label thì không có role', () => {
    const { rerender } = render(<ScrollStrip label="Chọn công đoạn"><button>a</button></ScrollStrip>)
    expect(screen.getByRole('group', { name: 'Chọn công đoạn' })).toBeTruthy()
    rerender(<ScrollStrip><button>a</button></ScrollStrip>)
    expect(screen.queryByRole('group')).toBeNull()
  })
  it('as="ol" render danh sách', () => {
    render(<ScrollStrip as="ol"><li>a</li></ScrollStrip>)
    expect(screen.getByRole('list')).toBeTruthy()
  })
})

describe('StepProgress', () => {
  it('index=4 total=7: aria-valuenow 5, chữ 05 / 07', () => {
    render(<StepProgress index={4} total={7} label="Tiến trình" unit="Công đoạn" />)
    const pb = screen.getByRole('progressbar', { name: 'Tiến trình' })
    expect(pb.getAttribute('aria-valuenow')).toBe('5')
    expect(pb.getAttribute('aria-valuemin')).toBe('1')
    expect(pb.getAttribute('aria-valuemax')).toBe('7')
    expect(screen.getByText('05')).toBeTruthy()
    expect(screen.getByText(/\/ 07/)).toBeTruthy()
    expect(screen.getByText('Công đoạn')).toBeTruthy()
  })
})

describe('PagerButton', () => {
  it('atEnd: aria-disabled, bấm không gọi onClick, focus còn trên nút', () => {
    const onClick = vi.fn()
    render(<PagerButton direction="prev" label="Công đoạn trước" onClick={onClick} atEnd iconOnly />)
    const btn = screen.getByRole('button', { name: 'Công đoạn trước' })
    expect(btn.getAttribute('aria-disabled')).toBe('true')
    btn.focus()
    fireEvent.click(btn)
    expect(onClick).not.toHaveBeenCalled()
    expect(document.activeElement).toBe(btn)
  })
  it('không atEnd: gọi onClick; không iconOnly thì hiện chữ', () => {
    const onClick = vi.fn()
    render(<PagerButton direction="next" label="Tiếp" onClick={onClick} atEnd={false} />)
    const btn = screen.getByRole('button', { name: 'Tiếp' })
    expect(btn.getAttribute('aria-disabled')).toBeNull()
    fireEvent.click(btn)
    expect(onClick).toHaveBeenCalledTimes(1)
  })
})

describe('PillButton', () => {
  it('active đổi kiểu, chuyển tiếp aria-current và onClick, là button type=button', () => {
    const onClick = vi.fn()
    const { rerender } = render(<PillButton tone="dark" active aria-current="step" onClick={onClick}>01 Chọn cói</PillButton>)
    const btn = screen.getByRole('button', { name: '01 Chọn cói' })
    expect(btn.getAttribute('type')).toBe('button')
    expect(btn.getAttribute('aria-current')).toBe('step')
    expect(btn.className).toContain('bg-bg-primary')
    fireEvent.click(btn)
    expect(onClick).toHaveBeenCalledTimes(1)
    rerender(<PillButton tone="dark" active={false} onClick={onClick}>01 Chọn cói</PillButton>)
    expect(screen.getByRole('button').className).toContain('border-border-on-dark-strong')
    expect(screen.getByRole('button').getAttribute('aria-current')).toBeNull()
  })
})

describe('ThreadsDivider', () => {
  it('size lg cao 14px, mặc định 12px', () => {
    const { container, rerender } = render(<ThreadsDivider />)
    expect(container.firstElementChild!.className).toContain('h-3')
    rerender(<ThreadsDivider size="lg" />)
    expect(container.firstElementChild!.className).toContain('h-3.5')
  })
  it('có class threads và aria-hidden', () => {
    const { container } = render(<ThreadsDivider className="mx-5" />)
    const el = container.firstElementChild!
    expect(el.className).toContain('threads')
    expect(el.getAttribute('aria-hidden')).toBe('true')
  })
})

describe('PlaceholderFrame', () => {
  it('pattern weave: nền sợi cói, không nét đứt, vẫn hiện nhãn và mô tả', () => {
    const { container } = render(<PlaceholderFrame label="ẢNH CẦN CHỤP" description="Chiếu trơn" pattern="weave" />)
    expect(container.firstElementChild!.className).toContain('weave')
    expect(container.firstElementChild!.className).not.toContain('border-dashed')
    expect(screen.getByText('Chiếu trơn')).toBeTruthy()
  })
  it('hiện label, title, description; nét đứt theo tone', () => {
    const { container, rerender } = render(<PlaceholderFrame label="ẢNH CẦN CHỤP" title="Chẻ cói" description="Cận tay chẻ cói" />)
    expect(screen.getByText('ẢNH CẦN CHỤP')).toBeTruthy()
    expect(screen.getByText('Chẻ cói')).toBeTruthy()
    expect(screen.getByText('Cận tay chẻ cói')).toBeTruthy()
    expect(container.firstElementChild!.className).toContain('border-border-dashed')
    rerender(<PlaceholderFrame label="X" tone="dark" />)
    expect(container.firstElementChild!.className).toContain('border-border-on-dark-dashed')
  })
})

describe('ShotNeeded (dựng trên PlaceholderFrame)', () => {
  it('tone dark giữ role img, aria-label và nhãn', () => {
    render(<ShotNeeded tone="dark" description="Chẻ cói" />)
    expect(screen.getByRole('img', { name: 'Ảnh cần chụp: Chẻ cói' })).toBeTruthy()
    expect(screen.getByText('ẢNH CẦN CHỤP')).toBeTruthy()
  })
})

describe('Callout', () => {
  it('hiện tiêu đề và nội dung', () => {
    render(<Callout title="LƯU Ý">Nội dung</Callout>)
    expect(screen.getByText('LƯU Ý')).toBeTruthy()
    expect(screen.getByText('Nội dung')).toBeTruthy()
  })
})

describe('DetailTitle, Lede', () => {
  it('h1 font display 40px; cỡ desktop theo size (story 72, person 64)', () => {
    const { rerender } = render(<DetailTitle size="story">Chuyện về Trạng Chiếu</DetailTitle>)
    const h1 = screen.getByRole('heading', { level: 1 })
    expect(h1.className).toContain('font-display')
    expect(h1.className).toContain('text-[40px]')
    expect(h1.className).toContain('md:text-[72px]')
    rerender(<DetailTitle size="person">Chờ đồng ý</DetailTitle>)
    expect(screen.getByRole('heading', { level: 1 }).className).toContain('md:text-[64px]')
  })
  it('as="p" (styleguide): cùng kiểu chữ, không phải heading', () => {
    const { container } = render(<DetailTitle size="person" as="p">Mẫu</DetailTitle>)
    expect(screen.queryByRole('heading')).toBeNull()
    expect(container.querySelector('p')!.className).toContain('md:text-[64px]')
  })
  it('Lede: đoạn nghiêng chữ phụ; story 18/22 rộng tối đa 720, person 17/19', () => {
    const { container, rerender } = render(<Lede size="story">Sapo</Lede>)
    const p = container.querySelector('p')!
    expect(p.className).toContain('italic')
    expect(p.className).toContain('text-text-secondary')
    expect(p.className).toContain('md:max-w-[720px]')
    expect(p.className).toContain('md:text-[22px]')
    rerender(<Lede size="person">Giới thiệu</Lede>)
    expect(container.querySelector('p')!.className).toContain('md:text-[19px]')
    expect(container.querySelector('p')!.className).not.toContain('md:max-w-[720px]')
  })
})

describe('FactList', () => {
  it('dl > div > dt + dd', () => {
    const { container } = render(<FactList items={[{ term: 'Nơi dệt', detail: 'Hải Triều' }, { term: 'Chất liệu', detail: 'Cói' }]} />)
    const divs = container.querySelectorAll('dl > div')
    expect(divs).toHaveLength(2)
    expect(divs[0].querySelector('dt + dd')).not.toBeNull()
    expect(divs[0].className).toContain('border-border-strong')
    expect(divs[1].className).toContain('border-border-soft')
  })
  it('inline: hai cột, nhãn chữ thường màu phụ (không phải eyebrow)', () => {
    const { container } = render(<FactList layout="inline" items={[{ term: 'Vai trò', detail: 'Thợ dệt' }, { term: 'Năm làm nghề', detail: '40' }]} />)
    const divs = container.querySelectorAll('dl > div')
    expect(divs[0].className).toContain('grid-cols-[120px_1fr]')
    expect(divs[1].className).toContain('border-b')
    const dt = container.querySelector('dt')!
    expect(dt.className).toContain('text-text-muted')
    expect(dt.className).not.toContain('tracking-label')
  })
})

describe('PullQuote', () => {
  it('article: viền trên dưới, chữ nghiêng; có ghi chú thì hiện', () => {
    const { container } = render(<PullQuote variant="article" note="Trích từ bài viết">Một nghề theo làng.</PullQuote>)
    const bq = container.querySelector('blockquote')!
    expect(bq.className).toContain('border-y')
    expect(container.querySelector('p')?.className).toContain('italic')
    expect(container.querySelector('p')?.className).toContain('text-accent')
    expect(screen.getByText('Trích từ bài viết')).toBeTruthy()
  })
  it('noteClassName thêm vào dòng ghi chú', () => {
    render(<PullQuote variant="article" note="Trích từ bài viết" noteClassName="max-md:hidden">Một nghề theo làng.</PullQuote>)
    const note = screen.getByText('Trích từ bài viết')
    expect(note.className).toContain('max-md:hidden')
    expect(note.className).toContain('text-text-muted')
  })
  it('testimony: viền trái rơm, chữ muted, không ghi chú thì không có', () => {
    const { container } = render(<PullQuote variant="testimony">“Lời kể”</PullQuote>)
    const bq = container.querySelector('blockquote')!
    expect(bq.className).toContain('border-l-[3px]')
    expect(bq.className).toContain('border-decor-straw')
    expect(container.querySelector('p')?.className).toContain('text-text-muted')
    expect(bq.querySelectorAll('span')).toHaveLength(0)
  })
})

describe('BackLink', () => {
  it('có mũi tên, chữ, href; ẩn từ md; cao tối thiểu 44px', () => {
    render(<BackLink href="/cau-chuyen" label="Câu chuyện" />)
    const a = screen.getByRole('link', { name: /Câu chuyện/ })
    expect(a.getAttribute('href')).toBe('/cau-chuyen')
    expect(a.textContent).toBe('← Câu chuyện')
    expect(a.className).toContain('min-h-11')
    expect(a.className).toContain('md:hidden')
  })
})

describe('NoteBanner', () => {
  it('role=note, chữ đậm + chữ thường, chấm nét đứt', () => {
    const { container } = render(<NoteBanner strong="Mẫu trang." text="Người trong ảnh chưa được hỏi ý." />)
    const note = screen.getByRole('note')
    expect(note.className).toContain('bg-bg-secondary')
    expect(note.querySelector('strong')?.textContent).toBe('Mẫu trang.')
    expect(note.textContent).toContain('Người trong ảnh chưa được hỏi ý.')
    expect(container.querySelector('[aria-hidden="true"]')?.className).toContain('border-dashed')
  })
})

describe('Callout tone dark', () => {
  it('nền xanh làng, eyebrow vàng, chữ sáng, aria-label', () => {
    render(<Callout tone="dark" title="NGUYÊN TẮC CHÂN DUNG" label="Nguyên tắc chân dung">Nội dung</Callout>)
    const aside = screen.getByRole('complementary', { name: 'Nguyên tắc chân dung' })
    expect(aside.className).toContain('bg-bg-inverse')
    expect(aside.className).not.toContain('border-accent')
    expect(screen.getByText('NGUYÊN TẮC CHÂN DUNG').className).toContain('text-accent-on-dark')
  })
  it('mặc định vẫn là light', () => {
    const { container } = render(<Callout title="LƯU Ý">x</Callout>)
    expect(container.firstElementChild!.className).toContain('border-accent')
  })
})

describe('EmptyState body hai bản', () => {
  it('nhận VariantText: bản mobile null thì chỉ có span desktop; không body thì không có dòng chữ', () => {
    const { container, rerender } = render(<EmptyState title="T" body={<VariantText value={{ desktop: 'Bản desktop', mobile: null }} />} />)
    expect(screen.getByText('Bản desktop').className).toContain('max-md:hidden')
    expect(container.querySelector('.md\\:hidden')).toBeNull()
    rerender(<EmptyState title="T" />)
    expect(container.querySelectorAll('span')).toHaveLength(1)
  })
})

describe('EmptyState size lg', () => {
  it('lg: đệm 56px và tiêu đề 32px từ md; md giữ nguyên', () => {
    const { container, rerender } = render(<EmptyState title="Chưa có bài" body="Nội dung" />)
    expect(container.firstElementChild!.className).toContain('p-6')
    rerender(<EmptyState size="lg" title="Chưa có bài" body="Nội dung" action={{ href: '/ket-noi', label: 'Góp một câu chuyện' }} />)
    expect(container.firstElementChild!.className).toContain('md:p-14')
    expect(screen.getByText('Chưa có bài').className).toContain('md:text-[32px]')
    expect(screen.getByRole('link', { name: /Góp một câu chuyện/ })).toBeTruthy()
  })
})

describe('ReadNext', () => {
  const items = [
    { href: '/lang-hoi', eyebrow: 'LÀNG HỚI', title: 'Dòng thời gian làng Hới', cta: 'Xem các mốc →', image: null },
    { href: '/nghe-det-chieu', eyebrow: 'NGHỀ DỆT CHIẾU', title: 'Một tấm chiếu, muôn công đoạn', cta: 'Đi theo hành trình →', image: null },
    { href: '/cau-chuyen', eyebrow: 'CHỦ ĐỀ · BẢN NHÁP', title: 'Bài khác', cta: 'Đọc bài →', image: null, mobile: false },
  ]
  it('không title: giữ hành vi cũ (eyebrow, không h2, không action)', () => {
    render(<ReadNext items={items.slice(0, 2)} eyebrow="ĐỌC TIẾP" />)
    expect(screen.getByText('ĐỌC TIẾP')).toBeTruthy()
    expect(screen.queryByRole('heading', { level: 2 })).toBeNull()
  })
  it('eyebrow của thẻ in hoa bằng CSS (nhãn dữ liệu như chủ đề giữ chữ thường trong view model)', () => {
    render(<ReadNext items={[{ ...items[0], eyebrow: 'Lịch sử · Bản nháp' }]} eyebrow="ĐỌC TIẾP" />)
    expect(screen.getByText('Lịch sử · Bản nháp').className).toContain('uppercase')
  })
  it('có title: h2 và action; eyebrow còn cho mobile', () => {
    render(<ReadNext items={items} eyebrow="ĐỌC TIẾP" title="Đọc tiếp" action={{ href: '/cau-chuyen', label: 'Tất cả câu chuyện' }} />)
    expect(screen.getByRole('heading', { level: 2, name: 'Đọc tiếp' })).toBeTruthy()
    expect(screen.getByRole('link', { name: 'Tất cả câu chuyện' }).getAttribute('href')).toBe('/cau-chuyen')
    expect(screen.getByText('ĐỌC TIẾP').className).toContain('md:hidden')
  })
  it('mục mobile:false có max-md:hidden; mục cuối hiện ở mobile giữ viền dưới', () => {
    const { container } = render(<ReadNext items={items} eyebrow="ĐỌC TIẾP" />)
    const lis = container.querySelectorAll('li')
    expect(lis[2].className).toContain('max-md:hidden')
    expect(lis[0].className).not.toContain('max-md:hidden')
    expect(lis[1].querySelector('a')!.className).toContain('max-md:border-b')
    expect(lis[2].querySelector('a')!.className).not.toContain('max-md:border-b')
  })
  it('mọi mục đều mobile:false thì cả khối ẩn dưới md (không để dải "LIÊN QUAN" trống)', () => {
    const { container, rerender } = render(<ReadNext items={[items[2]]} eyebrow="LIÊN QUAN" title="Liên quan" />)
    expect(container.querySelector('section')!.className).toContain('max-md:hidden')
    rerender(<ReadNext items={items} eyebrow="LIÊN QUAN" title="Liên quan" />)
    expect(container.querySelector('section')!.className).not.toContain('max-md:hidden')
  })
  it('className thêm vào section, nằm trong phạm vi ẩn ở mobile khi không còn mục', () => {
    const { container } = render(<ReadNext items={[items[2]]} eyebrow="LIÊN QUAN" className="mt-10 md:mt-28" />)
    const cls = container.querySelector('section')!.className
    expect(cls).toContain('mt-10 md:mt-28')
    expect(cls).toContain('max-md:hidden')
  })
  it('imageClassName đổi chiều cao ảnh', () => {
    const img = { url: '/x.webp', alt: 'a', width: 10, height: 10, sizes: {}, photographer: null, code: null, docNumber: null, flags: [] as [] }
    const { container } = render(<ReadNext items={[{ ...items[0], image: img }]} eyebrow={null} imageClassName="h-[220px]" />)
    expect(container.querySelector('img')!.className).toContain('h-[220px]')
    expect(container.querySelector('img')!.className).not.toContain('h-[260px]')
  })
})

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

