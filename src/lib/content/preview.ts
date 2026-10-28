import type { Payload } from 'payload'

/** Ai đang đăng nhập admin (biên tập viên hoặc người duyệt) thì được bật xem trước. */
export function createPreview(payload: Payload) {
  return {
    async canPreview(headers: Headers): Promise<boolean> {
      try {
        const { user } = await payload.auth({ headers })
        return Boolean(user)
      } catch {
        return false
      }
    },
  }
}
