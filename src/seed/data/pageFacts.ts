// Dữ kiện trang /lang-hoi và /nghe-det-chieu, dạng nhập của global `page-intros`.
// Chép nguyên văn từ src/lib/content/copy/village.ts và copy/craft.ts (bản trước khi chuyển vào CMS).
// Nguồn ghi bằng sourceId; importPageFacts đổi sang id lúc ghi.

/** Các nguồn trang cần, theo thứ tự đánh số [1]–[5] của trang Làng Hới. */
export const PAGE_FACT_SOURCE_IDS = ['vietnamplus-2026', 'danviet-2024', 'daidoanket-2021', 'nq-1666-2025', 'nq-202-2025'] as const

export type PageFactSourceId = (typeof PAGE_FACT_SOURCE_IDS)[number]

type Sentence = { text: string; mobileText?: string; hideOnMobile?: boolean; sources?: PageFactSourceId[] }
type OptionalSentence = { text?: string; mobileText?: string; hideOnMobile?: boolean; sources?: PageFactSourceId[] }

export type VillageFactsSeed = {
  facts: {
    term: string
    detail: string
    detailMobile?: string
    note?: string
    noteMobile?: string
    editorNote?: string
    sources: PageFactSourceId[]
  }[]
  founder: {
    paragraphs: { sentences: Sentence[] }[]
    conflict: Sentence[]
    conflictEditorNote: string
    noPortrait: string
  }
  location: { text: string; sources: PageFactSourceId[]; editorNote: string }
  heritage: { sentences: Sentence[]; editorNote: string }
  pageSources: PageFactSourceId[]
}

type WaySeed = { title: string; text: OptionalSentence; note: OptionalSentence }

export type CraftFactsSeed = {
  tools: { name: string; note: OptionalSentence }[]
  hand: WaySeed
  machine: WaySeed
  compareRows: { aspect: string; hand: string; machine: string; mobile?: string; sources?: PageFactSourceId[] }[]
  pageSources: PageFactSourceId[]
}

export const villageFactsSeed: VillageFactsSeed = {
  facts: [
    {
      term: 'TÊN GỌI',
      detail: 'Làng Hới, tên chữ Hải Triều; tên cũ Hải Hồ',
      sources: ['vietnamplus-2026', 'daidoanket-2021'],
    },
    {
      term: 'ĐỊA GIỚI HIỆN NAY',
      detail: 'Xã Long Hưng, tỉnh Hưng Yên',
      note: 'Trước đây: xã Tân Lễ, huyện Hưng Hà, tỉnh Thái Bình',
      noteMobile: 'Trước đây: xã Tân Lễ, huyện Hưng Hà, Thái Bình',
      sources: ['vietnamplus-2026', 'nq-1666-2025', 'nq-202-2025'],
    },
    {
      term: 'TỔ NGHỀ',
      detail: 'Phạm Đôn Lễ, dân làng gọi là “Trạng Chiếu”',
      detailMobile: 'Phạm Đôn Lễ, “Trạng Chiếu”',
      sources: ['vietnamplus-2026', 'danviet-2024'],
    },
  ],
  founder: {
    paragraphs: [
      {
        sentences: [
          {
            text: 'Theo báo chí, Phạm Đôn Lễ sinh năm 1457 tại làng Hải Triều, mất năm 1531. Năm 1481, dưới triều Lê Thánh Tông, ông đỗ đầu cả ba kỳ thi Hương, Hội và Đình, tức Tam nguyên.',
            mobileText: 'Theo báo chí, ông sinh năm 1457 tại làng Hải Triều, mất năm 1531, đỗ Tam nguyên năm 1481 dưới triều Lê Thánh Tông.',
            sources: ['danviet-2024', 'daidoanket-2021'],
          },
        ],
      },
      {
        sentences: [
          {
            text: 'Lời kể trong làng cho rằng khi đi sứ nhà Minh, ông thấy người dân dệt chiếu, mua khung dệt mang về, cải tiến khung và dạy dân làng cách dệt.',
            mobileText: 'Lời kể trong làng cho rằng khi đi sứ nhà Minh, ông mang khung dệt về, cải tiến và dạy dân làng.',
            sources: ['danviet-2024', 'daidoanket-2021'],
          },
          {
            text: 'Sau khi ông mất, dân làng tôn ông làm Phúc thần.',
            hideOnMobile: true,
            sources: ['daidoanket-2021'],
          },
        ],
      },
    ],
    conflict: [
      {
        text: 'Vietnam+ đặt câu chuyện mang nghề về làng vào đầu thế kỷ XVI và nhắc đến hai lần đi sứ.',
        mobileText: 'Vietnam+ đặt câu chuyện vào đầu thế kỷ XVI.',
        sources: ['vietnamplus-2026'],
      },
      {
        text: 'Dân Việt ghi rằng phần lớn tiểu sử của ông dựa vào truyền khẩu, chưa có hồ sơ lưu trữ địa phương.',
        mobileText: 'Tiểu sử phần lớn dựa vào truyền khẩu.',
        sources: ['danviet-2024'],
      },
    ],
    conflictEditorNote: 'Cần đối chiếu với sử liệu khoa bảng trước khi đăng chính thức.',
    noPortrait: 'Không có chân dung lịch sử của Phạm Đôn Lễ. Trang này không dùng ảnh minh hoạ cho nhân vật.',
  },
  location: {
    text: 'Sông Luộc bao quanh làng rồi đổ ra sông Hồng; bên kia sông là thành phố Hưng Yên.',
    sources: ['daidoanket-2021'],
    editorNote: 'Mô tả này theo bài báo năm 2021, trước khi địa giới thay đổi. Cần cập nhật theo đơn vị hành chính hiện hành.',
  },
  heritage: {
    sentences: [
      {
        text: 'Máy dệt bắt đầu được đưa vào làng khoảng năm 2005. Theo Vietnam+, nhiều khâu như chọn cói, viền mép và in hoa văn vẫn làm bằng tay.',
        mobileText: 'Máy dệt bắt đầu về làng khoảng năm 2005; chọn cói, viền mép và in hoa văn vẫn làm bằng tay.',
        sources: ['vietnamplus-2026'],
      },
      {
        text: 'Bên cạnh chiếu cói, các cơ sở trong xã còn làm chiếu nhựa, chiếu ni-lông và chiếu giả mây.',
        hideOnMobile: true,
        sources: ['vietnamplus-2026'],
      },
    ],
    editorNote:
      'Số hộ, số khung dệt và số lao động có trong bài báo nhưng chưa thống nhất giữa các đoạn; chưa đưa lên trang cho đến khi đối chiếu với số liệu của xã.',
  },
  pageSources: [...PAGE_FACT_SOURCE_IDS],
}

export const craftFactsSeed: CraftFactsSeed = {
  tools: [
    {
      name: 'Khung dệt',
      note: { text: 'Cấu tạo, chất liệu gỗ và tên gọi từng bộ phận: [cần xác minh].', mobileText: 'Tên bộ phận: [cần xác minh]' },
    },
    {
      name: 'Khuôn in hoa văn',
      note: { text: 'Chất liệu khuôn và cách làm khuôn: [cần xác minh].', mobileText: 'Chất liệu: [cần xác minh]' },
    },
    {
      name: 'Bàn chải quét màu',
      note: { text: 'Loại màu dùng để in và cách pha: [cần xác minh].', mobileText: 'Loại màu: [cần xác minh]' },
    },
  ],
  hand: {
    title: 'Dệt thủ công',
    text: {
      text: 'Người thợ ngồi bên khung, đưa từng sợi cói qua khung dệt.',
      mobileText: 'Người thợ ngồi bên khung, đưa từng sợi cói qua khung dệt.',
    },
    note: {
      text: 'Số người cần cho một khung, thời gian một tấm, cách chia việc trong gia đình: [cần xác minh].',
      mobileText: 'Thời gian một tấm, cách chia việc: [cần xác minh].',
    },
  },
  machine: {
    title: 'Dệt bằng máy',
    text: {
      text: 'Máy đảm nhận việc đan sợi, nhưng người thợ vẫn nạp cói bằng tay.',
      mobileText: 'Máy đảm nhận việc đan sợi, người thợ vẫn nạp cói bằng tay.',
    },
    note: {
      text: 'Thời điểm máy dệt xuất hiện ở làng, loại máy và công suất: [cần xác minh].',
      mobileText: 'Thời điểm máy dệt xuất hiện ở làng: [cần xác minh].',
    },
  },
  compareRows: [
    {
      aspect: 'Việc của đôi tay',
      hand: 'Đưa sợi và dệt trên khung',
      machine: 'Nạp cói vào máy',
      mobile: 'Thủ công: đưa sợi và dệt trên khung\nBằng máy: nạp cói vào máy',
    },
    // Để trống `mobile`: hệ thống tự ghép "Thủ công: … · Máy: …", đúng chữ artboard mobile.
    { aspect: 'Thời gian một tấm', hand: '[cần xác minh]', machine: '[cần xác minh]' },
    { aspect: 'Hoa văn', hand: '[cần xác minh]', machine: '[cần xác minh]' },
    { aspect: 'Khâu vẫn làm tay', hand: '[cần xác minh]', machine: '[cần xác minh]' },
  ],
  pageSources: [],
}
