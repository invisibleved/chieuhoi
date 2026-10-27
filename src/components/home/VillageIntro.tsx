import type { HomeMediaView, Mode } from '@/lib/content'
import { ContentImage } from '@/components/content/ContentImage'
import { VerifyNote } from '@/components/content/VerifyNote'
import { LinkArrow } from '@/components/ui/LinkArrow'
import { Eyebrow } from '@/components/ui/Eyebrow'
import { ThreadsDivider } from '@/components/ui/ThreadsDivider'

type VillageIntroProps = { media: HomeMediaView; mode: Mode }

const CAPTION = 'font-serif italic text-[13px] leading-[1.5] text-text-secondary md:text-[14px]'

export function VillageIntro({ media, mode }: VillageIntroProps) {
  const [first, second] = media.village
  const preview = mode === 'preview'
  return (
    <>
      <ThreadsDivider className="mx-20 mt-[72px] hidden h-[14px] md:block" />
      <section className="flex flex-col gap-5 px-5 pt-16 pb-14 md:grid md:grid-cols-12 md:gap-x-6 md:gap-y-16 md:px-20 md:pt-24 md:pb-[120px]">
        <div className="flex flex-col gap-5 md:col-span-4">
          <Eyebrow>LÀNG HỚI</Eyebrow>
          <h2 className="font-display text-h2 leading-[1.15] font-normal md:leading-[1.1]">Có một làng Hới...</h2>
        </div>
        <div className="flex flex-col gap-5 md:col-span-6 md:col-start-6 md:gap-6">
          <p className="font-serif text-[18px] leading-[1.7] md:text-lead md:first-letter:float-left md:first-letter:pt-1.5 md:first-letter:pr-3 md:first-letter:font-display md:first-letter:text-[84px] md:first-letter:leading-[.9] md:first-letter:text-accent">
            Có những ngôi làng được nhớ bằng một mái đình, một bến sông. Làng Hới được nhớ bằng nhịp khung dệt và những tấm chiếu trải phơi kín bãi đất đầu làng.
          </p>
          {preview ? (
            <>
              <div className="md:hidden">
                <VerifyNote size="sm">[CẦN XÁC MINH] Đoạn giới thiệu lịch sử làng Hới.</VerifyNote>
              </div>
              <div className="hidden md:block">
                <VerifyNote>[CẦN XÁC MINH] Đoạn giới thiệu lịch sử làng Hới (Hải Triều, Tân Lễ, Hưng Hà) — đối chiếu tư liệu địa phương.</VerifyNote>
              </div>
            </>
          ) : null}
          <LinkArrow href="/lang-hoi" className="max-md:hidden self-start md:inline-flex">
            Đọc về làng Hới
          </LinkArrow>
        </div>
        {first ? (
          <figure className="-mx-5 mt-1 flex flex-col gap-2.5 md:col-span-8 md:mx-0 md:mt-0 md:gap-3">
            <ContentImage
              image={first.image}
              size="wide"
              sizes="(min-width: 768px) 66vw, 100vw"
              className="h-[260px] md:h-[540px]"
            />
            {first.caption ? <figcaption className={`${CAPTION} px-5 md:px-0`}>{first.caption}</figcaption> : null}
          </figure>
        ) : null}
        {second ? (
          <figure className="hidden flex-col gap-3 md:col-span-3 md:col-start-10 md:mt-[120px] md:flex">
            <ContentImage image={second.image} size="card" sizes="25vw" className="h-[420px]" />
            {second.caption ? <figcaption className={CAPTION}>{second.caption}</figcaption> : null}
          </figure>
        ) : null}
        <LinkArrow href="/lang-hoi" className="self-start md:hidden">
          Đọc về làng Hới
        </LinkArrow>
      </section>
    </>
  )
}
