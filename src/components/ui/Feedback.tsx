import type { ReactNode } from 'react'
import { Button } from './Button'
import { LinkArrow } from './LinkArrow'

// Skeleton: khối ảnh + các dòng chữ giả. Nơi dùng tự thêm chữ đọc màn hình "Đang tải".
const LINE_SPEC = [
  { h: 14, w: '40%' },
  { h: 24, w: '85%' },
  { h: 24, w: '60%' },
] as const

export function Skeleton({ lines = 3, imageHeight = 200 }: { lines?: number; imageHeight?: number }) {
  const bar = 'bg-[#E3D7C1] motion-safe:animate-weave-pulse' // artboard dùng #E3D7C1, chưa có token
  return (
    <div aria-hidden="true" className="flex flex-col gap-3">
      <div className={bar} style={{ height: imageHeight }} />
      {Array.from({ length: lines }, (_, i) => {
        const spec = LINE_SPEC[Math.min(i, LINE_SPEC.length - 1)]
        return <div key={i} className={bar} style={{ height: spec.h, width: spec.w }} />
      })}
    </div>
  )
}

export function EmptyState({
  title,
  body,
  action,
  size = 'md',
  tone = 'light',
}: {
  title: string
  /** Chữ thường hoặc <VariantText> khi có hai bản desktop/mobile. */
  body?: ReactNode
  action?: { href: string; label: string }
  /** lg: khung rộng của trang danh sách (đệm 56px, tiêu đề 32px từ md). */
  size?: 'md' | 'lg'
  /** dark: trên nền tối (Thư viện). */
  tone?: 'light' | 'dark'
}) {
  const lg = size === 'lg'
  const dark = tone === 'dark'
  return (
    <div className={`flex flex-col justify-center border border-dashed ${dark ? 'border-border-on-dark-dashed text-text-on-dark' : 'border-border-dashed'} p-6 ${lg ? 'items-start gap-3.5 md:max-w-[720px] md:p-14' : 'gap-3'}`}>
      <span className={`font-display ${lg ? 'text-[24px] md:text-[32px]' : 'text-[24px]'}`}>{title}</span>
      {body ? <span className={`leading-[1.6] ${dark ? 'text-text-on-dark-muted' : 'text-text-secondary'} ${lg ? 'text-[14px] md:text-[16px] md:leading-[1.65]' : 'text-[14px]'}`}>{body}</span> : null}
      {action ? <LinkArrow href={action.href} tone={tone}>{action.label}</LinkArrow> : null}
    </div>
  )
}

export function ErrorState({
  title,
  body,
  retry,
}: {
  title: string
  body: string
  retry?: { label: string; onClick?: () => void; href?: string }
}) {
  return (
    <div role="alert" className="flex flex-col gap-3 border-t-[3px] border-accent bg-bg-raised p-6">
      <span className="flex items-center gap-2.5 text-[17px] font-semibold text-accent">
        <svg
          aria-hidden="true"
          width="20"
          height="20"
          viewBox="0 0 20 20"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.6"
        >
          <circle cx="10" cy="10" r="9" />
          <path d="M10 5.5v5.5M10 13.5v1" />
        </svg>
        {title}
      </span>
      <span className="text-[14px] leading-[1.6] text-text-secondary">{body}</span>
      {retry?.href ? (
        <LinkArrow href={retry.href}>{retry.label}</LinkArrow>
      ) : retry?.onClick ? (
        <button
          type="button"
          onClick={retry.onClick}
          className="inline-flex min-h-11 items-center self-start text-[15px] font-medium text-accent hover:text-accent-hover hover:underline hover:decoration-2 hover:underline-offset-4"
        >
          {retry.label}
        </button>
      ) : null}
    </div>
  )
}

export function SuccessState({
  title,
  body,
  action,
  size = 'md',
  headingLevel = 'span',
}: {
  title: string
  body: string
  /** Nút viền sáng dưới chữ (ví dụ "Góp thêm một ký ức"). */
  action?: { label: string; onClick: () => void }
  /** lg: màn hình thành công của form (đệm 48px, tiêu đề 40px). */
  size?: 'md' | 'lg'
  headingLevel?: 'h3' | 'span'
}) {
  const lg = size === 'lg'
  const Title = headingLevel
  const check = (
    <svg
      aria-hidden="true"
      width={lg ? 40 : 22}
      height={lg ? 40 : 22}
      viewBox="0 0 22 22"
      fill="none"
      className="text-accent-on-dark"
      stroke="currentColor"
      strokeWidth={lg ? 1.6 : 1.8}
    >
      <path d="M4 11.5l4.5 4.5L18 6" />
    </svg>
  )
  return (
    <div role="status" className={`bg-bg-inverse flex flex-col text-text-on-dark ${lg ? 'gap-[18px] p-12' : 'gap-3 p-6'}`}>
      {lg ? check : null}
      <Title className={`m-0 flex items-center gap-2.5 font-display font-normal ${lg ? 'text-[40px] leading-[1.15]' : 'text-[24px]'}`}>
        {lg ? null : check}
        {title}
      </Title>
      <span className={`block text-text-on-dark-muted ${lg ? 'text-[17px] leading-[1.7]' : 'text-[14px] leading-[1.6]'}`}>{body}</span>
      {action ? (
        <Button variant="outline-dark" onClick={action.onClick} className="self-start">
          {action.label}
        </Button>
      ) : null}
    </div>
  )
}
