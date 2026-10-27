import Link from 'next/link'
import type { StoryCardView } from '@/lib/content'
import { ContentImage } from './ContentImage'
import { PreviewNotes } from './PreviewNotes'
import { Tag } from './Tag'

type StoryCardProps = { story: StoryCardView; href: string; variant: 'featured' | 'grid' | 'compact'
  /** 'large': kích thước trang chủ (ảnh, tiêu đề, sapo lớn hơn; responsive). */
  size?: 'default' | 'large'
  /** Ẩn nút cuối thẻ ở mobile (< md). */
  hideCta?: boolean
}

// Thẻ bài viết. Không có ảnh bìa thì bỏ hẳn khối ảnh.
export function StoryCard({ story, href, variant, size = 'default', hideCta = false }: StoryCardProps) {
  const status = story.status
  const cta = story.hasDetail ? 'Đọc bài →' : 'Xem đề cương →'
  const compact = variant === 'compact'
  const eyebrowText = [
    story.category ? story.category.toLocaleUpperCase('vi') : null,
    story.readingMinutes !== null ? `${story.readingMinutes} PHÚT ĐỌC` : null,
  ]
    .filter(Boolean)
    .join(' · ')
  const large = size === 'large'
  const imgH = large ? 'h-[230px] md:h-[460px]' : variant === 'featured' ? 'h-[260px]' : 'h-[280px]'
  const titleCls = large
    ? compact
      ? 'text-[21px] leading-[1.25] md:text-[26px]'
      : 'text-[28px] leading-[1.2] md:text-[44px] md:leading-[1.15]'
    : variant === 'featured'
      ? 'text-[32px] leading-[1.2]'
      : variant === 'grid'
        ? 'text-[28px] leading-[1.2]'
        : 'text-[24px] leading-[1.25]'
  const sapoCls = large
    ? 'max-w-[600px] text-[16px] leading-[1.65] md:text-[18px] md:leading-[1.7]'
    : variant === 'featured'
      ? 'text-[16px] leading-[1.65]'
      : 'text-[15px] leading-[1.6]'
  const image = story.cover ? (
    compact ? (
      <ContentImage image={story.cover} size="card" sizes={large ? '140px' : '120px'} className={`block ${large ? 'h-[116px] w-[96px] md:h-[170px] md:w-[140px]' : 'h-[150px] w-[120px]'} transition-opacity duration-[var(--dur-micro)] group-hover:opacity-[.88]`} />
    ) : (
      <ContentImage image={story.cover} size="card" sizes="(min-width: 1024px) 40vw, 100vw" className={`${imgH} block transition-opacity duration-[var(--dur-micro)] group-hover:opacity-[.88]`} />
    )
  ) : null
  const text = (
    <span className="flex min-w-0 flex-col gap-3">
      {(eyebrowText || status) && (
        <span className="flex flex-wrap items-center gap-2">
          {eyebrowText && <span className="text-[12px] font-semibold tracking-meta text-text-meta">{eyebrowText}</span>}
          {status && <Tag variant={status === 'Bản nháp' ? 'dashed' : 'filled'}>{status}</Tag>}
        </span>
      )}
      {story.title && (
        <span className={`font-display transition-colors duration-[var(--dur-micro)] ease-[var(--ease-weave)] group-hover:text-accent ${titleCls}`}>{story.title}</span>
      )}
      {!compact && story.sapo && <span className={`font-serif text-text-secondary ${sapoCls}`}>{story.sapo}</span>}
      <PreviewNotes flags={story.flags} />
      <span className={`font-medium text-accent underline-offset-4 group-hover:underline ${compact ? 'text-[14px]' : 'text-[15px]'} ${hideCta ? 'max-md:hidden' : ''}`}>{cta}</span>
    </span>
  )
  if (compact) {
    return (
      <Link
        href={href}
        className={`group grid border-b border-border-subtle text-text-primary no-underline ${large ? 'gap-4 pb-5 md:gap-5 md:py-7' : 'gap-4 pb-5'} ${image ? (large ? 'grid-cols-[96px_1fr] md:grid-cols-[140px_1fr]' : 'grid-cols-[120px_1fr]') : 'grid-cols-1'}`}
      >
        {image}
        {text}
      </Link>
    )
  }
  return (
    <Link href={href} className="group flex flex-col gap-4 text-text-primary no-underline">
      {image}
      {text}
    </Link>
  )
}
