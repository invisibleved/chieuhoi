import { FieldError } from './FieldError'

// Ô đồng ý: checkbox thật (sr-only) trong <label>; ô vuông 22px vẽ bằng span, focus hiện trên ô.
export function ConsentCheck({
  id,
  label,
  checked,
  onChange,
  error,
}: {
  id: string
  label: string
  checked: boolean
  onChange: (c: boolean) => void
  error?: string | null
}) {
  const errId = `${id}-error`
  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={id} className="flex min-h-11 cursor-pointer items-start gap-3.5 text-[15px] leading-[1.6]">
        <input
          id={id}
          type="checkbox"
          checked={checked}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? errId : undefined}
          onChange={(e) => onChange(e.target.checked)}
          className="peer sr-only"
        />
        <span
          aria-hidden="true"
          className={`mt-px flex size-[22px] flex-none items-center justify-center text-[14px] font-bold peer-focus-visible:outline-2 peer-focus-visible:outline-offset-3 peer-focus-visible:outline-focus-light ${
            checked
              ? 'border-2 border-bg-inverse bg-bg-inverse text-text-on-dark'
              : error
                ? 'border-2 border-accent bg-bg-raised'
                : 'border-[1.5px] border-text-muted bg-bg-raised'
          }`}
        >
          {checked ? '✓' : ''}
        </span>
        <span>{label}</span>
      </label>
      {error ? <FieldError id={errId}>{error}</FieldError> : null}
    </div>
  )
}
