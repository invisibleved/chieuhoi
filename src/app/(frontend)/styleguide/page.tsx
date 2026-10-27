import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { ArchiveChip, DocumentLabel } from '@/components/content/DocumentLabel'
import { ComparisonTabs } from '@/components/content/ComparisonTabs'
import { ConsentPanel } from '@/components/content/ConsentPanel'
import { ConfidenceBadge, ConfidenceLegend, ConfidenceMark } from '@/components/content/Confidence'
import { CraftJourney } from '@/components/content/CraftJourney'
import { CraftStage } from '@/components/content/CraftStage'
import { FigureCard } from '@/components/content/FigureCard'
import { PageHeader } from '@/components/content/PageHeader'
import { PhotoEssay } from '@/components/content/PhotoEssay'
import { RichText, StoryPlaceholder } from '@/components/content/RichText'
import { ReadNext } from '@/components/content/ReadNext'
import { Timeline } from '@/components/content/Timeline'
import { ExhibitCard } from '@/components/content/ExhibitCard'
import { PortraitCard } from '@/components/content/PortraitCard'
import { ProductCard } from '@/components/content/ProductCard'
import { FootnoteRef, SourceList } from '@/components/content/Sources'
import { StoryCard } from '@/components/content/StoryCard'
import { VerifyNote } from '@/components/content/VerifyNote'
import { applyMode } from '@/lib/content/copy/applyMode'
import { peopleCopy } from '@/lib/content/copy/people'
import { storiesCopy } from '@/lib/content/copy/stories'
import { craftCompare, craftCopy, craftReadNext, craftTools } from '@/lib/content/copy/craft'
import { productsCopy } from '@/lib/content/copy/products'
import { archiveCopy } from '@/lib/content/copy/archive'
import { docLabel } from '@/lib/content/copy/docLabel'
import { villageCopy } from '@/lib/content/copy/village'
import { Breadcrumb } from '@/components/layout/Breadcrumb'
import { isStyleguideEnabled } from '@/components/styleguide/enabled'
import * as fx from '@/components/styleguide/fixtures'
import { Lab, Tok } from '@/components/styleguide/Lab'
import { Button } from '@/components/ui/Button'
import { EmptyState, ErrorState, Skeleton, SuccessState } from '@/components/ui/Feedback'
import { BackLink } from '@/components/ui/BackLink'
import { Callout } from '@/components/ui/Callout'
import { NoteBanner } from '@/components/ui/NoteBanner'
import { PullQuote } from '@/components/ui/PullQuote'
import { Eyebrow } from '@/components/ui/Eyebrow'
import { FactList } from '@/components/ui/FactList'
import { CtaBand } from '@/components/ui/CtaBand'
import { DetailTitle, Lede } from '@/components/ui/DetailTitle'
import { LinkArrow } from '@/components/ui/LinkArrow'
import { StatusDot } from '@/components/ui/StatusDot'
import { PlaceholderFrame } from '@/components/ui/PlaceholderFrame'
import { ThreadsDivider } from '@/components/ui/ThreadsDivider'
import { VariantText } from '@/components/ui/VariantText'
import { FilterDemos, InteractiveDemos, LightboxDemo, PatternExplorerDemo, SegmentedDemos, SuccessActionDemo, StepperDemos, TabDemo } from './Demos'

// Đọc APP_ENV lúc request, không chốt lúc build.
export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Component',
  robots: { index: false, follow: false },
}

const h2 = 'font-display text-h3 font-normal'
const state = 'flex min-w-0 flex-col items-start gap-2.5'
const focusLight = 'outline outline-2 outline-offset-4 outline-focus-light'
const rowThreads = <ThreadsDivider />

const consentCopy = applyMode(peopleCopy, 'public').detail.consent

const NAV_LINK = 'flex min-h-11 items-baseline gap-2 py-2.5 text-text-primary no-underline md:min-h-0 md:py-0'

export default function StyleguidePage() {
  if (!isStyleguideEnabled(process.env.APP_ENV)) notFound()

  return (
    <div className="mx-auto flex max-w-[1440px] flex-col gap-16 px-5 py-12 md:gap-24 md:px-20 md:py-24">
      <div className="flex flex-col gap-4">
        <Breadcrumb items={[{ label: 'Trang chủ', href: '/' }, { label: 'Component' }]} />
        <Eyebrow as="p">HỆ THỐNG THIẾT KẾ · v0.1</Eyebrow>
        <h1 className="font-display text-display font-normal leading-[1.1]">Component</h1>
        <p className="max-w-[760px] text-body-lg leading-[1.65] text-text-secondary">
          Mỗi component vẽ đủ các trạng thái: mặc định, hover, focus, đang chọn, vô hiệu và lỗi khi có. Tên token ghi dưới mỗi mẫu để bàn giao cho dev.
        </p>
        <div className="flex max-w-[760px] flex-col gap-4">
          <VerifyNote size="sm">Ảnh mẫu chỉ có ở máy dev.</VerifyNote>
          <VerifyNote title="CẦN THẨM ĐỊNH TRƯỚC KHI ĐĂNG">
            <ul className="m-0 list-disc pl-5">
              <li>Đối chiếu năm sinh, năm mất, năm đỗ với sử liệu khoa bảng.</li>
              <li>Xác nhận ngày lễ tế tổ nghề với người làng.</li>
            </ul>
          </VerifyNote>
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
            <PortraitCard person={fx.person} href="#" pendingLabel={peopleCopy.card.pending} />
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
        <div className="hidden flex-col gap-3 md:flex">
          <Lab>STORY CARD · HERO (BÀI NỔI BẬT ĐẦU TRANG, TỪ MD)</Lab>
          <StoryCard story={fx.storyFeatured} href="#" variant="hero" eyebrow={fx.storyHeroFeatured.eyebrow} meta={fx.storyHeroFeatured.meta} />
        </div>
        <Tok>card/portrait · card/story-hero · card/story-featured · card/story-compact · card/object — cả thẻ là một link; hover: ảnh mờ 12%, CTA gạch chân</Tok>

        <h3 className="mt-6 font-display text-[28px] font-normal">Thẻ khi thiếu dữ liệu</h3>
        <div className="grid grid-cols-1 items-start gap-6 md:grid-cols-12">
          <div className="flex flex-col gap-3 md:col-span-3">
            <Lab>PORTRAIT · CHỜ ĐỒNG Ý</Lab>
            <PortraitCard person={fx.personPending} href="#" pendingLabel={peopleCopy.card.pending} />
          </div>
          <div className="flex flex-col gap-3 md:col-span-3">
            <Lab>PORTRAIT · FLUID + GHI CHÚ (TRANG CON NGƯỜI)</Lab>
            <PortraitCard person={{ ...fx.personPending, note: 'Dệt chiếu tay · [cần xác minh]' }} href="#" size="fluid" detail="note" pendingLabel={peopleCopy.card.pending} />
          </div>
          <div className="flex flex-col gap-3 md:col-span-3">
            <Lab>STORY · CHỦ ĐỀ ĐỀ XUẤT</Lab>
            <StoryCard story={fx.storyIdea} href="#" variant="grid" />
          </div>
          <div className="flex flex-col gap-3 md:col-span-3">
            <Lab>STORY · KHÔNG LINK (ARTICLE, KHÔNG CTA)</Lab>
            <StoryCard story={fx.storyIdea} variant="grid" />
          </div>
          <div className="flex flex-col gap-3 md:col-span-3">
            <Lab>PRODUCT · KHÔNG ẢNH</Lab>
            <ProductCard product={fx.productNoImage} href="#" shotNeeded={{ desktop: 'Chiếu cạp điều chụp phẳng, ánh sáng tự nhiên, kèm cận cảnh mặt dệt', mobile: 'Chiếu cạp điều' }} showSummary />
          </div>
          <div className="flex flex-col gap-3 md:col-span-3">
            <Lab>PRODUCT · CÓ ẢNH</Lab>
            <ProductCard product={fx.productWithImage} href="#" shotNeeded={{ desktop: 'Chiếu cạp điều', mobile: 'Chiếu cạp điều' }} />
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
            <DocumentLabel label={docLabel.desktop} code="001" title="In hoa văn lên chiếu bằng khuôn" meta="Ảnh: [tác giả] · Niên đại: [cần xác minh] · Quyền dùng: [cần xác minh]" />
            <div className="self-start"><ArchiveChip label={docLabel.mobile} code="021" category="Làng quê" /></div>
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
              <FootnoteRef n={1} /><FootnoteRef n={2} />
            </p>
            <Tok>footnote/ref · source/list</Tok>
          </div>
        </div>
        <div className="-mx-5 -my-8 md:-mx-20 md:-my-16">
          <SourceList sources={fx.sources} headingId="sg-nguon" title="Nguồn" />
        </div>
        <div className="-mx-5 -my-8 md:-mx-20 md:-my-16">
          <SourceList sources={fx.sources} headingId="sg-ghi-chu" title="Ghi chú nguồn" variant="notes" idPrefix="sg-ghi-chu" />
        </div>
      </section>

      {rowThreads}

      {/* Thành phần chung */}
      <section aria-labelledby="sg-chung" className="flex flex-col gap-8">
        <h2 id="sg-chung" className={h2}>Thành phần chung</h2>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div className={state}><Lab>EYEBROW · NỀN SÁNG</Lab><Eyebrow>NGHỀ DỆT CHIẾU</Eyebrow></div>
          <div className={`${state} bg-bg-inverse p-4`}><Lab tone="dark">EYEBROW · NỀN TỐI</Lab><Eyebrow tone="dark">NGHỀ DỆT CHIẾU</Eyebrow></div>
          <div className={state}><Lab>EYEBROW · CÓ VẠCH</Lab><Eyebrow rule>LÀNG HỚI</Eyebrow></div>
          <div className={`${state} bg-bg-inverse p-4`}><Lab tone="dark">EYEBROW · CÓ VẠCH · NỀN TỐI</Lab><Eyebrow tone="dark" rule>LÀNG HỚI</Eyebrow></div>
          <div className={state}><Lab>EYEBROW · IN HOA BẰNG CSS (uppercase)</Lab><Eyebrow uppercase>{fx.storyFeatured.category}</Eyebrow></div>
          <StepperDemos />
          <div className="flex flex-col gap-3"><Lab>KHUNG GIỮ CHỖ · NỀN SÁNG</Lab><PlaceholderFrame label="ẢNH CẦN CHỤP" title="Chẻ cói bằng tay" description="Cận cảnh đôi tay đang chẻ sợi cói." className="min-h-[200px]" /></div>
          <div className="flex flex-col gap-3 bg-bg-inverse p-4"><Lab tone="dark">KHUNG GIỮ CHỖ · NỀN TỐI</Lab><PlaceholderFrame tone="dark" label="ẢNH CẦN CHỤP" title="Chẻ cói bằng tay" description="Cận cảnh đôi tay đang chẻ sợi cói." className="min-h-[200px]" /></div>
          <div className="flex flex-col gap-3"><Lab>CALLOUT</Lab><Callout title="LƯU Ý">Nội dung này cần được xác minh với nghệ nhân trước khi đăng.</Callout></div>
          <div className="flex flex-col gap-3"><Lab>CALLOUT · NỀN TỐI</Lab><Callout tone="dark" title="NGUYÊN TẮC CHÂN DUNG" label="Nguyên tắc chân dung"><ul className="m-0 flex flex-col gap-1.5 pl-[18px]"><li>Tên, tuổi, vai trò chỉ đăng khi người được kể đồng ý.</li><li>Lời trích chỉ đăng khi có ghi âm hoặc ghi chép gốc.</li></ul></Callout></div>
          <div className="flex flex-col gap-3">
            <Lab>DANH SÁCH THÔNG TIN</Lab>
            <FactList items={[{ term: 'NƠI DỆT', detail: 'Làng Hới, Hải Triều' }, { term: 'CHẤT LIỆU', detail: 'Cói' }, { term: 'GHI CHÚ', detail: '[cần xác minh]' }]} />
          </div>
          <div className="flex flex-col gap-3 md:col-span-2">
            <Lab>DANH SÁCH THÔNG TIN · 2 CỘT (columns=2, từ md)</Lab>
            <FactList columns={2} items={[{ term: 'CHẤT LIỆU', detail: 'Cói' }, { term: 'KỸ THUẬT', detail: '[cần xác minh]' }, { term: 'HOA VĂN', detail: '[cần xác minh]' }, { term: 'KÍCH THƯỚC', detail: '[chỉ ghi khi đã đo]' }]} />
          </div>
          <div className="flex min-w-0 flex-col gap-3 md:col-span-2">
            <Lab>TIÊU ĐỀ TRANG CHI TIẾT · BÀI ĐỌC</Lab>
            <DetailTitle size="story" as="p">Chuyện về Trạng Chiếu</DetailTitle>
            <Lede size="story">Ông Trạng, khung dệt và nghề chiếu theo làng qua nhiều thế kỷ.</Lede>
            <Lab>TIÊU ĐỀ TRANG CHI TIẾT · CHÂN DUNG</Lab>
            <DetailTitle size="person" as="p">Chờ đồng ý</DetailTitle>
            <Lede size="person">[Một câu giới thiệu ngắn, do chính người được kể duyệt.]</Lede>
          </div>
          <div className="flex flex-col gap-3">
            <Lab>DANH SÁCH THÔNG TIN · HAI CỘT</Lab>
            <FactList layout="inline" items={[{ term: 'Vai trò', detail: '[cần xác minh]' }, { term: 'Năm làm nghề', detail: '[cần xác minh]' }, { term: 'Ghi lại bởi', detail: '[người phỏng vấn] · [ngày]' }]} />
          </div>
          <div className="flex flex-col gap-4 bg-bg-inverse p-4 md:col-span-2">
            <Lab tone="dark">MỨC TIN CẬY · NỀN TỐI</Lab>
            <ConfidenceLegend label={villageCopy.timeline.legendLabel.desktop} labels={villageCopy.timeline.confidence} />
            <div className="flex flex-wrap items-center gap-6 p-2">
              <ConfidenceMark level="press" /><ConfidenceMark level="oral" /><ConfidenceMark level="pending" />
              <ConfidenceMark level="press" active /><ConfidenceMark level="oral" active /><ConfidenceMark level="pending" active />
            </div>
            <div className="flex flex-wrap gap-3">
              <ConfidenceBadge level="press" labels={villageCopy.timeline.confidence} />
              <ConfidenceBadge level="oral" labels={villageCopy.timeline.confidence} />
              <ConfidenceBadge level="pending" labels={villageCopy.timeline.confidence} />
            </div>
          </div>
          <div className="flex flex-col gap-3 md:col-span-2"><Lab>VẠCH SỢI CÓI</Lab><ThreadsDivider /></div>
        </div>
        <Tok>ui/eyebrow · pill-button · scroll-strip · step-progress · pager-button · placeholder-frame · callout · fact-list · threads-divider — nút Trước/Sau dùng aria-disabled nên focus không mất khi chạm đầu cuối</Tok>
      </section>

      {rowThreads}

      {/* Khối trang Nghề dệt chiếu và Làng Hới */}
      <section aria-labelledby="sg-trang" className="flex flex-col gap-8">
        <h2 id="sg-trang" className={h2}>Khối trang Nghề &amp; Làng</h2>
        <div className="flex flex-col gap-3">
          <Lab>ĐẦU TRANG CON · PAGE HEADER</Lab>
          <div className="-mx-5 border border-dashed border-border-dashed md:-mx-0">
            <PageHeader
              crumbs={[{ label: craftCopy.breadcrumb.home, href: '/' }, { label: craftCopy.breadcrumb.current }]}
              intro={{
                eyebrow: '03 — NGHỀ DỆT CHIẾU',
                title: 'Một tấm chiếu,\nmuôn công đoạn.',
                lead: 'Từ bó cói ngoài đồng đến tấm chiếu trải giữa nhà là một hành trình của đôi tay, thời tiết và sự kiên nhẫn. Đi theo từng công đoạn bên dưới.',
                heroTitle: null,
              }}
              note={<VerifyNote size="sm">{craftCopy.intro.preview.verifyNote.desktop}</VerifyNote>}
            />
          </div>
        </div>
        <div className="flex flex-col gap-3">
          <Lab>ĐẦU TRANG · DÒNG CUỐI NGHIÊNG MÀU NHẤN (accentLastLine)</Lab>
          <div className="-mx-5 border border-dashed border-border-dashed md:-mx-0">
            <PageHeader
              crumbs={[{ label: 'Trang chủ', href: '/' }, { label: 'Kết nối' }]}
              intro={{ eyebrow: '06 — KẾT NỐI', title: 'Làng vẫn còn đó.\nChuyện nghề vẫn được kể tiếp.', lead: null, heroTitle: null }}
              titleClassName="text-[38px] md:text-[76px]"
              accentLastLine
            />
          </div>
        </div>
        <div className="flex flex-col gap-3">
          <Lab>KHỐI KÊU GỌI · CtaBand (chỉ từ md): inverse · secondary · primary</Lab>
          <div className="-mx-5 flex flex-col md:-mx-0">
            <CtaBand tone="inverse" title="Muốn tìm đến người làm chiếu?" body="Trang này không bán hàng. Danh sách cơ sở dệt sẽ chỉ đăng khi đã xác minh và được cơ sở đồng ý công khai." action={{ href: '#', label: 'Kết nối với làng' }} />
            <CtaBand tone="secondary" title="Bạn biết một người giữ nghề?" body="Chúng tôi sẽ hỏi ý người đó trước khi đăng." action={{ href: '#', label: 'Giới thiệu một người' }} />
            <CtaBand tone="primary" title="Nhà bạn còn giữ ảnh cũ của làng?" body="Chúng tôi sẽ ghi công và hỏi ý bạn trước khi đăng." action={{ href: '#', label: 'Góp tư liệu' }} />
          </div>
          <p className="m-0 text-small text-text-muted md:hidden">Ở khổ mobile CtaBand ẩn, theo artboard.</p>
        </div>
        <div className="flex flex-col gap-3">
          <Lab>ĐẦU TRANG · LEAD CHỈ MOBILE (leadClassName) · CỘT CHỮ RỘNG (wideIntro) · Ô TÌM Ở CỘT PHẢI</Lab>
          <div className="-mx-5 border border-dashed border-border-dashed md:-mx-0">
            <PageHeader
              crumbs={[{ label: 'Trang chủ', href: '/' }, { label: 'Câu chuyện' }]}
              intro={{ eyebrow: '02 — CÂU CHUYỆN', title: 'Chuyện làng, kể chậm.', lead: 'Lead chỉ hiện ở mobile.', heroTitle: null }}
              titleClassName="text-[38px] md:text-[76px]"
              leadClassName="md:hidden"
              wideIntro
              aside={<p className="m-0 text-small text-text-muted">Cột phải (ô tìm)</p>}
              asideSpan="narrow"
              asideClassName="max-md:hidden md:max-w-[360px] md:justify-self-end md:self-end"
            />
          </div>
        </div>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div className="flex min-w-0 flex-col gap-3 bg-bg-inverse p-5 text-text-on-dark">
            <Lab tone="dark">SÂN KHẤU CÔNG ĐOẠN · CÓ ẢNH</Lab>
            <CraftStage step={fx.craftSteps[0]} docLabel={docLabel} photoPrefix={craftCopy.journey.photoPrefix} />
          </div>
          <div className="flex min-w-0 flex-col gap-3 bg-bg-inverse p-5 text-text-on-dark">
            <Lab tone="dark">SÂN KHẤU CÔNG ĐOẠN · ẢNH CẦN CHỤP</Lab>
            <CraftStage step={fx.craftSteps[2]} docLabel={docLabel} photoPrefix={craftCopy.journey.photoPrefix} />
          </div>
        </div>
        <div className="flex flex-col gap-3">
          <Lab>HÀNH TRÌNH CÔNG ĐOẠN · NỀN TỐI</Lab>
          <div className="-mx-5 md:mx-0">
            <CraftJourney steps={fx.craftSteps} copy={craftCopy.journey} />
          </div>
        </div>
        <div className="flex flex-col gap-3">
          <Lab>DÒNG THỜI GIAN · NỀN TỐI</Lab>
          <div className="-mx-5 bg-bg-inverse px-5 py-10 text-text-on-dark md:mx-0 md:px-10">
            <Timeline events={fx.timelineEvents} copy={villageCopy.timeline} />
          </div>
        </div>
        <div className="flex flex-col gap-3">
          <Lab>THẺ HÌNH · CÓ ẢNH VÀ ẢNH CẦN CHỤP</Lab>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            <FigureCard label={`${craftCopy.tools.itemLabel} · 01`} title={craftTools[0].name} caption={craftTools[0].note} image={fx.imgStep1} />
            <FigureCard label={`${craftCopy.tools.itemLabel} · 02`} title={craftTools[1].name} caption={craftTools[1].note} image={null} />
          </div>
        </div>
        <div className="flex flex-col gap-3">
          <Lab>HAI CÁCH DỆT · TAB</Lab>
          <ComparisonTabs
            hand={{ ...craftCompare.hand, image: fx.imgHand }}
            machine={{ ...craftCompare.machine, image: null }}
            rows={fx.compareRows}
            rowsNote={craftCopy.compare.preview.note}
            labels={craftCopy.compare}
          />
        </div>
        <div className="flex flex-col gap-3">
          <Lab>ĐỌC TIẾP</Lab>
          <div className="-mx-5 md:mx-0">
            <ReadNext
              eyebrow={craftCopy.readNext.eyebrow}
              items={craftReadNext.map((r, i) => ({ href: r.href, eyebrow: r.eyebrow, title: r.title, cta: r.cta, image: i === 0 ? fx.imgPortrait : i === 1 ? fx.imgStory : null }))}
            />
          </div>
        </div>
        <Tok>content/page-header · craft-stage · craft-journey · timeline · figure-card · comparison-tabs · read-next — nút phóng và Trước/Sau dùng aria-disabled; mốc thời gian phân biệt độ tin cậy bằng hình dạng</Tok>
      </section>

      {rowThreads}

      {/* Bài đọc và chân dung */}
      <section aria-labelledby="sg-doc" className="flex flex-col gap-8">
        <h2 id="sg-doc" className={h2}>Bài đọc &amp; chân dung</h2>
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
          <div className="flex min-w-0 flex-col gap-3 md:col-span-2">
            <Lab>RICH TEXT · BÀI ĐỌC · CHỮ CÁI ĐẦU · GHI CHÚ TRÍCH (TỪ MD)</Lab>
            <div className="max-w-[720px]"><RichText variant="article" dropCap value={fx.richArticle} quoteNote={storiesCopy.detail.quoteNote} /></div>
          </div>
          <div className="flex min-w-0 flex-col gap-3">
            <Lab>RICH TEXT · LỜI KỂ CHÂN DUNG</Lab>
            <RichText variant="story" value={fx.richStory} />
            <Lab>GỢI Ý PHỎNG VẤN · XEM TRƯỚC</Lab>
            <StoryPlaceholder title={peopleCopy.detail.preview.sections[0].title} body={peopleCopy.detail.preview.sections[0].body} />
          </div>
          <div className="flex min-w-0 flex-col gap-3">
            <Lab>TRÍCH DẪN · BÀI ĐỌC</Lab>
            <PullQuote variant="article" note={storiesCopy.detail.quoteNote}>Một ông Trạng, một khung dệt, và một nghề theo làng qua nhiều thế kỷ.</PullQuote>
            <Lab>TRÍCH DẪN · GHI CHÚ CHỈ TỪ MD (noteClassName)</Lab>
            <PullQuote variant="article" note={storiesCopy.detail.quoteNote} noteClassName="max-md:hidden">Một ông Trạng, một khung dệt, và một nghề theo làng qua nhiều thế kỷ.</PullQuote>
            <Lab>TRÍCH DẪN · LỜI KỂ</Lab>
            <PullQuote variant="testimony" note="Chỉ hiển thị khi có ghi âm hoặc ghi chép gốc">“[Trích nguyên văn lời kể]”</PullQuote>
          </div>
          <div className="flex min-w-0 flex-col gap-3 md:col-span-2">
            <Lab>PHÓNG SỰ ẢNH</Lab>
            <PhotoEssay title="Phóng sự ảnh" note={<VariantText value={peopleCopy.detail.preview.galleryNote} />} items={fx.gallery} />
          </div>
          {(['none', 'partial', 'full'] as const).map((k) => (
            <div key={k} className="flex min-w-0 flex-col gap-3">
              <Lab>KHUNG ĐỒNG Ý · {k === 'none' ? 'CHƯA CÓ' : k === 'partial' ? 'MỘT PHẦN' : 'ĐÃ CÓ'}</Lab>
              <ConsentPanel consent={fx.consentStates[k]} copy={consentCopy} />
            </div>
          ))}
          <div className="flex min-w-0 flex-col gap-3">
            <Lab>CHẤM TRẠNG THÁI · 8 · 10 · 12</Lab>
            <div className="flex flex-wrap items-center gap-4">
              {([8, 10, 12] as const).flatMap((size) => (['none', 'partial', 'full'] as const).map((st) => <StatusDot key={`${size}-${st}`} state={st} size={size} />))}
            </div>
          </div>
          <div className="flex min-w-0 flex-col gap-3 md:col-span-2">
            <Lab>BĂNG GHI CHÚ</Lab>
            <NoteBanner strong="Mẫu trang chân dung." text="Người trong ảnh chưa được hỏi ý. Tên, tiểu sử và lời kể để trống cho đến khi có sự đồng ý bằng văn bản." />
          </div>
          <div className="flex min-w-0 flex-col gap-3">
            <Lab>LINK QUAY LẠI · CHỈ DƯỚI 768PX</Lab>
            <BackLink href="#" label="Câu chuyện" />
          </div>
          <div className="flex min-w-0 flex-col gap-3 md:col-span-2">
            <Lab>ĐỌC TIẾP · CÓ TIÊU ĐỀ VÀ LIÊN KẾT · MỤC THỨ BA ẨN Ở MOBILE</Lab>
            <ReadNext eyebrow="ĐỌC TIẾP" title="Đọc tiếp" action={{ href: '#', label: 'Tất cả câu chuyện' }} imageClassName="h-[240px]" items={fx.readNextItems} />
          </div>
        </div>
        <Tok>content/rich-text · ui/pull-quote · content/photo-essay · content/consent-panel · content/status-dot · ui/note-banner · ui/back-link · content/read-next (title, action, mobile) — khung đồng ý luôn có chữ đi kèm chấm; băng ghi chú dùng role=note</Tok>
      </section>

      {rowThreads}

      {/* Bộ lọc, tab & phân trang */}
      <section aria-labelledby="sg-loc" className="flex flex-col gap-8">
        <h2 id="sg-loc" className={h2}>Bộ lọc, tab &amp; phân trang</h2>
        <div className="flex min-w-0 flex-col gap-8">
          <FilterDemos />
          <SegmentedDemos />
          <PatternExplorerDemo copy={applyMode(productsCopy, 'preview').detail} />
          <LightboxDemo copy={applyMode(archiveCopy, 'preview')} />
          <TabDemo />
          <div className="flex flex-col gap-3">
            <Lab>CHỮ HAI BẢN (DESKTOP / MOBILE)</Lab>
            <p className="text-[14px] text-text-secondary">
              <VariantText value={{ desktop: 'Dệt thủ công (từ 768px)', mobile: 'Thủ công (dưới 768px)' }} />
            </p>
          </div>
          <InteractiveDemos />
        </div>
        <Tok>filter/chip · tabs · search · load-more · share · reading-progress · toc — bộ lọc dùng button aria-pressed, tab dùng role tablist</Tok>
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
          <div className="flex flex-col gap-3 sm:col-span-2 lg:col-span-4">
            <Lab>TRỐNG · KHUNG RỘNG (lg)</Lab>
            <EmptyState size="lg" title="Chưa có bài trong chủ đề này" body="Câu chuyện về người làng chỉ được viết khi chính họ đồng ý kể. Nếu bạn muốn kể về một người thân làm nghề chiếu, hãy liên hệ với chúng tôi." action={{ href: '#', label: 'Góp một câu chuyện' }} />
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
        <div className="grid grid-cols-1 items-start gap-6 md:grid-cols-2">
          <div className="flex flex-col gap-3 bg-bg-deep p-5"><Lab tone="dark">TRỐNG · NỀN TỐI (tone=dark)</Lab><EmptyState tone="dark" size="lg" title="Chưa có tư liệu được phép đăng" body="Tư liệu sẽ hiện ở đây khi được cho phép." action={{ href: '#', label: 'Góp một ký ức' }} /></div>
          <SuccessActionDemo />
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
