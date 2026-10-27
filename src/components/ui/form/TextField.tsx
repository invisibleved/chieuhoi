import { FieldError } from './FieldError'
import { fieldBorder, fieldInput, fieldLabel } from './fieldStyles'

// Ô nhập một dòng: <label for> thật; có lỗi thì aria-invalid + aria-describedby tới dòng lỗi.
export function TextField({
  id,
  label,
  value,
  onChange,
  error,
  autoComplete,
  type = 'text',
}: {
  id: string
  label: string
  value: string
  onChange: (v: string) => void
  error?: string | null
  autoComplete?: string
  type?: 'text' | 'email'
}) {
  const errId = `${id}-error`
  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={id} className={fieldLabel}>
        {label}
      </label>
      <input
        id={id}
        type={type}
        value={value}
        autoComplete={autoComplete}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? errId : undefined}
        onChange={(e) => onChange(e.target.value)}
        className={`${fieldInput} min-h-13 ${fieldBorder(!!error)}`}
      />
      {error ? <FieldError id={errId}>{error}</FieldError> : null}
    </div>
  )
}
