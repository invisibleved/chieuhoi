import { describe, expect, it } from 'vitest'

import { applyMode } from '@/lib/content/copy/applyMode'
import { craftCopy } from '@/lib/content/copy/craft'
import { villageCopy } from '@/lib/content/copy/village'

describe('applyMode', () => {
  it('public: copy craft không còn chữ quy trình hay dấu chờ xác minh', () => {
    const json = JSON.stringify(applyMode(craftCopy, 'public'))
    for (const banned of ['cần xác minh', 'chờ xác minh', 'CẦN GHI LẠI', 'sẽ được xác minh', 'Chờ dữ liệu địa lý']) {
      expect(json).not.toContain(banned)
    }
  })
  it('public: copy village không còn ghi chú quy trình', () => {
    const json = JSON.stringify(applyMode(villageCopy, 'public'))
    for (const banned of ['cần xác minh', 'BẢN ĐỒ VỊ TRÍ', 'Chờ dữ liệu địa lý', 'Số hộ, số khung dệt', 'bài báo năm 2021']) {
      expect(json).not.toContain(banned)
    }
    // R5: vẫn hiện ở public
    expect(json).toContain('CÁC NGUỒN CHƯA THỐNG NHẤT')
    expect(json).toContain('Không có chân dung lịch sử')
  })
  it('preview: giữ nguyên văn', () => {
    expect(applyMode(craftCopy, 'preview')).toEqual(craftCopy)
    expect(applyMode(villageCopy, 'preview')).toEqual(villageCopy)
  })
  it('nhánh preview thành null ở public, chuỗi thường giữ nguyên', () => {
    expect(applyMode({ preview: { a: 'x' }, b: 'y' }, 'public')).toEqual({ preview: null, b: 'y' })
  })
  it('giữ mảng cite và giá trị null; chuỗi có dấu chờ xác minh thành null ở public', () => {
    const copy = { cite: ['a-1'], text: { desktop: 'Có [cần xác minh]', mobile: null } }
    expect(applyMode(copy, 'public')).toEqual({ cite: ['a-1'], text: { desktop: null, mobile: null } })
  })
})
