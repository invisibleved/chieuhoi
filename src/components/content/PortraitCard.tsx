import Link from 'next/link'
import type { PersonView } from '@/lib/content'
import { ContentImage } from './ContentImage'
import { PreviewNotes } from './PreviewNotes'
import { Tag } from './Tag'

type PortraitCardProps = {
  person: PersonView
  href: string
  /** lg: thẻ lớn; sm: thẻ gọn (2 cột mobile); fluid: gọn ở mobile, lớn từ md (trang danh sách). */
  size?: 'lg' | 'sm' | 'fluid'
  /** Dòng chữ dưới tên: vai trò (mặc định) hoặc ghi chú ngắn (trang danh sách Con người). */
  detail?: 'role' | 'note'
  /** Thêm vào thẻ (ví dụ lùi xuống `md:mt-12` theo vị trí trong lưới). */
  className?: string
  /** Nhãn phủ trên ảnh khi chưa có đồng ý (copy: peopleCopy.card.pending). */
  pendingLabel: string
  /** Chữ nút cuối thẻ (mặc định "Xem chân dung →"). */
  cta?: string
  /** Ghi đè chiều cao ảnh (và ô giữ chỗ). */
  imageClassName?: string
  /** Ghi đè cỡ chữ tên. */
  nameClassName?: string
}

// Kích thước theo lớp CSS: fluid đổi giữa sm (mobile) và lg (từ md) mà không render hai thẻ.
const looks = {
  lg: {
    gap: 'gap-3',
    image: 'h-[380px]',
    tagPos: 'left-3 top-3',
    category: 'tracking-meta',
    name: 'text-[24px] leading-[1.2]',
    more: '',
  },
  sm: {
    gap: 'gap-3',
    image: 'h-[220px]',
    tagPos: 'left-1.5 top-1.5',
    category: 'tracking-meta-sm',
    name: 'text-[19px] leading-[1.25]',
    more: '',
  },
  fluid: {
    gap: 'gap-2 md:gap-2.5',
    image: 'h-[220px] md:h-[380px]',
    tagPos: 'left-1.5 top-1.5 md:left-3 md:top-3',
    category: 'tracking-meta-sm md:tracking-meta',
    name: 'text-[19px] leading-[1.25] md:text-[24px] md:leading-[1.2]',
    more: 'max-md:hidden',
  },
} as const

// Thẻ chân dung. Chưa có đồng ý thì không có tên: nhãn `pendingLabel` thay thế, không in placeholder.
export function PortraitCard({ person, href, size = 'lg', detail = 'role', className, pendingLabel, cta = 'Xem chân dung →', imageClassName, nameClassName }: PortraitCardProps) {
  const look = looks[size]
  const h = imageClassName ?? look.image
  const cardFlags = person.flags.filter((f) => !person.portrait?.flags.includes(f))
  const line = detail === 'note' ? person.note : person.role
  return (
    <Link href={href} className={['group flex flex-col text-text-primary no-underline', look.gap, className].filter(Boolean).join(' ')}>
      <span className="relative block">
        {person.portrait ? (
          <ContentImage image={person.portrait} size="card" className={`${h} block transition-opacity duration-[var(--dur-micro)] group-hover:opacity-[.88]`} sizes={size === 'sm' ? '50vw' : '(min-width: 1024px) 25vw, 50vw'} />
        ) : (
          <span aria-hidden="true" className={`block w-full bg-bg-secondary ${h}`} />
        )}
        {person.consentPending && (
          <span className={`absolute ${look.tagPos}`}>
            <Tag variant="overlay" size={size === 'lg' ? 'md' : size}>{pendingLabel}</Tag>
          </span>
        )}
      </span>
      {person.category && (
        <span className={`text-[12px] font-semibold uppercase text-text-meta ${look.category}`}>{person.category}</span>
      )}
      {person.name && (
        <span className={`font-display ${nameClassName ?? look.name}`}>{person.name}</span>
      )}
      {size !== 'sm' && line && <span className={`text-[14px] leading-[1.55] text-text-secondary ${look.more}`}>{line}</span>}
      <PreviewNotes flags={cardFlags} />
      {size !== 'sm' && (
        <span className={`text-[15px] font-medium text-accent underline-offset-4 group-hover:underline ${look.more}`}>{cta}</span>
      )}
    </Link>
  )
}
