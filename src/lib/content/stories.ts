// View model của /cau-chuyen và /cau-chuyen/[slug]. Dùng lại createContent và ảnh theo ô của createPages.
import type { Payload } from 'payload'

import { storyCategoryOptions } from './categories'
import { applyMode } from './copy/applyMode'
import { storiesCopy, storiesReadNext } from './copy/stories'
import { createPages } from './pages'
import type { createContent } from './queries'
import type { Mode, ReadNextItem, StoriesPageView, StoryCardView, StoryPageView, StoryView } from './types'

type Content = ReturnType<typeof createContent>

/** Thẻ "Đọc tiếp" thứ ba: bài khác đầu tiên (R8). Eyebrow "CHỦ ĐỀ · NHÃN TRẠNG THÁI". */
function otherStory(s: StoryCardView): ReadNextItem | null {
  if (!s.title) return null
  return {
    href: s.hasDetail ? `/cau-chuyen/${s.slug}` : '/cau-chuyen',
    eyebrow: [s.category, s.status].filter((t): t is string => !!t).join(' · ').toLocaleUpperCase('vi'),
    title: s.title,
    cta: s.cta,
    image: s.cover,
    mobile: false,
  }
}

/** Dòng meta của bài: phần trống bị bỏ (kèm dấu ngăn khi hiển thị). */
function storyMeta(s: StoryView): string[] {
  const m = storiesCopy.detail.meta
  return [
    s.editor ? m.editor + s.editor : null,
    s.publishedAt ? m.published + s.publishedAt : null,
    s.readingMinutes !== null ? m.minutes.replace('{m}', String(s.readingMinutes)) : null,
    s.sourceCount > 0 ? m.sources.replace('{s}', String(s.sourceCount)) : null,
  ].filter((p): p is string => p !== null)
}

export function createStories(payload: Payload, content: Content) {
  const { getPageMedia } = createPages(payload, content)

  async function getStoriesPage(mode: Mode): Promise<StoriesPageView> {
    const [intro, stories] = await Promise.all([content.getPageIntro('cau-chuyen', mode), content.getStories(mode)])
    const story = stories.find((s) => s.hasDetail)
    const fill = (t: string) => t.replace('{s}', String(story?.sourceCount ?? '')).replace('{m}', String(story?.readingMinutes ?? ''))
    const featured = story
      ? {
          story,
          eyebrow: [storiesCopy.featured.eyebrow, story.category?.toLocaleUpperCase('vi')].filter(Boolean).join(' · '),
          meta: story.sourceCount > 0 && story.readingMinutes !== null ? fill(storiesCopy.featured.meta) : null,
        }
      : null
    return {
      intro,
      stories,
      featured,
      filters: [{ key: 'all', label: storiesCopy.filter.all }, ...storyCategoryOptions],
      copy: applyMode(storiesCopy, mode),
    }
  }

  async function getStoryPage(slug: string, mode: Mode): Promise<StoryPageView | null> {
    const story = await content.getStory(slug, mode)
    if (!story) return null
    const [media, stories] = await Promise.all([getPageMedia('cau-chuyen', mode), content.getStories(mode)])
    const readNext: ReadNextItem[] = storiesReadNext.map((r) => ({
      href: r.href, eyebrow: r.eyebrow, title: r.title, cta: r.cta, image: media[r.slot]?.image ?? null,
    }))
    const other = stories.filter((s) => s.slug !== slug).map(otherStory).find((r) => r !== null)
    if (other) readNext.push(other)
    return { story, meta: storyMeta(story), readNext, copy: applyMode(storiesCopy, mode) }
  }

  /** Slug đủ điều kiện public (đã đăng, không phải idea) cho generateStaticParams (R20). */
  async function getStorySlugs(): Promise<string[]> {
    return (await content.getStories('public')).filter((s) => s.hasDetail).map((s) => s.slug)
  }

  return { getStoriesPage, getStoryPage, getStorySlugs }
}
