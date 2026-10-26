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
}: {
  title: string
  body: string
  action?: { href: string; label: string }
}) {
  return (
    <div className="flex flex-col justify-center gap-3 border border-dashed border-border-dashed p-6">
      <span className="font-display text-[24px]">{title}</span>
      <span className="text-[14px] leading-[1.6] text-text-secondary">{body}</span>
      {action ? <LinkArrow href={action.href}>{action.label}</LinkArrow> : null}
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

export function SuccessState({ title, body }: { title: string; body: string }) {
  return (
    <div role="status" className="bg-bg-inverse flex flex-col gap-3 p-6 text-text-on-dark">
      <span className="flex items-center gap-2.5 font-display text-[24px]">
        <svg
          aria-hidden="true"
          width="22"
          height="22"
          viewBox="0 0 22 22"
          fill="none"
          className="text-accent-on-dark"
          stroke="currentColor"
          strokeWidth="1.8"
        >
          <path d="M4 11.5l4.5 4.5L18 6" />
        </svg>
        {title}
      </span>
      <span className="text-[14px] leading-[1.6] text-text-on-dark-muted">{body}</span>
    </div>
  )
}
