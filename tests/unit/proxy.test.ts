// @vitest-environment node
import { describe, expect, it } from 'vitest'
import { config, gate } from '@/proxy'

const auth = (raw: string) => ({ authorization: 'Basic ' + btoa(raw) })
const req = (path = '/', headers: Record<string, string> = {}) => new Request('http://localhost' + path, { headers })
const staging = { APP_ENV: 'staging', STAGING_AUTH: 'u:p' }
const ROBOTS = 'noindex, nofollow'

describe('gate (mật khẩu staging)', () => {
  it('staging không header: 401 kèm lời nhắc', async () => {
    const res = gate(req(), staging)
    expect(res.status).toBe(401)
    expect(res.headers.get('www-authenticate')).toBe('Basic realm="Chieu Hoi staging", charset="UTF-8"')
    expect(res.headers.get('cache-control')).toBe('no-store')
    expect(await res.text()).toBe('Cần mật khẩu để xem bản thử nghiệm.')
  })
  it('staging sai mật khẩu: 401', () => {
    expect(gate(req('/', auth('u:x')), staging).status).toBe(401)
  })
  it('staging đúng mật khẩu: đi tiếp, có X-Robots-Tag', () => {
    const res = gate(req('/', auth('u:p')), staging)
    expect(res.headers.get('x-middleware-next')).toBe('1')
    expect(res.headers.get('x-robots-tag')).toBe(ROBOTS)
  })
  it('staging thiếu STAGING_AUTH: 503', async () => {
    const res = gate(req('/', auth('u:p')), { APP_ENV: 'staging' })
    expect(res.status).toBe(503)
    expect(await res.text()).toBe('Staging chưa đặt mật khẩu.')
  })
  it.each([':', 'user:', ':pw', 'khongcohaicham'])('staging STAGING_AUTH "%s" coi như chưa đặt: 503', (v) => {
    expect(gate(req('/', auth(v)), { APP_ENV: 'staging', STAGING_AUTH: v }).status).toBe(503)
  })
  it('development: đi tiếp, có X-Robots-Tag', () => {
    const res = gate(req(), { APP_ENV: 'development' })
    expect(res.headers.get('x-middleware-next')).toBe('1')
    expect(res.headers.get('x-robots-tag')).toBe(ROBOTS)
  })
  it('APP_ENV thiếu hoặc sai: không ném, coi như không phải production', () => {
    expect(gate(req(), {}).headers.get('x-robots-tag')).toBe(ROBOTS)
    expect(gate(req(), { APP_ENV: 'xx' }).headers.get('x-robots-tag')).toBe(ROBOTS)
  })
  it('production: đi tiếp, không có X-Robots-Tag', () => {
    const res = gate(req(), { APP_ENV: 'production' })
    expect(res.headers.get('x-middleware-next')).toBe('1')
    expect(res.headers.get('x-robots-tag')).toBeNull()
  })
  it.each(['/admin', '/api/archive-assets/file/a.webp', '/preview'])('staging chặn %s khi không có header', (p) => {
    expect(gate(req(p), staging).status).toBe(401)
  })
})

describe('config.matcher', () => {
  it('loại /_next/static, giữ đường dẫn khác', () => {
    const [m] = config.matcher as string[]
    const re = new RegExp('^' + m + '$')
    expect(re.test('/_next/static/chunks/a.js')).toBe(false)
    for (const p of ['/', '/admin', '/api/x', '/images/a.webp', '/_next/image']) expect(re.test(p)).toBe(true)
  })
})
