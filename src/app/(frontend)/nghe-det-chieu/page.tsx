import type { Metadata } from 'next'

import { CraftView } from '@/components/craft/CraftView'
import { getCraftPage, getMode } from '@/lib/content'

export async function generateMetadata(): Promise<Metadata> {
  const { intro, copy } = await getCraftPage(await getMode())
  const title = (intro.title ?? copy.breadcrumb.current ?? '').replace(/\n/g, ' ')
  return intro.lead ? { title, description: intro.lead } : { title }
}

export default async function CraftPage() {
  const mode = await getMode()
  const page = await getCraftPage(mode)
  return <CraftView page={page} />
}
