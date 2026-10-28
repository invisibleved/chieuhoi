import { afterEach, describe, expect, it } from 'vitest'
import { cleanup, render, screen } from '@testing-library/react'
import { ArchiveView } from '@/components/archive/ArchiveView'
import { applyMode } from '@/lib/content/copy/applyMode'
import { archiveCopy } from '@/lib/content/copy/archive'
import type { ArchiveItemView, ArchivePageView } from '@/lib/content'

afterEach(cleanup)

const one = {
  image: { url: '/x.webp', alt: 'Alt', width: 800, height: 600, sizes: {}, photographer: null, code: 'TL-001', docNumber: '001', flags: [] },
  title: 'Tiêu đề', description: null, category: 'village', categoryLabel: 'Làng quê', era: 'now', eraLabel: 'Nay',
  related: null, flags: [], code: 'TL-001', displayCode: '001', docLabel: 'TL · 001', chipLabel: 'TL · 001 · Làng quê', name: 'Tiêu đề', takenAt: null, photographer: null, source: null,
  rights: { desktop: 'Được phép', mobile: 'Được phép' }, sourceVerified: false,
} as unknown as ArchiveItemView

function page(items: ArchiveItemView[]): ArchivePageView {
  return {
    intro: { eyebrow: '06 — THƯ VIỆN', title: 'Ký ức qua\ntừng khung hình.', lead: 'Kho ảnh.', heroTitle: null },
    items,
    stats: { total: items.length, verified: 0 },
    categories: [{ key: 'all', label: 'Tất cả' }, { key: 'village', label: 'Làng quê' }],
    eras: [{ key: 'all', label: 'Mọi thời kỳ' }, { key: 'old', label: 'Xưa' }, { key: 'now', label: 'Nay' }],
    hasOld: false,
    copy: applyMode(archiveCopy, 'public'),
  }
}

describe('ArchiveView', () => {
  it('h1, hai số liệu, CtaBand mời góp tư liệu', () => {
    render(<ArchiveView page={page([one])} initialCode={null} />)
    expect(screen.getAllByRole('heading', { level: 1 })).toHaveLength(1)
    expect(screen.getByText('TƯ LIỆU')).toBeTruthy()
    expect(screen.getByText('ĐÃ XÁC MINH NGUỒN')).toBeTruthy()
    expect(screen.getByRole('heading', { name: 'Nhà bạn còn giữ ảnh cũ của làng?' })).toBeTruthy()
  })
  it('không có tư liệu: khung trống và "0 tư liệu"', () => {
    render(<ArchiveView page={page([])} initialCode={null} />)
    expect(screen.getByText('Chưa có tư liệu trong nhóm này')).toBeTruthy()
    expect(screen.getByRole('status').textContent).toBe('0 tư liệu')
  })
})
