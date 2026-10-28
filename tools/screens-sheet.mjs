// Ghép ảnh thiết kế (trái) và ảnh chụp bản build (phải) để so bằng mắt (R14, không so pixel).
// Dùng: node tools/screens-sheet.mjs — đọc design/screens/{name}.jpg và test-results/screens/{name}.png,
// ghi .superpowers/screens/{name}-01.png, -02.png… (thư mục gitignore: ảnh có ảnh tham khảo, không commit).
import { existsSync, mkdirSync, readdirSync, rmSync } from 'node:fs'
import { basename, join } from 'node:path'
import sharp from 'sharp'

const DESIGN_DIR = 'design/screens'
const BUILD_DIR = 'test-results/screens'
const OUT_DIR = '.superpowers/screens'
const GAP = 24
const SEGMENT_MAX = 1800
const BG = { r: 255, g: 0, b: 255, alpha: 1 } // nền khe và phần thiếu: tím hồng để không lẫn với nền trang

/** Ảnh 1440 thu về 900px mỗi bên; ảnh mobile giữ 390px. */
const columnWidth = (sourceWidth) => (sourceWidth > 600 ? 900 : 390)

async function resized(file, width) {
  const { data, info } = await sharp(file)
    .resize({ width })
    .png()
    .toBuffer({ resolveWithObject: true })
  return { data, height: info.height }
}

async function sheet(name) {
  const designFile = join(DESIGN_DIR, `${name}.jpg`)
  const buildFile = join(BUILD_DIR, `${name}.png`)
  const { width: sourceWidth } = await sharp(designFile).metadata()
  const width = columnWidth(sourceWidth)
  const [design, build] = await Promise.all([resized(designFile, width), resized(buildFile, width)])
  const height = Math.max(design.height, build.height)
  const composite = await sharp({
    create: { width: width * 2 + GAP, height, channels: 4, background: BG },
  })
    .composite([
      { input: design.data, left: 0, top: 0 },
      { input: build.data, left: width + GAP, top: 0 },
    ])
    .png()
    .toBuffer()

  const segments = Math.ceil(height / SEGMENT_MAX)
  for (let i = 0; i < segments; i++) {
    const top = i * SEGMENT_MAX
    const out = join(OUT_DIR, `${name}-${String(i + 1).padStart(2, '0')}.png`)
    await sharp(composite)
      .extract({
        left: 0,
        top,
        width: width * 2 + GAP,
        height: Math.min(SEGMENT_MAX, height - top),
      })
      .toFile(out)
  }
  return { name, width, design: design.height, build: build.height, segments }
}

rmSync(OUT_DIR, { recursive: true, force: true })
mkdirSync(OUT_DIR, { recursive: true })

const names = readdirSync(DESIGN_DIR)
  .filter((f) => f.endsWith('.jpg'))
  .map((f) => basename(f, '.jpg'))
  .sort()

const missing = []
for (const name of names) {
  if (!existsSync(join(BUILD_DIR, `${name}.png`))) {
    missing.push(name)
    continue
  }
  const r = await sheet(name)
  console.log(
    `${r.name}: ${r.width}px/bên, thiết kế ${r.design}px, build ${r.build}px, ${r.segments} đoạn`,
  )
}
if (missing.length) {
  console.error(`Thiếu ảnh chụp build: ${missing.join(', ')}`)
  process.exitCode = 1
}
