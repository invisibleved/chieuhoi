import { describe, expect, it } from 'vitest'
import type { ImportReport } from '@/seed/pageFacts'
import { formatReport } from '@/scripts/import-page-facts'

const base: ImportReport = { sourcesCreated: [], sourcesSkipped: [], filled: [], skipped: [], pages: [] }

describe('formatReport', () => {
  it('in nguồn, từng trang đã điền, nhóm bỏ qua và hướng dẫn sau khi lưu nháp', () => {
    const out = formatReport({
      ...base,
      sourcesCreated: ['vietnamplus-2026', 'bao-2020'],
      sourcesSkipped: ['x-1'],
      filled: ['lang-hoi.facts', 'lang-hoi.heritage'],
      skipped: [{ group: 'lang-hoi.location', reason: 'đã có dữ liệu' }],
      pages: [{ slug: 'lang-hoi', filled: ['facts', 'heritage'], saved: 'draft' }],
    })
    expect(out).toContain('Đã tạo nguồn: vietnamplus-2026, bao-2020')
    expect(out).toContain('Đã có sẵn nguồn: x-1')
    expect(out).toContain('Trang Làng Hới: đã điền facts, heritage và lưu bản nháp')
    expect(out).toContain('Bỏ qua nhóm lang-hoi.location: đã có dữ liệu')
    expect(out).not.toContain('Phần mở đầu trang')
    expect(out.trim().split('\n').at(-1)).toBe('Người duyệt vào /admin › Trang để xem và đăng.')
  })
  it('trang đã đăng thì báo đã đăng, không nhắc người duyệt', () => {
    const out = formatReport({ ...base, pages: [{ slug: 'nghe-det-chieu', filled: ['tools'], saved: 'published' }] })
    expect(out).toContain('Trang Nghề dệt chiếu: đã điền tools và đăng')
    expect(out).not.toContain('/admin')
  })
  it('không có gì để nhập', () => {
    expect(formatReport(base)).toContain('Không có gì để nhập.')
  })
  it('in cảnh báo của trang khi có', () => {
    const out = formatReport({
      ...base, pages: [{ slug: 'lang-hoi', filled: ['facts'], saved: 'draft', warning: 'Cẩn thận' }],
    })
    expect(out).toContain('Lưu ý: Cẩn thận')
  })
})
