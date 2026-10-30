import { describe, expect, it } from 'vitest'
import type { ImportReport } from '@/seed/pageFacts'
import { formatReport } from '@/scripts/import-page-facts'

const base: ImportReport = { sourcesCreated: [], sourcesSkipped: [], filled: [], skipped: [], saved: 'none' }

describe('formatReport', () => {
  it('in nguồn, nhóm đã điền, nhóm bỏ qua và hướng dẫn sau khi lưu nháp', () => {
    const out = formatReport({
      ...base,
      sourcesCreated: ['vietnamplus-2026', 'bao-2020'],
      sourcesSkipped: ['x-1'],
      filled: ['craft.steps'],
      skipped: [{ group: 'lang-hoi.location', reason: 'đã có dữ liệu' }],
      saved: 'draft',
    })
    expect(out).toContain('Đã tạo nguồn: vietnamplus-2026, bao-2020')
    expect(out).toContain('Đã có sẵn nguồn: x-1')
    expect(out).toContain('Đã điền nhóm: craft.steps')
    expect(out).toContain('Bỏ qua nhóm lang-hoi.location: đã có dữ liệu')
    expect(out).toContain('Đã lưu bản nháp. Người duyệt vào /admin › Phần mở đầu trang để xem và đăng.')
  })
  it('không có gì để nhập', () => {
    expect(formatReport(base)).toContain('Không có gì để nhập.')
  })
  it('in cảnh báo khi có', () => {
    expect(formatReport({ ...base, warning: 'Cẩn thận' })).toContain('Cẩn thận')
  })
})
