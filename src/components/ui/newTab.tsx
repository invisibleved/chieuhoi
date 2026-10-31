// Liên kết ra trang ngoài (nguồn báo chí…): mở tab mới, không cho trang đích truy cập window.opener.
export const newTabProps = { target: '_blank', rel: 'noopener noreferrer' } as const

/** Báo cho trình đọc màn hình rằng liên kết mở tab mới; đặt bên trong thẻ <a>. */
export function NewTabHint() {
  return <span className="sr-only"> (mở tab mới)</span>
}
