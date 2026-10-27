import Link from 'next/link'
import type { ReadNextItem } from '@/lib/content'
import { Eyebrow } from '@/components/ui/Eyebrow'
import { LinkArrow } from '@/components/ui/LinkArrow'
import { ContentImage } from './ContentImage'

type ReadNextProps = {
  items: ReadNextItem[]
  eyebrow: string | null
  /** Có title: desktop hiện h2 40px (và `action` bên phải), mobile chỉ hiện eyebrow. */
  title?: string
  /** Nhãn có thể kèm mũi tên cuối (copy artboard); LinkArrow tự thêm mũi tên nên bị cắt. */
  action?: { href: string; label: string }
  /** Chiều cao ảnh thẻ (mặc định h-[260px]). */
  imageClassName?: string
  /** Thêm vào section (ví dụ khoảng cách phía trên): ẩn cùng khối khi mobile không còn mục nào. */
  className?: string
}

// "Đọc tiếp": desktop 3 thẻ ảnh; mobile danh sách hàng 56px. Mỗi mục là một liên kết.
// Mục `mobile: false` chỉ hiện từ md.
export function ReadNext({ items, eyebrow, title, action, imageClassName = 'h-[260px]', className }: ReadNextProps) {
  if (items.length === 0) return null
  const lastOnMobile = items.reduce((last, it, i) => (it.mobile !== false ? i : last), -1)
  const labelId = title || eyebrow ? 'read-next-h' : undefined
  // Không còn mục nào cho mobile thì ẩn cả khối (kể cả eyebrow) dưới md, không để dải trống.
  const mobileEmpty = lastOnMobile === -1 ? 'max-md:hidden ' : ''
  return (
    <section aria-labelledby={labelId} className={`${mobileEmpty}flex flex-col gap-1 bg-bg-secondary px-5 py-10 md:grid md:grid-cols-12 md:gap-x-6 md:gap-y-8 md:px-20 md:py-24${className ? ` ${className}` : ''}`}>
      {title ? (
        <div className="md:col-span-12 md:flex md:items-end md:justify-between">
          {eyebrow ? (
            <Eyebrow as="p" className="mb-2 md:hidden">
              {eyebrow}
            </Eyebrow>
          ) : null}
          <h2 id="read-next-h" className="m-0 font-display text-[40px] font-normal max-md:hidden">
            {title}
          </h2>
          {action ? (
            <LinkArrow href={action.href} className="max-md:hidden">
              {action.label.replace(/\s*→$/, '')}
            </LinkArrow>
          ) : null}
        </div>
      ) : eyebrow ? (
        <Eyebrow as="p" id="read-next-h" className="mb-2 md:col-span-12 md:mb-0">
          {eyebrow}
        </Eyebrow>
      ) : null}
      <ul className="contents">
        {items.map((it, i) => (
          <li key={it.href} className={`md:col-span-4 ${it.mobile === false ? 'max-md:hidden' : ''}`}>
            <Link
              href={it.href}
              className={`group flex min-h-14 items-center justify-between border-t border-border-strong font-display text-[21px] text-text-primary no-underline md:flex-col md:items-stretch md:justify-start md:gap-3 md:border-0 md:text-[26px] ${
                i === lastOnMobile ? 'max-md:border-b' : ''
              }`}
            >
              {it.image ? (
                <ContentImage image={{ ...it.image, alt: '' }} size="card" sizes="(min-width: 768px) 30vw, 0px" className={`block ${imageClassName} max-md:hidden`} wrapperClassName="max-md:hidden" />
              ) : null}
              <span className="font-sans text-[12px] font-semibold tracking-meta text-text-muted-alt max-md:hidden">{it.eyebrow}</span>
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
