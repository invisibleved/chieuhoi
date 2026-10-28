// @vitest-environment node
import { describe, expect, it } from 'vitest'
import { checkBasicAuth } from '@/lib/basicAuth'

const basic = (raw: string) => 'Basic ' + Buffer.from(raw, 'utf8').toString('base64')

describe('checkBasicAuth', () => {
  it('khớp user:password', () => {
    expect(checkBasicAuth('Basic ' + btoa('u:p'), 'u:p')).toBe(true)
  })
  it('mật khẩu có dấu hai chấm vẫn khớp', () => {
    expect(checkBasicAuth('Basic ' + btoa('u:a:b'), 'u:a:b')).toBe(true)
  })
  it('chữ Unicode (UTF-8) khớp', () => {
    expect(checkBasicAuth(basic('u:mậtkhẩu'), 'u:mậtkhẩu')).toBe(true)
  })
  it.each([
    ['null', null, 'u:p'],
    ['rỗng', '', 'u:p'],
    ['không phải Basic', 'Bearer x', 'u:p'],
    ['base64 hỏng', 'Basic !!!', 'u:p'],
    ['sai mật khẩu', 'Basic ' + btoa('u:x'), 'u:p'],
    ['sai user', 'Basic ' + btoa('x:p'), 'u:p'],
    ['độ dài khác', 'Basic ' + btoa('u:pp'), 'u:p'],
    ['expected rỗng', 'Basic ' + btoa(':'), ''],
    ['expected rỗng và header rỗng', 'Basic ', ''],
  ])('false: %s', (_n, header, expected) => {
    expect(checkBasicAuth(header, expected)).toBe(false)
  })
})
