import Link from 'next/link'
import type { PeopleCopyView, PersonDetailView } from '@/lib/content'
import { Eyebrow } from '@/components/ui/Eyebrow'
import { StatusDot } from '@/components/ui/StatusDot'


type ConsentPanelProps = {
  consent: PersonDetailView['consent']
  copy: PeopleCopyView['detail']['consent']
}

const value = 'text-[16px] font-semibold text-text-primary'
const hint = 'text-[14px] leading-[1.55] text-text-secondary'
const cell = 'flex flex-col gap-2'
const action = 'inline-flex min-h-11 items-center text-[14px] font-medium text-accent hover:text-accent-hover hover:underline hover:decoration-2 hover:underline-offset-4'

// Khung trạng thái đồng ý: desktop ba cột (đồng ý, duyệt bài, yêu cầu chỉnh sửa), mobile một khối gọn.
// Mức đồng ý luôn có chữ đi kèm hình chấm.
export function ConsentPanel({ consent, copy }: ConsentPanelProps) {
  const stateLabel = copy.states[consent.state]
  const reviewed = (consent.reviewedBySubject ? copy.reviewed.yes : copy.reviewed.no) ?? ''
  const need = consent.missing.length > 0 ? copy.need?.replace('{list}', consent.missing.join(', ')) : null
  const summary = copy.mobileSummary[consent.reviewedBySubject ? 'yes' : 'no']?.replace('{state}', stateLabel ?? '')
  const href = copy.request.href ?? '/ket-noi'

  return (
    <section aria-label={copy.title ?? undefined} className="border border-border-soft p-5 md:p-8">
      <div className="hidden gap-8 md:grid md:grid-cols-3">
        <div className={cell}>
          <Eyebrow as="p" tone="muted" tracking="label">{copy.title}</Eyebrow>
          <span className={`flex items-center gap-2.5 ${value}`}>
            <StatusDot state={consent.state} />
            {stateLabel}
          </span>
          {need ? <span className={hint}>{need}</span> : null}
        </div>
        <div className={cell}>
          <Eyebrow as="p" tone="muted" tracking="label">{copy.reviewed.title}</Eyebrow>
          <span className={value}>{reviewed}</span>
          <span className={hint}>{copy.reviewed.hint}</span>
        </div>
        <div className={cell}>
          <Eyebrow as="p" tone="muted" tracking="label">{copy.request.title}</Eyebrow>
          <span className={value}>{copy.request.body}</span>
          {copy.request.action?.desktop ? <Link href={href} className={action}>{copy.request.action.desktop}</Link> : null}
        </div>
      </div>
      <div className="flex flex-col gap-3 md:hidden">
        <Eyebrow as="p" tone="muted" tracking="label">{copy.title}</Eyebrow>
        <span className={`flex items-center gap-2.5 ${value}`}>
          <StatusDot state={consent.state} />
          {summary}
        </span>
        {copy.request.action?.mobile ? <Link href={href} className={`${action} self-start text-[15px]`}>{copy.request.action.mobile}</Link> : null}
      </div>
    </section>
  )
}
