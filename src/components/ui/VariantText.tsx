import type { Variant } from '@/lib/content'

/** Có chữ ở ít nhất một bản (desktop hoặc mobile). */
export const hasVariant = (v: Variant | null | undefined): v is Variant => Boolean(v && (v.desktop || v.mobile))

// Chữ hai bản theo artboard: bản mobile null thì chỉ hiện từ md; hai bản giống nhau thì in một lần.
export function VariantText({ value }: { value: Variant }) {
  const { desktop, mobile } = value
  if (desktop && mobile && desktop === mobile) return <>{desktop}</>
  return (
    <>
      {desktop ? <span className="max-md:hidden">{desktop}</span> : null}
      {mobile ? <span className="md:hidden">{mobile}</span> : null}
    </>
  )
}
