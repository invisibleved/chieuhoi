// Nhập nội dung khởi đầu (dòng thời gian, công đoạn, sản phẩm, bài viết, phần mở đầu trang, cài đặt chung)
// vào CMS dưới dạng bản nháp. Chạy ở mọi APP_ENV. Không gắn ảnh, không ghi đè, không tự đăng.
import type { ContentReport } from '../seed/importContent'

const COLLECTION_LABEL: Record<ContentReport['created'][number]['collection'], string> = {
  'timeline-events': 'Dòng thời gian',
  'craft-steps': 'Công đoạn',
  products: 'Sản phẩm',
  stories: 'Bài viết',
}

const GLOBAL_LABEL: Record<ContentReport['globals'][number]['slug'], string> = {
  'page-intros': 'Phần mở đầu trang',
  'site-settings': 'Thông tin site',
}

export function formatContentReport(r: ContentReport): string {
  const savedGlobals = r.globals.filter((g) => g.saved === 'draft')
  if (!r.sourcesCreated.length && !r.created.length && !savedGlobals.length) return 'Không có gì để nhập.'

  const lines: string[] = []
  if (r.sourcesCreated.length) lines.push(`Đã tạo nguồn: ${r.sourcesCreated.join(', ')}`)
  if (r.sourcesSkipped.length) lines.push(`Đã có sẵn nguồn: ${r.sourcesSkipped.join(', ')}`)

  for (const [collection, label] of Object.entries(COLLECTION_LABEL)) {
    const created = r.created.filter((c) => c.collection === collection).length
    const existing = r.existing.filter((c) => c.collection === collection).length
    if (!created && !existing) continue
    const parts = [`tạo ${created}`]
    if (existing) parts.push(`đã có sẵn ${existing}`)
    lines.push(`${label}: ${parts.join(', ')}`)
  }

  for (const g of savedGlobals) {
    lines.push(`${GLOBAL_LABEL[g.slug]}: đã điền ${g.filled.join(', ')} và lưu bản nháp`)
    if (g.warning) lines.push(`Lưu ý: ${g.warning}`)
  }

  lines.push('Mọi mục đều là bản nháp. Người duyệt vào /admin, xem từng mục rồi đăng.')
  return lines.join('\n')
}

async function main() {
  const { default: config } = await import('../payload.config')
  const { getPayload } = await import('payload')
  const { importContent } = await import('../seed/importContent')
  const payload = await getPayload({ config: await config })
  const report = await importContent(payload)
  console.log(formatContentReport(report))
  await payload.destroy()
  process.exit(0)
}

if (!process.env.VITEST) {
  await main().catch((err) => {
    console.error(err)
    process.exit(1)
  })
}
