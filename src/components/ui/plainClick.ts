import type { MouseEvent } from 'react'

/** Bấm trái thuần (không phím bổ trợ): chỉ khi đó mới chặn <a href> để xử lý bằng JS; còn lại để trình duyệt mở tab mới. */
export function isPlainClick(e: MouseEvent): boolean {
  return !e.defaultPrevented && e.button === 0 && !e.metaKey && !e.ctrlKey && !e.shiftKey && !e.altKey
}

/** onClick cho <a href>: bấm thuần thì chặn điều hướng và chạy `run`. */
export function interceptClick(run: () => void) {
  return (e: MouseEvent) => {
    if (!isPlainClick(e)) return
    e.preventDefault()
    run()
  }
}
