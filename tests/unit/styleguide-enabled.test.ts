import { describe, expect, it } from 'vitest'
import { isStyleguideEnabled } from '@/components/styleguide/enabled'

describe('isStyleguideEnabled', () => {
  it('chỉ mở ở development và staging', () => {
    expect(isStyleguideEnabled('development')).toBe(true)
    expect(isStyleguideEnabled('staging')).toBe(true)
    for (const v of ['production', undefined, '', 'Production', 'dev']) {
      expect(isStyleguideEnabled(v)).toBe(false)
    }
  })
})
