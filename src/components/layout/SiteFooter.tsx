import Link from 'next/link'

import { getMode, getSiteSettings } from '@/lib/content'

import { CONNECT_HREF, NAV_ITEMS } from './nav'

const linkCls = 'text-text-on-dark no-underline hover:text-accent-on-dark'
const headCls = 'm-0 mb-1.5 text-[12px] tracking-[.2em] text-text-deep-muted'

export async function SiteFooter({ variant }: { variant: 'full' | 'compact' }) {
  const s = await getSiteSettings(await getMode())

  if (variant === 'compact') {
    return (
      <footer className="bg-bg-ink px-5 py-9 text-text-on-dark lg:px-20 lg:pt-14 lg:pb-10">
        <div className="flex flex-col gap-2 lg:gap-3">
          <p className="m-0 font-display text-[20px] tracking-[.28em] lg:text-[24px] lg:tracking-[.3em]">CHIẾU HỚI</p>
          {s.tagline ? (
            <p className="m-0 font-serif text-[14px] italic text-accent-on-dark lg:text-[16px]">{s.tagline}</p>
          ) : null}
        </div>
      </footer>
    )
  }

  const contact = [s.email, s.phone].filter(Boolean).join(' · ')
  const connectLinks = ['Góp tư liệu', 'Liên hệ', 'Cơ sở dệt', 'Nguồn và ghi công']

  return (
    <footer className="flex flex-col gap-7 bg-bg-ink px-5 pt-12 pb-8 text-text-on-dark lg:grid lg:grid-cols-12 lg:gap-x-6 lg:gap-y-16 lg:px-10 lg:pt-22 lg:pb-10 xl:px-20">
      <div className="flex flex-col gap-2.5 lg:col-span-4 lg:gap-[18px]">
        <p className="m-0 font-display text-[22px] tracking-[.28em] lg:text-[28px] lg:tracking-[.3em]">CHIẾU HỚI</p>
        {s.tagline ? (
          <p className="m-0 font-serif text-[15px] italic text-accent-on-dark lg:text-[17px]">{s.tagline}</p>
        ) : null}
        {s.description ? (
          <p className="m-0 hidden text-[14px] leading-[1.65] text-text-deep-muted lg:block">{s.description}</p>
        ) : null}
      </div>

      {/* Mobile: một lưới 2 cột gồm 6 mục khám phá và 2 liên kết kết nối */}
      <nav aria-label="Liên kết cuối trang" className="grid grid-cols-2 gap-x-4 text-[15px] lg:hidden">
        {[
          NAV_ITEMS[0],
          NAV_ITEMS[3],
          NAV_ITEMS[1],
          NAV_ITEMS[4],
          NAV_ITEMS[2],
          NAV_ITEMS[5],
        ].map((item) => (
          <Link key={item.href} href={item.href} className={`${linkCls} flex min-h-11 items-center`}>
            {item.label}
          </Link>
        ))}
        <Link href={CONNECT_HREF} className={`${linkCls} flex min-h-11 items-center`}>
          Góp tư liệu
        </Link>
        <Link href={CONNECT_HREF} className={`${linkCls} flex min-h-11 items-center`}>
          Nguồn và ghi công
        </Link>
      </nav>

      <nav aria-label="Khám phá" className="hidden flex-col gap-3 text-[14px] lg:col-span-2 lg:col-start-6 lg:flex">
        <p className={headCls}>KHÁM PHÁ</p>
        {NAV_ITEMS.map((item) => (
          <Link key={item.href} href={item.href} className={linkCls}>
            {item.label}
          </Link>
        ))}
      </nav>

      <nav aria-label="Kết nối" className="hidden flex-col gap-3 text-[14px] lg:col-span-2 lg:flex">
        <p className={headCls}>KẾT NỐI</p>
        {connectLinks.map((label) => (
          <Link key={label} href={CONNECT_HREF} className={linkCls}>
            {label}
          </Link>
        ))}
      </nav>

      <div className="flex flex-col gap-1.5 text-[14px] leading-[1.6] text-text-deep-muted lg:col-span-3 lg:gap-3">
        <p className={`${headCls} hidden lg:block`}>ĐỊA CHỈ</p>
        {s.address ? <p className="m-0">{s.address}</p> : null}
        {s.addressNote ? <p className="m-0 text-[13px]">{s.addressNote}</p> : null}
        {contact ? <p className="m-0">{contact}</p> : null}
      </div>

      <div className="flex flex-col gap-6 border-t border-[rgba(243,235,221,.18)] pt-5 text-[13px] leading-[1.55] text-text-deep-muted lg:col-span-12 lg:flex-row lg:justify-between lg:pt-7">
        {s.copyright ? <span>{s.copyright}</span> : <span />}
        <span className="hidden lg:inline">Tiếng Việt · English (sắp có)</span>
      </div>
    </footer>
  )
}
