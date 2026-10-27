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

function walk(value: unknown, mode: Mode, key?: string): unknown {
  if (key === 'cite') return value
  if (typeof value === 'string') return showText(value, mode)
  if (Array.isArray(value)) return value.map((v) => walk(v, mode))
  if (value && typeof value === 'object') {
    const out: Record<string, unknown> = {}
    for (const [k, v] of Object.entries(value)) {
      out[k] = k === 'preview' && mode === 'public' ? null : walk(v, mode, k)
    }
    return out
  }
  return value
}

export function applyMode<T>(copy: T, mode: Mode): ApplyMode<T> {
  return walk(copy, mode) as ApplyMode<T>
}
