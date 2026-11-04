// Nhập dữ kiện trang (Làng Hới, Nghề dệt chiếu) vào CMS dưới dạng bản nháp. Chạy ở mọi APP_ENV.
// Chỉ điền nhóm còn trống, không ghi đè, không tự đăng: người duyệt đăng trong /admin.
import { pageLabel, type ImportReport } from '../seed/pageFacts'

export function formatReport(r: ImportReport): string {
  const lines: string[] = []
  if (r.sourcesCreated.length) lines.push(`Đã tạo nguồn: ${r.sourcesCreated.join(', ')}`)
  if (r.sourcesSkipped.length) lines.push(`Đã có sẵn nguồn: ${r.sourcesSkipped.join(', ')}`)
  for (const p of r.pages) {
    const how = p.saved === 'published' ? 'đăng' : 'lưu bản nháp'
    lines.push(`${pageLabel(p.slug)}: đã điền ${p.filled.join(', ')} và ${how}`)
    if (p.warning) lines.push(`Lưu ý: ${p.warning}`)
  }
  for (const s of r.skipped) lines.push(`Bỏ qua nhóm ${s.group}: ${s.reason}`)
  if (!r.pages.length) lines.push('Không có gì để nhập.')
  else if (r.pages.some((p) => p.saved === 'draft')) lines.push('Người duyệt vào /admin › Trang để xem và đăng.')
  return lines.join('\n')
}

async function main() {
  const { default: config } = await import('../payload.config')
  const { getPayload } = await import('payload')
  const { importPageFacts } = await import('../seed/pageFacts')
  const payload = await getPayload({ config: await config })
  const report = await importPageFacts(payload, { publish: 'never' })
  console.log(formatReport(report))
  await payload.destroy()
  process.exit(0)
}

if (!process.env.VITEST) {
  await main().catch((err) => {
    console.error(err)
    process.exit(1)
  })
}
