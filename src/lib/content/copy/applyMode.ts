// Áp luật hiển thị cho chữ cố định của trang (copy): cùng luật showText với nội dung CMS.
import type { Mode, Variant } from '../types'
import { showText } from '../visibility'

/**
 * Kiểu của copy sau khi áp mode:
 * chuỗi thành `string | null`; cặp `{desktop, mobile}` thành Variant; nhánh `preview` thành `… | null`;
 * mảng `cite` (sourceId) giữ nguyên.
 */
export type ApplyMode<T> = T extends string
  ? string | null
  : T extends null
    ? null
    : T extends { desktop: string | null; mobile: string | null }
      ? Variant
      : T extends readonly (infer U)[]
        ? ApplyMode<U>[]
        : T extends object
          ? {
              [K in keyof T]: K extends 'preview'
                ? ApplyMode<T[K]> | null
                : K extends 'cite'
                  ? T[K]
                  : ApplyMode<T[K]>
            }
          : T

type Options = {
  /** sourceId nhìn thấy được. Có thì `cite` được lọc theo tập này, và ở public mục có nguồn mà hết nguồn bị ẩn hoàn toàn. */
  cites?: ReadonlySet<string>
}

const nullTexts = (v: unknown, key?: string): unknown => {
  if (key === 'cite') return v
  if (typeof v === 'string') return null
  if (Array.isArray(v)) return v.map((x) => nullTexts(x))
  if (v && typeof v === 'object') return Object.fromEntries(Object.entries(v).map(([k, x]) => [k, nullTexts(x, k)]))
  return v
}

function walk(value: unknown, mode: Mode, opts: Options): unknown {
  if (typeof value === 'string') return showText(value, mode)
  if (Array.isArray(value)) return value.map((v) => walk(v, mode, opts))
  if (value && typeof value === 'object') {
    const out: Record<string, unknown> = {}
    for (const [k, v] of Object.entries(value)) {
      if (k === 'preview' && mode === 'public') out[k] = null
      else if (k === 'cite') out[k] = opts.cites && Array.isArray(v) ? v.filter((id) => opts.cites!.has(id)) : v
      else out[k] = walk(v, mode, opts)
    }
    // Câu có nguồn mà mọi nguồn đều bị ẩn: không để câu đứng một mình không có chú thích.
    const cite = (value as { cite?: unknown }).cite
    if (mode === 'public' && opts.cites && Array.isArray(cite) && cite.length > 0 && (out.cite as unknown[]).length === 0) {
      return nullTexts(out)
    }
    return out
  }
  return value
}

export function applyMode<T>(copy: T, mode: Mode, opts: Options = {}): ApplyMode<T> {
  return walk(copy, mode, opts) as ApplyMode<T>
}
