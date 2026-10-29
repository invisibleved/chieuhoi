import { describe, expect, it } from 'vitest'

import { TASKS, tasksFor } from '@/admin/dashboard/tasks'

const all = Object.fromEntries(['archive-assets', 'stories', 'people', 'products'].map((s) => [s, { create: true }]))

describe('tasksFor', () => {
  it('đủ quyền thì ra 5 mục đúng thứ tự, nhãn và href', () => {
    expect(tasksFor({ collections: all }).map((t) => [t.label, t.href])).toEqual([
      ['Tải ảnh lên', '/admin/collections/archive-assets/create'],
      ['Viết bài mới', '/admin/collections/stories/create'],
      ['Thêm người', '/admin/collections/people/create'],
      ['Thêm sản phẩm', '/admin/collections/products/create'],
      ['Xem hướng dẫn', '/admin/huong-dan'],
    ])
    expect(TASKS).toHaveLength(5)
  })

  it('thiếu quyền create của products thì bỏ Thêm sản phẩm', () => {
    const labels = tasksFor({ collections: { ...all, products: { create: false } } }).map((t) => t.label)
    expect(labels).not.toContain('Thêm sản phẩm')
    expect(labels).toHaveLength(4)
  })

  it('Xem hướng dẫn luôn có', () => {
    expect(tasksFor({}).map((t) => t.label)).toEqual(['Xem hướng dẫn'])
  })
})
