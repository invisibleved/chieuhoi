import { ALL_PAGE_ONLY_FIELDS, GROUP_PAGE_FIELDS, LIST_PAGE_FIELDS, PAGE_ONLY_FIELDS } from './fields'
import type { RouteKey } from './routeKeys'

/** Giữ dạng đối tượng của nhóm, xoá mọi giá trị con: mảng thành `[]`, còn lại thành `null` (`undefined` giữ nguyên). */
const clearGroup = (value: unknown): Record<string, unknown> => {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return {}
  return Object.fromEntries(
    Object.entries(value as Record<string, unknown>).map(([k, v]) => [
      k,
      v === undefined ? undefined : Array.isArray(v) ? [] : v && typeof v === 'object' ? clearGroup(v) : null,
    ]),
  )
}

/**
 * Bản sao của `data`, trong đó mọi trường riêng không thuộc trang `slug` bị xoá giá trị:
 * trường danh sách thành `[]`, trường nhóm thành đối tượng có mọi giá trị con bị xoá
 * (Payload không nhận nhóm `null`), còn lại thành `null`. Trường chung giữ nguyên.
 */
export function stripForeignFields(slug: RouteKey, data: Record<string, unknown>): Record<string, unknown> {
  const own = new Set(PAGE_ONLY_FIELDS[slug])
  const out: Record<string, unknown> = { ...data }
  for (const name of ALL_PAGE_ONLY_FIELDS) {
    if (own.has(name)) continue
    out[name] = LIST_PAGE_FIELDS.has(name) ? [] : GROUP_PAGE_FIELDS.has(name) ? clearGroup(data[name]) : null
  }
  return out
}
