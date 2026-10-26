import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { previewNotes, productTag, storyStatus } from '@/components/content/labels'
import { ArchiveChip, DocumentLabel } from '@/components/content/DocumentLabel'
import { ShotNeeded } from '@/components/content/ShotNeeded'
import { Tag } from '@/components/content/Tag'
import { VerifyNote } from '@/components/content/VerifyNote'

describe('labels', () => {
  it('storyStatus', () => {
    expect(storyStatus(['unpublished', 'idea'])).toBe('Chủ đề đề xuất')
    expect(storyStatus(['unpublished'])).toBe('Bản nháp')
    expect(storyStatus([])).toBeNull()
  })
  it('productTag', () => {
    expect(productTag({ image: null, typeConfirmed: false })).toEqual({ text: 'Chưa có ảnh', style: 'dashed' })
    expect(productTag({ image: {}, typeConfirmed: false })).toEqual({ text: 'Ảnh cần xác nhận loại', style: 'filled' })
    expect(productTag({ image: {}, typeConfirmed: true })).toBeNull()
  })
  it('previewNotes', () => {
    expect(previewNotes(['rights-not-permitted', 'unverified', 'unpublished'])).toEqual([
      'Ảnh chưa được phép đăng',
      '[cần xác minh]',
    ])
  })
  it('ArchiveChip in hoa chủ đề', () => {
    render(<ArchiveChip code="021" category="Làng quê" />)
    expect(screen.getByText('TL · 021 · LÀNG QUÊ')).toBeTruthy()
  })
  it('DocumentLabel hiện mã, tiêu đề, meta', () => {
    render(<DocumentLabel code="001" title="Chiếu cói" meta="Hải Triều" />)
    expect(screen.getByText('TƯ LIỆU · 001')).toBeTruthy()
    expect(screen.getByText('Chiếu cói')).toBeTruthy()
    expect(screen.getByText('Hải Triều')).toBeTruthy()
  })
  it('Tag overlay có chấm aria-hidden', () => {
    const { container } = render(<Tag variant="overlay">Chờ đồng ý</Tag>)
    expect(screen.getByText('Chờ đồng ý')).toBeTruthy()
    expect(container.querySelector('[aria-hidden="true"]')).not.toBeNull()
  })
  it('VerifyNote render p', () => {
    const { container } = render(<VerifyNote size="sm">[CẦN XÁC MINH] x</VerifyNote>)
    expect(container.querySelector('p')?.textContent).toBe('[CẦN XÁC MINH] x')
  })
  it('ShotNeeded có tiêu đề ẢNH CẦN CHỤP và mô tả', () => {
    render(<ShotNeeded description="Chiếu trơn chụp phẳng" />)
    expect(screen.getByText('ẢNH CẦN CHỤP')).toBeTruthy()
    expect(screen.getByText('Chiếu trơn chụp phẳng')).toBeTruthy()
    expect(screen.getByRole('img').getAttribute('aria-label')).toBe('Ảnh cần chụp: Chiếu trơn chụp phẳng')
  })
})
