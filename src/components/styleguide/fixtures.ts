import type {
  CraftPageView, CraftStepView, ImageView, PersonView, ProductCardView, SourceView, StoryCardView, TimelineEventView,
} from '@/lib/content'

// Dữ liệu mẫu cho /styleguide, lấy nguyên văn từ artboard Components.
// Ảnh nằm ở public/images/reference (gitignore, chỉ có ở máy dev); width/height đọc từ file thật.
function img(file: string, alt: string, width: number, height: number): ImageView {
  return { url: `/images/reference/${file}`, alt, width, height, sizes: {}, photographer: null, code: null, docNumber: null, flags: [] }
}

export const imgPortrait = img('nkc10.webp', 'Người phụ nữ lớn tuổi ngồi dệt chiếu', 840, 560)
export const imgStory = img('nkc9.webp', 'Mép chiếu với sợi cói buông', 840, 560)
export const imgCompact = img('hc9.webp', 'Chiếu phơi bờ ao', 1800, 841)

export const person: PersonView = {
  slug: 'mau',
  category: 'Nghệ nhân',
  categoryKey: 'artisan',
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
  categoryKey: 'history',
  cover: imgStory,
  readingMinutes: null,
  hasDetail: true,
  status: null,
  sourceCount: 3,
  flags: [],
}

export const storyCompact: StoryCardView = {
  slug: 'mot-ngay-o-lang-hoi',
  title: 'Một ngày ở làng Hới',
  sapo: null,
  category: 'Đời sống hôm nay',
  categoryKey: 'life-today',
  cover: imgCompact,
  readingMinutes: null,
  hasDetail: true,
  status: null,
  sourceCount: 0,
  flags: [],
}

export const storyIdea: StoryCardView = {
  ...storyFeatured,
  cover: null,
  sapo: null,
  hasDetail: false,
  status: 'Chủ đề đề xuất',
  sourceCount: 0,
  flags: [],
}

export const productNoImage: ProductCardView = {
  slug: 'chieu-tron',
  code: null,
  name: 'Chiếu trơn',
  group: null,
  groupLabel: null,
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

// Khối trang Nghề dệt chiếu / Làng Hới: lấy nguyên văn từ content/seed (craftSteps.json, timeline.json) và artboard.
export const imgStep1 = img('nkc8.webp', 'Một túm sợi cói nằm trên mặt chiếu đang dệt', 840, 560)
export const imgStep2 = img('nkc1.webp', 'Hai người ngồi bên đống cói trong nhà, chuẩn bị sợi', 700, 933)
export const imgHand = img('nkc5.webp', 'Hai người phụ nữ ngồi trên sàn nhà, cùng dệt chiếu trên khung gỗ', 840, 560)

const stepBase = { shortTitle: null, subtitle: null, body: null, tools: null, toRecord: null, shotNeeded: null, flags: [] }
export const craftSteps: CraftStepView[] = [
  { ...stepBase, n: 1, title: 'Nguyên liệu', shortTitle: 'Nguyên liệu', subtitle: 'Cói và các vật liệu liên quan', body: 'Cói là nguyên liệu chính làm nên tấm chiếu.', image: { ...imgStep1, docNumber: '101' }, focus: [45, 55] },
  { ...stepBase, n: 2, title: 'Chuẩn bị và xử lý', shortTitle: 'Xử lý', subtitle: 'Làm sợi cói trước khi dệt', image: { ...imgStep2, docNumber: '102' }, focus: [40, 70] },
  { ...stepBase, n: 3, title: 'Phơi và nhuộm', shortTitle: 'Phơi, nhuộm', subtitle: 'Phơi khô, nhuộm màu sợi', image: null, shotNeeded: 'Cói phơi trên sân và sợi cói sau khi nhuộm màu', focus: [50, 50] },
]

// Dòng nguồn ghép như getTimeline: "Nhà xuất bản (dd/mm/yyyy); …" theo content/seed/sources.json.
const ev = (label: string, title: string, body: string, confidence: TimelineEventView['confidence'], sourceLine: string): TimelineEventView => ({
  label, title, body, confidence, sourceIds: [], sourceLine, sourceHref: null, flags: [],
})
export const timelineEvents: TimelineEventView[] = [
  ev('1457', 'Phạm Đôn Lễ ra đời', 'Sinh tại làng Hải Triều, tức làng Hới.', 'press', 'Dân Việt (dẫn Báo Hải Dương) (13/06/2024); Đại Đoàn Kết (07/08/2021)'),
  ev('1481', 'Đỗ Tam nguyên', 'Đỗ đầu cả ba kỳ thi Hương, Hội và Đình dưới triều Lê Thánh Tông.', 'press', 'Dân Việt (dẫn Báo Hải Dương) (13/06/2024); Đại Đoàn Kết (07/08/2021)'),
  ev('Thời Lê', 'Khung dệt về làng', 'Theo lời kể, khi đi sứ nhà Minh ông học kỹ thuật dệt chiếu, mua khung dệt mang về, cải tiến khung và dạy dân làng. Vietnam+ đặt vào đầu thế kỷ XVI.', 'oral', 'Dân Việt (dẫn Báo Hải Dương) (13/06/2024); Đại Đoàn Kết (07/08/2021); Vietnam+ (14/08/2026)'),
  ev('[?]', 'Đền thờ tổ nghề', 'Năm lập đền và cấp xếp hạng chưa xác định. Lễ tế được ghi vào mùng 6 tháng Giêng âm lịch.', 'pending', 'Đại Đoàn Kết (07/08/2021)'),
  {
    label: '+', title: 'Mốc của bạn',
    body: 'Ký ức, ảnh cũ, giấy tờ của các gia đình làng Hới có thể bổ sung vào dòng thời gian này sau khi được xác minh.',
    confidence: 'pending', sourceIds: [], sourceLine: 'Mời đóng góp qua trang Kết nối', sourceHref: '/ket-noi', flags: [],
  },
]

export const compareRows: CraftPageView['compare']['rows'] = [
  {
    aspect: 'Việc của đôi tay', hand: 'Đưa sợi và dệt trên khung', machine: 'Nạp cói vào máy',
    mobile: ['Thủ công: đưa sợi và dệt trên khung', 'Bằng máy: nạp cói vào máy'],
    muted: { hand: false, machine: false, mobile: [false, false] },
  },
  {
    aspect: 'Thời gian một tấm', hand: '[cần xác minh]', machine: '[cần xác minh]',
    mobile: ['Thủ công: [cần xác minh] · Máy: [cần xác minh]'],
    muted: { hand: true, machine: true, mobile: [true] },
  },
]
