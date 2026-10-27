import type { CraftPageView } from '@/lib/content'
import { ComparisonTabs } from '@/components/content/ComparisonTabs'
import { ContentImage } from '@/components/content/ContentImage'
import { CraftJourney } from '@/components/content/CraftJourney'
import { FigureCard } from '@/components/content/FigureCard'
import { PageHeader } from '@/components/content/PageHeader'
import { ReadNext } from '@/components/content/ReadNext'
import { VerifyNote } from '@/components/content/VerifyNote'
import { Eyebrow } from '@/components/ui/Eyebrow'
import { ScrollStrip } from '@/components/ui/ScrollStrip'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { ThreadsDivider } from '@/components/ui/ThreadsDivider'
import { hasVariant, VariantText } from '@/components/ui/VariantText'

const pad = (n: number) => String(n).padStart(2, '0')

// Trang Nghề dệt chiếu: đầu trang, hành trình, dụng cụ, hai cách dệt, đọc tiếp. Phần không có dữ liệu ở public thì không dựng.
export function CraftView({ page }: { page: CraftPageView }) {
  const { copy, intro, hero, tools, compare } = page
  const verify = copy.intro.preview?.verifyNote ?? null
  const crumbs = [{ label: copy.breadcrumb.home ?? '', href: '/' }, { label: copy.breadcrumb.current ?? '' }]

  const note = verify ? (
    <>
      {verify.desktop ? (
        <div className="max-w-[640px] max-md:hidden">
          <VerifyNote>{verify.desktop}</VerifyNote>
        </div>
      ) : null}
      {verify.mobile ? (
        <div className="md:hidden">
          <VerifyNote size="sm">{verify.mobile}</VerifyNote>
        </div>
      ) : null}
    </>
  ) : undefined

  // Ảnh chính chỉ có ở artboard desktop.
  const aside = hero ? (
    <figure className="m-0 flex flex-col gap-2.5">
      <ContentImage image={hero.image} size="wide" sizes="40vw" priority className="block h-[460px]" />
      {hero.caption ? <figcaption className="font-serif text-[14px] text-text-secondary italic">{hero.caption}</figcaption> : null}
    </figure>
  ) : undefined

  return (
    <>
      <PageHeader crumbs={crumbs} intro={intro} note={note} aside={aside} asideClassName="max-md:hidden" />

      <CraftJourney steps={page.steps} copy={copy.journey} />

      {/* Không dựng section chỉ còn tiêu đề: dụng cụ, hai cách dệt và đọc tiếp luôn có chữ cố định; hành trình tự ẩn khi không có công đoạn. */}
      {tools.length > 0 ? (
        <section aria-labelledby="tools-h" className="flex flex-col gap-4 px-5 py-12 md:gap-10 md:px-20 md:py-28">
          <SectionHeading
            id="tools-h"
            size="section"
            eyebrow={copy.tools.eyebrow ?? undefined}
            title={copy.tools.title}
            note={copy.tools.preview?.note.desktop ?? undefined}
            noteClassName="max-md:hidden"
          />
          <ScrollStrip focusable label={copy.tools.title ?? undefined} className="gap-3 md:mx-0 md:grid md:grid-cols-3 md:gap-6 md:overflow-visible md:px-0">
            {tools.map((t) => (
              <FigureCard key={t.n} label={`${copy.tools.itemLabel} · ${pad(t.n)}`} title={t.name} caption={t.note} image={t.image} />
            ))}
          </ScrollStrip>
        </section>
      ) : null}

      <ThreadsDivider className="mx-5 md:mx-20" />

      <section aria-labelledby="compare-h" className="flex flex-col gap-4 px-5 pt-12 pb-14 md:gap-10 md:px-20 md:py-28">
        <div className="flex max-w-[760px] flex-col gap-4">
          {copy.compare.eyebrow ? <Eyebrow>{copy.compare.eyebrow}</Eyebrow> : null}
          <h2 id="compare-h" className="font-display text-h2-section leading-[1.1] font-normal">
            {copy.compare.title}
          </h2>
          {hasVariant(copy.compare.lead) ? (
            <p className="text-[15px] leading-[1.65] text-text-secondary md:text-[17px] md:leading-[1.7]">
              <VariantText value={copy.compare.lead} />
            </p>
          ) : null}
        </div>
        <ComparisonTabs hand={compare.hand} machine={compare.machine} rows={compare.rows} rowsNote={copy.compare.preview?.note ?? null} labels={copy.compare} />
      </section>

      <ReadNext items={page.readNext} eyebrow={copy.readNext.eyebrow} />
    </>
  )
}
