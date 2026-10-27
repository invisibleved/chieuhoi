import { fieldLabel } from './fieldStyles'

// Nhóm lựa chọn một: <fieldset><legend> + radio thật (sr-only). Vòng focus vẽ trên thẻ qua has-[:focus-visible].
export function ChoiceGroup<V extends string>({
  name,
  legend,
  options,
  value,
  onChange,
}: {
  name: string
  legend: string
  options: { value: V; label: string }[]
  value: V
  onChange: (v: V) => void
}) {
  return (
    <fieldset className="m-0 flex min-w-0 flex-col gap-2.5 border-0 p-0">
      <legend className={`${fieldLabel} mb-2.5 p-0`}>{legend}</legend>
      <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
        {options.map((o) => (
          <label
            key={o.value}
            className="flex min-h-13 cursor-pointer items-center gap-3 border border-border-dashed px-[18px] text-[15px] has-[:checked]:border-2 has-[:checked]:border-text-primary has-[:checked]:bg-bg-raised has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-3 has-[:focus-visible]:outline-focus-light"
          >
            <input
              type="radio"
              name={name}
              value={o.value}
              checked={value === o.value}
              onChange={() => onChange(o.value)}
              className="peer sr-only"
            />
            <span aria-hidden="true" className="box-border size-4 flex-none rounded-full border-[1.5px] border-text-muted peer-checked:border-[5px] peer-checked:border-accent" />
            {o.label}
          </label>
        ))}
      </div>
    </fieldset>
  )
}
