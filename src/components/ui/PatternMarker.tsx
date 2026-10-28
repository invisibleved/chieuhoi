import type { Ref } from 'react'

type PatternMarkerProps = {
  n: number
  /** Toạ độ theo % của khung ảnh. */
  x: number
  y: number
  pressed: boolean
  /** Ẩn khỏi mắt, con trỏ và bàn phím (khi ảnh đang phóng quanh một điểm khác). */
  hidden?: boolean
  label: string
  /** Để nơi gọi trả focus về điểm này. */
  buttonRef?: Ref<HTMLButtonElement>
  onClick: () => void
}

// Điểm đánh dấu tròn 44px đặt trên ảnh theo %. Đang chọn: nền nhấn và vòng sáng.
export function PatternMarker({ n, x, y, pressed, hidden = false, label, buttonRef, onClick }: PatternMarkerProps) {
  return (
    <button
      ref={buttonRef}
      type="button"
      aria-pressed={pressed}
      aria-label={label}
      tabIndex={hidden ? -1 : undefined}
      aria-hidden={hidden ? true : undefined}
      onClick={onClick}
      style={{ left: `${x}%`, top: `${y}%` }}
      className={`absolute z-10 size-11 -translate-x-1/2 -translate-y-1/2 cursor-pointer rounded-full border-2 font-sans text-[15px] font-semibold focus-visible:outline-focus-dark motion-safe:transition-[transform,opacity] motion-safe:hover:scale-[1.08] ${
        pressed ? 'border-bg-primary bg-accent text-bg-primary ring-[6px] ring-accent-halo' : 'border-accent bg-bg-primary text-accent'
      } ${hidden ? 'pointer-events-none opacity-0' : ''}`}
    >
      {n}
    </button>
  )
}
