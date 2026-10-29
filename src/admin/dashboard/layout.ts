import { isReviewerUser } from '@/access/roles'
import type { DashboardConfig } from 'payload'

export const WIDGET_SLUGS = { tasks: 'viec-thuong-lam', pending: 'dang-cho-duyet', entities: 'tat-ca-muc' } as const

export const dashboardWidgets: DashboardConfig['widgets'] = [
  { slug: WIDGET_SLUGS.tasks, label: 'Việc thường làm', Component: '/admin/dashboard/TasksWidget#TasksWidget', minWidth: 'full' },
  { slug: WIDGET_SLUGS.pending, label: 'Đang chờ duyệt', Component: '/admin/dashboard/PendingWidget#PendingWidget', minWidth: 'full' },
  { slug: WIDGET_SLUGS.entities, label: 'Tất cả mục', Component: '/admin/dashboard/EntitiesWidget#EntitiesWidget', minWidth: 'full' },
]

/** Người duyệt: việc thường làm, chờ duyệt, tất cả mục. Biên tập viên: không có chờ duyệt. */
export const defaultLayout: NonNullable<DashboardConfig['defaultLayout']> = ({ req }) => [
  { widgetSlug: WIDGET_SLUGS.tasks, width: 'full' },
  ...(isReviewerUser(req.user) ? [{ widgetSlug: WIDGET_SLUGS.pending, width: 'full' as const }] : []),
  { widgetSlug: WIDGET_SLUGS.entities, width: 'full' },
]
