import Link from 'next/link'
import type { CraftPageView } from '@/lib/content'
import { Eyebrow } from '@/components/ui/Eyebrow'
import { ContentImage } from './ContentImage'

type ReadNextProps = { items: CraftPageView['readNext']; eyebrow: string | null }

// "Đọc tiếp": desktop 3 thẻ ảnh; mobile danh sách hàng 56px. Mỗi mục là một liên kết.
export function ReadNext({ items, eyebrow }: ReadNextProps) {
  if (items.length === 0) return null
  return (
    <section aria-labelledby={eyebrow ? 'read-next-h' : undefined} className="flex flex-col gap-1 bg-bg-secondary px-5 py-10 md:grid md:grid-cols-12 md:gap-x-6 md:gap-y-8 md:px-20 md:py-24">
      {eyebrow ? (
        <Eyebrow as="p" id="read-next-h" className="mb-2 md:col-span-12 md:mb-0">
          {eyebrow}
        </Eyebrow>
      ) : null}
      <ul className="contents">
        {items.map((it, i) => (
          <li key={it.href} className="md:col-span-4">
            <Link
              href={it.href}
              className={`group flex min-h-14 items-center justify-between border-t border-border-strong font-display text-[21px] text-text-primary no-underline md:flex-col md:items-stretch md:justify-start md:gap-3 md:border-0 md:text-[26px] ${
                i === items.length - 1 ? 'max-md:border-b' : ''
              }`}
            >
              {it.image ? (
                <ContentImage image={it.image} size="card" sizes="(min-width: 768px) 30vw, 0px" className="block h-[260px] max-md:hidden" wrapperClassName="max-md:hidden" />
              ) : null}
              <span className="font-sans text-[12px] font-semibold tracking-[.16em] text-text-muted-alt max-md:hidden">{it.eyebrow}</span>
              <span className="group-hover:text-accent">{it.title}</span>
              <span className="font-sans text-[15px] font-medium text-accent max-md:hidden">{it.cta}</span>
              <span aria-hidden="true" className="font-sans text-accent md:hidden">→</span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  )
}
