'use client'

import { useRowLabel } from '@payloadcms/ui'

type Props = {
  /** Tên ô trong dòng có chữ dùng làm nhãn dòng. */
  field: string
  /** Chữ khi ô đó còn trống, kèm số dòng: "Dòng 01". */
  fallback: string
}

/** Nhãn dòng của ô mảng trong admin: chữ của một ô trong dòng, chưa có thì "<fallback> NN" (thay "Fact 01" tiếng Anh mặc định). */
export function FieldRowLabel({ field, fallback }: Props) {
  const { data, rowNumber } = useRowLabel<Record<string, unknown>>()
  const value = data?.[field]
  if (typeof value === 'string' && value.trim() !== '') return <span>{value.trim()}</span>
  return <span>{`${fallback} ${String((rowNumber ?? 0) + 1).padStart(2, '0')}`}</span>
}
