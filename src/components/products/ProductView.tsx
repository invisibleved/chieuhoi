import type { ProductPageView } from '@/lib/content'
import { PatternExplorer } from '@/components/content/PatternExplorer'
import { PreviewNotes } from '@/components/content/PreviewNotes'
import { ReadNext } from '@/components/content/ReadNext'
import { SourceList } from '@/components/content/Sources'
import { Tag } from '@/components/content/Tag'
import { Breadcrumb } from '@/components/layout/Breadcrumb'
import { BackLink } from '@/components/ui/BackLink'
import { Button } from '@/components/ui/Button'
import { DetailTitle } from '@/components/ui/DetailTitle'
import { Eyebrow } from '@/components/ui/Eyebrow'
import { FactList } from '@/components/ui/FactList'
import { LinkArrow } from '@/components/ui/LinkArrow'
import { hasVariant, VariantText } from '@/components/ui/VariantText'

const LIST_HREF = '/san-pham'
const CONTEXT_ID = 'boi-canh-h'

// Trang hiện vật (ProductDetail, ProductMobile). View model đã lọc theo quyền đăng và đồng ý của cơ sở dệt.
// Ô thông số trống: public bỏ dòng; preview hiện placeholder của copy (nhánh `preview`, null ở public).
export function ProductView({ page }: { page: ProductPageView }) {
  const { product: p, others, copy } = page
  const d = copy.detail
  const ph = d.preview?.placeholders ?? null
  const crumbs = [
    { label: copy.breadcrumb.home ?? '', href: '/' },
    { label: copy.breadcrumb.current ?? '', href: LIST_HREF },
    { label: p.name ?? '' },
  ]

  const rows = [
    { term: d.specs.material, detail: p.material },
    { term: d.specs.technique, detail: p.technique },
    { term: d.specs.pattern, detail: p.pattern },
    { term: d.specs.size, detail: p.size ?? ph?.size ?? null },
    { term: d.specs.maker, detail: p.maker?.name ?? (ph && hasVariant(ph.maker) ? <VariantText value={ph.maker} /> : null) },
    { term: d.specs.care, detail: p.care ?? ph?.care ?? null },
  ]
  const facts = rows.flatMap((r) => (r.term && r.detail ? [{ term: r.term, detail: r.detail }] : []))
  const connectHref = d.connect.href ?? ''
  const contact = {
    term: d.specs.contact ?? '',
    detail: p.contactLine,
    wide: true,
    action: <LinkArrow href={connectHref}>{d.connect.label.desktop}</LinkArrow>,
  }

  const heading = (
    <div className="flex flex-col gap-3 md:gap-[18px]">
      {p.eyebrow ? <Eyebrow as="p" tone="muted" uppercase>{p.eyebrow}</Eyebrow> : null}
      {p.name ? <DetailTitle size="product">{p.name}</DetailTitle> : null}
      {p.typeNote ? <div><Tag variant="filled">{p.typeNote}</Tag></div> : null}
      <PreviewNotes flags={p.flags} />
    </div>
  )

  return (
    <div>
      <div className="px-5 md:grid md:grid-cols-12 md:gap-x-6 md:px-20 md:pt-10">
        <div className="max-md:hidden md:col-span-12 md:mb-6">
          <Breadcrumb items={crumbs} />
        </div>
        <div className="mt-1 md:hidden">
          <BackLink href={LIST_HREF} label={d.back ?? ''} />
        </div>
        <PatternExplorer product={p} copy={d} aside={heading} />
      </div>

      {/* R5: dòng liên hệ (câu "Chưa có cơ sở..." và link kết nối) luôn có ở desktop nên section luôn render;
          cột tiêu đề + bối cảnh chỉ khi có `context`. */}
      <section aria-labelledby={p.context ? CONTEXT_ID : undefined} className="flex flex-col px-5 pt-2 md:grid md:grid-cols-12 md:gap-x-6 md:px-20 md:pt-28">
        {p.context ? (
          <div className="flex flex-col gap-4 md:col-span-4">
            <Eyebrow as="p" className="max-md:hidden">{d.context.eyebrow}</Eyebrow>
            <h2 id={CONTEXT_ID} className="m-0 font-display text-[40px] leading-[1.15] font-normal max-md:hidden">{d.context.title}</h2>
            <p className="m-0 text-[16px] leading-[1.7] text-text-secondary">{p.context}</p>
          </div>
        ) : null}
        <div className="mt-7 md:col-span-7 md:col-start-6 md:mt-0">
          <FactList columns={2} items={[...facts, contact]} className="max-md:hidden" />
          {facts.length > 0 ? <FactList layout="inline" items={facts} className="md:hidden" /> : null}
          <Button variant="outline" href={connectHref} className="mt-5 flex w-full md:hidden">
            {d.connect.label.mobile}
          </Button>
        </div>
      </section>

      <SourceList sources={p.sources} title={d.sourcesTitle ?? undefined} />

      <ReadNext
        items={others}
        eyebrow={d.others.eyebrow}
        title={d.others.title ?? undefined}
        action={{ href: LIST_HREF, label: d.others.all ?? '' }}
        imageClassName="h-[240px]"
        className={p.sources.length > 0 ? undefined : 'mt-10 md:mt-28'}
      />
    </div>
  )
}
