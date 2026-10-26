import Image from 'next/image'
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
}

// Ảnh nội dung qua next/image. Ảnh chưa đủ điều kiện công khai (có flag, chỉ thấy ở preview)
// phải tải trực tiếp từ trình duyệt kèm cookie đăng nhập: bộ tối ưu của Next tải từ server,
// không có cookie nên endpoint file của Payload sẽ chặn (403).
export function ContentImage({ image, size = 'card', sizes, className, priority, objectPosition, unoptimized }: ContentImageProps) {
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
      className={className ? `${className} w-full object-cover` : undefined}
      style={objectPosition ? { objectPosition } : undefined}
    />
  )
  if (notes.length === 0) return el
  return (
    <span className="relative block">
      {el}
      <span className="absolute bottom-3 left-3 flex flex-col items-start gap-1">
        {notes.map((n) => (
          <Tag key={n} variant="overlay">{n}</Tag>
        ))}
      </span>
    </span>
  )
}
