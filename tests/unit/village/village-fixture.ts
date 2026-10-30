import { villageFactsFrom } from '@/lib/content/pageFacts'
import { villageCopy } from '@/lib/content/copy/village'
import { villageFactsSeed } from '@/seed/data/pageFacts'
import { mapSourceRefs } from '@/seed/pageFacts'

/** Dữ kiện Làng Hới như pages.ts đọc từ CMS (seed, quan hệ nguồn đã populate). */
export const seedVillageFacts = villageFactsFrom(
  mapSourceRefs(villageFactsSeed, (id) => ({ sourceId: id })) as Record<string, unknown>,
)

/** Gộp dữ kiện vào khung `villageCopy`, giống getVillagePage. */
export function mergeVillageCopy(f = seedVillageFacts) {
  return {
    ...villageCopy,
    founder: {
      ...villageCopy.founder,
      paragraphs: f.founder.paragraphs,
      conflict: { ...villageCopy.founder.conflict, parts: f.founder.conflict.parts, preview: { closing: f.founder.conflict.closing } },
      noPortrait: f.founder.noPortrait,
    },
    location: { ...villageCopy.location, body: f.location.body, preview: { ...villageCopy.location.preview, note: f.location.note } },
    heritage: { ...villageCopy.heritage, paragraphs: f.heritage.paragraphs, preview: { note: f.heritage.note } },
  }
}
