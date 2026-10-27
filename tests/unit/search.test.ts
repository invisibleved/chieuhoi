import { describe, expect, it } from 'vitest'
import { normalizeSearch } from '@/lib/search'

describe('normalizeSearch', () => {
  it('bỏ dấu, hạ chữ thường, gộp khoảng trắng, cắt hai đầu', () => {
    expect(normalizeSearch('Chuyện về TRẠNG Chiếu ')).toBe('chuyen ve trang chieu')
    expect(normalizeSearch('  khung \t dệt\n')).toBe('khung det')
  })
  it('đ và Đ thành d', () => {
    expect(normalizeSearch('Đồng')).toBe('dong')
    expect(normalizeSearch('đình làng')).toBe('dinh lang')
  })
  it('chuỗi rỗng', () => {
    expect(normalizeSearch('   ')).toBe('')
  })
})
