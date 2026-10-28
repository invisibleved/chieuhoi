// @vitest-environment node
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const { state, requestHeaders, headers, hasAdminSession } = vi.hoisted(() => {
  const state = { enabled: false, session: false }
  const requestHeaders = new Headers({ cookie: 'payload-token=x' })
  return {
    state,
    requestHeaders,
    headers: vi.fn(async () => requestHeaders),
    hasAdminSession: vi.fn(async (_h: Headers) => state.session),
  }
})
vi.mock('next/headers', () => ({ draftMode: async () => ({ isEnabled: state.enabled }), headers }))
vi.mock('@/lib/content/session', () => ({ hasAdminSession }))

import { getMode } from '@/lib/content/mode'
import { getPreviewBar } from '@/lib/content/previewBar'

const saved = { ...process.env }
beforeEach(() => {
  state.enabled = false
  state.session = false
  headers.mockClear()
  hasAdminSession.mockClear()
  delete process.env.APP_ENV
  delete process.env.PREVIEW_ALL
})
afterEach(() => {
  process.env = { ...saved }
})

describe('getMode', () => {
  it('production bỏ qua PREVIEW_ALL', async () => {
    process.env.APP_ENV = 'production'
    process.env.PREVIEW_ALL = 'true'
    expect(await getMode()).toBe('public')
  })
  it('staging + PREVIEW_ALL -> preview', async () => {
    process.env.APP_ENV = 'staging'
    process.env.PREVIEW_ALL = 'true'
    expect(await getMode()).toBe('preview')
  })
  it('draftMode bật + đang đăng nhập admin -> preview, kể cả production', async () => {
    process.env.APP_ENV = 'production'
    state.enabled = true
    state.session = true
    expect(await getMode()).toBe('preview')
    expect(hasAdminSession).toHaveBeenCalledWith(requestHeaders)
  })
  it('draftMode bật nhưng không còn phiên admin -> public', async () => {
    process.env.APP_ENV = 'production'
    state.enabled = true
    expect(await getMode()).toBe('public')
  })
  it.each(['development', 'staging'])('draftMode bật, không phiên admin, %s + PREVIEW_ALL -> preview', async (env) => {
    process.env.APP_ENV = env
    process.env.PREVIEW_ALL = 'true'
    state.enabled = true
    expect(await getMode()).toBe('preview')
  })
  it('draftMode tắt thì không đọc headers() (trang tĩnh vẫn tĩnh)', async () => {
    process.env.APP_ENV = 'production'
    expect(await getMode()).toBe('public')
    expect(headers).not.toHaveBeenCalled()
    expect(hasAdminSession).not.toHaveBeenCalled()
  })
  it('mặc định public', async () => {
    expect(await getMode()).toBe('public')
  })
  it.each([undefined, 'prod', 'production'])('APP_ENV=%s + PREVIEW_ALL -> public', async (env) => {
    if (env) process.env.APP_ENV = env
    process.env.PREVIEW_ALL = 'true'
    expect(await getMode()).toBe('public')
  })
  it('development + PREVIEW_ALL -> preview', async () => {
    process.env.APP_ENV = 'development'
    process.env.PREVIEW_ALL = 'true'
    expect(await getMode()).toBe('preview')
  })
})

describe('getPreviewBar', () => {
  it('draftMode tắt -> null, không đọc headers()', async () => {
    expect(await getPreviewBar()).toBeNull()
    expect(headers).not.toHaveBeenCalled()
  })
  it('draftMode bật nhưng không còn phiên admin -> null (kể cả PREVIEW_ALL)', async () => {
    process.env.APP_ENV = 'development'
    process.env.PREVIEW_ALL = 'true'
    state.enabled = true
    expect(await getPreviewBar()).toBeNull()
  })
  it('draftMode bật + phiên admin -> có thanh xem trước', async () => {
    state.enabled = true
    state.session = true
    expect(await getPreviewBar()).toMatchObject({ exitRoute: expect.stringContaining('/preview/exit') })
  })
})
