// @vitest-environment node
import { describe, expect, it } from 'vitest'

import { archiveCategoryLabel, archiveEraLabel, productGroupLabel } from '@/lib/content/categories'

describe('nhãn option', () => {
  it('map value sang nhãn từ collection', () => {
    expect(productGroupLabel('traditional')).toBe('Chiếu cói truyền thống')
    expect(archiveCategoryLabel('history')).toBe('Tư liệu lịch sử')
    expect(archiveEraLabel('now')).toBe('Nay')
  })
  it('giá trị lạ hoặc rỗng trả null', () => {
    expect(productGroupLabel('x')).toBeNull()
    expect(archiveCategoryLabel(null)).toBeNull()
    expect(archiveEraLabel(undefined)).toBeNull()
  })
})
