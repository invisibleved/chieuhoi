// Luật kiểm tra của form Kết nối (R16): tên, cách liên lạc và ô đồng ý là bắt buộc.
// Chỉ cần không trống (cắt khoảng trắng hai đầu), không kiểm định dạng. Chỉ có lỗi sau khi đã bấm Gửi.
export type ConnectDraft = { name: string; contact: string; consent: boolean }
export type ConnectErrors = { name: boolean; contact: boolean; consent: boolean; count: number }

export function connectErrors(draft: ConnectDraft, tried: boolean): ConnectErrors {
  const name = tried && !draft.name.trim()
  const contact = tried && !draft.contact.trim()
  const consent = tried && !draft.consent
  return { name, contact, consent, count: Number(name) + Number(contact) + Number(consent) }
}
