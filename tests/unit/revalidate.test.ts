// @vitest-environment node
import type { PayloadRequest } from 'payload'
import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('next/cache', () => ({ revalidatePath: vi.fn() }))

import { revalidatePath } from 'next/cache'

import {
  revalidateAfterChange,
  revalidateAfterDelete,
  revalidateGlobalAfterChange,
  revalidateSite,
} from '@/hooks/revalidate'

const makeReq = (context: Record<string, unknown> = {}) =>
  ({ context, payload: { logger: { debug: vi.fn() } } }) as unknown as PayloadRequest

describe('revalidateSite', () => {
  it("gọi revalidate('/', 'layout') một lần", () => {
    const fn = vi.fn()
    revalidateSite(makeReq(), fn)
    expect(fn).toHaveBeenCalledTimes(1)
    expect(fn).toHaveBeenCalledWith('/', 'layout')
  })
  it('bỏ qua khi context.disableRevalidate', () => {
    const fn = vi.fn()
    revalidateSite(makeReq({ disableRevalidate: true }), fn)
    expect(fn).not.toHaveBeenCalled()
  })
  it('nuốt lỗi và ghi debug', () => {
    const req = makeReq()
    const fn = vi.fn(() => {
      throw new Error('static generation store missing')
    })
    expect(() => revalidateSite(req, fn)).not.toThrow()
    expect(req.payload.logger.debug).toHaveBeenCalled()
  })
})

describe('hook revalidate', () => {
  beforeEach(() => vi.mocked(revalidatePath).mockClear())
  const doc = { id: 1 }
  it('afterChange gọi revalidatePath và trả doc', async () => {
    const out = await revalidateAfterChange({ doc, req: makeReq() } as never)
    expect(revalidatePath).toHaveBeenCalledWith('/', 'layout')
    expect(out).toBe(doc)
  })
  it('afterDelete gọi revalidatePath và trả doc', async () => {
    const out = await revalidateAfterDelete({ doc, req: makeReq() } as never)
    expect(revalidatePath).toHaveBeenCalledWith('/', 'layout')
    expect(out).toBe(doc)
  })
  it('global afterChange gọi revalidatePath và trả doc', async () => {
    const out = await revalidateGlobalAfterChange({ doc, req: makeReq() } as never)
    expect(revalidatePath).toHaveBeenCalledWith('/', 'layout')
    expect(out).toBe(doc)
  })
})
