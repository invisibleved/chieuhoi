// Vạch chia sợi cói (.threads). Chỉ trang trí nên ẩn khỏi trình đọc màn hình.
export function ThreadsDivider({ className }: { className?: string }) {
  return <div aria-hidden="true" className={['threads', className].filter(Boolean).join(' ')} />
}
