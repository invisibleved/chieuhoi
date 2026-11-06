import type { Metadata } from 'next'

import { PeopleView } from '@/components/people/PeopleView'
import { getMode, getPeoplePage } from '@/lib/content'

export async function generateMetadata(): Promise<Metadata> {
  const { intro, copy } = await getPeoplePage(await getMode())
  const title = (intro.title ?? copy.breadcrumb.current ?? '').replace(/\n/g, ' ')
  return intro.lead ? { title, description: intro.lead } : { title }
}

export default async function PeoplePage() {
  const mode = await getMode()
  const page = await getPeoplePage(mode)
  return <PeopleView page={page} />
}
