// Mã tư liệu chỉ hiện khi dạng TL-<số>; trả về phần số.
export function docNumber(code: string | null | undefined): string | null {
  const m = code?.match(/^TL-(\d+)$/)
  return m ? m[1] : null
}
