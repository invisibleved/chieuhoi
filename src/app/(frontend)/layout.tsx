import React from 'react'
import './globals.css'
import { FooterSlot } from '@/components/layout/FooterSlot'
import { SiteFooter } from '@/components/layout/SiteFooter'
import { SiteHeader } from '@/components/layout/SiteHeader'
import { fontDisplay, fontSans, fontSerif } from './fonts'

export const metadata = {
  description: 'Website di sản số nghề dệt chiếu làng Hới.',
  title: 'Chiếu Hới',
}

export default function RootLayout(props: { children: React.ReactNode }) {
  const { children } = props

  return (
    <html lang="vi" className={`${fontDisplay.variable} ${fontSerif.variable} ${fontSans.variable}`}>
      <body className="flex min-h-screen flex-col bg-bg-primary text-text-primary font-sans">
        <SiteHeader />
        <main className="flex-1">{children}</main>
        <FooterSlot full={<SiteFooter variant="full" />} compact={<SiteFooter variant="compact" />} />
      </body>
    </html>
  )
}
