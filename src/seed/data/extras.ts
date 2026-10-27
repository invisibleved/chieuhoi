// Trường seed JSON còn thiếu, lấy nguyên văn từ artboard.

type StoryExtra = {
  sapo: string
  cover: string
  readingMinutes?: number
  coverCaption?: string
  reviewChecklist?: string[]
}

/**
 * StoriesIndex.dc.html (`data`); riêng bài Trạng Chiếu lấy sapo, chú thích ảnh bìa và danh sách
 * "CẦN THẨM ĐỊNH TRƯỚC KHI ĐĂNG" từ StoryDetail.dc.html. Ngày đăng để trống (chờ thẩm định).
 */
export const storyExtras: Record<string, StoryExtra> = {
  'chuyen-ve-trang-chieu': {
    sapo: 'Phạm Đôn Lễ và khung dệt mang về làng Hới — những gì báo chí ghi lại, và những gì làng vẫn kể.',
    cover: 'nkc13.webp',
    readingMinutes: 4,
    coverCaption: 'Khung dệt thủ công ngày nay. Ảnh minh hoạ cho bài, không phải khung dệt thời Lê.',
    reviewChecklist: [
      'Đối chiếu năm sinh, năm mất, năm đỗ với sử liệu khoa bảng.',
      'Xác nhận ngày lễ tế tổ nghề với người làng.',
      'Xin phép và ghi công tác giả ảnh.',
    ],
  },
  'nhung-ky-uc-ben-khung-det': { sapo: 'Chờ ghi chép từ các gia đình làm nghề.', cover: 'kn1.webp' },
  'mot-ngay-o-lang-hoi': { sapo: 'Phóng sự ảnh một ngày làm chiếu, chờ chụp tại làng.', cover: 'hc8.webp' },
  'nghe-xua-trong-nhip-song-moi': { sapo: 'Dệt tay và dệt máy cùng tồn tại ở làng nghề hôm nay.', cover: 'nkc2.webp' },
  'tu-soi-coi-den-mot-doi-nguoi': { sapo: 'Hành trình của một tấm chiếu, từ đồng cói đến giường cưới.', cover: 'nkc1.webp' },
  'mua-chieu-tet': { sapo: 'Ký ức về những phiên chiếu cuối năm, chờ người làng kể.', cover: 'kn3.webp' },
}

export const storyCategory: Record<string, string> = {
  'Lịch sử': 'history',
  'Ký ức làng quê': 'village-memory',
  'Nghề truyền thống': 'traditional-craft',
  'Con người': 'people',
  'Đời sống hôm nay': 'life-today',
}

type PersonSample = {
  slug: string
  category: string
  note: string
  portrait: string
  gallery?: { file: string; caption: string }[]
  /** Số công đoạn liên quan (`n`). */
  relatedStep?: number
}

/**
 * PeopleIndex.dc.html: tên là placeholder nên để null. Mẫu đầu tiên trùng slug `mau-nghe-nhan` của seed JSON; note theo artboard.
 * Phóng sự ảnh và công đoạn liên quan của mẫu đầu lấy từ PersonDetail.dc.html (R17); không seed hiện vật liên quan.
 */
export const peopleSamples: PersonSample[] = [
  {
    slug: 'mau-nghe-nhan', category: 'artisan', note: 'Dệt chiếu tay · vai trò cần xác minh', portrait: 'nkc10.webp',
    gallery: [
      { file: 'nkc5.webp', caption: 'Hai người cùng làm trên một khung. [Chú thích cần người trong ảnh duyệt]' },
      { file: 'nkc14.webp', caption: 'Đôi tay trên khung dệt.' },
    ],
    relatedStep: 5,
  },
  { slug: 'mau-nguoi-2', category: 'craft-family', note: 'Đôi tay trên khung dệt · cần xác minh', portrait: 'nkc14.webp' },
  { slug: 'mau-nguoi-3', category: 'craft-keeper', note: 'In hoa văn bằng khuôn · cần xác minh', portrait: 'kn14.webp' },
  { slug: 'mau-nguoi-4', category: 'craft-family', note: 'Nạp cói cho máy dệt · cần xác minh', portrait: 'nkc2.webp' },
  { slug: 'mau-nguoi-5', category: 'craft-keeper', note: 'Hoàn thiện thành phẩm · cần xác minh', portrait: 'kn11.webp' },
  { slug: 'mau-nguoi-6', category: 'village-bound', note: 'Bày chiếu, đưa chiếu đi xa · cần xác minh', portrait: 'kn2.webp' },
  { slug: 'mau-nguoi-7', category: 'artisan', note: 'In hoa văn trên bàn gỗ · cần xác minh', portrait: 'nkc4.webp' },
  { slug: 'mau-nguoi-8', category: 'village-bound', note: 'Công việc trong xưởng · cần xác minh', portrait: 'kn12.webp' },
]

/** ProductsIndex.dc.html (`d`), theo `code` của seed JSON. */
export const productSummary: Record<string, string> = {
  'chieu-cap-dieu': 'Tên gọi gợi phần viền (cạp) màu đỏ điều. Đặc điểm cụ thể: [cần xác minh].',
  'chieu-hoa-cai': 'Đặc điểm và cách làm: [cần xác minh].',
  'chieu-tron': 'Chiếu không in hoa văn. Kích thước phổ biến: [cần xác minh].',
  'chieu-dot': 'Đặc điểm và cách làm: [cần xác minh].',
  'chieu-soi-xe': 'Đặc điểm và cách làm: [cần xác minh].',
  'chieu-gon': 'Báo Đại Đoàn Kết (2021) viết chiếu gon có tuổi đời hơn 500 năm. Đặc điểm: [cần xác minh].',
  'chieu-duong-dai': 'Cơ sở trong xã hiện cũng làm các loại chiếu này bằng máy.',
}
