// Chữ cố định của /cau-chuyen và /cau-chuyen/[slug], chép nguyên văn từ StoriesIndex, StoriesMobile,
// StoryDetail và StoryMobile (.dc.html). Nhánh `preview` là việc biên tập, chỉ hiện ở bản xem trước.
import type { ApplyMode } from './applyMode'

export const storiesCopy = {
  breadcrumb: { home: 'Trang chủ', current: 'Câu chuyện' },
  search: {
    label: 'Tìm trong câu chuyện',
    placeholder: { desktop: 'Ví dụ: khung dệt, Trạng Chiếu', mobile: 'Ví dụ: Trạng Chiếu' },
  },
  // aria-label của nhóm chip trên artboard.
  filter: { label: { desktop: 'Lọc theo chủ đề', mobile: 'Lọc' }, all: 'Tất cả' },
  count: { stories: '{n} bài', drafts: ' · {d} bản nháp' },
  featured: { eyebrow: 'BÀI NỔI BẬT', meta: '{s} nguồn báo chí · khoảng {m} phút đọc' },
  cta: { read: 'Đọc bài →', outline: 'Xem đề cương →' },
  empty: {
    title: 'Chưa có bài trong chủ đề này',
    body: {
      desktop: 'Câu chuyện về người làng chỉ được viết khi chính họ đồng ý kể. Nếu bạn muốn kể về một người thân làm nghề chiếu, hãy liên hệ với chúng tôi.',
      mobile: 'Câu chuyện về người làng chỉ được viết khi chính họ đồng ý kể.',
    },
    // LinkArrow tự thêm mũi tên nên nhãn không kèm "→".
    action: { href: '/ket-noi', label: 'Góp một câu chuyện' },
  },
  more: { label: 'Xem thêm câu chuyện', done: 'Đã hiện hết các bài hiện có' },
  detail: {
    back: 'Câu chuyện',
    draftTag: 'Bản nháp — cần thẩm định',
    meta: { editor: 'Biên tập: ', published: 'Ngày đăng: ', minutes: 'Khoảng {m} phút đọc', sources: '{s} nguồn' },
    photoPrefix: 'Ảnh: ',
    share: {
      label: 'CHIA SẺ',
      copy: { desktop: 'Sao chép đường dẫn', mobile: 'Sao chép link' },
      facebook: { desktop: 'Chia sẻ qua Facebook', mobile: 'Facebook' },
      zalo: { desktop: 'Chia sẻ qua Zalo', mobile: 'Zalo' },
      copied: 'Đã sao chép đường dẫn',
      zaloFallback: 'Đã sao chép đường dẫn, dán vào Zalo để chia sẻ',
    },
    toc: { label: 'Mục lục', title: 'TRONG BÀI' },
    progress: 'Tiến độ đọc',
    quoteNote: 'Trích từ bài viết',
    notesTitle: 'Ghi chú nguồn',
    // `all` đi qua LinkArrow (tự thêm mũi tên).
    readNext: { title: 'Đọc tiếp', eyebrow: 'ĐỌC TIẾP', all: 'Tất cả câu chuyện' },
    preview: { checklistTitle: 'CẦN THẨM ĐỊNH TRƯỚC KHI ĐĂNG' },
  },
}

export type StoriesCopyView = ApplyMode<typeof storiesCopy>

// Hai thẻ "Đọc tiếp" cố định của bài (R8); ảnh lấy từ ô `slot` của page-intros.cau-chuyen.
export const storiesReadNext = [
  { href: '/lang-hoi', slot: 'next-village', eyebrow: 'LÀNG HỚI', title: 'Dòng thời gian làng Hới', cta: 'Xem các mốc →' },
  { href: '/nghe-det-chieu', slot: 'next-craft', eyebrow: 'NGHỀ DỆT CHIẾU', title: 'Một tấm chiếu, muôn công đoạn', cta: 'Đi theo hành trình →' },
] as const
