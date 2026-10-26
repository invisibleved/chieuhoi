import type { PersonView } from '@/lib/content'
import { PortraitCard } from '@/components/content/PortraitCard'
import { LinkArrow } from '@/components/ui/LinkArrow'

type PeopleTeaserProps = { people: PersonView[] }

const CTA = 'Đọc câu chuyện →'

// Ô theo thứ tự: người 1 lớn, người 2 và 3 nhỏ, lệch dọc (desktop). Mobile: dải vuốt ngang.
const SLOTS = [
  { cell: 'md:col-span-6', image: 'h-[360px] md:h-[600px]', name: 'text-[22px] leading-[1.2] md:text-[32px]' },
  { cell: 'md:col-span-3 md:mt-40', image: 'h-[360px] md:h-[400px]', name: 'text-[22px] leading-[1.2] md:text-[24px]' },
  { cell: 'md:col-span-3 md:mt-16', image: 'h-[360px] md:h-[400px]', name: 'text-[22px] leading-[1.2] md:text-[24px]' },
] as const

export function PeopleTeaser({ people }: PeopleTeaserProps) {
  const shown = people.slice(0, 3)
  if (shown.length === 0) return null
  return (
    <>
      <div aria-hidden="true" className="threads mx-5 h-[14px] md:mx-20" />
      <section className="flex flex-col gap-5 px-5 pt-16 pb-14 md:grid md:grid-cols-12 md:gap-x-6 md:gap-y-16 md:px-20 md:pt-24 md:pb-[120px]">
        <div className="flex flex-col gap-5 md:col-span-6 md:gap-[18px]">
          <span className="text-eyebrow font-semibold tracking-[.22em] text-accent md:tracking-[.24em]">CON NGƯỜI</span>
          <h2 className="font-display text-h2 leading-[1.15] font-normal md:leading-[1.1]">Những bàn tay giữ hồn làng.</h2>
        </div>
        <p className="hidden text-[17px] leading-[1.65] text-text-secondary md:col-span-5 md:col-start-8 md:block md:self-end">
          Mỗi người một khung dệt, một nếp nhà, một cách giữ nghề. Tên và câu chuyện chỉ được đăng khi chính họ đồng ý kể.
        </p>
        <p className="text-[15px] leading-[1.6] text-text-secondary md:hidden">
          Tên và câu chuyện chỉ được đăng khi chính họ đồng ý kể.
        </p>
        <div className="-mx-5 flex gap-4 overflow-x-auto px-5 md:contents">
          {shown.map((person, i) => (
            <div key={person.slug} className={`w-[280px] shrink-0 md:w-auto ${SLOTS[i].cell}`}>
              <PortraitCard
                person={person}
                href={`/con-nguoi/${person.slug}`}
                cta={CTA}
                imageClassName={SLOTS[i].image}
                nameClassName={SLOTS[i].name}
              />
            </div>
          ))}
        </div>
        {shown.length >= 2 ? <p className="text-[13px] text-text-muted md:hidden">Vuốt ngang để xem thêm</p> : null}
        <LinkArrow href="/con-nguoi" className="hidden self-start md:col-span-12 md:inline-flex md:justify-self-start">
          Gặp những người làng Hới
        </LinkArrow>
      </section>
    </>
  )
}
