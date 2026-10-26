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
