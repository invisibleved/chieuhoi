import Link from 'next/link'

import { getMode, getSiteSettings } from '@/lib/content'

import { DesktopNav } from './DesktopNav'
import { LanguageSwitch } from './LanguageSwitch'
import { MobileMenu } from './MobileMenu'
import { CONNECT_HREF } from './nav'

export async function SiteHeader() {
  const settings = await getSiteSettings(await getMode())
  return (
    <header className="flex items-center justify-between border-b border-border-subtle bg-bg-primary py-2 pr-2 pl-5 lg:px-6 lg:py-[26px] xl:px-20">
      <Link
        href="/"
        className="inline-flex min-h-11 items-center font-display text-[18px] tracking-[.28em] text-text-primary no-underline whitespace-nowrap lg:text-[18px] lg:tracking-[.28em] xl:text-[22px] xl:tracking-[.3em]"
      >
        CHIẾU HỚI
      </Link>
      <DesktopNav />
      <div className="hidden items-center gap-4 text-[13px] lg:flex xl:gap-6">
        <LanguageSwitch />
        <Link
          href={CONNECT_HREF}
          className="inline-flex min-h-11 items-center whitespace-nowrap border-b border-border-strong text-text-primary no-underline hover:text-accent"
        >
          Kết nối
        </Link>
      </div>
      <MobileMenu tagline={settings.tagline} />
    </header>
  )
}
