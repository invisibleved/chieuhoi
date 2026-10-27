// View model của /thu-vien. Dùng lại getArchive (đã lọc quyền đăng và consent) của createContent.
import type { Payload } from 'payload'

import { archiveCategoryOptions, archiveEraLabel } from './categories'
import { applyMode } from './copy/applyMode'
import { archiveCopy } from './copy/archive'
import type { createContent } from './queries'
import type { ArchivePageView, Mode } from './types'

type Content = ReturnType<typeof createContent>

// payload để cùng dạng với createProducts/createPeople; truy vấn đi qua content.
export function createArchive(_payload: Payload, content: Content) {
  async function getArchivePage(mode: Mode): Promise<ArchivePageView> {
    const [intro, items] = await Promise.all([content.getPageIntro('thu-vien', mode), content.getArchive(mode)])
    return {
      intro,
      items,
      stats: { total: items.length, verified: items.filter((i) => i.sourceVerified).length },
      // R13: mọi chủ đề, kể cả nhóm chưa có ảnh.
      categories: [{ key: 'all', label: archiveCopy.filter.all }, ...archiveCategoryOptions],
      eras: [
        { key: 'all', label: archiveCopy.filter.eraAll },
        { key: 'old', label: archiveEraLabel('old') ?? 'Xưa' },
        { key: 'now', label: archiveEraLabel('now') ?? 'Nay' },
      ],
      hasOld: items.some((i) => i.era === 'old'),
      copy: applyMode(archiveCopy, mode),
    }
  }

  return { getArchivePage }
}
