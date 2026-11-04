// Đợt 1 (spec 6.6): chép "Phần mở đầu trang" sang collection "Trang".
//   npm run migrate:pages             chép các trang chưa có (không ghi đè)
//   npm run migrate:pages -- --replace  xoá rồi chép lại cả 8 trang
//   npm run migrate:pages -- --check    so global với Trang, không ghi gì; có khác biệt thì thoát mã 1
// Lệnh npm kết thúc bằng `--` vì `payload run` nuốt mọi cờ đứng trước dấu này.
import { ROUTE_LABELS } from '../collections/pages/routeKeys'
import type { MigrateAction, MigrateReport, PageDiff } from '../seed/migratePages'

const ACTION_LABEL: Record<MigrateAction, string> = {
  'created-published': 'đã tạo và đăng',
  'created-published+draft': 'đã tạo và đăng, kèm bản nháp mới hơn',
  'created-draft': 'đã tạo bản nháp',
  skipped: 'bỏ qua (đã có)',
}

/** `codes`: mã nguồn (`sourceId`) theo id số; thiếu thì in id số. */
export function formatMigrateReport(r: MigrateReport, codes: ReadonlyMap<number, string> = new Map()): string {
  const lines = r.pages.map(
    (p) => `${ROUTE_LABELS[p.slug]}: ${ACTION_LABEL[p.action]}, ${p.rows} dòng, ${p.citations} chú thích`,
  )
  if (r.sourceIssues.length) {
    lines.push('', 'Câu trích nguồn chưa có trong Nguồn tham khảo của trang (cần sửa trong admin):')
    for (const issue of r.sourceIssues) {
      for (const m of issue.missing) {
        const ids = m.sourceIds.map((id) => codes.get(id) ?? String(id)).join(', ')
        lines.push(`- ${ROUTE_LABELS[issue.slug]}: ${m.where} (${ids})`)
      }
    }
  }
  if (r.dropped.length) {
    lines.push('', 'Dữ liệu không chép được sang Trang (cần xem lại trong admin):')
    for (const d of r.dropped) lines.push(`- ${ROUTE_LABELS[d.slug]}: ${d.what}`)
  }
  return lines.join('\n')
}

export function formatCheck(diffs: PageDiff[]): string {
  if (!diffs.length) return 'Không có khác biệt.'
  const reason = (d: PageDiff) =>
    d.reason === 'unknown-field' ? `trường lạ "${d.field}"` : d.reason === 'missing' ? 'thiếu' : 'khác'
  return diffs.map((d) => `${d.slug} (${d.state}): ${reason(d)}`).join('\n')
}

const FLAGS = ['--check', '--replace'] as const

/** Đọc cờ dòng lệnh. Cờ lạ hoặc dùng cả hai cờ thì báo lỗi, không làm gì. */
export function parseArgs(argv: string[]): { check: boolean; replace: boolean } {
  const unknown = argv.filter((a) => !(FLAGS as readonly string[]).includes(a))
  if (unknown.length) throw new Error(`Cờ không hợp lệ: ${unknown.join(' ')}. Chỉ dùng --check hoặc --replace.`)
  const check = argv.includes('--check')
  const replace = argv.includes('--replace')
  if (check && replace) throw new Error('Không dùng --check cùng --replace.')
  return { check, replace }
}

async function main() {
  const args = parseArgs(process.argv.slice(2))
  const { default: config } = await import('../payload.config')
  const { getPayload } = await import('payload')
  const { checkPages, migratePages } = await import('../seed/migratePages')
  const payload = await getPayload({ config: await config })

  let code = 0
  if (args.check) {
    const diffs = await checkPages(payload)
    console.log(formatCheck(diffs))
    if (diffs.length) code = 1
  } else {
    const report = await migratePages(payload, { replace: args.replace })
    const ids = [...new Set(report.sourceIssues.flatMap((i) => i.missing.flatMap((m) => m.sourceIds)))]
    const codes = new Map<number, string>()
    if (ids.length) {
      const { docs } = await payload.find({
        collection: 'sources', where: { id: { in: ids } }, depth: 0, pagination: false, overrideAccess: true,
      })
      for (const d of docs as { id: number; sourceId?: string | null }[]) if (d.sourceId) codes.set(d.id, d.sourceId)
    }
    console.log(formatMigrateReport(report, codes))
  }
  await payload.destroy()
  process.exit(code)
}

if (!process.env.VITEST) {
  await main().catch((err) => {
    console.error(err)
    process.exit(1)
  })
}
