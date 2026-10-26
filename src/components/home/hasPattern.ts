import type { ProductView } from '@/lib/content'

/** Một vị từ duy nhất cho khối hoa văn: cần ảnh đầu tiên (nơi đặt toạ độ) và ít nhất một chú thích. */
export function hasPattern(p: ProductView | null): p is ProductView & { primaryImage: NonNullable<ProductView['primaryImage']> } {
  return p !== null && p.primaryImage !== null && p.annotations.length > 0
}
