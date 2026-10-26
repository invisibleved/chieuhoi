import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { ArchiveChip, DocumentLabel } from '@/components/content/DocumentLabel'
import { ExhibitCard } from '@/components/content/ExhibitCard'
import { PortraitCard } from '@/components/content/PortraitCard'
import { ProductCard } from '@/components/content/ProductCard'
import { FootnoteRef, SourceList } from '@/components/content/Sources'
import { StoryCard } from '@/components/content/StoryCard'
import { VerifyNote } from '@/components/content/VerifyNote'
import { Breadcrumb } from '@/components/layout/Breadcrumb'
import { isStyleguideEnabled } from '@/components/styleguide/enabled'
import * as fx from '@/components/styleguide/fixtures'
import { Lab, Tok } from '@/components/styleguide/Lab'
import { Button } from '@/components/ui/Button'
import { EmptyState, ErrorState, Skeleton, SuccessState } from '@/components/ui/Feedback'
import { LinkArrow } from '@/components/ui/LinkArrow'
import { FilterDemos, TabDemo } from './Demos'

// Đọc APP_ENV lúc request, không chốt lúc build.
export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Component',
  robots: { index: false, follow: false },
}

const h2 = 'font-display text-h3 font-normal'
const state = 'flex min-w-0 flex-col items-start gap-2.5'
const focusLight = 'outline outline-2 outline-offset-4 outline-focus-light'
const rowThreads = <div className="threads" aria-hidden="true" />

const NAV_LINK = 'flex min-h-11 items-baseline gap-2 py-2.5 text-text-primary no-underline md:min-h-0 md:py-0'

export default function StyleguidePage() {
  if (!isStyleguideEnabled(process.env.APP_ENV)) notFound()

  return (
    <div className="mx-auto flex max-w-[1440px] flex-col gap-16 px-5 py-12 md:gap-24 md:px-20 md:py-24">
      <div className="flex flex-col gap-4">
        <Breadcrumb items={[{ label: 'Trang chủ', href: '/' }, { label: 'Component' }]} />
        <p className="text-eyebrow font-semibold tracking-[.24em] text-accent">HỆ THỐNG THIẾT KẾ · v0.1</p>
        <h1 className="font-display text-display font-normal leading-[1.1]">Component</h1>
        <p className="max-w-[760px] text-body-lg leading-[1.65] text-text-secondary">
          Mỗi component vẽ đủ các trạng thái: mặc định, hover, focus, đang chọn, vô hiệu và lỗi khi có. Tên token ghi dưới mỗi mẫu để bàn giao cho dev.
        </p>
        <div className="max-w-[760px]">
          <VerifyNote size="sm">Ảnh mẫu chỉ có ở máy dev.</VerifyNote>
        </div>
      </div>

      {/* Nút & link */}
      <section aria-labelledby="sg-nut" className="flex flex-col gap-8">
        <h2 id="sg-nut" className={h2}>Nút &amp; link</h2>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-5">
          <div className={state}><Lab>MẶC ĐỊNH</Lab><Button href="#">Khám phá làng nghề</Button></div>
          <div className={state}><Lab>HOVER</Lab><Button href="#" className="!bg-accent-hover">Khám phá làng nghề</Button></div>
          <div className={state}><Lab>FOCUS</Lab><Button href="#" className={focusLight}>Khám phá làng nghề</Button></div>
          <div className={state}><Lab>ĐANG NHẤN</Lab><Button href="#" className="!bg-accent-press">Khám phá làng nghề</Button></div>
          <div className={state}><Lab>VÔ HIỆU</Lab><Button disabled>Đang gửi...</Button></div>
        </div>
        <div className="grid grid-cols-1 items-center gap-6 sm:grid-cols-2 lg:grid-cols-5">
          <div className={state}><Lab>NÚT PHỤ</Lab><Button variant="secondary" href="#" icon="play">Nghe chuyện làng Hới</Button></div>
          <div className={state}><Lab>LINK MŨI TÊN</Lab><LinkArrow href="#">Đọc về làng Hới</LinkArrow></div>
          <div className={state}><Lab>LINK HOVER</Lab><LinkArrow href="#" className="text-accent-hover underline decoration-2 underline-offset-4">Đọc về làng Hới</LinkArrow></div>
          <div className={`${state} bg-bg-inverse justify-center self-stretch p-4`}><Lab tone="dark">TRÊN NỀN TỐI</Lab><LinkArrow href="#" tone="dark">Xem cả hành trình</LinkArrow></div>
          <div className={`${state} bg-bg-inverse justify-center self-stretch p-4`}><Lab tone="dark">NÚT VIỀN · TỐI</Lab><Button variant="outline-dark" href="#">Vào thư viện</Button></div>
        </div>
        <Tok>button/primary · button/secondary · link/arrow · link/on-dark · button/outline-dark — chiều cao tối thiểu 44px, nút chính 52px</Tok>
      </section>

      {rowThreads}

      {/* Điều hướng */}
      <section aria-labelledby="sg-nav" className="flex flex-col gap-8">
        <h2 id="sg-nav" className={h2}>Điều hướng</h2>
        <div className="border border-border-subtle">
          <div className="flex flex-col gap-4 p-5 md:flex-row md:items-center md:justify-between md:px-10 md:py-6">
            <span className="font-display text-[22px] tracking-[.3em]">CHIẾU HỚI</span>
            <nav aria-label="Mẫu điều hướng" className="flex flex-col gap-0 text-[14px] md:flex-row md:gap-7">
              <a href="#" className={NAV_LINK}><span className="text-[12px] text-text-meta">01</span>Làng Hới</a>
              <a href="#" className={`${NAV_LINK} !text-accent`}><span className="text-[12px] text-text-meta">02</span>Câu chuyện <span className="text-[12px] text-text-muted">(hover)</span></a>
              <a href="#" aria-current="page" className={`${NAV_LINK} md:flex-col md:items-stretch md:gap-1.5`}>
                <span className="flex items-baseline gap-2"><span className="text-[12px] text-text-meta">03</span>Nghề dệt chiếu</span>
                <span className="threads hidden md:block" style={{ height: 6 }} aria-hidden="true" />
              </a>
              <a href="#" className={`${NAV_LINK} ${focusLight}`}><span className="text-[12px] text-text-meta">04</span>Con người</a>
            </nav>
            <span className="self-start border-b border-text-primary text-[13px]">Kết nối</span>
          </div>
        </div>
        <div className="flex flex-col gap-2 text-[13px] text-text-muted md:flex-row md:gap-10">
          <span>02 · hover: chữ đỏ điều</span><span>03 · trang hiện tại: gạch chân sợi rơm</span><span>04 · focus: viền xanh làng</span>
        </div>
        <Breadcrumb items={[{ label: 'Trang chủ', href: '/' }, { label: 'Câu chuyện', href: '/cau-chuyen' }, { label: 'Chuyện về Trạng Chiếu' }]} />
        <Tok>nav/desktop · nav/mobile (xem artboard Menu mobile) · breadcrumb</Tok>
      </section>

      {rowThreads}

      {/* Thẻ nội dung */}
      <section aria-labelledby="sg-the" className="flex flex-col gap-8">
        <h2 id="sg-the" className={h2}>Thẻ nội dung</h2>
        <div className="grid grid-cols-1 items-start gap-6 md:grid-cols-12">
          <div className="flex flex-col gap-3 md:col-span-3">
            <Lab>PORTRAIT CARD</Lab>
            <PortraitCard person={fx.person} href="#" />
          </div>
          <div className="flex flex-col gap-3 md:col-span-5">
            <Lab>STORY CARD · NỔI BẬT</Lab>
            <StoryCard story={fx.storyFeatured} href="#" variant="featured" />
          </div>
          <div className="flex flex-col gap-3 md:col-span-4">
            <Lab>STORY CARD · GỌN</Lab>
            <StoryCard story={fx.storyCompact} href="#" variant="compact" />
            <div className="mt-5 flex flex-col gap-3">
              <Lab>HIỆN VẬT · MẶC ĐỊNH / HOVER</Lab>
              <div className="grid grid-cols-2 gap-4">
                <ExhibitCard index={1} name="Chiếu trơn" href="#" />
                <ExhibitCard index={4} name="Chiếu cạp điều" href="#" active />
              </div>
            </div>
          </div>
        </div>
        <Tok>card/portrait · card/story-featured · card/story-compact · card/object — cả thẻ là một link; hover: ảnh mờ 12%, CTA gạch chân</Tok>

        <h3 className="mt-6 font-display text-[28px] font-normal">Thẻ khi thiếu dữ liệu</h3>
        <div className="grid grid-cols-1 items-start gap-6 md:grid-cols-12">
          <div className="flex flex-col gap-3 md:col-span-3">
            <Lab>PORTRAIT · CHỜ ĐỒNG Ý</Lab>
            <PortraitCard person={fx.personPending} href="#" />
          </div>
          <div className="flex flex-col gap-3 md:col-span-3">
            <Lab>STORY · CHỦ ĐỀ ĐỀ XUẤT</Lab>
            <StoryCard story={fx.storyIdea} href="#" variant="grid" />
          </div>
          <div className="flex flex-col gap-3 md:col-span-3">
            <Lab>PRODUCT · KHÔNG ẢNH</Lab>
            <ProductCard product={fx.productNoImage} href="#" />
          </div>
          <div className="flex flex-col gap-3 md:col-span-3">
            <Lab>PRODUCT · CÓ ẢNH</Lab>
            <ProductCard product={fx.productWithImage} href="#" />
          </div>
        </div>
        <Tok>card/portrait · card/story-grid · card/product — bản public lúc mới dựng</Tok>
      </section>

      {rowThreads}

      {/* Thành phần di sản */}
      <section aria-labelledby="sg-disan" className="flex flex-col gap-8">
        <h2 id="sg-disan" className={h2}>Thành phần di sản</h2>
        <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-3">
          <div className="flex min-w-0 flex-col gap-3.5">
            <Lab>NHÃN TƯ LIỆU</Lab>
            <DocumentLabel code="001" title="In hoa văn lên chiếu bằng khuôn" meta="Ảnh: [tác giả] · Niên đại: [cần xác minh] · Quyền dùng: [cần xác minh]" />
            <div className="self-start"><ArchiveChip code="021" category="Làng quê" /></div>
            <Tok>label/document · label/archive-chip</Tok>
          </div>
          <div className="flex min-w-0 flex-col gap-3.5">
            <Lab>BƯỚC CÔNG ĐOẠN · ĐIỂM HOA VĂN</Lab>
            <VerifyNote size="sm">Làm ở Phase 4.</VerifyNote>
            <VerifyNote size="sm">Làm ở Phase 5.</VerifyNote>
            <Tok>craft/step · craft/progress · pattern/marker · pattern/annotation</Tok>
          </div>
          <div className="flex min-w-0 flex-col gap-3.5">
            <Lab>NGUỒN</Lab>
            <p className="text-[15px] leading-[1.6] text-text-secondary">
              Không phải chi tiết nào cũng thống nhất. Vietnam+ đặt câu chuyện mang nghề về làng vào đầu thế kỷ XVI và nhắc đến hai lần đi sứ.
              <FootnoteRef n={1} /> Chính bài trên Dân Việt cũng ghi nhận rằng tiểu sử của ông dựa nhiều vào truyền khẩu, và cơ quan văn hoá nơi có lăng mộ ông chưa lưu giữ hồ sơ về ông.
              <FootnoteRef n={2} />
            </p>
            <Lab>CHÚ THÍCH LIỀN NHAU</Lab>
            <p id="sg-fn-adjacent" className="text-[15px] leading-[1.6] text-text-secondary">
              Hai nguồn đứng sát nhau.<FootnoteRef n={1} /><FootnoteRef n={2} />
            </p>
            <Tok>footnote/ref · source/list</Tok>
          </div>
        </div>
        <div className="-mx-5 -my-8 md:-mx-20 md:-my-16">
          <SourceList sources={fx.sources} headingId="sg-nguon" title="Nguồn" />
        </div>
      </section>

      {rowThreads}

      {/* Bộ lọc, tab & phân trang */}
      <section aria-labelledby="sg-loc" className="flex flex-col gap-8">
        <h2 id="sg-loc" className={h2}>Bộ lọc, tab &amp; phân trang</h2>
        <div className="flex min-w-0 flex-col gap-8">
          <FilterDemos />
          <TabDemo />
          <div className="flex flex-col gap-3">
            <Lab>XEM THÊM / PHÂN TRANG</Lab>
            <VerifyNote size="sm">Phân trang và Xem thêm làm ở Phase 5.</VerifyNote>
          </div>
        </div>
        <Tok>filter/chip · tabs · pagination · load-more — bộ lọc dùng button aria-pressed, tab dùng role tablist</Tok>
      </section>

      {rowThreads}

      {/* Form góp tư liệu */}
      <section aria-labelledby="sg-form" className="flex flex-col gap-8">
        <h2 id="sg-form" className={h2}>Form góp tư liệu</h2>
        <VerifyNote size="sm">Làm ở Phase 5.</VerifyNote>
      </section>

      {rowThreads}

      {/* Trạng thái phản hồi */}
      <section aria-labelledby="sg-phanhoi" className="flex flex-col gap-8">
        <h2 id="sg-phanhoi" className={h2}>Trạng thái phản hồi</h2>
        <div className="grid grid-cols-1 items-stretch gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <div className="flex flex-col gap-3"><Lab>ĐANG TẢI · SKELETON</Lab><Skeleton /></div>
          <div className="flex flex-col gap-3">
            <Lab>TRỐNG</Lab>
            <EmptyState title="Chưa có tư liệu trong nhóm này" body="Nếu gia đình bạn còn giữ ảnh cũ của làng, hãy góp cùng chúng tôi." action={{ href: '#', label: 'Góp một ký ức' }} />
          </div>
          <div className="flex flex-col gap-3">
            <Lab>LỖI</Lab>
            <ErrorState title="Không tải được ảnh" body="Kết nối mạng có thể đang chậm. Nội dung chữ vẫn đọc được bình thường." retry={{ label: 'Thử tải lại', href: '#' }} />
          </div>
          <div className="flex flex-col gap-3">
            <Lab>THÀNH CÔNG</Lab>
            <SuccessState title="Cảm ơn bạn" body="Chúng tôi sẽ liên hệ để xác minh trước khi đăng. (Màn hình minh hoạ — chưa có hệ thống nhận thật.)" />
          </div>
        </div>
        <Tok>feedback/skeleton · feedback/empty · feedback/error · feedback/success — skeleton tắt nhấp nháy khi người dùng bật giảm chuyển động</Tok>
      </section>

      {rowThreads}

      {/* Lightbox thư viện */}
      <section aria-labelledby="sg-lightbox" className="flex flex-col gap-8">
        <h2 id="sg-lightbox" className={h2}>Lightbox thư viện</h2>
        <VerifyNote size="sm">Làm ở Phase 5.</VerifyNote>
      </section>
    </div>
  )
}
