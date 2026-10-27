// Vạch chia sợi cói (.threads). Chỉ trang trí nên ẩn khỏi trình đọc màn hình.
// md: 12px (mặc định); lg: 14px (trang chủ, theo artboard).
const sizes = { md: 'h-3', lg: 'h-3.5' } as const

export function ThreadsDivider({ size = 'md', className }: { size?: keyof typeof sizes; className?: string }) {
  return <div aria-hidden="true" className={['threads', sizes[size], className].filter(Boolean).join(' ')} />
}
