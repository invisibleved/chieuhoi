import { readFileSync } from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'

import { GUIDE_SECTIONS, guideTextParts, sectionsFor } from '@/admin/guide/sections'
import { GUIDE_SHOTS } from '@/admin/guide/shots'

const labels = JSON.parse(readFileSync(path.resolve('public/admin-guide/labels.json'), 'utf8')) as Record<string, string>

const ALL = [
  'Đăng nhập',
  'Tải ảnh lên',
  'Viết một bài',
  'Thêm người hoặc sản phẩm',
  'Xem trước bài trên trang',
  'Gửi bài cho người duyệt',
  'Quên mật khẩu',
  'Khi gặp lỗi',
]
const REVIEWER = ['Xem bài chờ duyệt', 'Đánh dấu quyền dùng ảnh và sự đồng ý', 'Đăng bài', 'Tạo tài khoản cho người mới']
const FORBIDDEN = ['slug', 'collection', 'cms', 'đường dẫn', 'field']

const bolds = (text: string) => [...text.matchAll(/\*\*(.+?)\*\*/g)].map((m) => m[1])

describe('GUIDE_SECTIONS', () => {
  it('có 12 mục, id duy nhất', () => {
    expect(GUIDE_SECTIONS).toHaveLength(12)
    expect(new Set(GUIDE_SECTIONS.map((s) => s.id)).size).toBe(12)
  })

  it('8 mục cho mọi người rồi 4 mục cho người duyệt, đúng thứ tự spec', () => {
    expect(GUIDE_SECTIONS.filter((s) => s.audience === 'all').map((s) => s.title)).toEqual(ALL)
    expect(GUIDE_SECTIONS.filter((s) => s.audience === 'reviewer').map((s) => s.title)).toEqual(REVIEWER)
    expect(GUIDE_SECTIONS.map((s) => s.title)).toEqual([...ALL, ...REVIEWER])
  })

  it('mỗi mục mở đầu bằng câu "Dùng khi…" và có ít nhất một bước', () => {
    for (const s of GUIDE_SECTIONS) {
      expect(s.when, s.id).toMatch(/^Dùng khi /)
      expect(s.steps.length, s.id).toBeGreaterThan(0)
    }
  })

  it('mọi ảnh có trong GUIDE_SHOTS, và mọi ảnh trong GUIDE_SHOTS đều được dùng', () => {
    const ids = new Set(GUIDE_SHOTS.map((s) => s.id))
    const used = GUIDE_SECTIONS.flatMap((s) => s.steps.flatMap((st) => (st.shot ? [st.shot] : [])))
    for (const shot of used) expect(ids.has(shot), shot).toBe(true)
    expect(new Set(used)).toEqual(ids)
  })

  it('chữ in đậm ở bước có ảnh khớp trọn một dòng chữ trên ảnh chụp (labels.json)', () => {
    for (const s of GUIDE_SECTIONS) {
      for (const st of s.steps) {
        if (!st.shot) continue
        const lines = (labels[st.shot] ?? '').split('\n').map((l) => l.trim())
        for (const b of bolds(st.text)) expect(lines, `${s.id}/${st.shot}: ${b}`).toContain(b)
      }
    }
  })

  it('không dùng từ kỹ thuật', () => {
    for (const s of GUIDE_SECTIONS) {
      for (const t of [s.title, s.when, ...s.steps.map((st) => st.text)]) {
        for (const w of FORBIDDEN) expect(t.toLowerCase(), `${s.id}: ${t}`).not.toContain(w)
      }
    }
  })

  it('mục Quên mật khẩu bảo nhờ người duyệt', () => {
    const s = GUIDE_SECTIONS.find((x) => x.title === 'Quên mật khẩu')!
    expect([s.when, ...s.steps.map((st) => st.text)].join(' ')).toContain('nhờ người duyệt')
  })

  it('mục Viết một bài có bước nói ô nào có thể bỏ trống', () => {
    const s = GUIDE_SECTIONS.find((x) => x.title === 'Viết một bài')!
    expect(s.steps.some((st) => st.text.includes('bỏ trống'))).toBe(true)
  })

  it('mục Gửi bài cho người duyệt chọn Chờ duyệt ở Quy trình rồi bấm Lưu bản nháp', () => {
    const text = GUIDE_SECTIONS.find((x) => x.title === 'Gửi bài cho người duyệt')!.steps.map((st) => st.text).join(' ')
    expect(text).toContain('**Quy trình**')
    expect(text).toContain('**Chờ duyệt**')
    expect(text).toContain('**Lưu bản nháp**')
  })

  it('dấu ** luôn đi thành cặp', () => {
    for (const s of GUIDE_SECTIONS) for (const st of s.steps) expect(st.text.split('**').length % 2, st.text).toBe(1)
  })
})

describe('sectionsFor', () => {
  it('biên tập viên chỉ thấy 8 mục cho mọi người', () => {
    expect(sectionsFor({ role: 'editor' }).map((s) => s.title)).toEqual(ALL)
    expect(sectionsFor(null).map((s) => s.title)).toEqual(ALL)
  })

  it('người duyệt thấy đủ 12 mục', () => {
    expect(sectionsFor({ role: 'reviewer' })).toHaveLength(12)
  })
})

describe('guideTextParts', () => {
  it('tách chữ thường và chữ in đậm', () => {
    expect(guideTextParts('Bấm **Lưu** rồi **Đóng**.')).toEqual([
      { text: 'Bấm ', bold: false },
      { text: 'Lưu', bold: true },
      { text: ' rồi ', bold: false },
      { text: 'Đóng', bold: true },
      { text: '.', bold: false },
    ])
  })

  it('không có dấu ** thì trả nguyên câu', () => {
    expect(guideTextParts('Một câu.')).toEqual([{ text: 'Một câu.', bold: false }])
  })
})
