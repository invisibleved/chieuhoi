import type { PersonPageView } from '@/lib/content'
import { ConsentPanel } from '@/components/content/ConsentPanel'
import { ContentImage } from '@/components/content/ContentImage'
import { DocumentLabel } from '@/components/content/DocumentLabel'
import { PhotoEssay } from '@/components/content/PhotoEssay'
import { ReadNext } from '@/components/content/ReadNext'
import { RichText, StoryPlaceholder } from '@/components/content/RichText'
import { SourceList } from '@/components/content/Sources'
import { Breadcrumb } from '@/components/layout/Breadcrumb'
import { BackLink } from '@/components/ui/BackLink'
import { DetailTitle, Lede } from '@/components/ui/DetailTitle'
import { Eyebrow } from '@/components/ui/Eyebrow'
import { FactList } from '@/components/ui/FactList'
import { NoteBanner } from '@/components/ui/NoteBanner'
import { PullQuote } from '@/components/ui/PullQuote'
import { VariantText } from '@/components/ui/VariantText'

const LIST_HREF = '/con-nguoi'
const STORY_ID = 'cau-chuyen-h'

// Trang chân dung (PersonDetail, PersonMobile). View model đã lọc theo đồng ý: component chỉ hiện những gì nhận được.
// Phần chữ gợi ý (nhánh `preview` của copy) chỉ có ở bản xem trước (R14, R19).
export function PersonView({ page }: { page: PersonPageView }) {
  const { person: p, related, copy } = page
  const d = copy.detail
  const pv = d.preview
  const crumbs = [
    { label: copy.breadcrumb.home ?? '', href: '/' },
    { label: copy.breadcrumb.current ?? '', href: LIST_HREF },
    { label: p.heading },
  ]

  const rows = [
    { key: 'role', term: d.facts.role, detail: p.role },
    { key: 'years', term: d.facts.years, detail: p.yearsInCraft },
    { key: 'hamlet', term: d.facts.hamlet, detail: p.hamlet },
    { key: 'recorded', term: d.facts.recorded, detail: p.recorded },
  ] as const
  const factsOf = (keys: readonly string[]) =>
    rows.flatMap((f) => (keys.includes(f.key) && f.term && f.detail ? [{ term: f.term, detail: f.detail }] : []))
  const facts = factsOf(['role', 'years', 'hamlet', 'recorded'])
  // Mobile chỉ có Vai trò và Năm làm nghề (PersonMobile).
  const mobileFacts = factsOf(['role', 'years'])
  const intro = p.intro ?? pv?.intro ?? null

  const [part1, part2, part3] = p.storyParts
  const quote = p.quote
    ? <PullQuote variant="testimony" note={p.quote.note}>{p.quote.text}</PullQuote>
    : pv ? <PullQuote variant="testimony" note={<VariantText value={pv.quoteNote} />}>{pv.quote}</PullQuote> : null
  // Preview không có câu chuyện: ba mục gợi ý (R15). Public trống thì bỏ cả section.
  const placeholders = !part1 && !part2 && !part3 && pv ? pv.sections : null
  const hasStory = Boolean(part1 || part2 || part3 || p.quote || placeholders)
  // Lời trích sau mục 1 ở mobile (PersonMobile), sau mục 2 từ md (PersonDetail) (F1). Không có mục 2 thì
  // hai chỗ trùng nhau: chỉ render một lần.
  const blocks = placeholders
    ? placeholders.map((s, i) => <StoryPlaceholder key={i} title={s.title} body={s.body} />)
    : [part1, part2, part3].map((r, i) => (r ? <RichText key={i} value={r} variant="story" /> : null))
  const split = Boolean(quote && blocks[1])
  const cap = p.portraitCaption

  return (
    <div>
      {pv && p.consentPending ? (
        <>
          <div className="max-md:hidden"><NoteBanner strong={pv.banner.desktop.strong ?? ''} text={pv.banner.desktop.text ?? ''} /></div>
          <div className="md:hidden"><NoteBanner strong={pv.banner.mobile.strong ?? ''} text={pv.banner.mobile.text ?? ''} /></div>
        </>
      ) : null}

      <header className="flex flex-col md:grid md:grid-cols-12 md:items-end md:gap-x-6 md:px-20 md:pt-10">
        <div className="max-md:hidden md:col-span-12 md:mb-8">
          <Breadcrumb items={crumbs} />
        </div>
        <div className="mx-5 mt-1 md:hidden">
          <BackLink href={LIST_HREF} label={d.back ?? ''} />
        </div>
        {p.portrait ? (
          <figure className="relative m-0 mt-1 md:col-span-7 md:mt-0">
            <ContentImage
              image={p.portrait}
              size="full"
              priority
              notesPosition="top-right"
              sizes="(min-width: 768px) 55vw, 100vw"
              objectPosition="22% 50%"
              className="block h-[440px] md:h-[760px]"
            />
            {cap && (cap.code || cap.line.desktop || cap.line.mobile) ? (
              <figcaption className="absolute bottom-3 left-3 md:bottom-5 md:left-5">
                {cap.code || cap.line.desktop ? (
                  <DocumentLabel variant="overlay" size="sm" label={cap.label} code={cap.code} title={cap.line.desktop} className="gap-[3px] px-3.5 py-3 max-md:hidden" />
                ) : null}
                {cap.line.mobile ? (
                  <DocumentLabel variant="overlay" size="sm" label={null} title={cap.line.mobile} className="px-2.5 py-2 md:hidden" />
                ) : null}
              </figcaption>
            ) : null}
          </figure>
        ) : null}
        <div
          className={`flex flex-col gap-3.5 px-5 pt-7 md:gap-[22px] md:px-0 md:pt-0 md:pb-2 ${
            p.portrait ? 'md:col-span-4 md:col-start-9' : 'md:col-span-8'
          }`}
        >
          {p.category ? <Eyebrow as="p" uppercase>{p.category}</Eyebrow> : null}
          <DetailTitle size="person">{p.heading}</DetailTitle>
          {facts.length > 0 ? <FactList layout="inline" items={facts} className="max-md:hidden" /> : null}
          {mobileFacts.length > 0 ? <FactList layout="inline" items={mobileFacts} className="mt-1 md:hidden" /> : null}
          {intro ? <Lede size="person">{intro}</Lede> : null}
        </div>
      </header>

      {hasStory ? (
        <section aria-labelledby={STORY_ID} className="flex flex-col gap-6 px-5 pt-12 md:grid md:grid-cols-12 md:gap-x-6 md:px-20 md:pt-[120px]">
          <div className="flex flex-col gap-3 md:col-span-3">
            <Eyebrow as="p" className="max-md:hidden">{d.story.eyebrow}</Eyebrow>
            <h2 id={STORY_ID} className="m-0 font-display text-[30px] leading-[1.2] font-normal md:text-[40px] md:leading-[1.15]">
              {p.storyTitle}
            </h2>
          </div>
          <div className="flex flex-col gap-6 md:col-span-6 md:col-start-5 md:gap-8">
            {blocks[0]}
            {split ? <div className="md:hidden">{quote}</div> : quote}
            {blocks[1]}
            {split ? <div className="max-md:hidden">{quote}</div> : null}
            {blocks.slice(2)}
          </div>
        </section>
      ) : null}

      {/* Chú thích số trong câu chuyện trỏ tới #nguon-n ở đây (T2c). */}
      <SourceList sources={p.sources} variant="notes" headingId="ghi-chu-nguon" title={d.notesTitle ?? undefined} />

      {p.gallery.length > 0 ? (
        <div className="pt-12 md:px-20 md:pt-28">
          <PhotoEssay title={d.gallery.title ?? ''} note={pv ? <VariantText value={pv.galleryNote} /> : null} items={p.gallery} />
        </div>
      ) : null}

      <div className="mx-5 mt-10 md:mx-20 md:mt-28">
        <ConsentPanel consent={p.consent} copy={d.consent} />
      </div>

      {/* Khoảng cách nằm trong ReadNext để ẩn cùng khối khi mobile không còn thẻ nào. */}
      <ReadNext items={related} eyebrow={d.related.eyebrow} title={d.related.title ?? undefined} imageClassName="h-[220px]" className="mt-10 md:mt-28" />
    </div>
  )
}
