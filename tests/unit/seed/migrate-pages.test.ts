import { describe, expect, it } from 'vitest'

import { pageFromGlobal, samePageContent } from '@/seed/migratePages'
import { formatCheck, formatMigrateReport, parseArgs } from '@/scripts/migrate-pages'

const hasId = (v: unknown): boolean =>
  Array.isArray(v)
    ? v.some(hasId)
    : !!v && typeof v === 'object' && (Object.hasOwn(v, 'id') || Object.values(v).some(hasId))

describe('pageFromGlobal', () => {
  it('chuyển ảnh ô tool-n vào dòng dụng cụ thứ n và bỏ id của dòng', () => {
    const page = pageFromGlobal(
      {
        media: [{ id: 'a', slot: 'tool-2', image: 8 }, { id: 'b', slot: 'hero', image: 3 }],
        tools: [{ id: 't1', name: 'Khung' }, { id: 't2', name: 'Go' }],
      },
      'nghe-det-chieu',
    )
    const tools = page.tools as { name: string; image?: unknown }[]
    const media = page.media as { slot: string }[]
    expect(tools[1].image).toBe(8)
    expect(tools[0].image ?? null).toBeNull()
    expect(media.map((m) => m.slot)).toEqual(['hero'])
    expect(hasId(page)).toBe(false)
  })

  it('chỉ chép trường chung và trường của trang đó', () => {
    const page = pageFromGlobal({ facts: [{ term: 'x' }], heroTitle: 'h' }, 'home')
    expect(page.heroTitle).toBe('h')
    expect(page).not.toHaveProperty('facts')
  })

  it('không tạo khoá nhóm của trang khác', () => {
    const page = pageFromGlobal({ title: 't', founder: { noPortrait: 'x' }, hand: { title: 'y' } }, 'lang-hoi')
    expect(page.founder).toEqual({ noPortrait: 'x' })
    expect(page).not.toHaveProperty('hand')
  })

  it('đưa giá trị quan hệ đã nạp về id số', () => {
    const page = pageFromGlobal(
      {
        pageSources: [{ id: 4, title: 'Báo' }, 5],
        facts: [{ id: 'r', term: 't', detail: 'd', sources: [{ id: 4 }, '6'] }],
        media: [{ slot: 'hero', image: { id: 9, url: '/x.webp' } }],
      },
      'lang-hoi',
    )
    expect(page.pageSources).toEqual([4, 5])
    expect((page.facts as { sources: unknown }[])[0].sources).toEqual([4, 6])
    expect((page.media as { image: unknown }[])[0].image).toBe(9)
  })

  it('nhóm trống thì trả đối tượng trống', () => {
    expect(pageFromGlobal(undefined, 'thu-vien')).toEqual({})
  })
})

describe('samePageContent', () => {
  const a = { title: 'T', facts: [{ id: 'x1', term: 'Diện tích', detail: '1 km²', sources: [1] }] }

  it('bằng nhau khi chỉ khác id của dòng và các khoá bỏ qua', () => {
    const b = {
      id: 7, slug: 'lang-hoi', _status: 'published', workflow: 'published', createdAt: '1', updatedAt: '2',
      title: 'T', facts: [{ id: 'y9', term: 'Diện tích', detail: '1 km²', sources: [1] }],
    }
    expect(samePageContent(a, b)).toBe(true)
  })

  it('khác nhau khi một detail khác', () => {
    const b = { title: 'T', facts: [{ id: 'x1', term: 'Diện tích', detail: '2 km²', sources: [1] }] }
    expect(samePageContent(a, b)).toBe(false)
  })

  it('null, thiếu khoá và mảng trống coi như nhau', () => {
    expect(samePageContent({ title: 'T', lead: null, media: [] }, { title: 'T' })).toBe(true)
    expect(samePageContent({ tools: [{ name: 'Go' }] }, { tools: [{ name: 'Go', image: null }] })).toBe(true)
  })

  it('thứ tự dòng có nghĩa', () => {
    expect(samePageContent({ pageSources: [1, 2] }, { pageSources: [2, 1] })).toBe(false)
  })
})

describe('báo cáo CLI', () => {
  it('in mỗi trang một dòng và các câu trích ngoài danh sách nguồn', () => {
    const out = formatMigrateReport(
      {
        pages: [
          { slug: 'home', action: 'created-published', rows: 2, citations: 0 },
          { slug: 'lang-hoi', action: 'created-published+draft', rows: 9, citations: 4 },
          { slug: 'thu-vien', action: 'skipped', rows: 0, citations: 0 },
        ],
        sourceIssues: [{ slug: 'lang-hoi', missing: [{ where: 'Vị trí', sourceIds: [3] }] }],
      },
      new Map([[3, 'bao-1']]),
    )
    expect(out).toContain('Trang chủ: đã tạo và đăng, 2 dòng, 0 chú thích')
    expect(out).toContain('Làng Hới: đã tạo và đăng, kèm bản nháp mới hơn, 9 dòng, 4 chú thích')
    expect(out).toContain('Thư viện: bỏ qua (đã có), 0 dòng, 0 chú thích')
    expect(out).toContain('Câu trích nguồn chưa có trong Nguồn tham khảo của trang (cần sửa trong admin):')
    expect(out).toContain('Làng Hới: Vị trí (bao-1)')
  })

  it('--check in từng khác biệt hoặc báo không có', () => {
    expect(formatCheck([])).toBe('Không có khác biệt.')
    expect(formatCheck([
      { slug: 'lang-hoi', state: 'published', reason: 'different' },
      { slug: 'home', state: 'draft', reason: 'missing' },
    ])).toBe('lang-hoi (published): khác\nhome (draft): thiếu')
  })
})

describe('parseArgs', () => {
  it('nhận --check, --replace hoặc không cờ', () => {
    expect(parseArgs([])).toEqual({ check: false, replace: false })
    expect(parseArgs(['--check'])).toEqual({ check: true, replace: false })
    expect(parseArgs(['--replace'])).toEqual({ check: false, replace: true })
  })

  it('cờ lạ hoặc cả hai cờ thì lỗi', () => {
    expect(() => parseArgs(['--repalce'])).toThrow('Cờ không hợp lệ: --repalce')
    expect(() => parseArgs(['--check', '--replace'])).toThrow('Không dùng --check cùng --replace.')
  })
})
