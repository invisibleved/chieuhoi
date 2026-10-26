/** Seed chỉ được chạy ở môi trường dev/staging; thiếu APP_ENV cũng bị chặn. */
export function assertSeedAllowed(env: Record<string, string | undefined>): void {
  const appEnv = env.APP_ENV
  if (!appEnv) {
    throw new Error('Seed bị chặn: thiếu APP_ENV (chỉ chạy khi APP_ENV là development hoặc staging).')
  }
  if (appEnv === 'production') {
    throw new Error('Seed bị chặn: không bao giờ chạy seed ở production.')
  }
}
