type DocumentLabelProps = { code: string; title: string; meta: string }

// Nhãn tư liệu: mã, tiêu đề, dòng chú thích.
export function DocumentLabel({ code, title, meta }: DocumentLabelProps) {
  return (
    <div className="border border-border-subtle bg-bg-raised px-4 py-3.5">
      <div className="text-[12px] font-semibold tracking-[.2em] text-text-muted">{`TƯ LIỆU · ${code}`}</div>
      <div className="font-serif text-[16px]">{title}</div>
      <div className="text-[13px] leading-[1.45] text-text-secondary">{meta}</div>
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
