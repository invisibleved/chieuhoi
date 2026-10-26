import Link from 'next/link'

type ExhibitCardProps = { index: number; name: string; href?: string; active?: boolean }

// Thẻ "HIỆN VẬT 0n". Có href thì là link; active đánh dấu bằng vạch trên màu nhấn.
export function ExhibitCard({ index, name, href, active = false }: ExhibitCardProps) {
  const cls = `group block pt-4 text-text-primary no-underline ${active ? 'border-t-[3px] border-accent' : 'border-t border-border-strong'}`
  const body = (
    <>
      <span className="block text-[12px] font-semibold tracking-[.2em] text-text-muted">HIỆN VẬT {String(index).padStart(2, '0')}</span>
      <span className={`mt-2 block font-display text-[24px] leading-[1.2] transition-colors duration-[var(--dur-micro)] ease-[var(--ease-weave)] ${active ? 'text-accent' : 'group-hover:text-accent'}`}>{name}</span>
    </>
  )
  return href ? (
    <Link href={href} className={cls} aria-current={active ? 'true' : undefined}>{body}</Link>
  ) : (
    <div className={cls}>{body}</div>
  )
}
