import { readFileSync } from 'node:fs'
import { join } from 'node:path'

/** Route cần kiểm ở Phase 7 (a11y, bàn phím, CLS, so ảnh). `screen` là tên ảnh trong `design/screens` (không có đuôi). */
export type AuditRoute = { path: string; name: string; draftOnPublic?: true; screen?: { desktop: string; mobile: string } }

export const VIEWPORTS = { desktop: { width: 1440, height: 900 }, mobile: { width: 390, height: 844 } }

type SeedRecord = { slug: string; title?: string; annotations?: unknown[] }

// Đọc slug thật từ seed lúc nạp module, không viết cứng: đổi seed thì route đổi theo.
function seed(name: string): SeedRecord[] {
  return JSON.parse(readFileSync(join(process.cwd(), 'content/seed', `${name}.json`), 'utf8')) as SeedRecord[]
}

function required<T>(value: T | undefined, what: string): T {
  if (value === undefined) throw new Error(`Seed thiếu ${what}`)
  return value
}

const story = required(
  seed('stories').find((s) => s.title === 'Chuyện về Trạng Chiếu'),
  'bài "Chuyện về Trạng Chiếu" trong content/seed/stories.json',
)
const person = required(seed('people')[0], 'người đầu tiên trong content/seed/people.json')
const product = required(
  seed('products').find((p) => (p.annotations?.length ?? 0) > 0),
  'sản phẩm có điểm hoa văn (annotations) trong content/seed/products.json',
)

export const AUDIT_ROUTES: AuditRoute[] = [
  { path: '/', name: 'trang chủ', screen: { desktop: 'Home', mobile: 'HomeMobile' } },
  { path: '/nghe-det-chieu', name: 'nghề dệt chiếu', screen: { desktop: 'CraftPage', mobile: 'CraftMobile' } },
  { path: '/lang-hoi', name: 'làng Hới', screen: { desktop: 'VillagePage', mobile: 'VillageMobile' } },
  { path: '/cau-chuyen', name: 'câu chuyện', screen: { desktop: 'StoriesIndex', mobile: 'StoriesMobile' } },
  { path: `/cau-chuyen/${story.slug}`, name: 'bài câu chuyện', draftOnPublic: true, screen: { desktop: 'StoryDetail', mobile: 'StoryMobile' } },
  { path: '/con-nguoi', name: 'con người', screen: { desktop: 'PeopleIndex', mobile: 'PeopleMobile' } },
  { path: `/con-nguoi/${person.slug}`, name: 'chân dung', screen: { desktop: 'PersonDetail', mobile: 'PersonMobile' } },
  { path: '/san-pham', name: 'sản phẩm', screen: { desktop: 'ProductsIndex', mobile: 'ProductsMobile' } },
  { path: `/san-pham/${product.slug}`, name: 'chi tiết sản phẩm', screen: { desktop: 'ProductDetail', mobile: 'ProductMobile' } },
  { path: '/thu-vien', name: 'thư viện', screen: { desktop: 'ArchivePage', mobile: 'ArchiveMobile' } },
  { path: '/ket-noi', name: 'kết nối', screen: { desktop: 'ConnectPage', mobile: 'ConnectMobile' } },
]
