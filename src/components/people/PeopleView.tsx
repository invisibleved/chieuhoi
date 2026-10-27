'use client'

import type { PeoplePageView, PersonView, Variant } from '@/lib/content'
import { PageHeader } from '@/components/content/PageHeader'
import { PortraitCard } from '@/components/content/PortraitCard'
import { Button } from '@/components/ui/Button'
import { Callout } from '@/components/ui/Callout'
import { EmptyState } from '@/components/ui/Feedback'
import { FilterableList } from '@/components/ui/FilterableList'
import { ThreadsDivider } from '@/components/ui/ThreadsDivider'
import { useVariantString } from '@/components/ui/useVariant'
import { VariantText } from '@/components/ui/VariantText'

const fill = (template: string, values: Record<string, string | number>) =>
  template.replace(/\{(\w+)\}/g, (_, k: string) => String(values[k] ?? ''))

// Thẻ thứ 2 và thứ 4 của mỗi hàng desktop (4 cột) lùi xuống, theo artboard.
const offset = (index: number) => (index % 4 === 1 || index % 4 === 3 ? 'md:mt-12' : undefined)

// Trang danh sách Con người: đầu trang kèm khung nguyên tắc, lưới chân dung có lọc, khối mời.
export function PeopleView({ page }: { page: PeoplePageView }) {
  const { copy, intro, people, filters } = page
  const emptyBody = useVariantString(copy.empty.body)
  const crumbs = [
    { label: copy.breadcrumb.home ?? '', href: '/' },
    { label: copy.breadcrumb.current ?? '' },
  ]
  const { principles, invite } = copy

  const status = (matches: PersonView[]): Variant => {
    const n = fill(copy.count.people ?? '', { n: matches.length })
    const allPending = matches.length > 0 && matches.every((p) => p.consentPending)
    return allPending
      ? {
          desktop: n + (copy.count.allPending.desktop ?? ''),
          mobile: n + (copy.count.allPending.mobile ?? ''),
        }
      : { desktop: n, mobile: n }
  }

  return (
    <>
      <PageHeader
        crumbs={crumbs}
        intro={intro}
        titleClassName="text-[38px] md:text-[76px]"
        asideSpan="narrow"
        asideClassName="md:self-end"
        aside={
          <Callout tone="dark" title={principles.title ?? ''} label={principles.label ?? undefined}>
            <div className="flex flex-col gap-3.5">
              <ul className="m-0 flex list-disc flex-col gap-1.5 pl-[18px] max-md:hidden">
                {(principles.items.desktop ?? []).map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
              <p className="m-0 md:hidden">{(principles.items.mobile ?? []).join(' ')}</p>
              {principles.preview?.note ? (
                <p className="m-0 text-[13px] leading-[1.55] text-text-on-dark-muted">
                  <VariantText value={principles.preview.note} />
                </p>
              ) : null}
            </div>
          </Callout>
        }
      />

      <ThreadsDivider className="mx-5 md:mx-20" />

      <section className="px-5 pt-8 pb-12 md:px-20 md:pt-14 md:pb-[120px]">
        <FilterableList
          items={people}
          getKey={(p) => p.slug}
          getCategory={(p) => p.categoryKey}
          filters={filters}
          filterLabel={copy.filter.label}
          status={status}
          empty={
            <EmptyState
              size="lg"
              title={copy.empty.title ?? ''}
              body={emptyBody}
              action={
                copy.empty.action.href && copy.empty.action.label
                  ? { href: copy.empty.action.href, label: copy.empty.action.label }
                  : undefined
              }
            />
          }
          className="flex flex-col gap-4 md:gap-10"
          toolbarClassName="flex flex-col gap-4 md:flex-row md:flex-wrap md:items-center md:justify-between md:gap-6"
          listClassName="grid grid-cols-2 gap-x-3 gap-y-6 md:grid-cols-4 md:gap-x-6 md:gap-y-14"
          renderItem={(p, i) => (
            <PortraitCard
              person={p}
              href={`/con-nguoi/${p.slug}`}
              size="fluid"
              detail="note"
              cta={copy.card.cta ?? undefined}
              className={offset(i)}
            />
          )}
        />
      </section>

      <section className="grid grid-cols-12 items-center gap-x-6 bg-bg-secondary px-20 py-[88px] max-md:hidden">
        <div className="col-span-7 flex flex-col gap-3.5">
          <h2 className="m-0 font-display text-[44px] leading-[1.15] font-normal">{invite.title}</h2>
          <p className="m-0 text-[17px] leading-[1.7] text-text-secondary">{invite.body}</p>
        </div>
        <div className="col-span-4 col-start-9 flex justify-end">
          <Button href={invite.action.href ?? undefined}>{invite.action.label}</Button>
        </div>
      </section>
    </>
  )
}
