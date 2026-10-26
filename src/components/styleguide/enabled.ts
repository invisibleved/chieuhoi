// Trang /styleguide chỉ mở ở development và staging; thiếu hoặc viết sai biến thì đóng (404).
export function isStyleguideEnabled(env: string | undefined): boolean {
  return env === 'development' || env === 'staging'
}
