// Chuẩn hoá chuỗi để tìm kiếm không phân biệt dấu và hoa thường. Util thuần, dùng được ở client.
export function normalizeSearch(s: string): string {
  return s
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/đ/gi, 'd')
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim()
}
