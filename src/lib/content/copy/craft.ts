// Chữ cố định của /nghe-det-chieu, chép nguyên văn từ CraftPage.dc.html và CraftMobile.dc.html.
// Nhánh `preview` là ghi chú quy trình, chỉ hiện ở bản xem trước (R4).
import type { ApplyMode } from './applyMode'
import { docLabel, photoPrefix } from './docLabel'

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
    docLabel,
    photoPrefix,
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

// Thẻ "Đọc tiếp": ảnh lấy từ ô `slot`.
export const craftReadNext = [
  { href: '/con-nguoi', slot: 'next-people', eyebrow: 'CON NGƯỜI', title: 'Gặp những người dệt', cta: 'Xem chân dung →' },
  { href: '/cau-chuyen', slot: 'next-stories', eyebrow: 'CÂU CHUYỆN', title: 'Nghề xưa trong nhịp sống mới', cta: 'Đọc bài →' },
  { href: '/san-pham', slot: 'next-products', eyebrow: 'SẢN PHẨM', title: 'Bộ sưu tập chiếu', cta: 'Xem hiện vật →' },
] as const
