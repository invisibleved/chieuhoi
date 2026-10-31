'use client'

import type { ProductCardView, ProductsPageView, Variant } from '@/lib/content'
import { fillTemplate } from '@/lib/template'
import { PageHeader } from '@/components/content/PageHeader'
import { ProductCard } from '@/components/content/ProductCard'
import { Callout } from '@/components/ui/Callout'
import { CtaBand } from '@/components/ui/CtaBand'
import { EmptyState } from '@/components/ui/Feedback'
import { FilterableList } from '@/components/ui/FilterableList'
import { LinkArrow } from '@/components/ui/LinkArrow'
import { ThreadsDivider } from '@/components/ui/ThreadsDivider'

// Trang danh sách Sản phẩm: đầu trang kèm khung "VỀ DANH MỤC" (desktop), lưới hiện vật có lọc, khối mời.
export function ProductsView({ page }: { page: ProductsPageView }) {
  const { copy, intro, products, filters, catalogSourceUrl } = page
  const crumbs = [
    { label: copy.breadcrumb.home ?? '', href: '/' },
    { label: copy.breadcrumb.current ?? '' },
  ]
  const { catalog, cta } = copy

  const status = (matches: ProductCardView[]): Variant => ({
    desktop: fillTemplate(copy.count.desktop ?? '', { n: matches.length }),
    mobile: fillTemplate(copy.count.mobile ?? '', { n: matches.length }),
  })

  return (
    <>
      <PageHeader
        crumbs={crumbs}
        intro={intro}
        hideCrumbsOnMobile
        titleClassName="text-[38px] md:text-[76px]"
        asideSpan="narrow"
        asideClassName="max-md:hidden md:self-end"
        aside={
          <Callout tone="outline" title={catalog.title ?? ''}>
            <div className="flex flex-col gap-2.5">
              <p className="m-0">{catalog.body}</p>
              {catalogSourceUrl ? <LinkArrow href={catalogSourceUrl} newTab>{catalog.link}</LinkArrow> : null}
            </div>
          </Callout>
        }
      />

      <ThreadsDivider className="mx-5 max-md:hidden md:mx-20" />

      <section className="px-5 pb-12 md:px-20 md:pt-14 md:pb-[120px]">
        <FilterableList
          items={products}
          getKey={(p) => p.slug}
          getCategory={(p) => p.group}
          filters={filters}
          filterLabel={copy.filter.label}
          status={status}
          empty={<EmptyState size="lg" title={copy.empty.title ?? ''} />}
          className="flex flex-col gap-4 md:gap-10"
          toolbarClassName="flex flex-col gap-4 md:flex-row md:flex-wrap md:items-center md:justify-between md:gap-6"
          listClassName="grid grid-cols-1 gap-y-7 md:grid-cols-3 md:gap-x-6 md:gap-y-16"
          renderItem={(p) => (
            <ProductCard product={p} href={`/san-pham/${p.slug}`} shotNeeded={p.shotNeeded} showSummary />
          )}
        />
      </section>

      <CtaBand
        tone="inverse"
        title={cta.title ?? ''}
        body={cta.body ?? ''}
        action={{ href: cta.action.href ?? undefined, label: cta.action.label ?? '' }}
      />
    </>
  )
}
