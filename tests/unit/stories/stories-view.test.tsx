import { afterEach, describe, expect, it } from 'vitest'
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react'
import type { StoriesPageView, StoryCardView } from '@/lib/content'
import { applyMode } from '@/lib/content/copy/applyMode'
import { storiesCopy } from '@/lib/content/copy/stories'
import { StoriesView } from '@/components/stories/StoriesView'

afterEach(cleanup)

const card = (slug: string, title: string, over: Partial<StoryCardView> = {}): StoryCardView => ({
  slug,
  title,
  sapo: `Sapo ${title}`,
  category: 'Lịch sử',
  categoryKey: 'history',
  cover: null,
  readingMinutes: null,
  hasDetail: false,
  cta: 'Xem đề cương →',
  status: 'Chủ đề đề xuất',
  isDraft: false,
  sourceCount: 0,
  flags: [],
  ...over,
})
const draft = card('chuyen-ve-trang-chieu', 'Chuyện về Trạng Chiếu', {
  hasDetail: true,
  cta: 'Đọc bài →',
  status: 'Bản nháp',
  isDraft: true,
  sourceCount: 3,
  readingMinutes: 4,
})
const ideas = [
  card('ky-uc', 'Những ký ức bên khung dệt', { category: 'Ký ức làng quê', categoryKey: 'memory' }),
  card('mot-ngay', 'Một ngày ở làng Hới', {
    category: 'Đời sống hôm nay',
    categoryKey: 'life-today',
  }),
]
const filters = [
  { key: 'all', label: 'Tất cả' },
  { key: 'history', label: 'Lịch sử' },
  { key: 'memory', label: 'Ký ức làng quê' },
  { key: 'life-today', label: 'Đời sống hôm nay' },
]

function view(stories: StoryCardView[], mode: 'public' | 'preview' = 'preview'): StoriesPageView {
  return {
    intro: {
      eyebrow: '02 — CÂU CHUYỆN',
      title: 'Chuyện làng, kể chậm.',
      lead: 'Ký ức, lịch sử và đời sống hôm nay của làng Hới.',
      heroTitle: null,
    },
    stories,
    filters,
    featured: (() => {
      const s = stories.find((x) => x.hasDetail)
      return s
        ? {
            story: s,
            eyebrow: `BÀI NỔI BẬT · ${s.category ?? ''}`,
            meta:
              s.sourceCount > 0 && s.readingMinutes !== null
                ? `${s.sourceCount} nguồn báo chí · khoảng ${s.readingMinutes} phút đọc`
                : null,
          }
        : null
    })(),
    copy: applyMode(storiesCopy, mode),
  }
}

describe('StoriesView', () => {
  it('đếm bản nháp theo isDraft, không theo chữ nhãn trạng thái', () => {
    const relabelled = { ...draft, status: null }
    render(<StoriesView page={view([relabelled, ...ideas])} />)
    expect(screen.getByRole('status').textContent).toContain('3 bài · 1 bản nháp')
  })

  it('có đúng một h1', () => {
    render(<StoriesView page={view([draft, ...ideas])} />)
    expect(screen.getAllByRole('heading', { level: 1 })).toHaveLength(1)
  })

  it('preview: bài nổi bật là bài hasDetail đầu tiên, có meta nguồn và phút đọc', () => {
    render(<StoriesView page={view([...ideas, draft])} />)
    const featured = screen.getByRole('region', { name: 'BÀI NỔI BẬT' })
    expect(within(featured).getByText('BÀI NỔI BẬT · Lịch sử').className).toContain('uppercase')
    expect(within(featured).getByText('Chuyện về Trạng Chiếu')).toBeTruthy()
    expect(within(featured).getByText('3 nguồn báo chí · khoảng 4 phút đọc')).toBeTruthy()
    expect(within(featured).getByRole('link').getAttribute('href')).toBe(
      '/cau-chuyen/chuyen-ve-trang-chieu',
    )
  })

  it('không có bài hasDetail thì không có khối nổi bật', () => {
    render(<StoriesView page={view(ideas, 'public')} />)
    expect(screen.queryByRole('region', { name: 'BÀI NỔI BẬT' })).toBeNull()
  })

  it('thẻ idea không phải link và không có nút Xem đề cương', () => {
    const { container } = render(<StoriesView page={view(ideas, 'public')} />)
    expect(container.querySelectorAll('article')).toHaveLength(2)
    expect(container.querySelector('a[href^="/cau-chuyen"]')).toBeNull()
    expect(screen.queryByText('Xem đề cương →')).toBeNull()
  })

  it('thẻ có trang chi tiết là link tới /cau-chuyen/{slug}', () => {
    const { container } = render(<StoriesView page={view([draft])} />)
    const cardLinks = [...container.querySelectorAll('a[href="/cau-chuyen/chuyen-ve-trang-chieu"]')]
    expect(cardLinks).toHaveLength(2) // nổi bật + lưới
  })

  it('đếm: preview "N bài · M bản nháp", public chỉ "N bài"', () => {
    const { unmount } = render(<StoriesView page={view([draft, ...ideas])} />)
    expect(screen.getByRole('status').textContent).toContain('3 bài · 1 bản nháp')
    unmount()
    render(<StoriesView page={view(ideas, 'public')} />)
    expect(screen.getByRole('status').textContent).toContain('2 bài')
    expect(screen.getByRole('status').textContent).not.toContain('bản nháp')
  })

  it('bấm chip lọc theo chủ đề, aria-pressed đổi', () => {
    render(<StoriesView page={view([draft, ...ideas])} />)
    fireEvent.click(screen.getByRole('button', { name: 'Lịch sử' }))
    expect(screen.getByRole('button', { name: 'Lịch sử' }).getAttribute('aria-pressed')).toBe(
      'true',
    )
    expect(screen.getByRole('status').textContent).toContain('1 bài')
  })

  it('tìm không dấu "trang chieu" ra 1 kết quả; "zzz" ra khung trống', () => {
    render(<StoriesView page={view([draft, ...ideas])} />)
    const box = screen.getAllByLabelText('Tìm trong câu chuyện')[0]
    fireEvent.change(box, { target: { value: 'trang chieu' } })
    expect(screen.getByRole('status').textContent).toContain('1 bài')
    fireEvent.change(box, { target: { value: 'zzz' } })
    expect(screen.getByText('Chưa có bài trong chủ đề này')).toBeTruthy()
    expect(screen.getByRole('status').textContent).toContain('0 bài')
  })

  it('hai ô tìm (đầu trang desktop, trong danh sách mobile) dùng chung một từ khoá', () => {
    render(<StoriesView page={view([draft, ...ideas])} />)
    const boxes = screen.getAllByLabelText('Tìm trong câu chuyện') as HTMLInputElement[]
    expect(boxes).toHaveLength(2)
    fireEvent.change(boxes[1], { target: { value: 'khung det' } })
    expect(boxes[0].value).toBe('khung det')
  })

  it('không có bài nào thì hiện EmptyState', () => {
    render(<StoriesView page={view([], 'public')} />)
    expect(screen.getByText('Chưa có bài trong chủ đề này')).toBeTruthy()
    expect(screen.getByRole('link', { name: 'Góp một câu chuyện' }).getAttribute('href')).toBe(
      '/ket-noi',
    )
    expect(screen.getByRole('status').textContent).toContain('0 bài')
  })
})
