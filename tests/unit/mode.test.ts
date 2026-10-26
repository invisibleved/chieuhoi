// @vitest-environment node
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const state = { enabled: false }
vi.mock('next/headers', () => ({ draftMode: async () => ({ isEnabled: state.enabled }) }))

import { getMode } from '@/lib/content/mode'

const saved = { ...process.env }
beforeEach(() => {
  state.enabled = false
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
  it('draftMode bật -> preview, kể cả production', async () => {
    process.env.APP_ENV = 'production'
    state.enabled = true
    expect(await getMode()).toBe('preview')
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
