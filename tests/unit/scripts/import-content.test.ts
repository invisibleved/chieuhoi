import { describe, expect, it } from 'vitest'
import type { ContentReport } from '@/seed/importContent'
import { formatContentReport } from '@/scripts/import-content'

const base: ContentReport = {
  sourcesCreated: [],
  sourcesSkipped: [],
  created: [],
  existing: [],
  globals: [
    { slug: 'page-intros', filled: [], saved: 'none' },
    { slug: 'site-settings', filled: [], saved: 'none' },
  ],
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
  it('in global lưu nháp và cảnh báo', () => {
    const out = formatContentReport({
      ...base,
      globals: [
        { slug: 'page-intros', filled: ['lang-hoi'], saved: 'draft', warning: 'Đang có bản nháp chưa đăng' },
        { slug: 'site-settings', filled: [], saved: 'none' },
      ],
    })
    const line = out.split('\n').find((l) => l.includes('Phần mở đầu trang'))!
    expect(line).toContain('bản nháp')
    expect(out.split('\n').some((l) => l.startsWith('Lưu ý:'))).toBe(true)
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
      globals: [{ slug: 'page-intros', filled: [], saved: 'none', warning: 'w' }],
    })
    expect(out.trim()).toBe('Không có gì để nhập.')
  })
  it('nguồn mới tạo vẫn tính là có việc', () => {
    expect(formatContentReport({ ...base, sourcesCreated: ['a'] })).not.toContain('Không có gì để nhập.')
  })
})
