// Nguyên văn từ footer Home.dc.html và phần đầu các artboard desktop.

export const siteSettings = {
  tagline: 'Nơi những sợi cói dệt nên chuyện làng.',
  description: 'Không gian số lưu giữ ký ức, con người và nghề dệt chiếu làng Hới.',
  address: 'Làng Hới (Hải Triều), xã Long Hưng, tỉnh Hưng Yên',
  addressNote: 'Trước đây: xã Tân Lễ, huyện Hưng Hà, tỉnh Thái Bình',
  copyright: '© 2026 Chiếu Hới. Ảnh thuộc bản quyền của tác giả, ghi công trong từng tư liệu.',
  // email, phone, visitInfo: artboard chỉ có placeholder, để trống.
} as const

export const homeMedia = {
  heroImage: 'kn14.webp',
  heroInset: 'kn5.webp',
  heroCaption: 'Ảnh: [tác giả — cần xác minh] · Địa điểm: [cần xác minh]',
  villageImages: [
    { file: 'hc8.webp', caption: 'Chiếu trải phơi trên bãi đất trống. Địa điểm và thời gian chụp: [cần xác minh].' },
    { file: 'kn11.webp', caption: 'Gấp chiếu thành phẩm. [Nhân vật — cần xin phép trước khi đăng]' },
  ],
}

type Slot = { slot: string; file: string; caption?: string }

/** Ảnh theo ô của các trang Nghề dệt chiếu, Làng Hới, Câu chuyện và Con người. File và chú thích nguyên văn từ artboard. */
export const pageMedia: Record<'nghe-det-chieu' | 'lang-hoi' | 'cau-chuyen' | 'con-nguoi' | 'san-pham', Slot[]> = {
  'nghe-det-chieu': [
    { slot: 'hero', file: 'nkc14.webp', caption: 'Đôi tay trên khung dệt. Ảnh: [tác giả — cần xác minh]' },
    { slot: 'hand', file: 'nkc5.webp' },
    { slot: 'machine', file: 'nkc2.webp' },
    { slot: 'next-people', file: 'nkc10.webp' },
    { slot: 'next-stories', file: 'nkc2.webp' },
    { slot: 'next-products', file: 'kn8.webp' },
  ],
  'lang-hoi': [
    { slot: 'hero', file: 'hc9.webp', caption: 'Chiếu phơi bên ao làng · Địa điểm, tác giả: [cần xác minh]' },
    { slot: 'life-1', file: 'hc8.webp', caption: 'Chiếu phơi trên bãi đất trống. [Địa điểm, thời gian — cần xác minh]' },
    { slot: 'life-2', file: 'hc2.webp', caption: 'Bày chiếu. [cần xác minh]' },
    { slot: 'life-3', file: 'kn2.webp', caption: 'Xem chiếu. [cần xác minh]' },
  ],
  // Thẻ "Đọc tiếp" của bài (StoryDetail.dc.html).
  'cau-chuyen': [
    { slot: 'next-village', file: 'hc9.webp' },
    { slot: 'next-craft', file: 'nkc5.webp' },
  ],
  // Thẻ cố định "Những chân dung khác" ở mục Liên quan của trang chân dung (PersonDetail.dc.html).
  'con-nguoi': [{ slot: 'related-people', file: 'kn2.webp' }],
  // Thẻ cố định "CÁCH LÀM · Công đoạn tạo hoa văn" ở cuối trang hiện vật (R8).
  'san-pham': [{ slot: 'next-pattern', file: 'kn13.webp' }],
}

/** Ảnh của từng dòng dụng cụ trang Nghề dệt chiếu (theo thứ tự dòng), trước đây ở ô `tool-1..3`. */
export const toolImages = ['nkc13.webp', 'kn1.webp', 'kn4.webp'] as const

type Intro = { eyebrow: string; title: string; lead?: string; heroTitle?: string }

// title là textarea nên giữ được ngắt dòng (\n).
export const pageIntros: Record<string, Intro> = {
  home: {
    eyebrow: 'DI SẢN LÀNG NGHỀ VIỆT NAM',
    title: 'Từ sợi cói quê nhà, dệt nên những câu chuyện.',
    heroTitle: 'Từ sợi cói quê nhà,\ndệt nên những\ncâu chuyện.',
    lead: 'Khám phá làng Hới, nơi nghề dệt chiếu lưu giữ ký ức, sự khéo léo và tâm hồn của bao thế hệ.',
  },
  'lang-hoi': {
    eyebrow: '01 — LÀNG HỚI',
    title: 'Có một làng Hới...',
    lead: 'Một ngôi làng ven sông, nơi nghề dệt chiếu được kể là đã có từ hơn năm trăm năm, và nơi người ta vẫn nhắc đến một ông Trạng đã mang khung dệt về quê.',
  },
  // Lead là bản mobile (StoriesMobile.dc.html), chỉ hiện ở mobile (R12).
  'cau-chuyen': { eyebrow: '02 — CÂU CHUYỆN', title: 'Chuyện làng, kể chậm.', lead: 'Ký ức, lịch sử và đời sống hôm nay của làng Hới.' },
  'nghe-det-chieu': {
    eyebrow: '03 — NGHỀ DỆT CHIẾU',
    title: 'Một tấm chiếu,\nmuôn công đoạn.',
    lead: 'Từ bó cói ngoài đồng đến tấm chiếu trải giữa nhà là một hành trình của đôi tay, thời tiết và sự kiên nhẫn. Đi theo từng công đoạn bên dưới.',
  },
  'con-nguoi': {
    eyebrow: '04 — CON NGƯỜI',
    title: 'Những bàn tay\ngiữ hồn làng.',
    lead: 'Người dệt, người in hoa, người giữ khung dệt cũ trong nhà. Mỗi chân dung ở đây là một người thật, và chỉ được kể khi chính họ đồng ý.',
  },
  'san-pham': {
    eyebrow: '05 — SẢN PHẨM',
    title: 'Nét đẹp từ\nnhững đường dệt.',
    lead: 'Mỗi tấm chiếu ở đây được trình bày như một hiện vật: chất liệu, cách làm, nơi làm ra. Đây là bộ sưu tập để hiểu, không phải cửa hàng.',
  },
  'thu-vien': {
    eyebrow: '06 — THƯ VIỆN',
    title: 'Ký ức qua\ntừng khung hình.',
    lead: 'Kho ảnh và tư liệu của làng Hới. Mỗi tấm đều có chỗ cho tên, thời gian, người chụp, nguồn và quyền sử dụng.',
  },
  'ket-noi': {
    eyebrow: 'KẾT NỐI',
    title: 'Làng vẫn còn đó.\nChuyện nghề vẫn được kể tiếp.',
    lead: 'Góp một tấm ảnh, giới thiệu một người giữ nghề, hay chỉ muốn tìm hiểu thêm về làng Hới, đây là nơi bắt đầu.',
  },
}
