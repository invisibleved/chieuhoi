import { defineConfig, devices } from '@playwright/test'

/**
 * Read environment variables from file.
 * https://github.com/motdotla/dotenv
 */
import 'dotenv/config'

/**
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig({
  testDir: './tests/e2e',
  globalSetup: './tests/e2e/global-setup.ts',
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  /* Retry on CI only */
  retries: process.env.CI ? 2 : 0,
  /* Opt out of parallel tests on CI. */
  workers: process.env.CI ? 1 : undefined,
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: 'html',
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
      testIgnore: /public-pages\.e2e|workflow\.e2e/,
      // Chạy sau workflow: story tạm của workflow nằm chung DB nên sẽ hiện trong bản xem trước ở cổng 3000 nếu chạy song song.
      dependencies: ['workflow'],
      use: { ...devices['Desktop Chrome'], channel: 'chromium' },
    },
    {
      // Trang chủ ở chế độ public (PREVIEW_ALL=false) trên máy chủ production riêng, cổng 3100.
      name: 'public',
      testMatch: /public-pages\.e2e/,
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
  ],
  webServer: [
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
