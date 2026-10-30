import { villageFactsFrom } from '@/lib/content/pageFacts'
import { villageCopy } from '@/lib/content/copy/village'
import { mergeVillageCopy as merge } from '@/lib/content/villageMerge'
import { villageFactsSeed } from '@/seed/data/pageFacts'
import { mapSourceRefs } from '@/seed/pageFacts'

/** Dữ kiện Làng Hới như pages.ts đọc từ CMS (seed, quan hệ nguồn đã populate). */
export const seedVillageFacts = villageFactsFrom(
  mapSourceRefs(villageFactsSeed, (id) => ({ sourceId: id })) as Record<string, unknown>,
)

export const mergeVillageCopy = (f = seedVillageFacts) => merge(villageCopy, f)
