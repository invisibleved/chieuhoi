import type { StoryCardView } from '@/lib/content'
import { StoryCard } from '@/components/content/StoryCard'
import { LinkArrow } from '@/components/ui/LinkArrow'

type StoriesTeaserProps = { stories: StoryCardView[] }

// Bài chưa có trang chi tiết (chủ đề đề xuất) trỏ về danh sách, không trỏ 404.
const href = (s: StoryCardView) => (s.hasDetail ? `/cau-chuyen/${s.slug}` : '/cau-chuyen')

export function StoriesTeaser({ stories }: StoriesTeaserProps) {
  if (stories.length === 0) return null
  const featured = stories.find((s) => s.hasDetail) ?? stories[0]
  const rest = stories.filter((s) => s !== featured).slice(0, 3)
  // Ghi chú tính trên các thẻ đang hiện: thẻ nổi bật + thẻ nhỏ. Mobile ẩn thẻ nhỏ thứ 3 nên có bản riêng.
  const noteDesktop = !featured.hasDetail || rest.some((s) => !s.hasDetail)
  const noteMobile = !featured.hasDetail || rest.slice(0, 2).some((s) => !s.hasDetail)
  const NOTE = 'Chủ đề biên tập đề xuất — bài viết chưa được soạn.'
  return (
    <>
      <div aria-hidden="true" className="threads mx-5 h-[14px] md:mx-20" />
      <section className="flex flex-col gap-5 px-5 py-14 md:grid md:grid-cols-12 md:gap-x-6 md:gap-y-14 md:px-20 md:pt-[120px] md:pb-32">
        <div className="flex flex-col gap-5 md:col-span-12 md:flex-row md:items-end md:justify-between md:gap-10">
          <div className="flex flex-col gap-5 md:gap-[18px]">
            <span className="text-eyebrow font-semibold tracking-[.22em] text-accent md:tracking-[.24em]">CÂU CHUYỆN</span>
            <h2 className="font-display text-h2 leading-[1.15] font-normal md:leading-[1.1]">Chuyện làng, kể chậm.</h2>
          </div>
          <LinkArrow href="/cau-chuyen" className="max-md:hidden md:inline-flex">
            Tất cả câu chuyện
          </LinkArrow>
        </div>
        <div className="md:col-span-7">
          <StoryCard story={featured} href={href(featured)} variant="featured" size="large" hideCta />
        </div>
        {rest.length > 0 || noteDesktop ? (
          <div className="flex flex-col md:col-span-4 md:col-start-9 md:-mt-7">
            {rest.map((s, i) => (
              <div key={s.slug} className={i === 2 ? 'hidden md:block' : undefined}>
                <StoryCard story={s} href={href(s)} variant="compact" size="large" hideCta />
              </div>
            ))}
            {noteDesktop ? (
              <p className={`mt-5 text-[13px] text-text-muted ${noteMobile ? '' : 'max-md:hidden'}`}>{NOTE}</p>
            ) : null}
          </div>
        ) : null}
        <LinkArrow href="/cau-chuyen" className="self-start md:hidden">
          Tất cả câu chuyện
        </LinkArrow>
      </section>
    </>
  )
}
