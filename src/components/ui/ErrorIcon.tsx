// Biểu tượng lỗi: vòng tròn + dấu chấm than, dùng currentColor. Dùng ở ErrorState, ErrorSummary, dòng lỗi của ô form.
export function ErrorIcon({ size = 20, className }: { size?: number; className?: string }) {
  return (
    <svg
      aria-hidden="true"
      width={size}
      height={size}
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      className={className}
    >
      <circle cx="10" cy="10" r="9" />
      <path d="M10 5.5v5.5M10 13.5v1" />
    </svg>
  )
}
