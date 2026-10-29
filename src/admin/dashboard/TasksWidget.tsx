import type { WidgetServerProps } from 'payload'

import { tasksFor } from './tasks'

/** Lưới nút việc thường làm. Chỉ hiện nút mà người dùng có quyền tạo. */
export function TasksWidget({ permissions }: WidgetServerProps) {
  const tasks = tasksFor(permissions)
  return (
    <section className="ch-widget" aria-labelledby="ch-w-tasks">
      <h2 id="ch-w-tasks" className="ch-widget__title">Việc thường làm</h2>
      <ul className="ch-tasks">
        {tasks.map((t) => (
          <li key={t.href}>
            <a className={`ch-tasks__btn${t.collection ? '' : ' ch-tasks__btn--outline'}`} href={t.href}>{t.label}</a>
          </li>
        ))}
      </ul>
    </section>
  )
}
