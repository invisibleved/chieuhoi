import { fieldInput, fieldLabel } from './fieldStyles'

// Ô nhập nhiều dòng, có gợi ý (nối qua aria-describedby).
export function TextArea({
  id,
  label,
  value,
  onChange,
  hint,
  rows = 5,
}: {
  id: string
  label: string
  value: string
  onChange: (v: string) => void
  hint?: string
  rows?: number
}) {
  const hintId = `${id}-hint`
  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={id} className={fieldLabel}>
        {label}
      </label>
      <textarea
        id={id}
        rows={rows}
        value={value}
        aria-describedby={hint ? hintId : undefined}
        onChange={(e) => onChange(e.target.value)}
        className={`${fieldInput} min-h-[150px] resize-y border border-text-muted py-3.5`}
      />
      {hint ? (
        <span id={hintId} className="text-[13px] text-text-muted-alt">
          {hint}
        </span>
      ) : null}
    </div>
  )
}
