// View model của /con-nguoi và /con-nguoi/[slug]. Dùng lại createContent và ảnh theo ô của createPages.
import type { Payload } from 'payload'

import { personCategoryOptions } from './categories'
import { applyMode } from './copy/applyMode'
import { peopleCopy, peopleRelated } from './copy/people'
import { createPages } from './pages'
import type { createContent } from './queries'
import type { Mode, PeoplePageView, PersonPageView, ReadNextItem } from './types'

type Content = ReturnType<typeof createContent>

export function createPeople(payload: Payload, content: Content) {
  const { getPageMedia } = createPages(payload, content)

  async function getPeoplePage(mode: Mode): Promise<PeoplePageView> {
    const [intro, people] = await Promise.all([content.getPageIntro('con-nguoi', mode), content.getPeople(mode)])
    return {
      intro,
      people,
      filters: [{ key: 'all', label: peopleCopy.filter.all }, ...personCategoryOptions],
      copy: applyMode(peopleCopy, mode),
    }
  }

  /** Thẻ công đoạn: chỉ khi công đoạn nhìn thấy được ở mode này (đã đăng ở public, P2) và có tiêu đề. */
  async function stepCard(n: number | null, mode: Mode): Promise<ReadNextItem | null> {
    if (n === null) return null
    const step = (await content.getCraftSteps(mode)).find((s) => s.n === n)
    if (!step?.title) return null
    const { eyebrow, cta, href } = peopleRelated.step
    return { href, eyebrow, cta, title: `${String(n).padStart(2, '0')} · ${step.title}`, image: step.image }
  }

  /** Thẻ hiện vật: tên sản phẩm (R16), không gắn tên người với sản phẩm. */
  async function productCard(slug: string | null, mode: Mode): Promise<ReadNextItem | null> {
    if (slug === null) return null
    const product = (await content.getProducts(mode)).find((p) => p.slug === slug)
    if (!product?.name) return null
    const { eyebrow, cta } = peopleRelated.product
    return { href: `/san-pham/${product.slug}`, eyebrow, cta, title: product.name, image: product.image }
  }

  async function getPersonPage(slug: string, mode: Mode): Promise<PersonPageView | null> {
    const found = await content.getPersonWithLinks(slug, mode)
    if (!found) return null
    const [step, product, media] = await Promise.all([
      stepCard(found.stepN, mode),
      productCard(found.productSlug, mode),
      getPageMedia('con-nguoi', mode),
    ])
    const fixed = peopleRelated.people
    // Mobile chỉ hiện các thẻ trước thẻ cố định, theo artboard.
    const related = [step, product].filter((r): r is ReadNextItem => r !== null)
    related.push({
      href: fixed.href, eyebrow: fixed.eyebrow, title: fixed.title, cta: fixed.cta,
      image: media[fixed.slot]?.image ?? null, mobile: false,
    })
    return { person: found.person, related, copy: applyMode(peopleCopy, mode) }
  }

  /** Slug người đã đăng cho generateStaticParams (R20). */
  async function getPersonSlugs(): Promise<string[]> {
    return (await content.getPeople('public')).map((p) => p.slug)
  }

  return { getPeoplePage, getPersonPage, getPersonSlugs }
}
