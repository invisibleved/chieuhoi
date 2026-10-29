/** Seed chỉ được chạy ở dev/staging (R22: danh sách cho phép, mọi giá trị khác đều bị chặn). */
const ALLOWED = new Set(['development', 'staging'])

export function assertSeedAllowed(env: Record<string, string | undefined>): void {
  const appEnv = env.APP_ENV
  if (!appEnv || !ALLOWED.has(appEnv)) {
    throw new Error(
      `Seed bị chặn: APP_ENV phải là development hoặc staging (hiện là "${appEnv ?? ''}").`,
    )
  }
}

/** Tên DB duy nhất mà dữ liệu mẫu của hướng dẫn được ghi vào. */
export const GUIDE_DATABASE = 'chieuhoi_test'

/**
 * Dữ liệu mẫu cho ảnh hướng dẫn xoá sạch DB trước khi tạo, nên chỉ được chạy trên DB test.
 * Chỉ tin tên DB trong đường dẫn URI (không tin user, host hay query). Thông báo không chứa URI.
 */
export function assertGuideDatabase(uri: string | undefined): void {
  let dbName = ''
  try {
    dbName = decodeURIComponent(new URL(uri ?? '').pathname.replace(/^\//, ''))
  } catch {
    dbName = ''
  }
  if (dbName !== GUIDE_DATABASE) {
    throw new Error(
      `Dữ liệu mẫu hướng dẫn bị chặn: DATABASE_URI phải trỏ vào DB ${GUIDE_DATABASE} (hiện là "${dbName}"). ` +
        'Seeder này xoá sạch DB trước khi tạo dữ liệu mẫu, nên không bao giờ chạy trên DB dev.',
    )
  }
}
