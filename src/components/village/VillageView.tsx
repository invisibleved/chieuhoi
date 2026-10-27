import type { ReactNode } from 'react'
import type { Variant, VillagePageView } from '@/lib/content'
import { ConfidenceLegend } from '@/components/content/Confidence'
import { ContentImage } from '@/components/content/ContentImage'
import { DocumentLabel } from '@/components/content/DocumentLabel'
import { PageHeader } from '@/components/content/PageHeader'
import { Cite, SourceList, sourceNumbers } from '@/components/content/Sources'
import { Timeline } from '@/components/content/Timeline'
import { Callout } from '@/components/ui/Callout'
import { Eyebrow } from '@/components/ui/Eyebrow'
import { FactList } from '@/components/ui/FactList'
import { LinkArrow } from '@/components/ui/LinkArrow'
import { PlaceholderFrame } from '@/components/ui/PlaceholderFrame'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { ThreadsDivider } from '@/components/ui/ThreadsDivider'
import { hasVariant, VariantText } from '@/components/ui/VariantText'

type Numbers = Map<string, number>

// Bản mobile null nghĩa là chỉ có ở desktop: ẩn cả khối dưới md.
const desktopOnly = (v: Variant) => (v.mobile ? '' : 'max-md:hidden')

// Một câu kèm chú thích; câu chỉ có ở desktop thì chú thích cũng ẩn theo.
function Sentence({ text, cite, numbers }: { text: Variant; cite: string[]; numbers: Numbers }) {
  if (!hasVariant(text)) return null
  return (
    <span className={desktopOnly(text)}>
      <VariantText value={text} />
      <Cite ids={cite} numbers={numbers} />{' '}
    </span>
  )
}

// Một đoạn gồm nhiều câu; ẩn cả đoạn khi không câu nào có chữ.
function Parts({ parts, numbers }: { parts: { text: Variant; cite: string[] }[]; numbers: Numbers }) {
  return (
    <>
      {parts.map((p, i) => (
        <Sentence key={i} text={p.text} cite={p.cite} numbers={numbers} />
      ))}
    </>
  )
}

// Trang Làng Hới: đầu trang, tổ nghề, dòng thời gian, vị trí, đời sống (chỉ desktop), di sản hôm nay, nguồn.
export function VillageView({ page }: { page: VillagePageView }) {
  const { copy, intro, hero, facts, life } = page
  const numbers = sourceNumbers(page.sources)
  const crumbs = [{ label: copy.breadcrumb.home ?? '', href: '/' }, { label: copy.breadcrumb.current ?? '' }]

  const factItems = facts.filter((f) => hasVariant(f.detail)).map((f) => ({
    term: f.term,
    detail: (
      <>
        <VariantText value={f.detail} />
        <Cite ids={f.cite} numbers={numbers} />
        {hasVariant(f.note) ? (
          <>
            <br />
            <span className="text-[13px] text-text-muted">
              <VariantText value={f.note} />
            </span>
          </>
        ) : null}
      </>
    ),
  }))
  const factList = factItems.length > 0 ? <FactList items={factItems} /> : null

  const { founder, timeline, location, heritage } = copy
  const lifeOn = life.length > 0 && hasVariant(copy.life.title)
  const heroDoc = hero ? hero.image.docNumber : null

  return (
    <>
      <PageHeader
        crumbs={crumbs}
        intro={intro}
        titleClassName="text-[40px] md:text-[76px]"
        aside={factList ? <div data-testid="village-facts-desktop">{factList}</div> : undefined}
        asideSpan="narrow"
        asideClassName="max-md:hidden md:self-end md:pb-14"
      />

      {hero ? (
        <figure className="relative m-0 flex flex-col gap-2 md:block">
          <ContentImage image={hero.image} size="full" sizes="100vw" priority className="block h-[260px] md:h-[640px]" />
          {heroDoc || hero.caption ? (
            <>
              <DocumentLabel code={heroDoc} title={hero.caption ?? ''} size="sm" className="absolute right-20 bottom-6 max-w-[340px] max-md:hidden" />
              <figcaption className="px-5 text-[12px] tracking-[.1em] text-text-muted md:hidden">
                {[heroDoc && copy.hero.docLabel.mobile ? `${copy.hero.docLabel.mobile} · ${heroDoc}` : null, hero.caption].filter(Boolean).join(' · ')}
              </figcaption>
            </>
          ) : null}
        </figure>
      ) : null}

      {factList ? <div data-testid="village-facts-mobile" className="mx-5 mt-6 md:hidden">{factList}</div> : null}

      <section aria-labelledby="founder-h" className="flex flex-col gap-4 px-5 py-14 md:grid md:grid-cols-12 md:gap-x-6 md:gap-y-10 md:px-20 md:py-[120px]">
        <div className="flex flex-col gap-4 md:col-span-4">
          <Eyebrow as="p">{founder.eyebrow}</Eyebrow>
          <h2 id="founder-h" className="font-display text-h2-section leading-[1.15] font-normal md:leading-[1.12]">
            {founder.title}
          </h2>
        </div>
        <div className="flex flex-col gap-4 md:col-span-6 md:col-start-6 md:gap-[22px]">
          {founder.paragraphs.filter((para) => para.parts.some((p) => hasVariant(p.text))).map((para, i) => (
            <p key={i} className="m-0 font-serif text-[17px] leading-[1.75] md:text-[20px]">
              <Parts parts={para.parts} numbers={numbers} />
            </p>
          ))}
          {founder.conflict.parts.some((p) => hasVariant(p.text)) ? (
            <Callout title={founder.conflict.label ?? ''}>
              <Parts parts={founder.conflict.parts} numbers={numbers} />
              {founder.conflict.preview?.closing && hasVariant(founder.conflict.preview.closing) ? (
                <span className={desktopOnly(founder.conflict.preview.closing)}>
                  <VariantText value={founder.conflict.preview.closing} />
                </span>
              ) : null}
            </Callout>
          ) : null}
          {hasVariant(founder.noPortrait) ? (
            <p className="m-0 text-small text-text-muted max-md:hidden">
              <VariantText value={founder.noPortrait} />
            </p>
          ) : null}
        </div>
      </section>

      {page.timeline.length > 0 ? (
        <section aria-labelledby="timeline-h" className="flex flex-col gap-4 bg-bg-inverse px-5 py-12 text-text-on-dark md:gap-12 md:px-20 md:pt-[104px] md:pb-24">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between md:gap-10">
            <SectionHeading id="timeline-h" size="section" tone="dark" eyebrow={timeline.eyebrow ?? undefined} title={timeline.title} />
            {timeline.legendLabel.desktop ? (
              <ConfidenceLegend label={timeline.legendLabel.desktop} labels={timeline.confidence} className="max-md:hidden" />
            ) : null}
            {timeline.legendLabel.mobile ? (
              <ConfidenceLegend label={timeline.legendLabel.mobile} labels={timeline.confidence} className="md:hidden" />
            ) : null}
          </div>
          <Timeline events={page.timeline} copy={timeline} />
        </section>
      ) : null}

      <section aria-labelledby="location-h" className="flex flex-col gap-4 px-5 py-14 md:grid md:grid-cols-12 md:gap-x-6 md:gap-y-8 md:px-20 md:py-[120px]">
        <div className="flex flex-col gap-4 md:col-span-5">
          <Eyebrow as="p">{location.eyebrow}</Eyebrow>
          <h2 id="location-h" className="font-display text-h2-section leading-[1.15] font-normal md:leading-[1.12]">
            {location.title}
          </h2>
          {location.body.text ? (
            <p className="m-0 text-[16px] leading-[1.7] md:text-[17px]">
              {location.body.text}
              <Cite ids={location.body.cite} numbers={numbers} />
            </p>
          ) : null}
          {location.preview && hasVariant(location.preview.note) ? (
            <p className={`m-0 text-[15px] leading-[1.65] text-text-secondary ${desktopOnly(location.preview.note)}`}>
              <VariantText value={location.preview.note} />
            </p>
          ) : null}
        </div>
        {location.preview ? (
          <PlaceholderFrame
            label={location.preview.map.label ?? ''}
            title={location.preview.map.title ?? undefined}
            description={location.preview.map.body.desktop ?? undefined}
            descriptionClassName="max-md:hidden"
            className="h-[200px] md:col-span-6 md:col-start-7 md:h-[380px]"
          />
        ) : null}
      </section>

      {lifeOn ? <LifeSection life={life} copy={copy.life} /> : null}

      <ThreadsDivider className="mx-5 md:mx-20" />

      <section aria-labelledby="heritage-h" className="flex flex-col gap-3.5 bg-bg-secondary px-5 py-12 md:grid md:grid-cols-12 md:gap-x-6 md:gap-y-8 md:px-20 md:py-28">
        <div className="flex flex-col gap-3.5 md:col-span-4 md:gap-4">
          <Eyebrow as="p">{heritage.eyebrow}</Eyebrow>
          <h2 id="heritage-h" className="font-display text-h2-section leading-[1.2] font-normal md:leading-[1.12]">
            {heritage.title}
          </h2>
        </div>
        <div className="flex flex-col gap-3.5 md:col-span-7 md:col-start-6 md:gap-5">
          {heritage.paragraphs.filter((para) => hasVariant(para.text)).map((para, i) => (
            <p key={i} className={`m-0 text-[16px] leading-[1.7] md:text-[18px] md:leading-[1.75] ${desktopOnly(para.text)}`}>
              <VariantText value={para.text} />
              <Cite ids={para.cite} numbers={numbers} />
            </p>
          ))}
          {heritage.preview && hasVariant(heritage.preview.note) ? (
            <p className={`m-0 border border-dashed border-border-dashed px-[18px] py-3.5 text-small leading-[1.6] text-text-secondary ${desktopOnly(heritage.preview.note)}`}>
              <VariantText value={heritage.preview.note} />
            </p>
          ) : null}
          {heritage.link.href && heritage.link.label ? (
            <LinkArrow href={heritage.link.href} className="self-start">
              {heritage.link.label.replace(/\s*→$/, '')}
            </LinkArrow>
          ) : null}
        </div>
      </section>

      <SourceList sources={page.sources} title={copy.sources.title ?? undefined} />
    </>
  )
}

// Đời sống làng: chỉ có ở artboard desktop (ảnh lớn 7 cột, hai ảnh xếp dọc 5 cột).
function LifeSection({ life, copy }: { life: VillagePageView['life']; copy: VillagePageView['copy']['life'] }): ReactNode {
  const [main, ...rest] = life
  const fig = (m: (typeof life)[number], h: string, sizes: string) => (
    <figure className="m-0 flex flex-col gap-2.5">
      <ContentImage image={m.image} size="wide" sizes={sizes} className={`block ${h}`} />
      {m.caption ? <figcaption className="font-serif text-[14px] text-text-secondary italic">{m.caption}</figcaption> : null}
    </figure>
  )
  return (
    <section aria-labelledby="life-h" className="hidden grid-cols-12 gap-x-6 gap-y-8 px-20 py-[120px] md:grid">
      <div className="col-span-12 flex items-end justify-between gap-10">
        <SectionHeading id="life-h" size="section" eyebrow={copy.eyebrow.desktop ?? undefined} title={copy.title.desktop} />
        {copy.link.label.desktop && copy.link.href ? <LinkArrow href={copy.link.href}>{copy.link.label.desktop.replace(/\s*→$/, '')}</LinkArrow> : null}
      </div>
      <div className="col-span-7">{fig(main, 'h-[460px]', '58vw')}</div>
      {rest.length > 0 ? (
        <div className="col-span-5 col-start-8 grid grid-rows-2 gap-6">{rest.slice(0, 2).map((m, i) => <div key={i}>{fig(m, 'h-[190px]', '40vw')}</div>)}</div>
      ) : null}
    </section>
  )
}
