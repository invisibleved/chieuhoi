import type { ArchiveAsset } from '@/payload-types'

import type { ArchiveCopyView } from './copy/archive'
import type { ConnectCopyView } from './copy/connect'
import type { CraftCopyView } from './copy/craft'
import type { PeopleCopyView } from './copy/people'
import type { ProductsCopyView } from './copy/products'
import type { StoriesCopyView } from './copy/stories'
import type { VillageCopyView } from './copy/village'

export type Mode = 'public' | 'preview'
export type Flag = 'unpublished' | 'rights-not-permitted' | 'consent-pending' | 'unverified'

export interface ImageView {
  url: string
  alt: string
  width: number
  height: number
  sizes: Partial<Record<'thumb' | 'card' | 'wide' | 'full', string>>
  photographer: string | null
  code: string | null
  /** Phần số của mã `TL-<số>`; null khi mã không đúng dạng đó. */
  docNumber: string | null
  flags: Flag[]
}

export interface PersonView {
  slug: string
  category: string | null
  role: string | null
  name: string | null
  /** Giá trị option của nhóm (khoá bộ lọc); nhãn ở `category`. */
  categoryKey: string | null
  portrait: ImageView | null
  /** Ghi chú ngắn trên thẻ; ở public chỉ khi có đồng ý tên. */
  note: string | null
  quote: { text: string; sourceId: string } | null
  consentPending: boolean
  flags: Flag[]
}

export interface SourceView {
  id: string
  publisher: string | null
  title: string
  url: string | null
  date: string | null
}

export type Confidence = 'press' | 'oral' | 'pending'

export interface TimelineEventView {
  label: string | null
  title: string | null
  body: string | null
  /** Thiếu mức tin cậy thì coi là 'pending'. */
  confidence: Confidence
  sourceIds: string[]
  /** "Nhà xuất bản (dd/mm/yyyy); …" ghép từ các nguồn nhìn thấy được; null khi không còn nguồn nào. */
  sourceLine: string | null
  /** Liên kết nội bộ của dòng nguồn (chỉ mốc tĩnh "Mốc của bạn" có). */
  sourceHref: string | null
  flags: Flag[]
}

export interface CraftStepView {
  n: number
  title: string | null
  shortTitle: string | null
  subtitle: string | null
  body: string | null
  tools: string | null
  /** Việc biên tập cần ghi lại thêm: luôn null ở public. */
  toRecord: string | null
  image: ImageView | null
  shotNeeded: string | null
  focus: [number, number]
  flags: Flag[]
}

export interface ProductCardView {
  slug: string
  code: string | null
  name: string | null
  group: 'traditional' | 'contemporary' | null
  groupLabel: string | null
  summary: string | null
  image: ImageView | null
  typeConfirmed: boolean
  /** Nhãn trên thẻ: chưa có ảnh, hoặc có ảnh mà chưa xác nhận loại (R1). */
  tag: { text: string; style: 'filled' | 'dashed' } | null
  /** Chữ khung "Ảnh cần chụp" đã điền tên (bản desktop/mobile); null khi chưa có tên. */
  shotNeeded: Variant | null
  flags: Flag[]
}

export interface ProductView extends ProductCardView {
  images: ImageView[]
  /** Ảnh CMS đầu tiên (nơi các điểm annotation đặt toạ độ); null khi ảnh đó chưa được dùng ở mode hiện tại. */
  primaryImage: ImageView | null
  /** Đủ ảnh đầu tiên và ít nhất một chú thích để dựng khối hoa văn. */
  hasPattern: boolean
  material: string | null
  technique: string | null
  /** Trống là null ở cả hai mode: UI hiện placeholder của copy ở preview. */
  size: string | null
  care: string | null
  context: string | null
  pattern: string | null
  /** "{mã} · {nhóm}" trên tiêu đề trang chi tiết; bỏ phần nào trống. */
  eyebrow: string
  /** Câu riêng của trang chi tiết: có ảnh mà chưa xác nhận loại (R1). */
  typeNote: string | null
  /** Song song `images` (R6). */
  imageCaptions: string[]
  annotations: {
    n: number
    title: string | null
    /** Nhãn nút trên mobile; trống thì dùng `title` (R3). */
    shortTitle: string | null
    x: number
    y: number
    body: string
    sourceId: string | null
    /** Số thứ tự trong `sources` (R2); null khi không có nguồn nhìn thấy được. */
    sourceN: number | null
    sourceLine: string | null
    /** "n · tiêu đề", hoặc chỉ "n" khi không có tiêu đề. */
    heading: string
    /** Tên đọc của điểm trên ảnh ("Chi tiết n: tiêu đề viết thường"); cùng một quy tắc ở mọi trang. */
    markerLabel: string
    /** Nhãn nút chọn trên mobile: "n · tên ngắn". */
    pickerLabel: string
  }[]
  /** Nguồn theo lần xuất hiện đầu trong các chú thích còn hiện (R2); date dạng dd/mm/yyyy. */
  sources: SourceView[]
  /** `contact` chỉ có khi cơ sở đã đăng, được xác minh và đồng ý công khai (R5). */
  maker: { name: string | null; verified: boolean; contact: string | null } | null
  /**
   * Chữ dòng "Liên hệ người làm": liên hệ khi cơ sở được hiện và có liên hệ; câu "chưa có cơ sở" chỉ khi không có cơ sở
   * nào qua cổng; null khi cơ sở được hiện mà chưa có liên hệ (UI chỉ giữ liên kết kết nối).
   */
  contactLine: string | null
}

export interface ProductsPageView {
  intro: PageIntroView
  products: ProductCardView[]
  /** Chip "Tất cả" (key all) rồi các nhóm theo thứ tự option. */
  filters: { key: string; label: string }[]
  /** URL nguồn Vietnam+ của khung "VỀ DANH MỤC"; null khi nguồn bị ẩn hoặc URL không phải http(s) (R9). */
  catalogSourceUrl: string | null
  copy: ProductsCopyView
}

export interface ProductPageView {
  product: ProductView
  /** Hai hiện vật kế tiếp rồi thẻ cố định (mobile: false) (R8). */
  others: ReadNextItem[]
  copy: ProductsCopyView
}

/**
 * Cây Lexical đã lọc (xem rich.ts). Nút đặc biệt:
 * - heading h2 có thêm `anchor: string` (R5);
 * - `{ type: 'cite', n: number }`: số chú thích, trỏ tới `sources[n - 1]` (R4);
 * - `{ type: 'figure', image: ImageView, caption: string | null }` (R3).
 */
export type RichNode = Record<string, unknown>
export type Rich = { root: RichNode }

export interface StoryCardView {
  slug: string
  title: string | null
  sapo: string | null
  category: string | null
  /** Giá trị option của chủ đề (khoá bộ lọc, khớp `StoriesPageView.filters[].key`); nhãn ở `category`. */
  categoryKey: string | null
  cover: ImageView | null
  readingMinutes: number | null
  hasDetail: boolean
  /** Chữ nút cuối thẻ: "Đọc bài →" khi có trang chi tiết, "Xem đề cương →" khi không (nguồn: copy/stories.ts). */
  cta: string
  /** "Chủ đề đề xuất" cho bài idea ở mọi mode; "Bản nháp" chỉ ở preview (R2). */
  status: 'Bản nháp' | 'Chủ đề đề xuất' | null
  /** Bài chưa đăng (chỉ có ở preview). Component dùng cờ này, `status` chỉ để hiển thị. */
  isDraft: boolean
  /** Số nguồn nhìn thấy được ở mode hiện tại. */
  sourceCount: number
  flags: Flag[]
}

export interface StoryView extends StoryCardView {
  body: Rich | null
  /** Các h2 của bài, theo thứ tự (R5). */
  toc: { id: string; title: string }[]
  /** Đánh số theo lần trích đầu tiên, nguồn không được trích xếp sau (R4); date dạng dd/mm/yyyy. */
  sources: SourceView[]
  editor: string | null
  /** dd/mm/yyyy */
  publishedAt: string | null
  coverCaption: string | null
  /** Việc cần thẩm định trước khi đăng: luôn null ở public. */
  reviewChecklist: string[] | null
}

export type ReadNextItem = {
  href: string
  eyebrow: string
  title: string
  cta: string
  image: ImageView | null
  /** false: không hiện ở mobile (R8). */
  mobile?: boolean
}

export interface StoriesPageView {
  intro: PageIntroView
  stories: StoryCardView[]
  /** Chip "Tất cả" (key all) rồi các chủ đề theo thứ tự option. */
  filters: { key: string; label: string }[]
  /** Bài nổi bật (desktop): bài `hasDetail` đầu tiên; null khi không có bài nào có trang chi tiết. */
  featured: { story: StoryCardView; eyebrow: string; meta: string | null } | null
  copy: StoriesCopyView
}

export interface StoryPageView {
  story: StoryView
  /** Dòng meta đã dựng ở lib: "Biên tập: …", "Ngày đăng: …", "Khoảng N phút đọc", "N nguồn"; phần trống bị bỏ. */
  meta: string[]
  /** Hai thẻ cố định và một bài khác (R8). */
  readNext: ReadNextItem[]
  copy: StoriesCopyView
}

export type ConsentState = 'none' | 'partial' | 'full'

/**
 * Trang chân dung. Ở public, mọi phần có thể nhận ra người (intro, xóm thôn, ghi lại bởi, câu chuyện,
 * năm làm nghề, ghi chú) chỉ có khi đã đồng ý tên; phóng sự ảnh chỉ khi đã đồng ý ảnh (R13).
 * `quote` thay kiểu của PersonView (P1): có thêm dòng nguồn.
 */
export type PersonDetailView = Omit<PersonView, 'quote'> & {
  /** h1, mục cuối breadcrumb, tiêu đề trang: tên, hoặc "Chờ đồng ý" khi không có tên (R16). */
  heading: string
  /** h2 câu chuyện: "Câu chuyện của {tên}", hoặc "Câu chuyện" khi không có tên (R16). */
  storyTitle: string
  /** Null khi trống (preview dùng gợi ý trong copy, R14). */
  intro: string | null
  yearsInCraft: string | null
  hamlet: string | null
  /** "recordedBy · dd/mm/yyyy"; null khi cả hai trống ở public, "[cần xác minh]" ở preview. */
  recorded: string | null
  /**
   * Câu chuyện tách tại heading thứ hai và thứ ba: [trước heading 2, heading 2 tới trước heading 3, phần còn lại].
   * Lời trích đứng sau phần 1 ở mobile (PersonMobile), sau phần 2 từ md (PersonDetail) (R15, F1).
   * Lọc và đánh số cite một lần trên cả cây rồi mới tách. Phần trống là null.
   */
  storyParts: [Rich | null, Rich | null, Rich | null]
  /** Nguồn mà câu chuyện trích, đánh số theo lần trích đầu tiên (R4, T2c); [] khi câu chuyện không hiện. */
  sources: SourceView[]
  /**
   * `sourceLine`: "Nhà xuất bản (dd/mm/yyyy)". `note`: dòng dưới lời trích đã dựng, "Nguồn: …" (R15);
   * preview thêm tiền tố "Chỉ hiển thị khi có ghi âm hoặc ghi chép gốc · ".
   */
  quote: { text: string; sourceLine: string | null; note: string | null } | null
  gallery: { image: ImageView; caption: string | null }[]
  /** Hiện ở cả public (R18). */
  /** `missing`: nhãn các mức chưa đồng ý (tên, ảnh, lời trích), lấy từ peopleCopy.detail.consent.kinds. */
  consent: { state: ConsentState; missing: string[]; reviewedBySubject: boolean }
  /**
   * Chú thích ảnh chân dung; null khi không có ảnh chân dung ở mode này.
   * `label` "CHÂN DUNG", `code` số từ mã TL-… (DocumentLabel ghép "CHÂN DUNG · 001").
   * `line.desktop`: "Ảnh: {tác giả} · {dòng đồng ý}"; `line.mobile`: chỉ dòng đồng ý (PersonMobile).
   * Dòng đồng ý chỉ có ở preview, khi chưa đồng ý ảnh.
   */
  portraitCaption: { label: string; code: string | null; line: Variant } | null
}

export interface PeoplePageView {
  intro: PageIntroView
  people: PersonView[]
  /** Chip "Tất cả" (key all) rồi các nhóm theo thứ tự option. */
  filters: { key: string; label: string }[]
  copy: PeopleCopyView
}

export interface PersonPageView {
  person: PersonDetailView
  /** Công đoạn (nếu có và nhìn thấy được), hiện vật (nếu có), thẻ cố định "Những chân dung khác". */
  related: ReadNextItem[]
  copy: PeopleCopyView
}

/** Giá trị chủ đề ảnh tư liệu, lấy từ kiểu Payload (nguồn là ARCHIVE_CATEGORY_OPTIONS). */
export type ArchiveCategory = NonNullable<ArchiveAsset['category']>

export interface ArchiveItemView {
  image: ImageView
  title: string | null
  description: string | null
  category: ArchiveCategory | null
  categoryLabel: string | null
  era: NonNullable<ArchiveAsset['era']> | null
  eraLabel: string | null
  related: { label: string; href: string } | null
  flags: Flag[]
  /** Mã gốc `TL-001`, khoá của `?anh=`. Không dùng để hiển thị: dùng `displayCode`. */
  code: string
  /** Mã hiển thị: phần số của `TL-n`, hoặc mã đã qua luật hiện/ẩn; null khi bị ẩn ở public. */
  displayCode: string | null
  /** "TL · 001", null khi không có mã hiển thị. */
  docLabel: string | null
  /** "TL · 001 · Làng quê" (chữ hoa do CSS): tên đọc của chip và dòng đầu hộp xem ảnh. */
  chipLabel: string | null
  /** Tên gọi của ô ảnh: tiêu đề, hoặc mã hiển thị. */
  name: string | null
  takenAt: string | null
  photographer: string | null
  source: string | null
  /** Nhãn quyền dùng đã chọn theo bản (R14). */
  rights: Variant
  /** Đủ thời gian, người chụp và nguồn đã xác minh (R12). */
  sourceVerified: boolean
}

export interface ArchivePageView {
  intro: PageIntroView
  /** Chỉ tư liệu có mã. */
  items: ArchiveItemView[]
  stats: { total: number; verified: number }
  /** Chip "Tất cả" rồi mọi chủ đề theo thứ tự option (R13). */
  categories: { key: string; label: string }[]
  eras: { key: 'all' | 'old' | 'now'; label: string }[]
  hasOld: boolean
  copy: ArchiveCopyView
}

export interface ConnectPageView {
  /** title giữ nguyên '\n' (R17) */
  intro: PageIntroView
  /** Giá trị đã định dạng sẵn (R18): email/điện thoại trống thì null ở public, placeholder không liên kết ở preview. */
  contact: {
    email: { text: string; href: string | null } | null
    phone: { text: string; href: string | null } | null
    address: string | null
    addressNote: string | null
    /** visitInfo hoặc câu "chưa có thông tin", đã gồm tiền tố mobile. */
    visit: Variant
    /** Dòng "email · điện thoại" của mobile: các phần có mặt (giữ liên kết) và dấu nối; null khi cả hai trống. */
    mobileLine: { parts: { text: string; href: string | null }[]; separator: string } | null
  }
  copy: ConnectCopyView
}

export interface SiteSettingsView {
  tagline: string | null
  description: string | null
  address: string | null
  addressNote: string | null
  email: string | null
  phone: string | null
  visitInfo: string | null
  copyright: string | null
}

export interface HomeMediaView {
  hero: { image: ImageView; title: string | null; caption: string | null } | null
  heroInset: ImageView | null
  village: { image: ImageView; caption: string | null }[]
}

export interface PageIntroView {
  eyebrow: string | null
  title: string | null
  lead: string | null
  heroTitle: string | null
}

export type MediaView = { image: ImageView; caption: string | null }
export type Variant = { desktop: string | null; mobile: string | null }

export interface CraftPageView {
  /** title giữ nguyên '\n' */
  intro: PageIntroView
  hero: MediaView | null
  steps: CraftStepView[]
  tools: { n: number; name: string; note: Variant; image: ImageView | null }[]
  compare: {
    hand: { title: string; image: ImageView | null; text: Variant; note: Variant }
    machine: { title: string; image: ImageView | null; text: Variant; note: Variant }
    /** Ô desktop bị ẩn để null; hàng cả hai ô null đã bị bỏ. `mobile`: các dòng mobile còn hiện được. */
    rows: {
      aspect: string
      hand: string | null
      machine: string | null
      mobile: string[]
      /** Ô/dòng còn chờ xác minh (hiện mờ ở preview); `mobile` song song với `mobile` ở trên. */
      muted: { hand: boolean; machine: boolean; mobile: boolean[] }
    }[]
  }
  readNext: ReadNextItem[]
  copy: CraftCopyView
}

export interface VillagePageView {
  intro: PageIntroView
  hero: MediaView | null
  /** Mục có nguồn mà mọi nguồn bị ẩn thì bị bỏ ở public. */
  facts: { term: string; detail: Variant; note: Variant; cite: string[] }[]
  /** Mốc từ CMS, mốc tĩnh '+' ở cuối. */
  timeline: TimelineEventView[]
  life: MediaView[]
  /** Nguồn mà trang trích, theo thứ tự đánh số [1][2][3], đã lọc theo mode. */
  sources: SourceView[]
  copy: VillageCopyView
}

export type { ArchiveCopyView, ConnectCopyView, CraftCopyView, PeopleCopyView, StoriesCopyView, VillageCopyView }
