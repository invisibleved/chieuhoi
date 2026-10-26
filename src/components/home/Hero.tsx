import type { HomeMediaView, PageIntroView } from '@/lib/content'
import { Button } from '@/components/ui/Button'
import { ContentImage } from '@/components/content/ContentImage'
import { DocumentLabel } from '@/components/content/DocumentLabel'
import { docNumber } from './tlCode'

type HeroProps = { intro: PageIntroView; media: HomeMediaView; storyHref: string | null }

// Tiêu đề hero: tách theo \n, dòng cuối nghiêng màu accent.
function HeroTitle({ intro }: { intro: PageIntroView }) {
  const cls = 'font-display text-display leading-[1.12] tracking-[-.01em]'
  const raw = intro.heroTitle ?? intro.title
  if (!raw) return <h1 className="sr-only">Chiếu Hới</h1>
  if (!intro.heroTitle) return <h1 className={cls}>{raw}</h1>
  // Chỉ ≥1280px mới ép không xuống dòng; dưới đó 70px sẽ tràn cột chữ.
  const lineCls = `${cls} xl:whitespace-nowrap`
  const lines = raw.split('\n')
  return (
    <h1 className={lineCls}>
      {lines.map((line, i) => {
        const last = i === lines.length - 1
        return (
          <span key={i}>
            {last && lines.length > 1 ? <em className="italic text-accent">{line}</em> : line}
            {last ? null : <br />}
          </span>
        )
      })}
    </h1>
  )
}

export function Hero({ intro, media, storyHref }: HeroProps) {
  const { hero, heroInset } = media
  const num = hero ? docNumber(hero.image.code) : null
  const hasLabel = hero !== null && (num !== null || !!hero.title || !!hero.caption)
  return (
    <section className="relative md:grid md:h-[840px] md:grid-cols-12 md:gap-x-6 md:px-20 md:pt-16">
      <div className="flex flex-col gap-[22px] px-5 pt-8 md:col-span-6 md:justify-center md:gap-8 md:px-0 md:pt-0 md:pb-[120px]">
        {intro.eyebrow ? (
          <p className="flex items-center gap-3 text-eyebrow font-semibold tracking-[.22em] text-accent md:gap-4 md:tracking-[.24em]">
            <span aria-hidden="true" className="h-px w-8 bg-accent md:w-12" />
            {intro.eyebrow}
          </p>
        ) : null}
        <HeroTitle intro={intro} />
        {intro.lead ? (
          <p className="max-w-[460px] text-body-lg leading-[1.65] text-text-secondary">{intro.lead}</p>
        ) : null}
        <div className="flex flex-col gap-1 md:flex-row md:items-center md:gap-8">
          <Button href="/lang-hoi" className="justify-center md:justify-start">
            Khám phá làng nghề
          </Button>
          {storyHref ? (
            <Button variant="secondary" href={storyHref} icon="play" className="justify-center max-md:min-h-12 max-md:[&_svg]:size-7">
              Nghe chuyện làng Hới
            </Button>
          ) : null}
        </div>
      </div>
      {hero ? (
        <figure className="relative mt-5 md:col-span-6 md:col-start-7 md:mt-0 md:self-start">
          <ContentImage
            image={hero.image}
            size="full"
            priority
            sizes="(min-width: 768px) 50vw, 100vw"
            className="h-[440px] md:h-[700px]"
            objectPosition="62% 50%"
          />
          {hasLabel ? (
          <figcaption className="absolute right-3 bottom-3 left-3 md:right-6 md:bottom-6 md:left-auto md:w-[280px]">
            <div className="hidden md:block">
              <DocumentLabel
                code={num}
                title={hero.title ?? ''}
                meta={hero.caption}
                className="border-0! bg-bg-primary!"
              />
            </div>
            <div className="flex flex-col gap-[3px] bg-bg-primary px-3 py-2.5 md:hidden">
              {num ? <span className="text-[12px] font-semibold tracking-[.18em] text-text-muted">{`TƯ LIỆU · ${num}`}</span> : null}
              <span className="text-[13px] leading-[1.45]">
                {[hero.title, hero.caption].filter(Boolean).join(' · ')}
              </span>
            </div>
          </figcaption>
          ) : null}
          {heroInset ? (
            <div className="absolute -bottom-[72px] -left-16 hidden size-[220px] box-content border-[10px] border-bg-primary md:block">
              <ContentImage image={heroInset} size="card" sizes="220px" className="h-[220px] w-[220px]" />
            </div>
          ) : null}
        </figure>
      ) : null}
      <div className="absolute bottom-8 left-20 hidden items-center gap-3.5 text-[12px] tracking-[.14em] text-text-muted md:flex">
        <span aria-hidden="true" className="h-10 w-px bg-text-muted" />
        CUỘN ĐỂ BẮT ĐẦU HÀNH TRÌNH
      </div>
    </section>
  )
}
