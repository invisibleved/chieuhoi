import Link from 'next/link'
import type { PersonView } from '@/lib/content'
import { ContentImage } from './ContentImage'
import { previewNotes } from './labels'
import { Tag } from './Tag'

type PortraitCardProps = { person: PersonView; href: string; size?: 'lg' | 'sm' }

// Thẻ chân dung. Chưa có đồng ý thì không có tên: nhãn "Chờ đồng ý" thay thế, không in placeholder.
export function PortraitCard({ person, href, size = 'lg' }: PortraitCardProps) {
  const lg = size === 'lg'
  const h = lg ? 'h-[380px]' : 'h-[220px]'
  const notes = previewNotes(person.flags)
  return (
    <Link href={href} className="group flex flex-col gap-3 text-text-primary no-underline">
      <span className="relative block">
        {person.portrait ? (
          <ContentImage image={person.portrait} size="card" className={`${h} block transition-opacity duration-[var(--dur-micro)] group-hover:opacity-[.88]`} sizes={lg ? '(min-width: 1024px) 25vw, 50vw' : '50vw'} />
        ) : (
          <span aria-hidden="true" className={`block w-full bg-bg-secondary ${h}`} />
        )}
        {person.consentPending && (
          <span className={`absolute ${lg ? 'left-3 top-3' : 'left-1.5 top-1.5'}`}>
            {lg ? (
              <Tag variant="overlay">Chờ đồng ý</Tag>
            ) : (
              <span className="inline-block bg-[rgba(243,235,221,.94)] px-[7px] py-[3px] text-[12px] font-semibold text-text-secondary">Chờ đồng ý</span>
            )}
          </span>
        )}
      </span>
      <span className={`text-[12px] font-semibold text-text-meta ${lg ? 'tracking-[.16em]' : 'tracking-[.1em]'}`}>
        {person.category.toUpperCase()}
      </span>
      {person.name && (
        <span className={`font-display ${lg ? 'text-[24px] leading-[1.2]' : 'text-[19px] leading-[1.25]'}`}>{person.name}</span>
      )}
      {lg && person.role && <span className="text-[14px] leading-[1.55] text-text-secondary">{person.role}</span>}
      {notes.length > 0 && (
        <span className="flex flex-wrap gap-2">
          {notes.map((n) => (
            <Tag key={n} variant="dashed">{n}</Tag>
          ))}
        </span>
      )}
      {lg && (
        <span className="text-[15px] font-medium text-accent underline-offset-4 group-hover:underline">Xem chân dung →</span>
      )}
    </Link>
  )
}
