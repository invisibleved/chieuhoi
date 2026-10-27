import { forwardRef } from 'react'
import { ErrorIcon } from '../ErrorIcon'

// Khung tổng hợp lỗi đầu form: role="alert", focus được bằng ref (tabIndex -1). Không render khi count = 0.
// text.count chứa "{n}" được thay bằng số lỗi.
export const ErrorSummary = forwardRef<HTMLDivElement, { count: number; text: { count: string; rest: string } }>(
  function ErrorSummary({ count, text }, ref) {
    if (count <= 0) return null
    return (
      <div
        ref={ref}
        role="alert"
        tabIndex={-1}
        className="flex items-start gap-3 border-t-[3px] border-accent bg-bg-raised px-[18px] py-4 text-[15px] leading-[1.55]"
      >
        <ErrorIcon className="mt-0.5 flex-none text-accent" />
        <span>
          <strong className="font-semibold text-accent">{text.count.replace('{n}', String(count))}</strong> {text.rest}
        </span>
      </div>
    )
  },
)
