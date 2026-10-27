import type { ConsentState } from '@/lib/content'

type StatusDotProps = { state: ConsentState; size?: 8 | 10 | 12 }

// Trạng thái bằng hình, không chỉ bằng màu: nét đứt (chưa có), vòng liền (một phần), chấm đặc (đã có).
// Điểm đánh dấu tròn duy nhất ngoài hoa văn được phép bo góc.
const looks = {
  none: 'border-2 border-dashed border-text-secondary',
  partial: 'border-2 border-solid border-text-secondary',
  full: 'border-2 border-solid border-text-secondary bg-text-secondary',
} as const

export function StatusDot({ state, size = 12 }: StatusDotProps) {
  return <span aria-hidden="true" className={`inline-block flex-none rounded-full ${looks[state]}`} style={{ width: size, height: size }} />
}
