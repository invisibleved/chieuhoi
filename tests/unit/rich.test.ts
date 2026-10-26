// @vitest-environment node
import { describe, expect, it } from 'vitest'

import { sanitizeRich } from '@/lib/content/rich'

const txt = (text: string) => ({ type: 'text', version: 1, text, format: 0, mode: 'normal', style: '', detail: 0 })
const para = (...children: unknown[]) => ({ type: 'paragraph', version: 1, direction: 'ltr', format: '', indent: 0, children })
const doc = (...children: unknown[]) => ({
  root: { type: 'root', version: 1, direction: 'ltr', format: '', indent: 0, children },
})

describe('sanitizeRich và [cần xác minh]', () => {
  const marked = doc(para(txt('Mở đầu '), txt('[cần  xác minh]')), para(txt('Đoạn khác')))

  it('public: trường có dấu ở bất kỳ nút chữ nào thì ẩn cả trường', () => {
    expect(sanitizeRich(marked, new Map(), 'public')).toBeNull()
  })
  it('public: dấu bị tách qua nhiều nút chữ vẫn bị bắt', () => {
    const split = doc(para(txt('[cần '), txt('xác minh]')))
    expect(sanitizeRich(split, new Map(), 'public')).toBeNull()
  })
  it('public: không có dấu thì giữ', () => {
    expect(sanitizeRich(doc(para(txt('Ổn'))), new Map(), 'public')).not.toBeNull()
  })
  it('preview: giữ nguyên', () => {
    expect(JSON.stringify(sanitizeRich(marked, new Map(), 'preview'))).toContain('[cần  xác minh]')
  })
})
