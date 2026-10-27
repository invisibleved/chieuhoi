import Image from 'next/image'
import type { CSSProperties } from 'react'
import type { ImageView } from '@/lib/content'
import { previewNotes } from './labels'
import { Tag } from './Tag'

type ContentImageProps = {
  image: ImageView
  size?: 'thumb' | 'card' | 'wide' | 'full'
  sizes?: string
  className?: string
  priority?: boolean
  objectPosition?: string
  unoptimized?: boolean
  wrapperClassName?: string
  /** contain: ảnh nằm trọn trong khung (lightbox). */
  fit?: 'cover' | 'contain'
  /** Góc đặt nhãn xem trước, để không đè lên chú thích đặt ở góc dưới trái. */
  notesPosition?: 'bottom-left' | 'bottom-right' | 'top-right'
  /** Style thêm cho thẻ ảnh (ví dụ phóng to quanh một điểm). */
  imageStyle?: CSSProperties
}

const fits = { cover: 'object-cover', contain: 'object-contain' } as const
const notePositions = {
  'bottom-left': 'bottom-3 left-3 items-start',
  'bottom-right': 'bottom-3 right-3 items-end',
  'top-right': 'top-3 right-3 items-end',
} as const

// Ảnh nội dung qua next/image. Ảnh chưa đủ điều kiện công khai (có flag, chỉ thấy ở preview)
// phải tải trực tiếp từ trình duyệt kèm cookie đăng nhập: bộ tối ưu của Next tải từ server,
// không có cookie nên endpoint file của Payload sẽ chặn (403).
export function ContentImage({ image, size = 'card', sizes, className, priority, objectPosition, unoptimized, wrapperClassName, fit = 'cover', notesPosition = 'bottom-left', imageStyle }: ContentImageProps) {
  const src = image.sizes[size] ?? image.url
  const notes = previewNotes(image.flags)
  const direct = unoptimized || image.flags.length > 0
  const el = (
    <Image
      src={src}
      alt={image.alt}
      width={image.width}
      height={image.height}
      sizes={sizes}
      priority={priority}
      unoptimized={direct}
      className={className ? `${className} w-full ${fits[fit]}` : undefined}
      style={objectPosition || imageStyle ? { ...(objectPosition ? { objectPosition } : null), ...imageStyle } : undefined}
    />
  )
  if (notes.length === 0) return el
  return (
    <span className={wrapperClassName ? `relative block ${wrapperClassName}` : 'relative block'}>
      {el}
      <span className={`absolute flex flex-col gap-1 ${notePositions[notesPosition]}`}>
        {notes.map((n) => (
          <Tag key={n} variant="overlay">{n}</Tag>
        ))}
      </span>
    </span>
  )
}
