import { describe, expect, it } from 'vitest'
import type { ContentReport } from '@/seed/importContent'
import { formatContentReport } from '@/scripts/import-content'

const base: ContentReport = {
  sourcesCreated: [],
  sourcesSkipped: [],
  created: [],
  existing: [],
  pages: [],
  globals: [{ slug: 'site-settings', filled: [], saved: 'none' }],
}

const seven = Array.from({ length: 7 }, (_, i) => ({ collection: 'timeline-events' as const, key: String(i + 1) }))

describe('formatContentReport', () => {
  it('in số bản ghi đã tạo theo nhãn tiếng Việt và nhắc người duyệt đăng', () => {
    const out = formatContentReport({
      ...base,
      sourcesCreated: ['a-1'],
      created: [
        ...seven,
        { collection: 'craft-steps', key: 'chuan-bi' },
        { collection: 'products', key: 'chieu-1' },
        { collection: 'stories', key: 'bai-1' },
      ],
    })
    expect(out).toContain('Dòng thời gian: tạo 7')
    expect(out).toContain('Công đoạn: tạo 1')
    expect(out).toContain('Sản phẩm: tạo 1')
    expect(out).toContain('Bài viết: tạo 1')
    expect(out).toContain('Đã tạo nguồn: a-1')
    const last = out.trim().split('\n').at(-1)!
    expect(last).toContain('/admin')
    expect(last).toContain('đăng')
  })
  it('báo mục đã có sẵn', () => {
    const out = formatContentReport({
      ...base,
      created: [{ collection: 'stories', key: 'b' }],
      existing: [{ collection: 'products', key: 'x' }],
    })
    expect(out).toMatch(/Sản phẩm.*đã có sẵn 1/)
  })
  it('in từng trang lưu nháp, kèm cảnh báo ngay dưới trang đó', () => {
    const out = formatContentReport({
      ...base,
      pages: [
        { slug: 'lang-hoi', filled: ['title', 'facts'], saved: 'draft', warning: 'Đang có bản nháp chưa đăng' },
        { slug: 'nghe-det-chieu', filled: ['tools'], saved: 'draft' },
      ],
    })
    const lines = out.split('\n')
    expect(out).not.toContain('Phần mở đầu trang')
    const i = lines.indexOf('Trang Làng Hới: đã điền title, facts và lưu bản nháp')
    expect(i).toBeGreaterThanOrEqual(0)
    expect(lines[i + 1]).toBe('Lưu ý: Đang có bản nháp chưa đăng')
    expect(lines).toContain('Trang Nghề dệt chiếu: đã điền tools và lưu bản nháp')
  })
  it('trang chủ không bị lặp chữ "Trang"', () => {
    const out = formatContentReport({ ...base, pages: [{ slug: 'home', filled: ['heroTitle'], saved: 'draft' }] })
    expect(out).toContain('Trang chủ: đã điền heroTitle và lưu bản nháp')
    expect(out).not.toContain('Trang Trang')
  })
  it('in global Thông tin site lưu nháp', () => {
    const out = formatContentReport({
      ...base,
      globals: [{ slug: 'site-settings', filled: ['tagline'], saved: 'draft' }],
    })
    expect(out).toContain('Thông tin site: đã điền tagline và lưu bản nháp')
  })
  it('không tạo gì thì chỉ báo không có gì để nhập', () => {
    const out = formatContentReport(base)
    expect(out).toContain('Không có gì để nhập.')
    expect(out).not.toContain('/admin')
    expect(out.trim()).toBe('Không có gì để nhập.')
  })
  it('đã có sẵn hết thì vẫn chỉ in một dòng, và không khen global có bản nháp treo', () => {
    const out = formatContentReport({
      ...base,
      existing: [{ collection: 'products', key: 'x' }],
      globals: [{ slug: 'site-settings', filled: [], saved: 'none', warning: 'w' }],
    })
    expect(out.trim()).toBe('Không có gì để nhập.')
  })
  it('nguồn mới tạo vẫn tính là có việc', () => {
    expect(formatContentReport({ ...base, sourcesCreated: ['a'] })).not.toContain('Không có gì để nhập.')
  })
})
