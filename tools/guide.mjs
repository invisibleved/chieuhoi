// Dữ liệu mẫu và ảnh chụp cho trang Hướng dẫn, luôn trên DB test (DATABASE_URI_TEST).
//   node --import tsx/esm tools/guide.mjs seed   → payload run src/seed/guide.ts
//   node --import tsx/esm tools/guide.mjs shots  → next build + next start :3300 + playwright --project=guide-shots
// npm/cross-env không đọc .env nên script này tự đọc rồi thay DATABASE_URI bằng DB test trước khi gọi lệnh con.
import 'dotenv/config'
import { spawn } from 'node:child_process'
import path from 'node:path'
import { assertGuideDatabase } from '../src/seed/guard.ts'

const PORT = 3300
const root = process.cwd()

const env = {
  ...process.env,
  DATABASE_URI: process.env.DATABASE_URI_TEST,
  // Admin không phụ thuộc chế độ xem trước; development để Payload tự đồng bộ schema của DB test.
  APP_ENV: 'development',
  // Ảnh mẫu nằm riêng, không lẫn với media/ của DB dev.
  MEDIA_DIR: path.resolve(root, '.superpowers/guide-media'),
  // Không bao giờ dùng bucket thật: S3_BUCKET trống thì plugin lưu trữ tắt (seeder và máy chủ :3300).
  S3_BUCKET: '',
  NODE_OPTIONS: '--no-deprecation',
}

function run(cmd, args, extra = {}) {
  return new Promise((resolve, reject) => {
    const child = spawn(cmd, args, { stdio: 'inherit', env: { ...env, ...extra } })
    child.on('error', reject)
    child.on('exit', (code) => (code === 0 ? resolve() : reject(new Error(`${cmd} ${args.join(' ')} thoát mã ${code}`))))
  })
}

async function isUp(url) {
  try {
    return (await fetch(url)).ok
  } catch {
    return false
  }
}

async function waitUp(url, ms) {
  const end = Date.now() + ms
  while (Date.now() < end) {
    if (await isUp(url)) return
    await new Promise((r) => setTimeout(r, 1000))
  }
  throw new Error(`Máy chủ ${url} không lên sau ${ms / 1000}s.`)
}

async function shots() {
  const login = `http://localhost:${PORT}/admin/login`
  if (await isUp(login)) throw new Error(`Cổng ${PORT} đang có máy chủ khác chạy; tắt nó trước.`)
  await run('npx', ['next', 'build'], { NODE_OPTIONS: '--no-deprecation --max-old-space-size=8000' })
  const server = spawn('npx', ['next', 'start', '-p', String(PORT)], { stdio: 'inherit', env, detached: true })
  const stop = () => {
    try {
      process.kill(-server.pid, 'SIGTERM')
    } catch {
      // đã tắt
    }
  }
  process.on('SIGINT', () => {
    stop()
    process.exit(130)
  })
  try {
    await waitUp(login, 120_000)
    await run('npx', ['playwright', 'test', '--config=playwright.config.ts', '--project=guide-shots'], {
      GUIDE_SHOTS: '1',
      NODE_OPTIONS: '--no-deprecation --import=tsx/esm',
    })
  } finally {
    stop()
  }
}

const command = process.argv[2]
try {
  assertGuideDatabase(env.DATABASE_URI)
  if (command === 'seed') await run('npx', ['payload', 'run', 'src/seed/guide.ts'])
  else if (command === 'shots') await shots()
  else throw new Error('Dùng: tools/guide.mjs seed | shots')
} catch (e) {
  console.error(e instanceof Error ? e.message : e)
  process.exit(1)
}
