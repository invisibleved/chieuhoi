import type { Access, FieldAccess } from 'payload'

export type Role = 'editor' | 'reviewer'

/** True khi user đã đăng nhập và có vai trò người duyệt. */
export function isReviewerUser(user: unknown): boolean {
  return Boolean(user) && (user as { role?: unknown }).role === 'reviewer'
}

export const isLoggedIn: Access = ({ req }) => Boolean(req.user)

export const isReviewer: Access = ({ req }) => isReviewerUser(req.user)

/** Dùng cho access.create và access.update của trường kiểm soát. */
export const reviewerOnlyField: FieldAccess = ({ req }) => isReviewerUser(req.user)

/** Ghi chú hiển thị dưới mọi trường chỉ người duyệt sửa được. */
export const CONTROL_FIELD_NOTE = 'Chỉ người duyệt sửa được.'

/** `admin` cho trường kiểm soát: nối ghi chú vào mô tả sẵn có (nếu có). */
export function controlFieldAdmin(description?: string): { description: string } {
  return { description: description ? `${description} ${CONTROL_FIELD_NOTE}` : CONTROL_FIELD_NOTE }
}

/** Nhóm trong menu admin (R7). */
export const ADMIN_GROUPS = {
  content: 'Nội dung',
  archive: 'Tư liệu',
  pages: 'Trang',
  admin: 'Quản trị',
} as const
