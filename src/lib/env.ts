/** Đọc và kiểm biến môi trường. File này không import gì để dùng được ở mọi tầng. */
export type AppEnv = 'development' | 'staging' | 'production'
type Env = Record<string, string | undefined>

const APP_ENVS: readonly string[] = ['development', 'staging', 'production']
const MIN_SECRET_LENGTH = 32
const REQUIRED_DEPLOY = ['DATABASE_URI', 'S3_BUCKET', 'S3_ENDPOINT', 'S3_ACCESS_KEY_ID', 'S3_SECRET_ACCESS_KEY'] as const

/** Giá trị APP_ENV hợp lệ, ném lỗi khi thiếu hoặc sai. */
export function readAppEnv(env: Env): AppEnv {
  const value = env.APP_ENV
  if (value && APP_ENVS.includes(value)) return value as AppEnv
  throw new Error(`APP_ENV phải là development, staging hoặc production (hiện là "${value ?? ''}").`)
}

function validSiteUrl(value: string | undefined): boolean {
  if (!value) return false
  try {
    const { protocol } = new URL(value)
    return protocol === 'http:' || protocol === 'https:'
  } catch {
    return false
  }
}

/** STAGING_AUTH hợp lệ khi có dạng user:password, user (trước dấu ':' đầu tiên) và password đều không rỗng. */
export function isValidStagingAuth(value: string | undefined): boolean {
  const v = value ?? ''
  const i = v.indexOf(':')
  return i > 0 && i < v.length - 1
}

/** Dừng build khi cấu hình deploy thiếu hoặc nguy hiểm. Thông báo không chứa giá trị bí mật. */
export function assertDeployEnv(env: Env): void {
  let appEnv: AppEnv
  try {
    appEnv = readAppEnv(env)
  } catch (e) {
    throw new Error(`Cấu hình môi trường chưa đúng:\n- ${(e as Error).message}`)
  }
  if (appEnv === 'development') {
    if (env.VERCEL) throw new Error('Cấu hình môi trường chưa đúng:\n- APP_ENV=development không dùng để deploy; đặt staging hoặc production.')
    return
  }

  const errors: string[] = []
  if (!validSiteUrl(env.SITE_URL)) errors.push('SITE_URL phải là địa chỉ http(s) đầy đủ.')
  if ((env.PAYLOAD_SECRET ?? '').length < MIN_SECRET_LENGTH) errors.push(`PAYLOAD_SECRET phải dài ít nhất ${MIN_SECRET_LENGTH} ký tự.`)
  for (const key of REQUIRED_DEPLOY) {
    if (!env[key]) errors.push(`${key} chưa được đặt.`)
  }
  if (appEnv === 'staging' && !isValidStagingAuth(env.STAGING_AUTH)) errors.push('STAGING_AUTH phải có dạng user:password.')
  if (appEnv === 'production' && env.PREVIEW_ALL === 'true') errors.push('PREVIEW_ALL không được là true ở production.')
  if (env.ALLOW_FIRST_USER === 'true') errors.push('ALLOW_FIRST_USER không được là true ở staging hoặc production.')

  if (errors.length) throw new Error(`Cấu hình môi trường chưa đúng:\n${errors.map((e) => `- ${e}`).join('\n')}`)
}

/** APP_ENV là staging; giá trị sai hoặc thiếu thì false. */
export function isStaging(env: Env): boolean {
  try {
    return readAppEnv(env) === 'staging'
  } catch {
    return false
  }
}

/** Chỉ production cho công cụ tìm kiếm lập chỉ mục. */
export function isIndexable(env: Env): boolean {
  try {
    return readAppEnv(env) === 'production'
  } catch {
    return false
  }
}

/** Địa chỉ gốc của site, mặc định http://localhost:3000. */
export function siteUrl(env: Env): URL {
  return new URL(env.SITE_URL || 'http://localhost:3000')
}
