// @vitest-environment node
import { describe, expect, it } from 'vitest'
import { assertDeployEnv, isIndexable, isPreviewAll, isValidStagingAuth, isStaging, readAppEnv, siteUrl } from '@/lib/env'

const SECRET = 's'.repeat(40)
const full = {
  APP_ENV: 'production',
  SITE_URL: 'https://chieuhoi.example',
  PAYLOAD_SECRET: SECRET,
  DATABASE_URI: 'postgres://u:p@h:5432/d',
  S3_BUCKET: 'b',
  S3_ENDPOINT: 'https://s3.example',
  S3_ACCESS_KEY_ID: 'k',
  S3_SECRET_ACCESS_KEY: 'v',
}
const staging = { ...full, APP_ENV: 'staging', STAGING_AUTH: 'user:pass' }

function msgOf(env: Record<string, string | undefined>): string {
  try {
    assertDeployEnv(env)
  } catch (e) {
    return (e as Error).message
  }
  return ''
}

describe('isValidStagingAuth', () => {
  it.each([[undefined, false], ['', false], [':', false], ['u:', false], [':p', false], ['nocolon', false], ['u:p', true], ['u:a:b', true]])(
    '%s -> %s',
    (v, ok) => expect(isValidStagingAuth(v)).toBe(ok),
  )
  it.each([':', 'u:', ':p'])('assertDeployEnv từ chối STAGING_AUTH "%s"', (v) => {
    expect(msgOf({ ...staging, STAGING_AUTH: v })).toContain('STAGING_AUTH')
  })
  it('assertDeployEnv nhận u:a:b', () => {
    expect(msgOf({ ...staging, STAGING_AUTH: 'u:a:b' })).toBe('')
  })
})

describe('readAppEnv', () => {
  it('nhận đúng 3 giá trị', () => {
    expect(readAppEnv({ APP_ENV: 'development' })).toBe('development')
    expect(readAppEnv({ APP_ENV: 'staging' })).toBe('staging')
    expect(readAppEnv({ APP_ENV: 'production' })).toBe('production')
  })
  it.each([undefined, '', 'prod'])('ném lỗi với %j', (v) => {
    expect(() => readAppEnv({ APP_ENV: v })).toThrow(`APP_ENV phải là development, staging hoặc production (hiện là "${v ?? ''}").`)
  })
})

describe('assertDeployEnv', () => {
  it('development trên host deploy (VERCEL) bị từ chối', () => {
    const m = msgOf({ APP_ENV: 'development', VERCEL: '1' })
    expect(m).toContain('APP_ENV')
    expect(m).toContain('development không dùng để deploy')
  })
  it('development không ném', () => {
    expect(() => assertDeployEnv({ APP_ENV: 'development' })).not.toThrow()
  })
  it('thiếu APP_ENV thì ném', () => {
    expect(msgOf({})).toContain('APP_ENV')
  })
  it.each(['staging', 'production'])('%s thiếu SITE_URL', (e) => {
    expect(msgOf({ ...staging, APP_ENV: e, SITE_URL: undefined })).toContain('SITE_URL')
  })
  it('SITE_URL sai giao thức', () => {
    expect(msgOf({ ...full, SITE_URL: 'ftp://x' })).toContain('SITE_URL')
  })
  it('PAYLOAD_SECRET ngắn, không lộ giá trị', () => {
    const short = 'short-secret-value'
    const msg = msgOf({ ...full, PAYLOAD_SECRET: short })
    expect(msg).toContain('PAYLOAD_SECRET')
    expect(msg).not.toContain(short)
  })
  it.each(['DATABASE_URI', 'S3_BUCKET', 'S3_ENDPOINT', 'S3_ACCESS_KEY_ID', 'S3_SECRET_ACCESS_KEY'])('thiếu %s', (k) => {
    expect(msgOf({ ...full, [k]: undefined })).toContain(k)
  })
  it('staging thiếu hoặc sai STAGING_AUTH', () => {
    expect(msgOf({ ...staging, STAGING_AUTH: undefined })).toContain('STAGING_AUTH')
    expect(msgOf({ ...staging, STAGING_AUTH: 'nocolon' })).toContain('STAGING_AUTH')
  })
  it('production + PREVIEW_ALL=true', () => {
    expect(msgOf({ ...full, PREVIEW_ALL: 'true' })).toContain('PREVIEW_ALL')
  })
  it.each(['staging', 'production'])('ALLOW_FIRST_USER=true ở %s', (e) => {
    expect(msgOf({ ...staging, APP_ENV: e, ALLOW_FIRST_USER: 'true' })).toContain('ALLOW_FIRST_USER')
  })
  it('đủ biến thì không ném', () => {
    expect(() => assertDeployEnv(full)).not.toThrow()
    expect(() => assertDeployEnv(staging)).not.toThrow()
  })
  it('gộp mọi lỗi, mỗi lỗi một dòng', () => {
    const msg = msgOf({ APP_ENV: 'production', PREVIEW_ALL: 'true', ALLOW_FIRST_USER: 'true', PAYLOAD_SECRET: 'x' })
    for (const k of ['SITE_URL', 'PAYLOAD_SECRET', 'DATABASE_URI', 'S3_BUCKET', 'PREVIEW_ALL', 'ALLOW_FIRST_USER']) expect(msg).toContain(k)
    expect(msg.startsWith('Cấu hình môi trường chưa đúng:')).toBe(true)
    expect(msg.split('\n').slice(1).every((l) => l.startsWith('- '))).toBe(true)
  })
})

describe('isIndexable / isStaging / siteUrl', () => {
  it('chỉ production được index', () => {
    expect(isIndexable({ APP_ENV: 'production' })).toBe(true)
    expect(isIndexable({ APP_ENV: 'staging' })).toBe(false)
    expect(isIndexable({ APP_ENV: 'development' })).toBe(false)
    expect(isIndexable({})).toBe(false)
  })
  it('isStaging an toàn', () => {
    expect(isStaging({ APP_ENV: 'staging' })).toBe(true)
    expect(isStaging({})).toBe(false)
    expect(isStaging({ APP_ENV: 'prod' })).toBe(false)
  })
  it('isPreviewAll chỉ mở ở staging hoặc next dev', () => {
    expect(isPreviewAll({ APP_ENV: 'staging', PREVIEW_ALL: 'true', NODE_ENV: 'production' })).toBe(true)
    expect(isPreviewAll({ APP_ENV: 'development', PREVIEW_ALL: 'true', NODE_ENV: 'development' })).toBe(true)
    expect(isPreviewAll({ APP_ENV: 'development', PREVIEW_ALL: 'true', NODE_ENV: 'production' })).toBe(false)
    expect(isPreviewAll({ APP_ENV: 'production', PREVIEW_ALL: 'true' })).toBe(false)
    expect(isPreviewAll({ APP_ENV: 'development', PREVIEW_ALL: 'false' })).toBe(false)
    expect(isPreviewAll({ APP_ENV: 'prod', PREVIEW_ALL: 'true' })).toBe(false)
    expect(isPreviewAll({ PREVIEW_ALL: 'true' })).toBe(false)
  })
  it('siteUrl mặc định localhost', () => {
    expect(siteUrl({}).href).toBe('http://localhost:3000/')
    expect(siteUrl({ SITE_URL: 'https://a.example' }).href).toBe('https://a.example/')
  })
})
