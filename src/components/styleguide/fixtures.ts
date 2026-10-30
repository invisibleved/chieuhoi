import type {
  ArchiveItemView, ArchivePageView, CraftPageView, CraftStepView, ImageView, PersonDetailView, PersonView, ProductCardView, ReadNextItem, Rich, SourceView, StoryCardView, TimelineEventView,
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
  note: null,
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
  cta: 'Đọc bài →',
  status: null,
  isDraft: false,
  sourceCount: 3,
  flags: [],
}

export const storyHeroFeatured = {
  eyebrow: 'BÀI NỔI BẬT · LỊCH SỬ',
  meta: '3 nguồn báo chí · khoảng 4 phút đọc',
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
  cta: 'Đọc bài →',
  status: null,
  isDraft: false,
  sourceCount: 0,
  flags: [],
}

export const storyIdea: StoryCardView = {
  ...storyFeatured,
  cover: null,
  sapo: null,
  hasDetail: false,
  cta: 'Xem đề cương →',
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
  tag: { text: 'Chưa có ảnh', style: 'dashed' },
  shotNeeded: { desktop: 'Chiếu cạp điều chụp phẳng, ánh sáng tự nhiên, kèm cận cảnh mặt dệt', mobile: 'Chiếu cạp điều' },
  flags: [],
}

export const productWithImage: ProductCardView = {
  ...productNoImage,
  slug: 'chieu-cap-dieu',
  name: 'Chiếu cạp điều',
  image: imgStory,
  typeConfirmed: false,
  tag: { text: 'Ảnh cần xác nhận loại', style: 'filled' },
  shotNeeded: { desktop: 'Chiếu cạp điều chụp phẳng, ánh sáng tự nhiên, kèm cận cảnh mặt dệt', mobile: 'Chiếu cạp điều' },
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
    cite: ['vietnamplus-2026'],
  },
  {
    aspect: 'Thời gian một tấm', hand: '[cần xác minh]', machine: '[cần xác minh]',
    mobile: ['Thủ công: [cần xác minh] · Máy: [cần xác minh]'],
    muted: { hand: true, machine: true, mobile: [true] },
    cite: [],
  },
]

// Dụng cụ và hai cách dệt mẫu (chữ giống seed), một mục có chú thích nguồn để minh hoạ.
export const craftToolSamples = [
  { name: 'Khung dệt', note: { desktop: 'Cấu tạo, chất liệu gỗ và tên gọi từng bộ phận: [cần xác minh].', mobile: 'Tên bộ phận: [cần xác minh]' }, cite: ['vietnamplus-2026'] },
  { name: 'Khuôn in hoa văn', note: { desktop: 'Chất liệu khuôn và cách làm khuôn: [cần xác minh].', mobile: 'Chất liệu: [cần xác minh]' }, cite: [] },
]
export const craftWaySamples: { hand: CraftPageView['compare']['hand']; machine: CraftPageView['compare']['machine'] } = {
  hand: {
    title: 'Dệt thủ công', image: null, textCite: ['vietnamplus-2026'], noteCite: [],
    text: {
      desktop: 'Người thợ ngồi bên khung, đưa từng sợi cói qua khung dệt. Ảnh cho thấy hai người cùng làm trên một khung.',
      mobile: 'Người thợ ngồi bên khung, đưa từng sợi cói qua khung dệt.',
    },
    note: {
      desktop: 'Số người cần cho một khung, thời gian một tấm, cách chia việc trong gia đình: [cần xác minh].',
      mobile: 'Thời gian một tấm, cách chia việc: [cần xác minh].',
    },
  },
  machine: {
    title: 'Dệt bằng máy', image: null, textCite: [], noteCite: [],
    text: {
      desktop: 'Máy đảm nhận việc đan sợi, nhưng người thợ vẫn nạp cói bằng tay, như trong ảnh.',
      mobile: 'Máy đảm nhận việc đan sợi, người thợ vẫn nạp cói bằng tay.',
    },
    note: {
      desktop: 'Thời điểm máy dệt xuất hiện ở làng, loại máy và công suất: [cần xác minh].',
      mobile: 'Thời điểm máy dệt xuất hiện ở làng: [cần xác minh].',
    },
  },
}

// Bài đọc và chân dung: rich text đã lọc (dạng sanitizeRich trả về), thư viện ảnh, copy đồng ý.
export const imgHands = img('nkc14.webp', 'Đôi tay ấn go trên khung dệt chiếu, nhìn từ trên xuống', 840, 560)

const t = (text: string, format = 0) => ({ type: 'text', text, format })
export const richArticle: Rich = {
  root: {
    type: 'root',
    children: [
      { type: 'paragraph', children: [t('Ở làng Hới, người ta ít khi gọi Phạm Đôn Lễ bằng học vị. Người ta gọi ông là "Trạng Chiếu".'), { type: 'cite', n: 1 }, { type: 'cite', n: 2 }] },
      { type: 'heading', tag: 'h2', anchor: 'mot-tam-nguyen-cua-lang-hai-trieu', children: [t('Một Tam nguyên của làng Hải Triều')] },
      { type: 'paragraph', children: [t('Theo các bài báo, Phạm Đôn Lễ sinh năm 1457 tại làng Hải Triều. '), t('Điều báo chí ghi lại', 1), t(' và '), t('điều làng kể', 2), t(' được giữ song song.'), { type: 'cite', n: 2 }] },
      { type: 'quote', children: [t('Một ông Trạng, một khung dệt, và một nghề theo làng qua nhiều thế kỷ.')] },
      { type: 'figure', image: imgHands, caption: 'Đôi tay trên khung dệt.' },
    ],
  },
}

export const richStory: Rich = {
  root: {
    type: 'root',
    children: [
      { type: 'heading', tag: 'h2', anchor: 'tuoi-tho', children: [t('Tuổi thơ bên khung dệt')] },
      { type: 'paragraph', children: [t('[Đoạn kể dựa trên phỏng vấn.]')] },
      { type: 'list', listType: 'bullet', children: [{ type: 'listitem', children: [t('Mục danh sách')] }] },
    ],
  },
}

export const gallery = [
  { image: imgStory, caption: 'Mép chiếu với sợi cói buông.' },
  { image: imgHands, caption: 'Đôi tay trên khung dệt.' },
]

export const consentStates: Record<'none' | 'partial' | 'full', PersonDetailView['consent']> = {
  none: { state: 'none', missing: ['tên', 'ảnh', 'lời trích'], reviewedBySubject: false },
  partial: { state: 'partial', missing: ['lời trích'], reviewedBySubject: false },
  full: { state: 'full', missing: [], reviewedBySubject: true },
}

export const readNextItems: ReadNextItem[] = [
  { href: '/lang-hoi', eyebrow: 'LÀNG HỚI', title: 'Dòng thời gian làng Hới', cta: 'Xem các mốc →', image: imgCompact },
  { href: '/nghe-det-chieu', eyebrow: 'NGHỀ DỆT CHIẾU', title: 'Một tấm chiếu, muôn công đoạn', cta: 'Đi theo hành trình →', image: imgHand },
  { href: '/cau-chuyen', eyebrow: 'CHỦ ĐỀ · LỊCH SỬ', title: 'Chuyện về Trạng Chiếu', cta: 'Đọc bài →', image: imgStory, mobile: false },
]

// Thư viện mẫu cho Lightbox / ArchiveGallery: tên và mô tả lấy từ artboard Thư viện.
function archiveItem(n: number, file: string, title: string, description: string, cat: 'village' | 'weaving', related: { label: string; href: string }): ArchiveItemView {
  const code = `TL-00${n}`
  return {
    image: { ...img(file, `${title}. ${description}`, 1200, 800), code, docNumber: `00${n}` },
    title,
    description,
    category: cat,
    categoryLabel: cat === 'village' ? 'Làng quê' : 'Nghề dệt',
    era: 'now',
    eraLabel: 'Nay',
    related,
    flags: [],
    code,
    displayCode: `00${n}`,
    docLabel: `TL · 00${n}`,
    chipLabel: `TL · 00${n} · ${cat === 'village' ? 'Làng quê' : 'Nghề dệt'}`,
    name: title,
    takenAt: '[cần xác minh]',
    photographer: '[cần xác minh]',
    source: 'Bộ ảnh tham khảo của dự án',
    rights: { desktop: 'Chưa xin phép · không đăng công khai', mobile: 'Chưa xin phép' },
    sourceVerified: false,
  }
}

export const archivePageBase: Omit<ArchivePageView, 'copy'> = {
  intro: { title: '', lead: null, eyebrow: null } as unknown as ArchivePageView['intro'],
  items: [
    archiveItem(1, 'hc9.webp', 'Chiếu phơi bên ao làng', 'Chiếu hoa văn đỏ phơi dọc bờ ao giữa làng.', 'village', { label: 'Trang Làng Hới', href: '/lang-hoi' }),
    archiveItem(2, 'kn14.webp', 'In hoa văn bằng khuôn', 'Người thợ dùng khuôn in hoa văn đỏ lên mặt chiếu.', 'weaving', { label: 'Công đoạn 06', href: '/nghe-det-chieu' }),
    archiveItem(3, 'nkc5.webp', 'Dệt chiếu trên khung', 'Hai người cùng làm trên một khung dệt.', 'weaving', { label: 'Công đoạn 05', href: '/nghe-det-chieu' }),
  ],
  stats: { total: 3, verified: 0 },
  categories: [{ key: 'all', label: 'Tất cả' }, { key: 'village', label: 'Làng quê' }, { key: 'weaving', label: 'Nghề dệt' }],
  eras: [{ key: 'all', label: 'Mọi thời kỳ' }, { key: 'old', label: 'Xưa' }, { key: 'now', label: 'Nay' }],
  hasOld: false,
}
