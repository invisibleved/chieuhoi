import { StatusDot } from './StatusDot'

// Băng ghi chú đầu trang: nền cói đậm, chấm nét đứt, chữ đậm rồi chữ thường.
export function NoteBanner({ strong, text }: { strong: string; text: string }) {
  return (
    <div role="note" className="flex items-start gap-2.5 bg-bg-secondary px-5 py-3 text-[13px] leading-[1.5] text-text-primary md:items-center md:gap-3.5 md:px-20 md:py-3.5 md:text-[14px]">
      <span className="mt-1 flex md:mt-0">
        <StatusDot state="none" size={10} />
      </span>
      <span>
        <strong className="font-semibold">{strong}</strong> {text}
      </span>
    </div>
  )
}
