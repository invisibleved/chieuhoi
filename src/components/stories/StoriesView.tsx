'use client'

import { useState } from 'react'
import type { StoriesPageView, StoryCardView, Variant } from '@/lib/content'
import { fillTemplate } from '@/lib/template'
import { PageHeader } from '@/components/content/PageHeader'
import { StoryCard } from '@/components/content/StoryCard'
import { EmptyState } from '@/components/ui/Feedback'
import { FilterableList } from '@/components/ui/FilterableList'
import { SearchField } from '@/components/ui/SearchField'
import { VariantText } from '@/components/ui/VariantText'
import { ThreadsDivider } from '@/components/ui/ThreadsDivider'

const PAGE_SIZE = 9

const detailHref = (s: StoryCardView) => (s.hasDetail ? `/cau-chuyen/${s.slug}` : undefined)
const searchText = (s: StoryCardView) => [s.title, s.sapo, s.category].filter(Boolean).join(' ')

// Trang danh sách Câu chuyện: đầu trang + ô tìm (desktop), bài nổi bật (desktop), lưới có lọc/tìm/xem thêm.
export function StoriesView({ page }: { page: StoriesPageView }) {
  const { copy, intro, stories, filters, featured } = page
  const [query, setQuery] = useState('')
  const crumbs = [
    { label: copy.breadcrumb.home ?? '', href: '/' },
    { label: copy.breadcrumb.current ?? '' },
  ]
  const search = { id: 'mq', label: copy.search.label ?? '', placeholder: copy.search.placeholder }

  const status = (matches: StoryCardView[]): Variant => {
    const drafts = matches.filter((s) => s.isDraft).length
    const n = fillTemplate(copy.count.stories ?? '', { n: matches.length })
    return { desktop: drafts > 0 ? n + fillTemplate(copy.count.drafts ?? '', { d: drafts }) : n, mobile: n }
  }

  return (
    <>
      <PageHeader
        crumbs={crumbs}
        intro={intro}
        titleClassName="text-[38px] md:text-[76px]"
        leadClassName="md:hidden"
        wideIntro
        aside={
          <SearchField
            id="q"
            label={search.label}
            placeholder={search.placeholder}
            value={query}
            onChange={setQuery}
          />
        }
        asideSpan="narrow"
        asideClassName="max-md:hidden md:max-w-[360px] md:justify-self-end md:self-end"
      />

      {featured ? (
        <section
          aria-label={copy.featured.eyebrow ?? undefined}
          className="px-20 pb-24 max-md:hidden"
        >
          <StoryCard
            story={featured.story}
            href={`/cau-chuyen/${featured.story.slug}`}
            variant="hero"
            eyebrow={featured.eyebrow}
            meta={featured.meta}
          />
        </section>
      ) : null}

      <ThreadsDivider className="mx-20 max-md:hidden" />

      <section className="px-5 pb-12 md:px-20 md:pt-[72px] md:pb-[120px]">
        <FilterableList
          items={stories}
          getKey={(s) => s.slug}
          getCategory={(s) => s.categoryKey}
          getSearchText={searchText}
          filters={filters}
          filterLabel={copy.filter.label}
          search={{ ...search, className: 'md:hidden' }}
          query={query}
          onQueryChange={setQuery}
          pageSize={PAGE_SIZE}
          more={
            copy.more.label && copy.more.done
              ? { label: copy.more.label, done: copy.more.done }
              : undefined
          }
          status={status}
          empty={
            <EmptyState
              size="lg"
              title={copy.empty.title ?? ''}
              body={<VariantText value={copy.empty.body} />}
              action={
                copy.empty.action.href && copy.empty.action.label
                  ? { href: copy.empty.action.href, label: copy.empty.action.label }
                  : undefined
              }
            />
          }
          listClassName="grid grid-cols-1 gap-y-7 md:grid-cols-3 md:gap-x-6 md:gap-y-14"
          className="flex flex-col gap-4 md:gap-10"
          toolbarClassName="flex flex-col gap-4 md:flex-row md:flex-wrap md:items-center md:justify-between md:gap-6"
          renderItem={(s) => <StoryCard story={s} href={detailHref(s)} variant="grid" hideCta />}
        />
      </section>
    </>
  )
}
