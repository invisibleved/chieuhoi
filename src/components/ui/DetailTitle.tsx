import type { ReactNode } from 'react'

type Size = 'story' | 'person'

const titles = {
  // StoryDetail: 40px mobile, 72px từ md.
  story: 'md:text-[72px]',
  // PersonDetail: 40px mobile, 64px từ md.
  person: 'md:text-[64px]',
} as const

const ledes = {
  // Sapo bài đọc: 18px / 22px, rộng tối đa 720px.
  story: 'text-[18px] leading-[1.6] md:max-w-[720px] md:text-[22px]',
  // Câu giới thiệu chân dung: 17px / 19px.
  person: 'mt-1.5 text-[17px] leading-[1.65] md:mt-0 md:text-[19px]',
} as const

// h1 của trang chi tiết (bài đọc, chân dung): font display, 40px mobile.
// `as="p"` chỉ dùng để trình bày mẫu (styleguide) mà không thêm h1 vào trang.
export function DetailTitle({ size, as: Tag = 'h1', children }: { size: Size; as?: 'h1' | 'p'; children: ReactNode }) {
  return <Tag className={`m-0 font-display text-[40px] leading-[1.12] font-normal md:leading-[1.1] ${titles[size]}`}>{children}</Tag>
}

// Đoạn mở đầu nghiêng (sapo, câu giới thiệu) dưới h1 trang chi tiết.
export function Lede({ size, children }: { size: Size; children: ReactNode }) {
  return <p className={`m-0 font-serif text-text-secondary italic ${ledes[size]}`}>{children}</p>
}
