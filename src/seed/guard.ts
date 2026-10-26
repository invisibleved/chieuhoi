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
