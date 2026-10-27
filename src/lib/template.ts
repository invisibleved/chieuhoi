// Ghép mẫu chữ có chỗ trống `{khoá}` (copy như "{n} bài", "Cần: đồng ý đăng {list}"). Util thuần, dùng được ở client.
// Khoá không có giá trị (thiếu, null, undefined) thành chuỗi rỗng.
export function fillTemplate(template: string, values: Record<string, string | number | null | undefined>): string {
  return template.replace(/\{(\w+)\}/g, (_, key: string) => {
    const v = values[key]
    return v === null || v === undefined ? '' : String(v)
  })
}
