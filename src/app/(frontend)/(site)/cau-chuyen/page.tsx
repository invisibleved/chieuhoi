import type { Metadata } from 'next'

import { StoriesView } from '@/components/stories/StoriesView'
import { getMode, getStoriesPage } from '@/lib/content'

export async function generateMetadata(): Promise<Metadata> {
  const { intro, copy } = await getStoriesPage(await getMode())
  const title = (intro.title ?? copy.breadcrumb.current ?? '').replace(/\n/g, ' ')
  return intro.lead ? { title, description: intro.lead } : { title }
}

export default async function StoriesPage() {
  const mode = await getMode()
  const page = await getStoriesPage(mode)
  return <StoriesView page={page} />
}
