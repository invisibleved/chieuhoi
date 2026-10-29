import { isReviewerUser } from '@/access/roles'

export type VisibleEntities = { collections: string[]; globals: string[] }

/** Mục quản trị: ẩn khỏi menu và bảng điều khiển của biên tập viên (URL vẫn mở theo quyền). */
export const EDITOR_HIDDEN: VisibleEntities = {
  collections: ['users', 'sources'],
  globals: ['site-settings', 'page-intros'],
}

/** Người duyệt thấy tất cả; người khác (kể cả chưa đăng nhập) bị ẩn các mục quản trị. Không sửa đầu vào. */
export function visibleForUser<T extends VisibleEntities>(entities: T, user: unknown): T {
  if (isReviewerUser(user)) return entities
  return {
    ...entities,
    collections: entities.collections.filter((s) => !EDITOR_HIDDEN.collections.includes(s)),
    globals: entities.globals.filter((s) => !EDITOR_HIDDEN.globals.includes(s)),
  }
}
