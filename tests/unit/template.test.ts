import { describe, expect, it } from 'vitest'
import { fillTemplate } from '@/lib/template'

describe('fillTemplate', () => {
  it('thay mọi {khoá} bằng giá trị (số thành chữ)', () => {
    expect(fillTemplate('{n} bài · {d} bản nháp', { n: 9, d: 2 })).toBe('9 bài · 2 bản nháp')
    expect(fillTemplate('Câu chuyện của {name}', { name: 'Bà A' })).toBe('Câu chuyện của Bà A')
  })
  it('một khoá xuất hiện nhiều lần đều được thay', () => {
    expect(fillTemplate('{x}-{x}', { x: 'a' })).toBe('a-a')
  })
  it('khoá thiếu, null hoặc undefined thành chuỗi rỗng; 0 vẫn giữ', () => {
    expect(fillTemplate('[{a}|{b}|{c}|{z}]', { a: null, b: undefined, c: 0 })).toBe('[||0|]')
  })
  it('không có khoá: giữ nguyên mẫu', () => {
    expect(fillTemplate('Đã có', {})).toBe('Đã có')
  })
})
