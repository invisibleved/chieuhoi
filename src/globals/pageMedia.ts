// Danh sách ô ảnh của từng trang có ảnh do CMS quản lý. Lớp lib/content đọc theo danh sách này.
export const PAGE_MEDIA_SLOTS = {
  'nghe-det-chieu': ['hero', 'tool-1', 'tool-2', 'tool-3', 'hand', 'machine', 'next-people', 'next-stories', 'next-products'],
  'lang-hoi': ['hero', 'life-1', 'life-2', 'life-3'],
} as const

export type PageMediaRoute = keyof typeof PAGE_MEDIA_SLOTS
export type PageMediaSlot<R extends PageMediaRoute> = (typeof PAGE_MEDIA_SLOTS)[R][number]

/** Nhãn hiển thị trong trang quản trị. */
export const PAGE_MEDIA_SLOT_LABELS: Record<string, string> = {
  hero: 'Ảnh đầu trang',
  'tool-1': 'Dụng cụ 1',
  'tool-2': 'Dụng cụ 2',
  'tool-3': 'Dụng cụ 3',
  hand: 'Dệt tay',
  machine: 'Dệt máy',
  'next-people': 'Tiếp theo: Con người',
  'next-stories': 'Tiếp theo: Câu chuyện',
  'next-products': 'Tiếp theo: Sản phẩm',
  'life-1': 'Đời sống 1',
  'life-2': 'Đời sống 2',
  'life-3': 'Đời sống 3',
}

export const isPageMediaRoute = (key: string): key is PageMediaRoute => key in PAGE_MEDIA_SLOTS
