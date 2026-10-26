// @vitest-environment node
import type { SerializedEditorState } from 'lexical'
import { describe, expect, it } from 'vitest'

import { assertSeedAllowed } from '@/seed/guard'
import { injectCitations } from '@/seed/citations'

describe('assertSeedAllowed', () => {
  it('chặn production', () => {
    expect(() => assertSeedAllowed({ APP_ENV: 'production' })).toThrow()
  })
  it('chặn khi thiếu APP_ENV', () => {
    expect(() => assertSeedAllowed({})).toThrow()
  })
  it('cho phép development và staging', () => {
    expect(() => assertSeedAllowed({ APP_ENV: 'development' })).not.toThrow()
    expect(() => assertSeedAllowed({ APP_ENV: 'staging' })).not.toThrow()
  })
})

const doc = (text: string): SerializedEditorState =>
  ({
    root: {
      type: 'root',
      version: 1,
      direction: 'ltr',
      format: '',
      indent: 0,
      children: [
        {
          type: 'paragraph',
          version: 1,
          direction: 'ltr',
          format: '',
          indent: 0,
          children: [{ type: 'text', version: 1, text, format: 0, mode: 'normal', style: '', detail: 0 }],
        },
      ],
    },
  }) as unknown as SerializedEditorState

describe('injectCitations', () => {
  it('tách text thành text, inlineBlock, text', () => {
    const out = injectCitations(doc('abc [[cite:danviet-2024]] def'), { 'danviet-2024': 7 })
    const kids = (out.root.children[0] as unknown as { children: Record<string, unknown>[] }).children
    expect(kids).toHaveLength(3)
    expect(kids[0]).toMatchObject({ type: 'text', text: 'abc ' })
    expect(kids[1]).toMatchObject({ type: 'inlineBlock', fields: { blockType: 'cite', source: 7 } })
    expect(kids[2]).toMatchObject({ type: 'text', text: ' def' })
  })
  it('ném lỗi khi sourceId không có', () => {
    expect(() => injectCitations(doc('x [[cite:nope]]'), {})).toThrow(/nope/)
  })
})
