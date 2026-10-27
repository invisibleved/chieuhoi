// Chữ cố định của /nghe-det-chieu, chép nguyên văn từ CraftPage.dc.html và CraftMobile.dc.html.
// Nhánh `preview` là ghi chú quy trình, chỉ hiện ở bản xem trước (R4).
import type { ApplyMode } from './applyMode'

export const craftCopy = {
  breadcrumb: { label: 'Đường dẫn', home: 'Trang chủ', current: 'Nghề dệt chiếu' },
  intro: {
    preview: {
      verifyNote: {
        desktop: 'Tên gọi và trình tự 7 công đoạn là khung ban đầu, sẽ được xác minh với nghệ nhân làng Hới trước khi đăng.',
        mobile: 'Tên gọi và trình tự công đoạn sẽ được xác minh với nghệ nhân trước khi đăng.',
      },
    },
  },
  journey: {
    eyebrow: 'HÀNH TRÌNH MỘT TẤM CHIẾU',
    title: 'Từ sợi cói đến một đời người.',
    stepLabel: 'Công đoạn',
    progressLabel: 'Tiến trình hành trình',
    listLabel: 'Các công đoạn',
    railLabel: 'Chọn công đoạn',
    noImage: 'ẢNH CẦN CHỤP',
    docLabel: { desktop: 'TƯ LIỆU', mobile: 'TL' },
    photoPrefix: 'Ảnh: ',
    prev: 'Trước',
    next: 'Tiếp',
    prevAria: 'Công đoạn trước',
    nextAria: 'Công đoạn tiếp',
    zoomOn: 'Xem cận cảnh',
    zoomOff: { desktop: 'Thu nhỏ', mobile: 'Thu nhỏ ảnh' },
    toolsLabel: 'DỤNG CỤ',
    // Chỉ có ở artboard desktop (mobile: null).
    hint: {
      desktop: 'Dùng phím Tab và Enter để chọn công đoạn. Khi bật chế độ giảm chuyển động, ảnh đổi ngay không có hiệu ứng.',
      mobile: null,
    },
    preview: { toRecordLabel: 'CẦN GHI LẠI' },
  },
  tools: {
    eyebrow: 'DỤNG CỤ',
    title: 'Những vật dụng của nghề.',
    itemLabel: 'DỤNG CỤ',
    preview: { note: { desktop: 'Tên gọi địa phương của từng dụng cụ cần được người làng xác nhận.', mobile: null } },
  },
  compare: {
    eyebrow: 'HAI CÁCH DỆT',
    title: 'Dệt thủ công, dệt bằng máy.',
    lead: {
      desktop:
        'Hai cách làm cùng tồn tại ở làng nghề hôm nay. Phần này đặt chúng cạnh nhau để hiểu điều gì thay đổi và điều gì vẫn cần đến bàn tay người thợ, không để xếp hạng cách nào đáng giá hơn.',
      mobile: 'Đặt cạnh nhau để hiểu điều gì thay đổi, không để xếp hạng cách nào đáng giá hơn.',
    },
    tablistLabel: 'Cách dệt',
    tabs: { hand: 'Dệt thủ công', machine: 'Dệt bằng máy', compare: 'So sánh' },
    panels: {
      hand: { desktop: 'Dệt thủ công', mobile: 'Thủ công' },
      machine: { desktop: 'Dệt bằng máy', mobile: 'Bằng máy' },
      compare: 'So sánh',
    },
    columns: { aspect: 'KHÍA CẠNH', hand: 'THỦ CÔNG', machine: 'BẰNG MÁY' },
    preview: { note: { desktop: 'Chỉ điền ô khi có thông tin từ nghệ nhân hoặc cơ sở dệt.', mobile: null } },
  },
  readNext: { eyebrow: 'ĐỌC TIẾP' },
}

export type CraftCopyView = ApplyMode<typeof craftCopy>

// Dụng cụ: tên cố định, ghi chú còn chờ xác minh (ẩn ở public). Ảnh lấy từ ô tool-<n>.
export const craftTools = [
  {
    n: 1, name: 'Khung dệt',
    note: { desktop: 'Cấu tạo, chất liệu gỗ và tên gọi từng bộ phận: [cần xác minh].', mobile: 'Tên bộ phận: [cần xác minh]' },
  },
  {
    n: 2, name: 'Khuôn in hoa văn',
    note: { desktop: 'Chất liệu khuôn và cách làm khuôn: [cần xác minh].', mobile: 'Chất liệu: [cần xác minh]' },
  },
  {
    n: 3, name: 'Bàn chải quét màu',
    note: { desktop: 'Loại màu dùng để in và cách pha: [cần xác minh].', mobile: 'Loại màu: [cần xác minh]' },
  },
]

// Mỗi hàng: ô desktop (hand/machine) và các dòng mobile (nguyên văn CraftMobile).
export const craftCompare = {
  hand: {
    title: 'Dệt thủ công',
    text: {
      desktop: 'Người thợ ngồi bên khung, đưa từng sợi cói qua khung dệt. Ảnh cho thấy hai người cùng làm trên một khung.',
      mobile: 'Người thợ ngồi bên khung, đưa từng sợi cói qua khung dệt.',
    },
    note: {
      desktop: 'Số người cần cho một khung, thời gian một tấm, cách chia việc trong gia đình: [cần xác minh].',
      mobile: 'Thời gian một tấm, cách chia việc: [cần xác minh].',
    },
  },
  machine: {
    title: 'Dệt bằng máy',
    text: {
      desktop: 'Máy đảm nhận việc đan sợi, nhưng người thợ vẫn nạp cói bằng tay, như trong ảnh.',
      mobile: 'Máy đảm nhận việc đan sợi, người thợ vẫn nạp cói bằng tay.',
    },
    note: {
      desktop: 'Thời điểm máy dệt xuất hiện ở làng, loại máy và công suất: [cần xác minh].',
      mobile: 'Thời điểm máy dệt xuất hiện ở làng: [cần xác minh].',
    },
  },
  rows: [
    {
      aspect: 'Việc của đôi tay', hand: 'Đưa sợi và dệt trên khung', machine: 'Nạp cói vào máy',
      mobile: ['Thủ công: đưa sợi và dệt trên khung', 'Bằng máy: nạp cói vào máy'],
    },
    {
      aspect: 'Thời gian một tấm', hand: '[cần xác minh]', machine: '[cần xác minh]',
      mobile: ['Thủ công: [cần xác minh] · Máy: [cần xác minh]'],
    },
    {
      aspect: 'Hoa văn', hand: '[cần xác minh]', machine: '[cần xác minh]',
      mobile: ['Thủ công: [cần xác minh] · Máy: [cần xác minh]'],
    },
    {
      aspect: 'Khâu vẫn làm tay', hand: '[cần xác minh]', machine: '[cần xác minh]',
      mobile: ['Thủ công: [cần xác minh] · Máy: [cần xác minh]'],
    },
  ],
}

// Thẻ "Đọc tiếp": ảnh lấy từ ô `slot`.
export const craftReadNext = [
  { href: '/con-nguoi', slot: 'next-people', eyebrow: 'CON NGƯỜI', title: 'Gặp những người dệt', cta: 'Xem chân dung →' },
  { href: '/cau-chuyen', slot: 'next-stories', eyebrow: 'CÂU CHUYỆN', title: 'Nghề xưa trong nhịp sống mới', cta: 'Đọc bài →' },
  { href: '/san-pham', slot: 'next-products', eyebrow: 'SẢN PHẨM', title: 'Bộ sưu tập chiếu', cta: 'Xem hiện vật →' },
] as const
