// @vitest-environment node
import { describe, expect, it } from 'vitest'
import { robotsFor } from '@/app/robots'

describe('robotsFor', () => {
  it('không phải production thì chặn tất cả', () => {
    for (const APP_ENV of ['development', 'staging', undefined]) {
      expect(robotsFor({ APP_ENV })).toEqual({ rules: { userAgent: '*', disallow: '/' } })
    }
  })
  it('production cho phép trừ các đường nội bộ', () => {
    expect(robotsFor({ APP_ENV: 'production' })).toEqual({
      rules: { userAgent: '*', allow: '/', disallow: ['/admin', '/api', '/preview', '/styleguide'] },
    })
  })
})
