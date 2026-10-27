// Chữ cố định của /lang-hoi, chép nguyên văn từ VillagePage.dc.html và VillageMobile.dc.html.
// `cite` là sourceId; số [n] do component đánh theo villageSourceOrder (R9).
// Nhánh `preview` là ghi chú quy trình, chỉ hiện ở bản xem trước (R4).
import type { ApplyMode } from './applyMode'

/** Thứ tự đánh số nguồn trên trang: [1] [2] [3]. */
export const villageSourceOrder = ['vietnamplus-2026', 'danviet-2024', 'daidoanket-2021']

export const villageCopy = {
  breadcrumb: { label: 'Đường dẫn', home: 'Trang chủ', current: 'Làng Hới' },
  founder: {
    eyebrow: 'TỔ NGHỀ',
    title: 'Phạm Đôn Lễ, ông Trạng Chiếu.',
    // Mỗi đoạn gồm các câu, mỗi câu có chú thích riêng.
    paragraphs: [
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
          {
            text: { desktop: 'Sau khi ông mất, dân làng tôn ông làm Phúc thần.', mobile: null },
            cite: ['daidoanket-2021'],
          },
        ],
      },
    ],
    // Một đoạn gồm các câu, mỗi câu có chú thích riêng.
    conflict: {
      label: 'CÁC NGUỒN CHƯA THỐNG NHẤT',
      parts: [
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
        {
          text: { desktop: 'Cần đối chiếu với sử liệu khoa bảng trước khi đăng chính thức.', mobile: null },
          cite: [],
        },
      ],
    },
    noPortrait: 'Không có chân dung lịch sử của Phạm Đôn Lễ. Trang này không dùng ảnh minh hoạ cho nhân vật.',
  },
  timeline: {
    eyebrow: 'DÒNG THỜI GIAN',
    title: 'Năm trăm năm, kể theo từng mốc.',
    legendLabel: { desktop: 'Chú giải độ tin cậy', mobile: 'Chú giải' },
    listLabel: 'Các mốc',
    confidence: { press: 'Có nguồn báo chí', oral: 'Truyền khẩu', pending: 'Chờ xác minh' },
    sourceLabel: { desktop: 'NGUỒN · ', mobile: 'Nguồn: ' },
    prev: 'Mốc trước',
    next: 'Mốc sau',
    hint: 'Hình dạng điểm mốc cho biết độ tin cậy, không chỉ dựa vào màu. Mọi mốc dùng được bằng bàn phím và chạm.',
  },
  location: {
    eyebrow: 'VỊ TRÍ',
    title: 'Làng bên sông Luộc.',
    body: { text: 'Sông Luộc bao quanh làng rồi đổ ra sông Hồng; bên kia sông là thành phố Hưng Yên.', cite: ['daidoanket-2021'] },
    preview: {
      note: 'Mô tả này theo bài báo năm 2021, trước khi địa giới thay đổi. Cần cập nhật theo đơn vị hành chính hiện hành.',
      map: {
        label: 'BẢN ĐỒ VỊ TRÍ',
        title: 'Chờ dữ liệu địa lý chính xác',
        body: 'Bản đồ đơn giản hoá: làng, sông Luộc, sông Hồng và đền thờ tổ nghề. Chỉ vẽ khi có toạ độ đã kiểm chứng.',
      },
    },
  },
  life: {
    eyebrow: 'ĐỜI SỐNG LÀNG',
    title: 'Nhịp làng, nhịp chiếu.',
    link: { label: 'Xem thêm trong Thư viện →', href: '/thu-vien' },
  },
  heritage: {
    eyebrow: 'DI SẢN HÔM NAY',
    title: 'Nghề xưa vẫn sống trong nhịp đời hôm nay.',
    paragraphs: [
      {
        text: {
          desktop: 'Máy dệt bắt đầu được đưa vào làng khoảng năm 2005. Theo Vietnam+, nhiều khâu như chọn cói, viền mép và in hoa văn vẫn làm bằng tay.',
          mobile: 'Máy dệt bắt đầu về làng khoảng năm 2005; chọn cói, viền mép và in hoa văn vẫn làm bằng tay.',
        },
        cite: ['vietnamplus-2026'],
      },
      {
        text: { desktop: 'Bên cạnh chiếu cói, các cơ sở trong xã còn làm chiếu nhựa, chiếu nylon và chiếu giả mây.', mobile: null },
        cite: ['vietnamplus-2026'],
      },
    ],
    link: { label: 'Xem quy trình dệt chiếu →', href: '/nghe-det-chieu' },
    preview: {
      note: 'Số hộ, số khung dệt và số lao động có trong bài báo nhưng chưa thống nhất giữa các đoạn; chưa đưa lên trang cho đến khi đối chiếu với số liệu của xã.',
    },
  },
  sources: { title: 'Nguồn tham khảo' },
}

export type VillageCopyView = ApplyMode<typeof villageCopy>

// Bảng thông tin đầu trang. `note` hiện ở mọi chế độ; `notePreview` nối thêm sau dấu "·" chỉ ở preview (R4).
export const villageFacts = [
  {
    term: 'TÊN GỌI',
    detail: 'Làng Hới, tên chữ Hải Triều; tên cũ Hải Hồ',
    note: null as string | null,
    notePreview: null as string | null,
    cite: ['vietnamplus-2026', 'daidoanket-2021'],
  },
  {
    term: 'ĐỊA GIỚI HIỆN NAY',
    detail: 'Xã Long Hưng, tỉnh Hưng Yên',
    note: 'Trước đây: xã Tân Lễ, huyện Hưng Hà, tỉnh Thái Bình' as string | null,
    notePreview: 'cần đối chiếu văn bản hành chính' as string | null,
    cite: ['vietnamplus-2026'],
  },
  {
    term: 'TỔ NGHỀ',
    detail: 'Phạm Đôn Lễ, dân làng gọi là "Trạng Chiếu"',
    note: null as string | null,
    notePreview: null as string | null,
    cite: ['vietnamplus-2026', 'danviet-2024'],
  },
]

// Mốc cuối dòng thời gian: tĩnh, không lấy từ CMS (R6). Mức tin cậy luôn là 'pending'.
export const villageTimelineAdd = {
  label: '+',
  title: 'Mốc của bạn',
  body: 'Ký ức, ảnh cũ, giấy tờ của các gia đình làng Hới có thể bổ sung vào dòng thời gian này sau khi được xác minh.',
  sourceLine: 'Mời đóng góp qua trang Kết nối',
  sourceHref: '/ket-noi',
}
