import Link from 'next/link'

type ExhibitCardProps = {
  index: number
  name: string
  href?: string
  active?: boolean
  /** Dòng mô tả dưới tên; với `large` chỉ hiện từ md trở lên. */
  note?: string | null
  /** Tên 28px (22px ở mobile). */
  large?: boolean
  /** Thẻ đặt trên nền bg-secondary: nhãn dùng text-muted-alt để đạt AA. */
  onSecondary?: boolean
}

// Thẻ "HIỆN VẬT 0n". Có href thì là link; active đánh dấu bằng vạch trên màu nhấn.
export function ExhibitCard({ index, name, href, active = false, note, large = false, onSecondary = false }: ExhibitCardProps) {
  const cls = `group block pt-4 text-text-primary no-underline ${active ? 'border-t-[3px] border-accent' : 'border-t border-border-strong'}`
  const body = (
    <>
      <span className={`block text-[12px] font-semibold tracking-[.2em] ${onSecondary ? 'text-text-muted-alt' : 'text-text-muted'}`}>HIỆN VẬT {String(index).padStart(2, '0')}</span>
      <span className={`mt-2 block font-display ${large ? 'text-[22px] md:text-[28px]' : 'text-[24px]'} leading-[1.2] transition-colors duration-[var(--dur-micro)] ease-[var(--ease-weave)] ${active ? 'text-accent' : 'group-hover:text-accent'}`}>{name}</span>
      {note ? <span className={`mt-2.5 text-[14px] leading-[1.55] text-text-secondary ${large ? 'hidden md:block' : 'block'}`}>{note}</span> : null}
    </>
  )
  return href ? (
    <Link href={href} className={cls} aria-current={active ? 'true' : undefined}>{body}</Link>
  ) : (
    <div className={cls}>{body}</div>
  )
}
