import React from 'react'
import './styles.css'

export const metadata = {
  description: 'Website di sản số nghề dệt chiếu làng Hới.',
  title: 'Chiếu Hới',
}

export default function RootLayout(props: { children: React.ReactNode }) {
  const { children } = props

  return (
    <html lang="vi">
      <body>
        <main>{children}</main>
      </body>
    </html>
  )
}
