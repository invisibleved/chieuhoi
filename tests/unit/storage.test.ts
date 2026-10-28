import { describe, expect, it, vi } from 'vitest'
import { storagePlugins } from '@/storage'

type Opts = { collections: unknown; bucket: string; enabled: boolean; alwaysInsertFields: boolean; clientUploads: boolean; disablePayloadAccessControl?: boolean; config: { endpoint: string; region: string; forcePathStyle: boolean; credentials: unknown } }

const full = {
  S3_BUCKET: 'chieuhoi-staging',
  S3_ENDPOINT: 'http://localhost:9000',
  S3_ACCESS_KEY_ID: 'khoa',
  S3_SECRET_ACCESS_KEY: 'bimat',
}

describe('storagePlugins', () => {
  it('thiếu S3_BUCKET: plugin tắt (dev lưu ảnh vào media/) nhưng vẫn chèn trường để schema giống staging', () => {
    const factory = vi.fn(() => () => null)
    expect(storagePlugins({}, factory as never)).toHaveLength(1)
    const opts = (factory.mock.calls[0] as unknown[])[0] as Opts
    expect(opts.enabled).toBe(false)
    expect(opts.alwaysInsertFields).toBe(true)
  })

  it('đủ biến thì trả đúng 1 plugin', () => {
    expect(storagePlugins(full)).toHaveLength(1)
  })

  it('cấu hình s3Storage: bucket, endpoint, vùng mặc định auto, path style, clientUploads', () => {
    const plugin = () => null
    const factory = vi.fn(() => plugin)
    const out = storagePlugins(full, factory as never)
    expect(out).toEqual([plugin])
    const opts = (factory.mock.calls[0] as unknown[])[0] as Opts
    expect(opts.collections).toEqual({ 'archive-assets': true })
    expect(opts.bucket).toBe('chieuhoi-staging')
    expect(opts.config.endpoint).toBe('http://localhost:9000')
    expect(opts.config.region).toBe('auto')
    expect(opts.config.forcePathStyle).toBe(true)
    expect(opts.config.credentials).toEqual({ accessKeyId: 'khoa', secretAccessKey: 'bimat' })
    expect(opts.clientUploads).toBe(true)
    expect(opts.enabled).toBe(true)
    expect(opts.alwaysInsertFields).toBe(true)
    expect(opts.disablePayloadAccessControl).not.toBe(true)
  })

  it('dùng S3_REGION khi có', () => {
    const factory = vi.fn(() => () => null)
    storagePlugins({ ...full, S3_REGION: 'eu-west-1' }, factory as never)
    expect(((factory.mock.calls[0] as unknown[])[0] as Opts).config.region).toBe('eu-west-1')
  })
})
