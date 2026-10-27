import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { ShotNeeded } from '@/components/content/ShotNeeded'
import { Callout } from '@/components/ui/Callout'
import { Eyebrow } from '@/components/ui/Eyebrow'
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

describe('FactList', () => {
  it('dl > div > dt + dd', () => {
    const { container } = render(<FactList items={[{ term: 'Nơi dệt', detail: 'Hải Triều' }, { term: 'Chất liệu', detail: 'Cói' }]} />)
    const divs = container.querySelectorAll('dl > div')
    expect(divs).toHaveLength(2)
    expect(divs[0].querySelector('dt + dd')).not.toBeNull()
    expect(divs[0].className).toContain('border-border-strong')
    expect(divs[1].className).toContain('border-border-soft')
  })
})
