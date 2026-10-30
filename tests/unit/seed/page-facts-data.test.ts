// @vitest-environment node
import { readFileSync } from 'fs'
import path from 'path'
import { describe, expect, it } from 'vitest'

import { craftFactsSeed, PAGE_FACT_SOURCE_IDS, villageFactsSeed } from '@/seed/data/pageFacts'
import { isEmptyGroup, mapSourceRefs } from '@/seed/pageFacts'
import { craftFactsFrom, villageFactsFrom } from '@/lib/content/pageFacts'
// Đối chiếu với chữ đang có trong code. Task 4/5 xoá các export này thì phải đổi test sang giá trị cố định.
import { villageCopy, villageFacts } from '@/lib/content/copy/village'
import { craftCompare, craftTools } from '@/lib/content/copy/craft'

const sourceJson = JSON.parse(
  readFileSync(path.resolve(process.cwd(), 'content/seed/sources.json'), 'utf8'),
) as { id: string }[]

/** Mọi chuỗi trong các mảng `sources`/`pageSources`. */
function citedIds(v: unknown): string[] {
  const out: string[] = []
  mapSourceRefs(v, (id) => {
    out.push(id)
    return id
  })
  return out
}

/** Dạng Payload trả về khi populate quan hệ: { sourceId }. */
const populated = <T>(v: T) => mapSourceRefs(v, (id) => ({ sourceId: id })) as Record<string, unknown>

describe('dữ liệu seed dữ kiện trang', () => {
  it('mọi nguồn được trích nằm trong PAGE_FACT_SOURCE_IDS', () => {
    const ids = [...citedIds(villageFactsSeed), ...citedIds(craftFactsSeed)]
    expect(ids.length).toBeGreaterThan(0)
    for (const id of ids) expect(PAGE_FACT_SOURCE_IDS).toContain(id)
  })

  it('mọi id trong PAGE_FACT_SOURCE_IDS có trong sources.json', () => {
    const known = sourceJson.map((s) => s.id)
    for (const id of PAGE_FACT_SOURCE_IDS) expect(known).toContain(id)
  })

  it('3 dụng cụ; nguồn trang Làng Hới theo đúng thứ tự, Nghề dệt rỗng', () => {
    expect(craftFactsSeed.tools.length).toBe(3)
    expect(villageFactsSeed.pageSources).toEqual([...PAGE_FACT_SOURCE_IDS])
    expect(craftFactsSeed.pageSources).toEqual([])
  })

  it('Làng Hới: qua villageFactsFrom ra đúng chữ hiện tại', () => {
    const v = villageFactsFrom(populated(villageFactsSeed))
    expect(v.facts).toEqual(
      villageFacts.map((f) => ({ term: f.term, detail: f.detail, note: f.note, editorNote: null, cite: f.cite })),
    )
    expect(v.founder.paragraphs).toEqual(villageCopy.founder.paragraphs)
    expect(v.founder.conflict.parts).toEqual(villageCopy.founder.conflict.parts)
    expect(v.founder.conflict.closing).toEqual(villageCopy.founder.conflict.preview.closing)
    expect(v.founder.noPortrait).toEqual(villageCopy.founder.noPortrait)
    expect(v.location.body).toEqual(villageCopy.location.body)
    expect(v.location.note).toEqual(villageCopy.location.preview.note)
    expect(v.heritage.paragraphs).toEqual(villageCopy.heritage.paragraphs)
    expect(v.heritage.note).toEqual(villageCopy.heritage.preview.note)
    expect(v.sourceOrder).toEqual([...PAGE_FACT_SOURCE_IDS])
  })

  it('Nghề dệt: qua craftFactsFrom ra đúng chữ hiện tại', () => {
    const c = craftFactsFrom(populated(craftFactsSeed))
    expect(c.tools).toEqual(craftTools.map((t) => ({ ...t, cite: [] })))
    expect(c.hand).toEqual({ ...craftCompare.hand, cite: [] })
    expect(c.machine).toEqual({ ...craftCompare.machine, cite: [] })
    expect(c.rows).toEqual(craftCompare.rows.map((r) => ({ ...r, cite: [] })))
    expect(c.sourceOrder).toEqual([])
  })
})

describe('isEmptyGroup', () => {
  it('nhóm chỉ có chuỗi trống, mảng rỗng là trống', () => {
    expect(isEmptyGroup({ sentences: [], editorNote: '' })).toBe(true)
    expect(isEmptyGroup({ text: null, sources: [], editorNote: null, hideOnMobile: false })).toBe(true)
    expect(isEmptyGroup([])).toBe(true)
    expect(isEmptyGroup(undefined)).toBe(true)
    expect(isEmptyGroup({ id: 'abc', paragraphs: [], noPortrait: '  ' })).toBe(true)
  })
  it('có chữ hay có dòng là không trống', () => {
    expect(isEmptyGroup({ text: 'x' })).toBe(false)
    expect(isEmptyGroup([{ term: 'A' }])).toBe(false)
    expect(isEmptyGroup([3])).toBe(false)
    expect(isEmptyGroup({ hand: { text: { text: 'x' } } })).toBe(false)
  })
  it('checkbox không tính', () => {
    expect(isEmptyGroup({ hideOnMobile: true })).toBe(true)
  })
})

describe('mapSourceRefs', () => {
  it('đổi chuỗi trong sources/pageSources, giữ nguyên phần còn lại', () => {
    const out = mapSourceRefs(
      { pageSources: ['a'], rows: [{ text: 'sources', sources: ['b', 7] }], note: { sources: [] } },
      (id) => `#${id}`,
    )
    expect(out).toEqual({ pageSources: ['#a'], rows: [{ text: 'sources', sources: ['#b', 7] }], note: { sources: [] } })
  })
})
