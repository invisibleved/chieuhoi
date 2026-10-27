/** Chữ thường, bỏ dấu, khoảng trắng và ký tự lạ thành '-'. Util thuần, dùng chung cho collection và lib. */
export const slugify = (v: string) =>
  v
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/gi, 'd')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
