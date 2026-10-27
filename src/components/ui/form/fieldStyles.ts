// Lớp dùng chung cho nhãn và ô nhập của form (artboard .lbl / .inp).
export const fieldLabel = 'text-[15px] font-medium'
export const fieldInput =
  'box-border w-full bg-bg-raised px-4 text-[16px] text-text-primary placeholder:text-text-muted focus:border-focus-light'
export const fieldBorder = (invalid: boolean) =>
  invalid ? 'border-2 border-accent' : 'border border-text-muted'
