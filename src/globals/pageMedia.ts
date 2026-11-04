// Danh sách ô ảnh của từng trang có ảnh do CMS quản lý (collection Trang). Lớp lib/content đọc theo danh sách này.
// Ảnh dụng cụ nằm trong từng dòng dụng cụ nên trang Nghề dệt chiếu không có ô tool-1..3.
export const PAGES_MEDIA_SLOTS = {
  'nghe-det-chieu': ['hero', 'hand', 'machine', 'next-people', 'next-stories', 'next-products'],
  'lang-hoi': ['hero', 'life-1', 'life-2', 'life-3'],
  'cau-chuyen': ['next-village', 'next-craft'],
  'con-nguoi': ['related-people'],
  'san-pham': ['next-pattern'],
} as const

/** Nhãn hiển thị trong trang quản trị. */
export const PAGE_MEDIA_SLOT_LABELS: Record<string, string> = {
  hero: 'Ảnh đầu trang',
  hand: 'Dệt tay',
  machine: 'Dệt máy',
  'next-people': 'Tiếp theo: Con người',
  'next-stories': 'Tiếp theo: Câu chuyện',
  'next-products': 'Tiếp theo: Sản phẩm',
  'life-1': 'Đời sống 1',
  'life-2': 'Đời sống 2',
  'life-3': 'Đời sống 3',
  'next-village': 'Tiếp theo: Làng Hới',
  'next-craft': 'Tiếp theo: Nghề dệt chiếu',
  'related-people': 'Liên quan: Con người',
  'next-pattern': 'Tiếp theo: Công đoạn tạo hoa văn',
}
