export type TaskLink = { label: string; href: string; collection?: string }

/** Việc thường làm trên trang đầu của admin. Thứ tự cố định; Task hướng dẫn và ảnh chụp dùng lại danh sách này. */
export const TASKS: TaskLink[] = [
  { label: 'Tải ảnh lên', href: '/admin/collections/archive-assets/create', collection: 'archive-assets' },
  { label: 'Viết bài mới', href: '/admin/collections/stories/create', collection: 'stories' },
  { label: 'Thêm người', href: '/admin/collections/people/create', collection: 'people' },
  { label: 'Thêm sản phẩm', href: '/admin/collections/products/create', collection: 'products' },
  { label: 'Xem hướng dẫn', href: '/admin/huong-dan' },
]

type CreatePermissions = { collections?: Record<string, { create?: boolean } | undefined> }

/** Bỏ nút tạo mới mà người dùng không có quyền `create`. */
export function tasksFor(permissions: CreatePermissions): TaskLink[] {
  return TASKS.filter((t) => !t.collection || permissions.collections?.[t.collection]?.create === true)
}
