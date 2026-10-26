// Trường seed JSON còn thiếu, lấy nguyên văn từ artboard.

/** StoriesIndex.dc.html (`data`); riêng sapo bài Trạng Chiếu lấy từ StoryDetail.dc.html. */
export const storyExtras: Record<string, { sapo: string; cover: string; readingMinutes?: number }> = {
  'chuyen-ve-trang-chieu': {
    sapo: 'Phạm Đôn Lễ và khung dệt mang về làng Hới — những gì báo chí ghi lại, và những gì làng vẫn kể.',
    cover: 'nkc13.webp',
    readingMinutes: 4,
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

/** PeopleIndex.dc.html: tên là placeholder nên để null. Mẫu đầu tiên trùng slug `mau-nghe-nhan` của seed JSON; note theo artboard (R17). */
export const peopleSamples: { slug: string; category: string; note: string; portrait: string }[] = [
  { slug: 'mau-nghe-nhan', category: 'artisan', note: 'Dệt chiếu tay · vai trò cần xác minh', portrait: 'nkc10.webp' },
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
