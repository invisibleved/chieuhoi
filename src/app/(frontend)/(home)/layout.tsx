import React from 'react'
import { SiteFooter } from '@/components/layout/SiteFooter'
import { getMode, getSiteSettings } from '@/lib/content'

// Trang chủ dùng footer đầy đủ. Chọn theo nhóm route, không theo đường dẫn: khi Vercel dựng lại trang chủ (ISR), đường dẫn ở server là /index.
export default async function HomeLayout(props: { children: React.ReactNode }) {
  const settings = await getSiteSettings(await getMode())
  return (
    <>
      <main className="flex-1">{props.children}</main>
      <SiteFooter variant="full" settings={settings} />
    </>
  )
}
