import { describe, expect, it } from 'vitest'

import { missingPageSources } from '@/collections/pages/checkPageSources'

describe('missingPageSources', () => {
  it('báo nguồn được trích mà không có trong pageSources', () => {
    expect(
      missingPageSources({ pageSources: [1, 2], facts: [{ term: 'Diện tích', sources: [1, 3] }] }),
    ).toEqual([{ where: 'Bảng thông tin đầu trang, dòng "Diện tích"', sourceIds: [3] }])
  })

  it('đủ nguồn thì rỗng, kể cả nguồn dạng đối tượng', () => {
    expect(
      missingPageSources({ pageSources: [{ id: 1 }, 2], facts: [{ term: 'a', sources: [{ id: 1 }, 2] }] }),
    ).toEqual([])
  })

  it('đếm đoạn và câu từ 1', () => {
    const out = missingPageSources({
      pageSources: [],
      founder: { paragraphs: [{ sentences: [] }, { sentences: [{ sources: [{ id: 4 }] }] }] },
    })
    expect(out).toEqual([{ where: 'Tổ nghề, đoạn 2, câu 1', sourceIds: [4] }])
  })

  it('duyệt các khối còn lại', () => {
    const out = missingPageSources({
      founder: { conflict: [{ sources: [1] }] },
      location: { sources: [2] },
      heritage: { sentences: [{ sources: [3] }] },
      tools: [{ name: 'Khung', note: { sources: [4] } }],
      hand: { text: { sources: [5] }, note: { sources: [6] } },
      machine: { text: { sources: [7] } },
      compareRows: [{ aspect: 'Tốc độ', sources: [8] }],
    })
    expect(out.map((m) => m.where)).toEqual([
      'Hộp Các nguồn chưa thống nhất, câu 1', 'Vị trí', 'Di sản hôm nay, câu 1', 'Dụng cụ "Khung"',
      'Thẻ Dệt thủ công', 'Thẻ Dệt thủ công', 'Thẻ Dệt bằng máy', 'Bảng so sánh, hàng "Tốc độ"',
    ])
  })

  it('trang không có ô dữ kiện thì rỗng', () => {
    expect(missingPageSources({})).toEqual([])
    expect(missingPageSources({ pageSources: [1], title: 'x' })).toEqual([])
  })
})
