import { afterEach, describe, expect, it } from 'vitest'
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react'
import type { PeoplePageView, PersonView } from '@/lib/content'
import { applyMode } from '@/lib/content/copy/applyMode'
import { peopleCopy } from '@/lib/content/copy/people'
import { personCategoryOptions } from '@/lib/content/categories'
import { PeopleView } from '@/components/people/PeopleView'
import { PortraitCard } from '@/components/content/PortraitCard'

afterEach(cleanup)

const keys = ['artisan', 'craft-family', 'craft-keeper', 'craft-family', 'craft-keeper', 'village-bound', 'artisan', 'village-bound']
const person = (i: number, over: Partial<PersonView> = {}): PersonView => ({
  slug: `nguoi-${i}`,
  category: personCategoryOptions.find((o) => o.key === keys[i])?.label ?? null,
  categoryKey: keys[i],
  role: null,
  name: null,
  note: null,
  portrait: null,
  quote: null,
  consentPending: true,
  flags: [],
  ...over,
})
const people = keys.map((_, i) => person(i))

function view(list: PersonView[], mode: 'public' | 'preview' = 'public'): PeoplePageView {
  return {
    intro: {
      eyebrow: '04 — CON NGƯỜI',
      title: 'Những bàn tay\ngiữ hồn làng.',
      lead: 'Người dệt, người in hoa.',
      heroTitle: null,
    },
    people: list,
    filters: [{ key: 'all', label: 'Tất cả' }, ...personCategoryOptions],
    copy: applyMode(peopleCopy, mode),
  }
}

const grid = () => screen.getAllByRole('link').filter((a) => a.getAttribute('href')?.startsWith('/con-nguoi/'))

describe('PeopleView', () => {
  it('một h1, 6 chip lọc', () => {
    render(<PeopleView page={view(people)} />)
    expect(screen.getAllByRole('heading', { level: 1 })).toHaveLength(1)
    expect(screen.getAllByRole('button', { pressed: false }).length + screen.getAllByRole('button', { pressed: true }).length).toBe(6)
  })

  it('đếm: tất cả đang chờ đồng ý', () => {
    render(<PeopleView page={view(people)} />)
    const status = screen.getByRole('status').textContent
    expect(status).toContain('8 chân dung · tất cả đang chờ đồng ý')
    expect(status).toContain('8 chân dung · đang chờ đồng ý')
  })

  it('có người đã đồng ý thì chỉ "N chân dung"', () => {
    render(<PeopleView page={view([person(0, { consentPending: false, name: 'Bà A' }), person(1)])} />)
    expect(screen.getByRole('status').textContent).toBe('2 chân dung')
  })

  it('lọc nhóm không có ai hiện khung trống', () => {
    render(<PeopleView page={view(people)} />)
    fireEvent.click(screen.getByRole('button', { name: 'Thế hệ trẻ' }))
    expect(screen.getByText('Chưa có chân dung trong nhóm này')).toBeTruthy()
    expect(screen.getByRole('status').textContent).toContain('0 chân dung')
    expect(grid()).toHaveLength(0)
  })

  it('lọc "Nghệ nhân" còn 2 thẻ, aria-pressed đổi', () => {
    render(<PeopleView page={view(people)} />)
    const chip = screen.getByRole('button', { name: 'Nghệ nhân' })
    fireEvent.click(chip)
    expect(chip.getAttribute('aria-pressed')).toBe('true')
    expect(grid()).toHaveLength(2)
  })

  it('thẻ thứ 2 và thứ 4 của mỗi hàng desktop lùi xuống (md:mt-12)', () => {
    render(<PeopleView page={view(people)} />)
    const flags = grid().map((a) => a.className.includes('md:mt-12'))
    expect(flags).toEqual([false, true, false, true, false, true, false, true])
  })

  it('public: không có tên, vai trò hay ghi chú; ảnh không có alt', () => {
    const { container } = render(<PeopleView page={view(people)} />)
    expect(container.textContent).not.toMatch(/\[|cần xác minh/)
    expect(container.querySelectorAll('img:not([alt=""])')).toHaveLength(0)
    expect(screen.getAllByText('Chờ đồng ý').length).toBeGreaterThanOrEqual(8)
  })

  it('preview: thẻ hiện ghi chú (note), không hiện vai trò', () => {
    render(<PeopleView page={view([person(0, { note: 'Dệt chiếu tay · cần xác minh', role: 'Vai trò X' })], 'preview')} />)
    expect(screen.getByText('Dệt chiếu tay · cần xác minh')).toBeTruthy()
    expect(screen.queryByText('Vai trò X')).toBeNull()
    expect(screen.getByText(/Ảnh dưới đây lấy từ bộ ảnh tham khảo/)).toBeTruthy()
  })

  it('public: không có câu về ảnh tham khảo; có khung nguyên tắc và khối mời tới /ket-noi', () => {
    render(<PeopleView page={view(people)} />)
    expect(screen.queryByText(/bộ ảnh tham khảo/)).toBeNull()
    const aside = screen.getByRole('complementary', { name: 'Nguyên tắc chân dung' })
    expect(within(aside).getByText('Lời trích chỉ đăng khi có ghi âm hoặc ghi chép gốc.')).toBeTruthy()
    const invite = screen.getByRole('link', { name: 'Giới thiệu một người' })
    expect(invite.getAttribute('href')).toBe('/ket-noi')
    expect(screen.getByRole('heading', { level: 2, name: 'Bạn biết một người giữ nghề?' })).toBeTruthy()
  })
})

describe('PortraitCard detail', () => {
  const p = person(0, { role: 'Vai trò X', note: 'Ghi chú Y' })
  it('mặc định hiện role', () => {
    render(<PortraitCard person={p} href="#" />)
    expect(screen.getByText('Vai trò X')).toBeTruthy()
    expect(screen.queryByText('Ghi chú Y')).toBeNull()
  })
  it('detail="note" hiện note thay role', () => {
    render(<PortraitCard person={p} href="#" detail="note" />)
    expect(screen.getByText('Ghi chú Y')).toBeTruthy()
    expect(screen.queryByText('Vai trò X')).toBeNull()
  })
  it('size="fluid" và className được áp lên link', () => {
    render(<PortraitCard person={p} href="#" size="fluid" className="md:mt-12" />)
    expect(screen.getByRole('link').className).toContain('md:mt-12')
  })
})
