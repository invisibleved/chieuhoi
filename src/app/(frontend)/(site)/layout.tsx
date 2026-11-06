import React from 'react'
import { SiteFooter } from '@/components/layout/SiteFooter'
import { getMode, getSiteSettings } from '@/lib/content'

// Mọi trang khác trang chủ dùng footer gọn.
export default async function SiteLayout(props: { children: React.ReactNode }) {
  const settings = await getSiteSettings(await getMode())
  return (
    <>
      <main className="flex-1">{props.children}</main>
      <SiteFooter variant="compact" settings={settings} />
    </>
  )
}
