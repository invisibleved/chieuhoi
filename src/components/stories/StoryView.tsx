import { Fragment } from 'react'
import type { StoryPageView } from '@/lib/content'
import { ContentImage } from '@/components/content/ContentImage'
import { ReadNext } from '@/components/content/ReadNext'
import { RichText } from '@/components/content/RichText'
import { SourceList } from '@/components/content/Sources'
import { Tag } from '@/components/content/Tag'
import { VerifyNote } from '@/components/content/VerifyNote'
import { Breadcrumb } from '@/components/layout/Breadcrumb'
import { BackLink } from '@/components/ui/BackLink'
import { DetailTitle, Lede } from '@/components/ui/DetailTitle'
import { Eyebrow } from '@/components/ui/Eyebrow'
import { ReadingProgress } from '@/components/ui/ReadingProgress'
import { ShareButtons } from '@/components/ui/ShareButtons'
import { TableOfContents } from '@/components/ui/TableOfContents'

const ARTICLE_ID = 'bai-doc'
const LIST_HREF = '/cau-chuyen'

// Trang bài đọc: đầu bài, ảnh bìa, thân bài (mục lục + chia sẻ ở cột trái từ md), ghi chú nguồn, đọc tiếp.
export function StoryView({ page }: { page: StoryPageView }) {
  const { story, meta, readNext, copy } = page
  const d = copy.detail
  const share = d.share
  const crumbs = [
    { label: copy.breadcrumb.home ?? '', href: '/' },
    { label: copy.breadcrumb.current ?? '', href: LIST_HREF },
    { label: story.title ?? '' },
  ]
  const photographer = story.cover?.photographer
  const hasCaption = Boolean(story.coverCaption || photographer)

  return (
    <div>
      <ReadingProgress label={d.progress ?? ''} targetId={ARTICLE_ID} />
      <article id={ARTICLE_ID}>
        <header className="flex flex-col gap-3.5 px-5 pt-2 pb-7 md:grid md:grid-cols-12 md:gap-x-6 md:gap-y-7 md:px-20 md:pt-10 md:pb-14">
          <div className="max-md:hidden md:col-span-12">
            <Breadcrumb items={crumbs} />
          </div>
          <BackLink href={LIST_HREF} label={d.back ?? ''} />
          <div className="flex flex-col gap-3.5 md:col-span-8 md:col-start-3 md:items-center md:gap-[22px] md:pt-8 md:text-center">
            <div className="flex flex-wrap items-center gap-2.5 md:gap-3">
              {story.category ? <Eyebrow tracking="label">{story.category.toLocaleUpperCase('vi')}</Eyebrow> : null}
              {story.status === 'Bản nháp' && d.draftTag ? <Tag variant="dashed">{d.draftTag}</Tag> : null}
            </div>
            <DetailTitle size="story">{story.title}</DetailTitle>
            {story.sapo ? <Lede size="story">{story.sapo}</Lede> : null}
            {meta.length > 0 ? (
              <p data-meta className="m-0 flex flex-wrap gap-x-2 text-[13px] leading-[1.6] text-text-muted md:justify-center md:gap-x-[18px] md:text-[14px]">
                {meta.map((m, i) => (
                  <Fragment key={m}>
                    {i > 0 ? <span aria-hidden="true">·</span> : null}
                    <span>{m}</span>
                  </Fragment>
                ))}
              </p>
            ) : null}
          </div>
        </header>

        {story.cover ? (
          <figure className="m-0 flex flex-col gap-2 md:mx-20 md:gap-3">
            <ContentImage image={story.cover} size="full" priority sizes="(min-width: 768px) 1280px, 100vw" className="block h-[260px] md:h-[600px]" />
            {hasCaption ? (
              <figcaption className="px-5 font-serif text-[13px] leading-[1.5] text-text-secondary italic md:px-0 md:text-[14px]">
                {story.coverCaption}
                {photographer ? <span className="max-md:hidden">{story.coverCaption ? ' ' : ''}{d.photoPrefix}{photographer}</span> : null}
              </figcaption>
            ) : null}
          </figure>
        ) : null}

        <div className="px-5 pt-9 md:grid md:grid-cols-12 md:gap-x-6 md:px-20 md:pt-[88px]">
          <aside className="flex flex-col gap-7 self-start max-md:hidden md:sticky md:top-6 md:col-span-2">
            <ShareButtons copy={share} />
            <TableOfContents label={d.toc.label ?? ''} title={d.toc.title ?? ''} items={story.toc} />
          </aside>
          <div className="flex flex-col gap-8 md:col-span-6 md:col-start-4 md:gap-11">
            {story.body ? <RichText value={story.body} variant="article" dropCap /> : null}
            {story.reviewChecklist && story.reviewChecklist.length > 0 ? (
              <VerifyNote title={d.preview?.checklistTitle ?? ''}>
                <ul className="m-0 list-disc pl-5">
                  {story.reviewChecklist.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </VerifyNote>
            ) : null}
            <div className="md:hidden">
              <ShareButtons copy={share} />
            </div>
          </div>
        </div>

        <SourceList sources={story.sources} variant="notes" headingId="ghi-chu-nguon" title={d.notesTitle ?? undefined} />
      </article>

      <ReadNext
        items={readNext}
        eyebrow={d.readNext.eyebrow}
        title={d.readNext.title ?? undefined}
        action={d.readNext.all ? { href: LIST_HREF, label: d.readNext.all } : undefined}
        imageClassName="h-[240px]"
        className="mt-12 md:mt-28"
      />
    </div>
  )
}
