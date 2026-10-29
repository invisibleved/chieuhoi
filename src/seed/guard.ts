import path from 'path'

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

/**
 * Seeder hướng dẫn xoá rồi tạo lại ảnh tư liệu, nên file ảnh phải nằm ngoài thư mục media/ của DB dev.
 * MEDIA_DIR phải được đặt (npm run guide:seed đặt `.superpowers/guide-media`) và không nằm trong `<repo>/media`.
 */
export function assertGuideMediaDir(mediaDir: string | undefined, repoRoot: string): void {
  if (!mediaDir) {
    throw new Error('Dữ liệu mẫu hướng dẫn bị chặn: MEDIA_DIR chưa được đặt, ảnh sẽ rơi vào media/ của DB dev. Chạy bằng npm run guide:seed.')
  }
  const devMedia = path.resolve(repoRoot, 'media')
  const rel = path.relative(devMedia, path.resolve(repoRoot, mediaDir))
  const outside = rel === '..' || rel.startsWith(`..${path.sep}`) || path.isAbsolute(rel)
  if (!outside) {
    throw new Error('Dữ liệu mẫu hướng dẫn bị chặn: MEDIA_DIR không được là media/ của DB dev hoặc nằm trong đó.')
  }
}

/**
 * Seeder hướng dẫn xoá rồi tạo lại ảnh tư liệu. Khi có S3_BUCKET, plugin lưu trữ bật và việc xoá/tải lên
 * đi thẳng vào bucket thật, nên seeder chỉ chạy khi S3_BUCKET trống (npm run guide:* luôn đặt nó trống).
 * Thông báo không chứa tên bucket.
 */
export function assertGuideNoS3(env: Record<string, string | undefined>): void {
  if (env.S3_BUCKET) {
    throw new Error(
      'Dữ liệu mẫu hướng dẫn bị chặn: S3_BUCKET đang được đặt, seeder sẽ xoá và tải ảnh lên bucket thật. Chạy bằng npm run guide:seed.',
    )
  }
}
