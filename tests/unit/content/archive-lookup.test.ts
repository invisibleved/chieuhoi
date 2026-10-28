import { describe, expect, it } from 'vitest'
import { findArchiveItem } from '@/lib/content/archiveLookup'
import type { ArchiveItemView } from '@/lib/content'

const items = [{ code: 'TL-001' }, { code: 'TL-002' }] as ArchiveItemView[]

describe('findArchiveItem', () => {
  it('khớp đúng mã', () => expect(findArchiveItem(items, 'TL-002')?.code).toBe('TL-002'))
  it('mã viết thường vẫn khớp, trả mã chuẩn', () => expect(findArchiveItem(items, 'tl-001')?.code).toBe('TL-001'))
  it('mảng: chỉ lấy giá trị đầu', () => {
    expect(findArchiveItem(items, ['TL-002', 'TL-001'])?.code).toBe('TL-002')
    expect(findArchiveItem(items, ['TL-999', 'TL-001'])).toBeNull()
  })
  it('mã lạ, rỗng, null, undefined, mảng rỗng: null', () => {
    expect(findArchiveItem(items, 'TL-999')).toBeNull()
    expect(findArchiveItem(items, '')).toBeNull()
    expect(findArchiveItem(items, null)).toBeNull()
    expect(findArchiveItem(items, undefined)).toBeNull()
    expect(findArchiveItem(items, [])).toBeNull()
  })
  it('danh sách rỗng (public, mọi ảnh bị ẩn): null', () => expect(findArchiveItem([], 'TL-004')).toBeNull())
})
