import { ErrorIcon } from '../ErrorIcon'

// Dòng lỗi dưới ô nhập: biểu tượng tròn 14px + lời nhắn (không chỉ dựa vào màu).
export function FieldError({ id, children }: { id: string; children: string }) {
  return (
    <span id={id} className="flex items-center gap-1.5 text-[13px] font-medium text-accent">
      <ErrorIcon size={14} className="flex-none" />
      {children}
    </span>
  )
}
