import type { ArchivePageView } from '@/lib/content'
import { ArchiveGallery } from '@/components/content/ArchiveGallery'
import { PageHeader } from '@/components/content/PageHeader'
import { CtaBand } from '@/components/ui/CtaBand'
import { Eyebrow } from '@/components/ui/Eyebrow'
import { ThreadsDivider } from '@/components/ui/ThreadsDivider'

type ArchiveViewProps = { page: ArchivePageView; initialCode: string | null }

// Trang Thư viện: đầu trang nền tối kèm hai số liệu, lưới có lọc và hộp xem ảnh, khối mời góp tư liệu (nền sáng).
export function ArchiveView({ page, initialCode }: ArchiveViewProps) {
  const { copy, intro, stats } = page
  const crumbs = [
    { label: copy.breadcrumb.home ?? '', href: '/' },
    { label: copy.breadcrumb.current ?? '' },
  ]
  const figures = [
    { label: copy.stats.total, value: stats.total },
    { label: copy.stats.verified, value: stats.verified },
  ]
  return (
    <>
      <div className="bg-bg-deep text-text-on-dark">
        <PageHeader
          tone="dark"
          crumbs={crumbs}
          intro={intro}
          hideCrumbsOnMobile
          titleClassName="text-[38px] md:text-[76px]"
          asideSpan="narrow"
          asideClassName="max-md:hidden md:self-end"
          aside={
            <dl className="m-0 grid grid-cols-2 gap-x-6">
              {figures.map((f) => (
                <div key={f.label} className="border-t border-border-on-dark-strong py-3.5">
                  <dt>
                    <Eyebrow tone="muted-dark" tracking="label">
                      {f.label}
                    </Eyebrow>
                  </dt>
                  <dd className="m-0 mt-1.5 font-display text-[36px]">{f.value}</dd>
                </div>
              ))}
            </dl>
          }
        />
        <ThreadsDivider className="mx-5 max-md:hidden md:mx-20" />
        <section className="px-5 pt-0 pb-12 md:px-20 md:pt-12 md:pb-24">
          <ArchiveGallery page={page} initialCode={initialCode} />
        </section>
      </div>
      <CtaBand
        tone="primary"
        title={copy.cta.title ?? ''}
        body={copy.cta.body ?? ''}
        action={{ href: copy.cta.action.href ?? undefined, label: copy.cta.action.label ?? '' }}
      />
    </>
  )
}
