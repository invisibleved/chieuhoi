import { defineConfig, devices } from '@playwright/test'

/**
 * Read environment variables from file.
 * https://github.com/motdotla/dotenv
 */
import 'dotenv/config'

/** Tên project chọn bằng --project (hai cách viết: `--project=x` và `--project x`). */
function selectedProjects(argv: string[]): string[] {
  return argv.flatMap((arg, i) => {
    if (arg.startsWith('--project=')) return [arg.slice('--project='.length)]
    if (arg === '--project' && argv[i + 1]) return [argv[i + 1]]
    return []
  })
}

// Chỉ chạy project staging (site đã deploy hoặc :3200 diễn tập): không cần máy chủ :3000/:3100 và phiên người duyệt seed.
const selected = selectedProjects(process.argv)
const stagingOnly = selected.length > 0 && selected.every((name) => name === 'staging')
// Ảnh hướng dẫn admin: `npm run guide:shots` tự build và chạy máy chủ :3300 trên DB test, không cần máy chủ nào khác.
const guideShots = process.env.GUIDE_SHOTS === '1'
const noLocalServers = stagingOnly || guideShots

// STAGING_AUTH dạng user:password, tách ở dấu ':' đầu tiên (mật khẩu được phép chứa ':').
const stagingAuth = process.env.STAGING_AUTH ?? ''
const authSplit = stagingAuth.indexOf(':')
const stagingCredentials =
  authSplit > 0 ? { username: stagingAuth.slice(0, authSplit), password: stagingAuth.slice(authSplit + 1) } : undefined

/**
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig({
  testDir: './tests/e2e',
  globalSetup: noLocalServers ? undefined : './tests/e2e/global-setup.ts',
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  /* Retry on CI only */
  retries: process.env.CI ? 2 : 0,
  /* Opt out of parallel tests on CI. */
  workers: process.env.CI ? 1 : undefined,
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  // guide:shots tự tắt máy chủ khi xong, nên không mở báo cáo HTML (nó chờ Ctrl+C khi có lỗi).
  reporter: guideShots ? 'list' : 'html',
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    /* Base URL to use in actions like `await page.goto('/')`. */
    baseURL: 'http://localhost:3000',

    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      testIgnore: /public-pages\.e2e|images\.e2e|workflow\.e2e|cls\.e2e|staging\.e2e|admin-guide-shots\.e2e/,
      // Chạy sau workflow: story tạm của workflow nằm chung DB nên sẽ hiện trong bản xem trước ở cổng 3000 nếu chạy song song.
      dependencies: ['workflow'],
      use: { ...devices['Desktop Chrome'], channel: 'chromium' },
    },
    {
      // Trang chủ ở chế độ public (PREVIEW_ALL=false) trên máy chủ production riêng, cổng 3100.
      name: 'public',
      testMatch: /public-pages\.e2e|images\.e2e/,
      use: { ...devices['Desktop Chrome'], channel: 'chromium', baseURL: 'http://localhost:3100' },
    },
    {
      // Quy trình hai vai trò trên bản build production (cổng 3100, có cache nên kiểm được revalidate).
      // Chạy sau project public để câu chuyện tạm không lọt vào các kiểm tra của trang public.
      name: 'workflow',
      testMatch: /workflow\.e2e/,
      dependencies: ['public'],
      use: { ...devices['Desktop Chrome'], channel: 'chromium', baseURL: 'http://localhost:3100' },
    },
    {
      // Quét a11y trên bản production public (cổng 3100). Bản xem trước của cùng file chạy trong project chromium.
      name: 'a11y-public',
      testMatch: /(a11y|cls)\.e2e/,
      dependencies: ['public'],
      use: { ...devices['Desktop Chrome'], channel: 'chromium', baseURL: 'http://localhost:3100' },
    },
    {
      // Kiểm site staging (deploy thật hoặc diễn tập :3200). Cả file tự bỏ qua khi thiếu STAGING_URL.
      // Chạy: STAGING_URL=... STAGING_AUTH=... npm run test:e2e -- --project=staging
      name: 'staging',
      testMatch: /staging\.e2e/,
      use: {
        ...devices['Desktop Chrome'],
        channel: 'chromium',
        baseURL: process.env.STAGING_URL,
        httpCredentials: stagingCredentials,
      },
    },
    // Ảnh chụp cho trang Hướng dẫn trong admin (DB test, dữ liệu mẫu). Chỉ có khi GUIDE_SHOTS=1: `npm run guide:shots`.
    ...(guideShots
      ? [
          {
            name: 'guide-shots',
            testMatch: /admin-guide-shots\.e2e/,
            use: { ...devices['Desktop Chrome'], channel: 'chromium', baseURL: 'http://localhost:3300' },
          },
        ]
      : []),
  ],
  webServer: noLocalServers ? undefined : [
    {
      command: 'npm run dev',
      reuseExistingServer: true,
      url: 'http://localhost:3000',
    },
    {
      command: 'npm run build && npm run start -- -p 3100',
      env: { PREVIEW_ALL: 'false' },
      reuseExistingServer: true,
      url: 'http://localhost:3100',
      timeout: 300_000,
    },
  ],
})
