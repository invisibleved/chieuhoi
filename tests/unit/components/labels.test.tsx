import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { previewNotes, productTag, storyStatus } from '@/components/content/labels'
import { ArchiveChip, DocumentLabel, DocumentLine } from '@/components/content/DocumentLabel'
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
  it('ArchiveChip in hoa chủ đề, nhãn lấy từ props', () => {
    const { container } = render(<ArchiveChip label="TL" code="021" category="Làng quê" />)
    expect(container.textContent).toBe('TL · 021 · LÀNG QUÊ')
  })
  it('ArchiveChip overlay: chủ đề chỉ hiện từ md', () => {
    render(<ArchiveChip overlay label="TL" code="021" category="Làng quê" />)
    expect(screen.getByText('· LÀNG QUÊ', { exact: false }).className).toContain('max-md:hidden')
  })
  it('DocumentLabel hiện mã, tiêu đề, meta; nhãn mã lấy từ props', () => {
    const { rerender } = render(<DocumentLabel label="TƯ LIỆU" code="001" title="Chiếu cói" meta="Hải Triều" />)
    expect(screen.getByText('TƯ LIỆU · 001')).toBeTruthy()
    expect(screen.getByText('Chiếu cói')).toBeTruthy()
    expect(screen.getByText('Hải Triều')).toBeTruthy()
    rerender(<DocumentLabel label={null} code="001" title="Chiếu cói" />)
    expect(screen.queryByText(/· 001/)).toBeNull()
  })
  it('DocumentLabel overlay: nền cói, không viền', () => {
    const { container } = render(<DocumentLabel variant="overlay" label="TƯ LIỆU" code="014" title="Dệt chiếu" />)
    const box = container.firstElementChild!
    expect(box.className).toContain('bg-bg-primary')
    expect(box.className).not.toContain('border')
  })
  it('DocumentLine: "TL · n · chú thích"; thiếu mã thì chỉ chú thích; rỗng thì không render', () => {
    const { container, rerender } = render(<DocumentLine label="TL" code="021" caption="Chiếu phơi" />)
    expect(container.textContent).toBe('TL · 021 · Chiếu phơi')
    rerender(<DocumentLine label="TL" code={null} caption="Chiếu phơi" />)
    expect(container.textContent).toBe('Chiếu phơi')
    rerender(<DocumentLine label="TL" code={null} caption={null} />)
    expect(container.innerHTML).toBe('')
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

describe('ShotNeeded không mô tả', () => {
  it('light và dark: chỉ ẢNH CẦN CHỤP, aria-label Ảnh cần chụp', () => {
    const { rerender } = render(<ShotNeeded />)
    expect(screen.getByRole('img').getAttribute('aria-label')).toBe('Ảnh cần chụp')
    expect(screen.getByText('ẢNH CẦN CHỤP')).toBeTruthy()
    rerender(<ShotNeeded tone="dark" />)
    expect(screen.getByRole('img').getAttribute('aria-label')).toBe('Ảnh cần chụp')
  })
})
