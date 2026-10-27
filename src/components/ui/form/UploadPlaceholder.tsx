import { fieldLabel } from './fieldStyles'

// Khung tải tệp tĩnh (chưa có hệ thống tải lên): không có <input type="file">.
export function UploadPlaceholder({ label, title, hint }: { label: string; title: string; hint: string }) {
  return (
    <div className="flex flex-col gap-2">
      <span className={fieldLabel}>{label}</span>
      <div className="flex flex-col items-center gap-1.5 border border-dashed border-border-dashed bg-bg-raised p-7 text-center">
        <span className="text-[15px] font-medium">{title}</span>
        <span className="text-[13px] text-text-muted-alt">{hint}</span>
      </div>
    </div>
  )
}
