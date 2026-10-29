import type { WidgetServerProps } from 'payload'

import { isReviewerUser } from '@/access/roles'

import { countPending } from './pending'

/** Số bài đang chờ duyệt theo từng mục. Chỉ người duyệt thấy. */
export async function PendingWidget({ req }: WidgetServerProps) {
  if (!isReviewerUser(req.user)) return null
  const rows = (await countPending(req.payload, req.user)).filter((r) => r.count > 0)
  return (
    <section className="ch-widget" aria-labelledby="ch-w-pending">
      <h2 id="ch-w-pending" className="ch-widget__title">Đang chờ duyệt</h2>
      {rows.length === 0 ? (
        <p className="ch-widget__empty">Không có bài nào chờ duyệt</p>
      ) : (
        <ul className="ch-pending">
          {rows.map((r) => (
            <li key={r.collection}>
              <a className="ch-pending__link" href={r.href}>{r.label} — {r.count}</a>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
