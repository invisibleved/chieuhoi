// Chữ cố định của /san-pham và /san-pham/[slug], chép nguyên văn từ ProductsIndex, ProductsMobile,
// ProductDetail và ProductMobile (.dc.html). Nhánh `preview` là chỉ dẫn biên tập, chỉ hiện ở bản xem trước.
import type { ApplyMode } from './applyMode'

export const productsCopy = {
  breadcrumb: { home: 'Trang chủ', current: 'Sản phẩm' },
  filter: { label: { desktop: 'Lọc theo nhóm', mobile: 'Lọc' }, all: 'Tất cả' },
  count: { desktop: '{n} hiện vật · danh mục theo Vietnam+', mobile: '{n} hiện vật' },
  catalog: {
    title: 'VỀ DANH MỤC',
    body: 'Các loại chiếu dưới đây theo bài Vietnam+ (14/08/2026). Tên gọi, đặc điểm và ảnh của từng loại cần cơ sở dệt xác nhận.',
    link: 'Xem nguồn',
  },
  tag: { noImage: 'Chưa có ảnh', unconfirmed: 'Ảnh cần xác nhận loại' },
  shotNeeded: { desktop: '{name} chụp phẳng, ánh sáng tự nhiên, kèm cận cảnh mặt dệt', mobile: '{name}' },
  empty: { title: 'Chưa có hiện vật trong nhóm này' },
  cta: {
    title: 'Muốn tìm đến người làm chiếu?',
    body: 'Trang này không bán hàng. Danh sách cơ sở dệt sẽ chỉ đăng khi đã xác minh và được cơ sở đồng ý công khai.',
    action: { href: '/ket-noi', label: 'Kết nối với làng' },
  },
  detail: {
    back: 'Sản phẩm',
    typeNote: 'Ảnh cần cơ sở dệt xác nhận đúng loại',
    imagesLabel: 'Ảnh hiện vật',
    thumbLabel: 'Xem ảnh {n}',
    caption: {
      position: 'Ảnh {i}/{n}',
      photographer: ' · Ảnh: {name}',
      unconfirmed: ' · Chưa xác nhận đây là {name}',
    },
    explore: {
      title: 'KHÁM PHÁ ĐƯỜNG DỆT',
      hint: 'Chạm vào các điểm để xem chi tiết đường dệt',
      hintOther: 'Chọn ảnh 1 để khám phá đường dệt',
      idle: {
        desktop: 'Chọn một điểm trên ảnh hoặc trong danh sách để phóng to và đọc chú thích.',
        mobile: 'Chạm một điểm trên ảnh hoặc chọn bên trên để phóng to và đọc chú thích.',
      },
      markerLabel: 'Chi tiết {n}: {title}',
      markerLabelUntitled: 'Chi tiết {n}',
      pickerLabel: 'Chọn chi tiết',
      regionLabel: 'Chú thích chi tiết',
      close: 'Đóng chi tiết',
    },
    context: { eyebrow: 'BỐI CẢNH', title: 'Một tấm chiếu trong đời sống làng' },
    specs: {
      material: 'Chất liệu', technique: 'Kỹ thuật', pattern: 'Hoa văn', size: 'Kích thước',
      maker: 'Nơi làm', care: 'Bảo quản', contact: 'Liên hệ người làm',
    },
    noMaker: 'Chưa có cơ sở được xác minh và đồng ý công khai',
    // Desktop: LinkArrow tự thêm mũi tên. Mobile: nút viền thay cho dòng liên hệ.
    connect: { label: { desktop: 'Kết nối với làng', mobile: 'Kết nối với người làm chiếu' }, href: '/ket-noi' },
    sourcesTitle: 'Nguồn',
    others: { title: 'Hiện vật khác', eyebrow: 'HIỆN VẬT KHÁC', all: 'Toàn bộ sưu tập', cta: 'Xem hiện vật →' },
    preview: {
      placeholders: {
        size: '[chỉ ghi khi đã đo]',
        maker: { desktop: '[tên cơ sở, nếu được đồng ý]', mobile: '[nếu được đồng ý]' },
        care: '[hướng dẫn từ cơ sở dệt]',
      },
    },
  },
}

export type ProductsCopyView = ApplyMode<typeof productsCopy>

// Thẻ cố định cuối "Hiện vật khác" (R8); ảnh lấy từ ô `slot` của page-intros.san-pham.
export const productsOtherFixed = {
  href: '/nghe-det-chieu', slot: 'next-pattern', eyebrow: 'CÁCH LÀM', title: 'Công đoạn tạo hoa văn', cta: 'Xem công đoạn →',
} as const
