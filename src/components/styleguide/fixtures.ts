import type { ImageView, PersonView, ProductCardView, SourceView, StoryCardView } from '@/lib/content'

// Dữ liệu mẫu cho /styleguide, lấy nguyên văn từ artboard Components.
// Ảnh nằm ở public/images/reference (gitignore, chỉ có ở máy dev); width/height đọc từ file thật.
function img(file: string, alt: string, width: number, height: number): ImageView {
  return { url: `/images/reference/${file}`, alt, width, height, sizes: {}, photographer: null, code: null, flags: [] }
}

export const imgPortrait = img('nkc10.webp', 'Người phụ nữ lớn tuổi ngồi dệt chiếu', 840, 560)
export const imgStory = img('nkc9.webp', 'Mép chiếu với sợi cói buông', 840, 560)
export const imgCompact = img('hc9.webp', 'Chiếu phơi bờ ao', 1800, 841)

export const person: PersonView = {
  slug: 'mau',
  category: 'Nghệ nhân',
  role: 'Vai trò: [cần xác minh]',
  name: '[Tên nghệ nhân]',
  portrait: imgPortrait,
  quote: null,
  consentPending: false,
  flags: [],
}

export const personPending: PersonView = {
  ...person,
  name: null,
  role: null,
  portrait: null,
  consentPending: true,
}

export const storyFeatured: StoryCardView = {
  slug: 'chuyen-ve-trang-chieu',
  title: 'Chuyện về Trạng Chiếu',
  sapo: 'Mô tả ngắn 1–2 dòng. [Cần nguồn]',
  category: 'Lịch sử',
  cover: imgStory,
  readingMinutes: null,
  hasDetail: true,
  flags: [],
}

export const storyCompact: StoryCardView = {
  slug: 'mot-ngay-o-lang-hoi',
  title: 'Một ngày ở làng Hới',
  sapo: null,
  category: 'Đời sống hôm nay',
  cover: imgCompact,
  readingMinutes: null,
  hasDetail: true,
  flags: [],
}

export const storyIdea: StoryCardView = {
  ...storyFeatured,
  cover: null,
  sapo: null,
  hasDetail: false,
  flags: ['idea'],
}

export const productNoImage: ProductCardView = {
  slug: 'chieu-tron',
  code: null,
  name: 'Chiếu trơn',
  group: null,
  summary: null,
  image: null,
  typeConfirmed: false,
  flags: [],
}

export const productWithImage: ProductCardView = {
  ...productNoImage,
  slug: 'chieu-cap-dieu',
  name: 'Chiếu cạp điều',
  image: imgStory,
  typeConfirmed: false,
}

// Hai nguồn thật trích từ content/seed/sources.json.
export const sources: SourceView[] = [
  {
    id: 'vietnamplus-2026',
    publisher: 'Vietnam+',
    title: 'Giữ hồn nghề dệt chiếu cói làng Hới giữa nhịp sống hiện đại',
    url: 'https://www.vietnamplus.vn/giu-hon-nghe-det-chieu-coi-lang-hoi-giua-nhip-song-hien-dai-post1123026.vnp',
    date: '2026-08-14',
  },
  {
    id: 'danviet-2024',
    publisher: 'Dân Việt (dẫn Báo Hải Dương)',
    title: 'Lăng mộ Trạng nguyên Phạm Đôn Lễ thời Hậu Lê ở Hải Dương',
    url: 'https://danviet.vn/lang-mo-trang-nguyen-pham-don-le-thoi-hau-le-o-hai-duong-ong-que-thai-binh-ong-to-nghe-det-chieu-20240613144750326-d1166801.html',
    date: '2024-06-13',
  },
]
