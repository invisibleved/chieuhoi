/** VI đang chọn; EN chưa có (phase sau) nên bị vô hiệu. */
export function LanguageSwitch({ className = '' }: { className?: string }) {
  return (
    <div role="group" aria-label="Ngôn ngữ" className={`flex border border-border-strong ${className}`}>
      <button
        type="button"
        aria-pressed="true"
        className="inline-flex h-11 min-w-11 items-center justify-center bg-bg-ink text-[13px] font-semibold text-text-on-dark"
      >
        VI
      </button>
      <button
        type="button"
        aria-pressed="false"
        disabled
        title="Sắp có"
        className="inline-flex h-11 min-w-11 items-center justify-center text-[13px] text-text-muted"
      >
        EN
      </button>
    </div>
  )
}
