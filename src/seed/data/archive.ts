// Nguyên văn từ design/source/ArchivePage.dc.html (mảng `data`, theo thứ tự) và các artboard khác cho alt.

export type ArchiveCategory = 'village' | 'weaving' | 'people' | 'products' | 'memory' | 'history'

export interface ArchiveItem {
  file: string
  code: string
  title: string
  description: string
  category: ArchiveCategory
  relatedLabel: string
  relatedHref: string
}

const route = {
  'VillagePage.dc.html': '/lang-hoi',
  'CraftPage.dc.html': '/nghe-det-chieu',
  'PeopleIndex.dc.html': '/con-nguoi',
  'ProductDetail.dc.html': '/san-pham/chieu-cap-dieu',
  'ProductsIndex.dc.html': '/san-pham',
} as const

const cat = { 'Làng quê': 'village', 'Nghề dệt': 'weaving', 'Con người': 'people', 'Sản phẩm': 'products' } as const

type Raw = [file: string, t: string, cat: keyof typeof cat, d: string, rel: string, relHref: keyof typeof route]

const raw: Raw[] = [
  ['hc9.webp', 'Chiếu phơi bên ao làng', 'Làng quê', 'Chiếu hoa văn đỏ phơi dọc bờ ao giữa làng.', 'Trang Làng Hới', 'VillagePage.dc.html'],
  ['kn14.webp', 'In hoa văn bằng khuôn', 'Nghề dệt', 'Người thợ dùng khuôn in hoa văn đỏ lên mặt chiếu.', 'Công đoạn 06', 'CraftPage.dc.html'],
  ['nkc5.webp', 'Dệt chiếu trên khung', 'Nghề dệt', 'Hai người cùng làm trên một khung dệt.', 'Công đoạn 05', 'CraftPage.dc.html'],
  ['nkc10.webp', 'Bên khung dệt', 'Con người', 'Người phụ nữ lớn tuổi ngồi dệt chiếu. Chưa có sự đồng ý của người trong ảnh.', 'Trang Con người', 'PeopleIndex.dc.html'],
  ['hc8.webp', 'Chiếu phơi trên bãi cỏ', 'Làng quê', 'Chiếu trải phơi kín bãi đất, trẻ em chơi bóng phía sau.', 'Trang Làng Hới', 'VillagePage.dc.html'],
  ['nkc13.webp', 'Khung dệt', 'Nghề dệt', 'Cận cảnh hàng răng gỗ của khung dệt với sợi căng.', 'Dụng cụ', 'CraftPage.dc.html'],
  ['kn8.webp', 'Chiếu trải trước xưởng', 'Sản phẩm', 'Tấm chiếu hoa văn đỏ trải trước cửa xưởng.', 'Hiện vật 01', 'ProductDetail.dc.html'],
  ['nkc8.webp', 'Sợi cói', 'Nghề dệt', 'Một túm sợi cói nằm trên mặt chiếu đang dệt.', 'Công đoạn 01', 'CraftPage.dc.html'],
  ['kn11.webp', 'Gấp chiếu', 'Con người', 'Người đàn ông gấp những tấm chiếu viền đỏ.', 'Trang Con người', 'PeopleIndex.dc.html'],
  ['kn3.webp', 'Sạp chiếu', 'Sản phẩm', 'Những cuộn chiếu hoa văn đỏ dựng đứng ở sạp.', 'Bộ sưu tập', 'ProductsIndex.dc.html'],
  ['nkc15.webp', 'May viền', 'Nghề dệt', 'May viền vải đỏ cho tấm chiếu bằng máy khâu.', 'Công đoạn 06', 'CraftPage.dc.html'],
  ['kn5.webp', 'Chiếu cuộn', 'Sản phẩm', 'Những cuộn chiếu cói dựng đứng trong xưởng.', 'Bộ sưu tập', 'ProductsIndex.dc.html'],
  ['kn12.webp', 'Lò trong xưởng', 'Nghề dệt', 'Người thợ đứng bên lò kim loại bốc hơi. Công dụng của lò: [cần xác minh].', 'Trang Nghề dệt', 'CraftPage.dc.html'],
  ['nkc2.webp', 'Máy dệt', 'Nghề dệt', 'Người đàn ông nạp sợi cói vào máy dệt.', 'Dệt bằng máy', 'CraftPage.dc.html'],
]

export const archiveItems: ArchiveItem[] = raw.map(([file, title, c, description, relatedLabel, href], k) => ({
  file,
  code: `TL-${String(k + 1).padStart(3, '0')}`,
  title,
  description,
  category: cat[c],
  relatedLabel,
  relatedHref: route[href],
}))

/** Alt của ảnh thuộc kho: artboard ArchivePage ghép `t + '. ' + d`. */
export const archiveAlt = (i: ArchiveItem) => `${i.title}. ${i.description}`

/** Ảnh tham khảo không nằm trong ArchivePage: alt lấy nguyên văn từ artboard ghi ở `from`. */
export const otherImageAlts: Record<string, { alt: string; from: string }> = {
  'hc2.webp': { alt: 'Người phụ nữ trải những tấm chiếu hoa văn đỏ bên dãy chiếu dựng đứng', from: 'Home.dc.html' },
  'kn1.webp': { alt: 'Tấm chiếu trắng in hoa văn trên bàn in', from: 'StoriesIndex.dc.html' },
  'kn2.webp': { alt: 'Hai người phụ nữ trải tấm chiếu hoa văn đỏ', from: 'PeopleIndex.dc.html' },
  'kn4.webp': { alt: 'Bàn tay đeo găng cầm bàn chải dính màu đỏ trên mặt chiếu', from: 'CraftPage.dc.html' },
  'kn13.webp': { alt: 'Hai người thợ in hoa văn đỏ lên chiếu bằng khuôn trong xưởng', from: 'CraftPage.dc.html' },
  'nkc1.webp': { alt: 'Hai người ngồi bên đống cói', from: 'StoriesIndex.dc.html' },
  'nkc4.webp': { alt: 'Hai người phụ nữ in hoa văn lên chiếu trên bàn gỗ', from: 'PeopleIndex.dc.html' },
  'nkc9.webp': { alt: 'Mép chiếu với sợi cói buông', from: 'StoriesIndex.dc.html' },
  'nkc14.webp': { alt: 'Đôi tay người phụ nữ ấn go trên khung dệt', from: 'PeopleIndex.dc.html' },
}
