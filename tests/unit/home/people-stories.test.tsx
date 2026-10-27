import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { PeopleTeaser } from '@/components/home/PeopleTeaser'
import { StoriesTeaser } from '@/components/home/StoriesTeaser'
import type { PersonView, StoryCardView } from '@/lib/content'

const p = (slug: string, over: Partial<PersonView> = {}): PersonView => ({
  slug, category: 'Nghệ nhân', categoryKey: 'artisan', role: null, name: `Tên ${slug}`, note: null, portrait: null, quote: null, consentPending: false, flags: [], ...over,
})
const s = (slug: string, over: Partial<StoryCardView> = {}): StoryCardView => ({
  slug, title: `Bài ${slug}`, sapo: null, category: null, categoryKey: null, cover: null, readingMinutes: null, hasDetail: true, cta: over.hasDetail === false ? 'Xem đề cương →' : 'Đọc bài →', status: null, sourceCount: 0, flags: [], ...over,
})
const hrefs = () => screen.getAllByRole('link').map((a) => a.getAttribute('href'))

describe('PeopleTeaser', () => {
  it('tối đa 3 người, CTA Đọc câu chuyện →, link Gặp những người làng Hới', () => {
    render(<PeopleTeaser people={[p('a'), p('b'), p('c'), p('d')]} />)
    expect(screen.getAllByText('Đọc câu chuyện →')).toHaveLength(3)
    expect(screen.queryByText('Tên d')).toBeNull()
    expect(hrefs()).toContain('/con-nguoi/a')
    expect(screen.getByRole('link', { name: /Gặp những người làng Hới/ }).getAttribute('href')).toBe('/con-nguoi')
  })
  it('gợi ý vuốt chỉ khi từ 2 người, không có bộ đếm', () => {
    const { unmount } = render(<PeopleTeaser people={[p('a')]} />)
    expect(screen.queryByText('Vuốt ngang để xem thêm')).toBeNull()
    unmount()
    render(<PeopleTeaser people={[p('a'), p('b')]} />)
    expect(screen.getByText('Vuốt ngang để xem thêm')).toBeTruthy()
  })
  it('rỗng thì không render', () => {
    const { container } = render(<PeopleTeaser people={[]} />)
    expect(container.innerHTML).toBe('')
  })
})

describe('StoriesTeaser', () => {
  it('bài nổi bật là bài có trang; idea trỏ /cau-chuyen; ghi chú đề xuất hiện', () => {
    render(<StoriesTeaser stories={[s('y1', { hasDetail: false, status: 'Chủ đề đề xuất', flags: ['unpublished'] }), s('d1', { status: 'Bản nháp', flags: ['unpublished'] })]} />)
    const links = hrefs()
    expect(links).toContain('/cau-chuyen')
    expect(links).toContain('/cau-chuyen/d1')
    expect(links).not.toContain('/cau-chuyen/y1')
    expect(screen.getByText('Chủ đề biên tập đề xuất — bài viết chưa được soạn.')).toBeTruthy()
  })
  it('dữ liệu kiểu public (không flag, hasDetail false) vẫn có ghi chú', () => {
    render(<StoriesTeaser stories={[s('d1'), s('y1', { hasDetail: false })]} />)
    expect(screen.getByText('Chủ đề biên tập đề xuất — bài viết chưa được soạn.')).toBeTruthy()
  })
  it('tất cả là chủ đề đề xuất (kể cả bài nổi bật) vẫn có ghi chú', () => {
    render(<StoriesTeaser stories={[s('y1', { hasDetail: false })]} />)
    expect(screen.getByText('Chủ đề biên tập đề xuất — bài viết chưa được soạn.')).toBeTruthy()
  })
  it('chỉ thẻ gọn thứ 3 (ẩn ở mobile) là đề xuất thì ghi chú ẩn ở mobile', () => {
    render(<StoriesTeaser stories={[s('d1'), s('d2'), s('d3'), s('y1', { hasDetail: false })]} />)
    expect(screen.getByText('Chủ đề biên tập đề xuất — bài viết chưa được soạn.').className).toContain('max-md:hidden')
  })
  it('không có bài gọn thiếu trang thì không có ghi chú', () => {
    render(<StoriesTeaser stories={[s('d1'), s('d2')]} />)
    expect(screen.queryByText(/Chủ đề biên tập đề xuất/)).toBeNull()
  })
  it('rỗng thì không render', () => {
    const { container } = render(<StoriesTeaser stories={[]} />)
    expect(container.innerHTML).toBe('')
  })
})
