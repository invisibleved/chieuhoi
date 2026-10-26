import React from 'react'
import './globals.css'
import { fontDisplay, fontSans, fontSerif } from './fonts'

export const metadata = {
  description: 'Website di sản số nghề dệt chiếu làng Hới.',
  title: 'Chiếu Hới',
}

export default function RootLayout(props: { children: React.ReactNode }) {
  const { children } = props

  return (
    <html lang="vi" className={`${fontDisplay.variable} ${fontSerif.variable} ${fontSans.variable}`}>
      <body className="bg-bg-primary text-text-primary font-sans">
        <main>{children}</main>
      </body>
    </html>
  )
}
