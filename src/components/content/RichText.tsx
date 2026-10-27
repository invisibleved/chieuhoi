import { Fragment, type ReactNode } from 'react'
import type { ImageView, Rich, RichNode, Variant } from '@/lib/content'
import { PullQuote } from '@/components/ui/PullQuote'
import { VariantText } from '@/components/ui/VariantText'
import { ContentImage } from './ContentImage'
import { FootnoteRef } from './Sources'

type RichTextProps = {
  value: Rich
  /** article: bài đọc (StoryDetail). story: lời kể trong trang chân dung (PersonDetail). */
  variant: 'article' | 'story'
  /** Chữ cái đầu của đoạn đầu tiên phóng to (chỉ bài đọc). */
  dropCap?: boolean
}

// Đoạn lời kể chân dung (không màu): RichText dùng màu chữ chính, StoryPlaceholder dùng màu mờ.
const STORY_P = 'm-0 font-serif text-[17px] leading-[1.75] md:text-[19px]'

const styles = {
  article: {
    wrap: 'flex flex-col gap-[22px] md:gap-7',
    p: 'm-0 font-serif text-[18px] leading-[1.8] text-text-primary md:text-[20px]',
    h: 'm-0 mt-4 scroll-mt-24 font-display text-[26px] font-normal leading-[1.25] md:mt-6 md:text-[34px] md:leading-[1.2]',
    h3: 'm-0 font-display text-[22px] font-normal leading-[1.25] md:text-[26px]',
    figcaption: 'font-sans text-[13px] leading-[1.55] text-text-secondary md:text-[14px]',
    img: 'block h-[260px] md:h-[420px]',
  },
  story: {
    wrap: 'flex flex-col gap-5 md:gap-6',
    p: `${STORY_P} text-text-primary`,
    h: 'm-0 font-display text-[22px] font-normal leading-[1.2] md:text-[26px]',
    h3: 'm-0 font-display text-[22px] font-normal leading-[1.2] md:text-[26px]',
    figcaption: 'font-serif text-[14px] italic leading-[1.5] text-text-secondary',
    img: 'block h-[260px] md:h-[400px]',
  },
} as const

const DROP_CAP =
  'first-letter:float-left first-letter:pr-2.5 first-letter:pt-1.5 first-letter:font-display first-letter:text-[68px] first-letter:leading-[.86] first-letter:text-accent md:first-letter:pr-3 md:first-letter:pt-2 md:first-letter:text-[92px]'

const kids = (n: RichNode): RichNode[] => (Array.isArray(n.children) ? (n.children as RichNode[]).filter((c) => c && typeof c === 'object') : [])

// Bit định dạng chữ của Lexical.
const BOLD = 1
const ITALIC = 2

function inline(nodes: RichNode[]): ReactNode[] {
  return nodes.map((n, i) => {
    switch (n.type) {
      case 'text': {
        const format = typeof n.format === 'number' ? n.format : 0
        let el: ReactNode = typeof n.text === 'string' ? n.text : ''
        if (format & BOLD) el = <strong className="font-semibold">{el}</strong>
        if (format & ITALIC) el = <em>{el}</em>
        return <Fragment key={i}>{el}</Fragment>
      }
      case 'linebreak':
        return <br key={i} />
      case 'cite':
        return typeof n.n === 'number' ? <FootnoteRef key={i} n={n.n} /> : null
      case 'link':
      case 'autolink': {
        const f = (n.fields ?? {}) as { url?: unknown; newTab?: unknown }
        if (typeof f.url !== 'string') return <Fragment key={i}>{inline(kids(n))}</Fragment>
        return (
          <a key={i} href={f.url} className="underline underline-offset-2 hover:decoration-2" {...(f.newTab ? { target: '_blank', rel: 'noopener noreferrer' } : {})}>
            {inline(kids(n))}
          </a>
        )
      }
      case 'paragraph':
        return <Fragment key={i}>{inline(kids(n))}</Fragment>
      default:
        return null // nút lạ bị bỏ qua
    }
  })
}

export function RichText({ value, variant, dropCap = false }: RichTextProps) {
  const s = styles[variant]
  const blocks = kids(value.root)

  function list(n: RichNode, key: number): ReactNode {
    const Tag = n.listType === 'number' ? 'ol' : 'ul'
    return (
      <Tag key={key} className={`${s.p} flex flex-col gap-2 pl-6 ${Tag === 'ol' ? 'list-decimal' : 'list-disc'}`}>
        {kids(n).map((li, j) =>
          li.type === 'listitem' ? (
            <li key={j}>
              {kids(li).map((c, k) => (c.type === 'list' ? list(c, k) : <Fragment key={k}>{inline([c])}</Fragment>))}
            </li>
          ) : null,
        )}
      </Tag>
    )
  }

  const dropAt = dropCap ? blocks.findIndex((b) => b.type === 'paragraph') : -1
  const out = blocks.map((n, i): ReactNode => {
    switch (n.type) {
      case 'paragraph': {
        return <p key={i} className={i === dropAt ? `${s.p} ${DROP_CAP}` : s.p}>{inline(kids(n))}</p>
      }
      case 'heading': {
        const text = inline(kids(n))
        if (variant === 'article' && n.tag === 'h2') {
          return <h2 key={i} id={typeof n.anchor === 'string' ? n.anchor : undefined} className={s.h}>{text}</h2>
        }
        return <h3 key={i} className={s.h3}>{text}</h3>
      }
      case 'quote':
        return (
          <PullQuote key={i} variant={variant === 'article' ? 'article' : 'testimony'}>
            {inline(kids(n))}
          </PullQuote>
        )
      case 'list':
        return list(n, i)
      case 'horizontalrule':
        return <hr key={i} className="m-0 border-0 border-t border-border-soft" />
      case 'figure': {
        const image = n.image as ImageView | undefined
        if (!image) return null
        const caption = typeof n.caption === 'string' && n.caption !== '' ? n.caption : null
        return (
          <figure key={i} className="m-0 my-2 flex flex-col gap-2 md:my-4 md:gap-2.5">
            <ContentImage image={image} size="wide" sizes="(min-width: 768px) 50vw, 100vw" className={s.img} />
            {caption ? <figcaption className={s.figcaption}>{caption}</figcaption> : null}
          </figure>
        )
      }
      default:
        return null
    }
  })

  return <div className={s.wrap}>{out}</div>
}

/**
 * Mục gợi ý phỏng vấn ở bản xem trước (R14): tiêu đề như h3 của lời kể, đoạn chữ mờ (.ph của artboard).
 * Thân là Variant: desktop có câu hỏi gợi ý, mobile rút gọn.
 */
export function StoryPlaceholder({ title, body }: { title: string | null; body: Variant }) {
  return (
    <div className="flex flex-col gap-2 md:gap-2.5">
      {title ? <h3 className={styles.story.h3}>{title}</h3> : null}
      <p className={`${STORY_P} text-text-muted`}>
        <VariantText value={body} />
      </p>
    </div>
  )
}
