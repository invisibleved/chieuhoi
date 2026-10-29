/** Tên file ảnh mẫu do src/seed/guide.ts sinh: TL-MAU-01.png và các cỡ TL-MAU-01-480x320.webp… */
const SAMPLE_FILE = /^TL-MAU-\d+(?:-\d+x\d+)?\.(?:png|webp)$/
const UPLOAD_PATH = '/api/archive-assets/file/'

function decode(src: string): string {
  let out = src
  // Giải mã nhiều lớp (vd. /_next/image?url=%2Fapi%2F… hoặc mã hoá hai lần).
  for (let i = 0; i < 3; i++) {
    try {
      const next = decodeURIComponent(out)
      if (next === out) break
      out = next
    } catch {
      break
    }
  }
  return out
}

/**
 * Địa chỉ ảnh không được xuất hiện trên ảnh hướng dẫn: ảnh tham khảo (kể cả dạng mã hoá), hoặc file
 * tư liệu ảnh không phải ảnh mẫu. Trả về danh sách địa chỉ vi phạm (rỗng = an toàn).
 */
export function forbiddenImageSources(sources: string[]): string[] {
  return sources.filter((raw) => {
    const src = decode(raw)
    if (/\/images\/reference/i.test(src) || /%2Fimages%2Freference/i.test(raw)) return true
    const at = src.indexOf(UPLOAD_PATH)
    if (at === -1) return false
    const file = src.slice(at + UPLOAD_PATH.length).split(/[?#&]/)[0]
    return !SAMPLE_FILE.test(file)
  })
}

/** Tách srcset thành các địa chỉ. */
export function srcsetUrls(srcset: string): string[] {
  return srcset
    .split(',')
    .map((part) => part.trim().split(/\s+/)[0])
    .filter(Boolean)
}
