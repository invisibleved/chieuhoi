import { Button } from './Button'

type CtaBandProps = {
  title: string
  body: string
  /** Không có href thì nút không điều hướng (như trước khi dùng chung). */
  action: { href?: string; label: string }
  tone: 'inverse' | 'secondary' | 'primary'
  className?: string
}

const tones = {
  inverse: { band: 'bg-bg-inverse text-text-on-dark', body: 'text-text-on-dark-muted', button: 'outline-dark' },
  secondary: { band: 'bg-bg-secondary text-text-primary', body: 'text-text-secondary', button: 'primary' },
  primary: { band: 'bg-bg-primary text-text-primary', body: 'text-text-secondary', button: 'primary' },
} as const

// Khối kêu gọi cuối trang: chữ cột 1–7, nút cột 9–12 căn phải. Mặc định chỉ có từ md (mobile không vẽ khối này).
export function CtaBand({ title, body, action, tone, className }: CtaBandProps) {
  const t = tones[tone]
  return (
    <section className={['grid grid-cols-12 items-center gap-x-6 px-20 py-[88px] max-md:hidden', t.band, className].filter(Boolean).join(' ')}>
      <div className="col-span-7 flex flex-col gap-3.5">
        <h2 className="m-0 font-display text-[44px] leading-[1.15] font-normal">{title}</h2>
        <p className={`m-0 text-[17px] leading-[1.7] ${t.body}`}>{body}</p>
      </div>
      <div className="col-span-4 col-start-9 flex justify-end">
        <Button href={action.href} variant={t.button} size="lg">
          {action.label}
        </Button>
      </div>
    </section>
  )
}
