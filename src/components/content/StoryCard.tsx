import Link from 'next/link'
import type { ReactNode } from 'react'
import type { StoryCardView } from '@/lib/content'
import { ContentImage } from './ContentImage'
import { PreviewNotes } from './PreviewNotes'
import { Tag } from './Tag'

type StoryCardProps = {
  story: StoryCardView
  /** Không có href (bài chưa có trang chi tiết) thì thẻ là <article>, không phải link, và không có nút cuối thẻ. */
  href?: string
  /** hero: bài nổi bật đầu trang danh sách (ảnh 7 cột, chữ 4 cột). */
  variant: 'featured' | 'grid' | 'compact' | 'hero'
  /** Thay dòng eyebrow mặc định (chủ đề · số phút đọc). */
  eyebrow?: string
  /** Dòng meta dưới sapo (chỉ variant hero). */
  meta?: string | null
  /** 'large': kích thước trang chủ (ảnh, tiêu đề, sapo lớn hơn; responsive). */
  size?: 'default' | 'large'
  /** Ẩn nút cuối thẻ ở mobile (< md). */
  hideCta?: boolean
}

// Thẻ bài viết. Không có ảnh bìa thì bỏ hẳn khối ảnh.
export function StoryCard({
  story,
  href,
  variant,
  eyebrow,
  meta = null,
  size = 'default',
  hideCta = false,
}: StoryCardProps) {
  const status = story.status
  const cta = href ? story.cta : null
  const hero = variant === 'hero'
  const compact = variant === 'compact'
  const eyebrowText =
    eyebrow ??
    [
      story.category,
      story.readingMinutes !== null ? `${story.readingMinutes} PHÚT ĐỌC` : null,
    ]
      .filter(Boolean)
      .join(' · ')
  const large = size === 'large'
  const imgH = large
    ? 'h-[230px] md:h-[460px]'
    : variant === 'featured'
      ? 'h-[260px]'
      : variant === 'grid'
        ? 'h-[210px] md:h-[280px]'
        : 'h-[280px]'
  const titleCls = large
    ? compact
      ? 'text-[21px] leading-[1.25] md:text-[26px]'
      : 'text-[28px] leading-[1.2] md:text-[44px] md:leading-[1.15]'
    : hero
      ? 'text-[52px] leading-[1.12]'
      : variant === 'featured'
        ? 'text-[32px] leading-[1.2]'
        : variant === 'grid'
          ? 'text-[24px] leading-[1.2] md:text-[28px]'
          : 'text-[24px] leading-[1.25]'
  const sapoCls = large
    ? 'max-w-[600px] text-[16px] leading-[1.65] md:text-[18px] md:leading-[1.7]'
    : hero
      ? 'text-[19px] leading-[1.7]'
      : variant === 'featured'
        ? 'text-[16px] leading-[1.65]'
        : variant === 'grid'
          ? 'text-[14px] leading-[1.55] md:text-[15px] md:leading-[1.6]'
          : 'text-[15px] leading-[1.6]'
  const image = story.cover ? (
    compact ? (
      <ContentImage
        image={story.cover}
        size="card"
        sizes={large ? '140px' : '120px'}
        className={`block ${large ? 'h-[116px] w-[96px] md:h-[170px] md:w-[140px]' : 'h-[150px] w-[120px]'} transition-opacity duration-[var(--dur-micro)] group-hover:opacity-[.88]`}
      />
    ) : (
      <ContentImage
        image={story.cover}
        size={hero ? 'full' : 'card'}
        sizes={hero ? '(min-width: 1024px) 58vw, 100vw' : '(min-width: 1024px) 40vw, 100vw'}
        className={`${hero ? 'h-[520px]' : imgH} block transition-opacity duration-[var(--dur-micro)] group-hover:opacity-[.88]`}
      />
    )
  ) : null
  // Hero chỉ hiện từ md nên không ưu tiên tải ảnh (mobile không bao giờ thấy).
  const imageSlot = hero && image ? <span className="block md:col-span-7">{image}</span> : image
  const text = (
    <span
      className={`flex min-w-0 flex-col ${hero ? 'gap-[18px] md:col-span-4 md:col-start-9' : 'gap-3'}`}
    >
      {(eyebrowText || status) && (
        <span className="flex flex-wrap items-center gap-2">
          {eyebrowText && (
            <span className="text-[12px] font-semibold uppercase tracking-meta text-text-meta">
              {eyebrowText}
            </span>
          )}
          {status && <Tag variant={story.isDraft ? 'dashed' : 'filled'}>{status}</Tag>}
        </span>
      )}
      {story.title && (
        <span
          className={`font-display transition-colors duration-[var(--dur-micro)] ease-[var(--ease-weave)] group-hover:text-accent ${titleCls}`}
        >
          {story.title}
        </span>
      )}
      {!compact && story.sapo && (
        <span className={`font-serif text-text-secondary ${sapoCls}`}>{story.sapo}</span>
      )}
      {hero && meta ? <span className="text-[14px] text-text-muted">{meta}</span> : null}
      <PreviewNotes flags={story.flags} />
      {cta ? (
        <span
          className={`font-medium text-accent underline-offset-4 group-hover:underline ${compact ? 'text-[14px]' : 'text-[15px]'} ${hideCta ? 'max-md:hidden' : ''}`}
        >
          {cta}
        </span>
      ) : null}
    </span>
  )
  const wrap = (className: string, children: ReactNode) =>
    href ? (
      <Link href={href} className={`group no-underline ${className}`}>
        {children}
      </Link>
    ) : (
      <article className={`group ${className}`}>{children}</article>
    )
  if (compact) {
    return wrap(
      `grid border-b border-border-subtle text-text-primary ${large ? 'gap-4 pb-5 md:gap-5 md:py-7' : 'gap-4 pb-5'} ${image ? (large ? 'grid-cols-[96px_1fr] md:grid-cols-[140px_1fr]' : 'grid-cols-[120px_1fr]') : 'grid-cols-1'}`,
      <>
        {imageSlot}
        {text}
      </>,
    )
  }
  const layout = hero
    ? 'flex flex-col gap-4 md:grid md:grid-cols-12 md:items-center md:gap-x-6'
    : 'flex flex-col gap-4'
  return wrap(
    `${layout} text-text-primary`,
    <>
      {imageSlot}
      {text}
    </>,
  )
}
