import { DefaultNav } from '@payloadcms/next/rsc'
import type { ComponentProps } from 'react'

import { visibleForUser } from './visibility'

/** Menu bên trái: bọc DefaultNav, chỉ lọc danh sách mục theo vai trò (không dùng admin.hidden, vì nó làm hỏng hộp "+" của quan hệ). */
export function Nav(props: ComponentProps<typeof DefaultNav>) {
  return <DefaultNav {...props} visibleEntities={props.visibleEntities && visibleForUser(props.visibleEntities, props.user)} />
}
