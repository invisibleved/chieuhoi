// @vitest-environment node
import { readFileSync } from 'fs'
import path from 'path'
import { describe, expect, it } from 'vitest'

import { craftFactsSeed, PAGE_FACT_SOURCE_IDS, villageFactsSeed } from '@/seed/data/pageFacts'
import { isEmptyGroup, mapSourceRefs } from '@/seed/pageFacts'
import { craftFactsFrom, villageFactsFrom } from '@/lib/content/pageFacts'
// Làng Hới: so với chữ cố định (chép từ artboard). Nghề dệt: đối chiếu với chữ đang có trong code (Task 5 đổi sang giá trị cố định).

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
    const none = { desktop: null, mobile: null }
    expect(v.facts).toEqual([
      {
        term: 'TÊN GỌI',
        detail: { desktop: 'Làng Hới, tên chữ Hải Triều; tên cũ Hải Hồ', mobile: 'Làng Hới, tên chữ Hải Triều; tên cũ Hải Hồ' },
        note: none, editorNote: null, cite: ['vietnamplus-2026', 'daidoanket-2021'],
      },
      {
        term: 'ĐỊA GIỚI HIỆN NAY',
        detail: { desktop: 'Xã Long Hưng, tỉnh Hưng Yên', mobile: 'Xã Long Hưng, tỉnh Hưng Yên' },
        note: { desktop: 'Trước đây: xã Tân Lễ, huyện Hưng Hà, tỉnh Thái Bình', mobile: 'Trước đây: xã Tân Lễ, huyện Hưng Hà, Thái Bình' },
        editorNote: null, cite: ['vietnamplus-2026', 'nq-1666-2025', 'nq-202-2025'],
      },
      {
        term: 'TỔ NGHỀ',
        detail: { desktop: 'Phạm Đôn Lễ, dân làng gọi là “Trạng Chiếu”', mobile: 'Phạm Đôn Lễ, “Trạng Chiếu”' },
        note: none, editorNote: null, cite: ['vietnamplus-2026', 'danviet-2024'],
      },
    ])
    expect(v.founder.paragraphs).toEqual([
      {
        parts: [
          {
            text: {
              desktop:
                'Theo báo chí, Phạm Đôn Lễ sinh năm 1457 tại làng Hải Triều, mất năm 1531. Năm 1481, dưới triều Lê Thánh Tông, ông đỗ đầu cả ba kỳ thi Hương, Hội và Đình, tức Tam nguyên.',
              mobile: 'Theo báo chí, ông sinh năm 1457 tại làng Hải Triều, mất năm 1531, đỗ Tam nguyên năm 1481 dưới triều Lê Thánh Tông.',
            },
            cite: ['danviet-2024', 'daidoanket-2021'],
          },
        ],
      },
      {
        parts: [
          {
            text: {
              desktop:
                'Lời kể trong làng cho rằng khi đi sứ nhà Minh, ông thấy người dân dệt chiếu, mua khung dệt mang về, cải tiến khung và dạy dân làng cách dệt.',
              mobile: 'Lời kể trong làng cho rằng khi đi sứ nhà Minh, ông mang khung dệt về, cải tiến và dạy dân làng.',
            },
            cite: ['danviet-2024', 'daidoanket-2021'],
          },
          { text: { desktop: 'Sau khi ông mất, dân làng tôn ông làm Phúc thần.', mobile: null }, cite: ['daidoanket-2021'] },
        ],
      },
    ])
    expect(v.founder.conflict.parts).toEqual([
      {
        text: {
          desktop: 'Vietnam+ đặt câu chuyện mang nghề về làng vào đầu thế kỷ XVI và nhắc đến hai lần đi sứ.',
          mobile: 'Vietnam+ đặt câu chuyện vào đầu thế kỷ XVI.',
        },
        cite: ['vietnamplus-2026'],
      },
      {
        text: {
          desktop: 'Dân Việt ghi rằng phần lớn tiểu sử của ông dựa vào truyền khẩu, chưa có hồ sơ lưu trữ địa phương.',
          mobile: 'Tiểu sử phần lớn dựa vào truyền khẩu.',
        },
        cite: ['danviet-2024'],
      },
    ])
    expect(v.founder.conflict.closing).toEqual({ desktop: 'Cần đối chiếu với sử liệu khoa bảng trước khi đăng chính thức.', mobile: null })
    expect(v.founder.noPortrait).toEqual({
      desktop: 'Không có chân dung lịch sử của Phạm Đôn Lễ. Trang này không dùng ảnh minh hoạ cho nhân vật.',
      mobile: null,
    })
    expect(v.location.body).toEqual({
      text: 'Sông Luộc bao quanh làng rồi đổ ra sông Hồng; bên kia sông là thành phố Hưng Yên.',
      cite: ['daidoanket-2021'],
    })
    expect(v.location.note).toEqual({
      desktop: 'Mô tả này theo bài báo năm 2021, trước khi địa giới thay đổi. Cần cập nhật theo đơn vị hành chính hiện hành.',
      mobile: null,
    })
    expect(v.heritage.paragraphs).toEqual([
      {
        text: {
          desktop: 'Máy dệt bắt đầu được đưa vào làng khoảng năm 2005. Theo Vietnam+, nhiều khâu như chọn cói, viền mép và in hoa văn vẫn làm bằng tay.',
          mobile: 'Máy dệt bắt đầu về làng khoảng năm 2005; chọn cói, viền mép và in hoa văn vẫn làm bằng tay.',
        },
        cite: ['vietnamplus-2026'],
      },
      { text: { desktop: 'Bên cạnh chiếu cói, các cơ sở trong xã còn làm chiếu nhựa, chiếu ni-lông và chiếu giả mây.', mobile: null }, cite: ['vietnamplus-2026'] },
    ])
    expect(v.heritage.note).toEqual({
      desktop: 'Số hộ, số khung dệt và số lao động có trong bài báo nhưng chưa thống nhất giữa các đoạn; chưa đưa lên trang cho đến khi đối chiếu với số liệu của xã.',
      mobile: null,
    })
    expect(v.sourceOrder).toEqual([...PAGE_FACT_SOURCE_IDS])
  })

  it('Nghề dệt: qua craftFactsFrom ra đúng chữ hiện tại', () => {
    // Chữ chép nguyên văn từ copy/craft.ts trước khi chuyển sang CMS.
    const c = craftFactsFrom(populated(craftFactsSeed))
    expect(c.tools).toEqual([
      { n: 1, name: 'Khung dệt', note: { desktop: 'Cấu tạo, chất liệu gỗ và tên gọi từng bộ phận: [cần xác minh].', mobile: 'Tên bộ phận: [cần xác minh]' }, cite: [] },
      { n: 2, name: 'Khuôn in hoa văn', note: { desktop: 'Chất liệu khuôn và cách làm khuôn: [cần xác minh].', mobile: 'Chất liệu: [cần xác minh]' }, cite: [] },
      { n: 3, name: 'Bàn chải quét màu', note: { desktop: 'Loại màu dùng để in và cách pha: [cần xác minh].', mobile: 'Loại màu: [cần xác minh]' }, cite: [] },
    ])
    expect(c.hand).toEqual({
      title: 'Dệt thủ công',
      text: {
        text: {
          desktop: 'Người thợ ngồi bên khung, đưa từng sợi cói qua khung dệt.',
          mobile: 'Người thợ ngồi bên khung, đưa từng sợi cói qua khung dệt.',
        },
        cite: [],
      },
      note: {
        text: {
          desktop: 'Số người cần cho một khung, thời gian một tấm, cách chia việc trong gia đình: [cần xác minh].',
          mobile: 'Thời gian một tấm, cách chia việc: [cần xác minh].',
        },
        cite: [],
      },
    })
    expect(c.machine).toEqual({
      title: 'Dệt bằng máy',
      text: {
        text: {
          desktop: 'Máy đảm nhận việc đan sợi, nhưng người thợ vẫn nạp cói bằng tay.',
          mobile: 'Máy đảm nhận việc đan sợi, người thợ vẫn nạp cói bằng tay.',
        },
        cite: [],
      },
      note: {
        text: {
          desktop: 'Thời điểm máy dệt xuất hiện ở làng, loại máy và công suất: [cần xác minh].',
          mobile: 'Thời điểm máy dệt xuất hiện ở làng: [cần xác minh].',
        },
        cite: [],
      },
    })
    const pending = ['Thủ công: [cần xác minh] · Máy: [cần xác minh]']
    expect(c.rows).toEqual([
      {
        aspect: 'Việc của đôi tay', hand: 'Đưa sợi và dệt trên khung', machine: 'Nạp cói vào máy',
        mobile: ['Thủ công: đưa sợi và dệt trên khung', 'Bằng máy: nạp cói vào máy'], mobileAuto: false, cite: [],
      },
      { aspect: 'Thời gian một tấm', hand: '[cần xác minh]', machine: '[cần xác minh]', mobile: pending, mobileAuto: true, cite: [] },
      { aspect: 'Hoa văn', hand: '[cần xác minh]', machine: '[cần xác minh]', mobile: pending, mobileAuto: true, cite: [] },
      { aspect: 'Khâu vẫn làm tay', hand: '[cần xác minh]', machine: '[cần xác minh]', mobile: pending, mobileAuto: true, cite: [] },
    ])
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
