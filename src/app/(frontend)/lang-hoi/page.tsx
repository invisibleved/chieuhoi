import type { Metadata } from 'next'

import { VillageView } from '@/components/village/VillageView'
import { getMode, getVillagePage } from '@/lib/content'

export async function generateMetadata(): Promise<Metadata> {
  const { intro, copy } = await getVillagePage(await getMode())
  const title = (intro.title ?? copy.breadcrumb.current ?? '').replace(/\n/g, ' ')
  return intro.lead ? { title, description: intro.lead } : { title }
}

export default async function LangHoiPage() {
  const mode = await getMode()
  const page = await getVillagePage(mode)
  return <VillageView page={page} />
}
