type DocumentLabelProps = { code?: string | null; title: string; meta?: string | null; className?: string; size?: 'md' | 'sm' }

// Nhãn tư liệu: mã, tiêu đề, dòng chú thích (tuỳ chọn). className thêm vào cuối để nơi gọi ghi đè.
export function DocumentLabel({ code, title, meta, className, size = 'md' }: DocumentLabelProps) {
  const cls = ['border border-border-subtle bg-bg-raised px-4 py-3.5', className].filter(Boolean).join(' ')
  return (
    <div className={cls}>
      {code ? <div className="text-[12px] font-semibold tracking-label text-text-muted">{`TƯ LIỆU · ${code}`}</div> : null}
      {title ? <div className={size === 'sm' ? 'text-[13px] leading-[1.45]' : 'font-serif text-[16px]'}>{title}</div> : null}
      {meta ? <div className="text-[13px] leading-[1.45] text-text-secondary">{meta}</div> : null}
    </div>
  )
}

type ArchiveChipProps = { code: string; category: string }

// Chip lưu trữ: TL · mã · CHỦ ĐỀ (in hoa).
export function ArchiveChip({ code, category }: ArchiveChipProps) {
  return (
    <span className="inline-block bg-bg-deep px-3 py-2.5 text-[12px] tracking-[.12em] text-text-on-dark">
      {`TL · ${code} · ${category.toLocaleUpperCase('vi')}`}
    </span>
  )
}
