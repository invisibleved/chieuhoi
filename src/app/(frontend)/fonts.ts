import { Be_Vietnam_Pro, Noto_Serif, Noto_Serif_Display } from 'next/font/google'


// Chỉ dùng cho cỡ chữ từ 20px trở lên (tiêu đề).
export const fontDisplay = Noto_Serif_Display({
  display: 'swap',
  subsets: ['vietnamese', 'latin'],
  variable: '--font-noto-serif-display',
})

export const fontSerif = Noto_Serif({
  display: 'swap',
  style: ['normal', 'italic'],
  subsets: ['vietnamese', 'latin'],
  variable: '--font-noto-serif',
  weight: '400',
})

export const fontSans = Be_Vietnam_Pro({
  display: 'swap',
  subsets: ['vietnamese', 'latin'],
  variable: '--font-be-vietnam-pro',
  weight: ['400', '500', '600'],
})
