// @vitest-environment node
import { describe, expect, it } from 'vitest'

import { EDITOR_HIDDEN, visibleForUser, type VisibleEntities } from '@/admin/visibility'

const all: VisibleEntities = {
  collections: ['users', 'sources', 'stories', 'people', 'products'],
  globals: ['site-settings', 'page-intros'],
}

describe('visibleForUser', () => {
  it('biên tập viên: bỏ đúng 4 slug, giữ thứ tự phần còn lại', () => {
    expect(visibleForUser(all, { role: 'editor' })).toEqual({
      collections: ['stories', 'people', 'products'],
      globals: [],
    })
    expect(EDITOR_HIDDEN).toEqual({ collections: ['users', 'sources'], globals: ['site-settings', 'page-intros'] })
  })

  it('người duyệt: giữ nguyên', () => {
    expect(visibleForUser(all, { role: 'reviewer' })).toEqual(all)
  })

  it('không có user: xử lý như biên tập viên', () => {
    const expected = { collections: ['stories', 'people', 'products'], globals: [] }
    expect(visibleForUser(all, null)).toEqual(expected)
    expect(visibleForUser(all, undefined)).toEqual(expected)
  })

  it('không sửa mảng đầu vào', () => {
    const input: VisibleEntities = { collections: [...all.collections], globals: [...all.globals] }
    visibleForUser(input, { role: 'editor' })
    expect(input).toEqual(all)
  })
})
