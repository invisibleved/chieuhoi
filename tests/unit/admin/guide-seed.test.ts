// @vitest-environment node
import { describe, expect, it } from 'vitest'

import path from 'path'

import { assertGuideDatabase, assertGuideMediaDir } from '@/seed/guard'
import { GUIDE_SHOTS } from '@/admin/guide/shots'
import { forbiddenImageSources, srcsetUrls } from '../../e2e/helpers/guideSafety'

describe('assertGuideMediaDir', () => {
  const root = '/repo'
  it('chặn khi thiếu MEDIA_DIR', () => {
    expect(() => assertGuideMediaDir(undefined, root)).toThrow(/MEDIA_DIR/)
    expect(() => assertGuideMediaDir('', root)).toThrow(/MEDIA_DIR/)
  })
  it('chặn media/ của dev và thư mục con của nó', () => {
    expect(() => assertGuideMediaDir('/repo/media', root)).toThrow(/media/)
    expect(() => assertGuideMediaDir('/repo/media/', root)).toThrow()
    expect(() => assertGuideMediaDir('media', root)).toThrow()
    expect(() => assertGuideMediaDir('/repo/media/guide', root)).toThrow()
    expect(() => assertGuideMediaDir('/repo/.superpowers/../media', root)).toThrow()
  })
  it('cho qua thư mục riêng của hướng dẫn', () => {
    expect(() => assertGuideMediaDir(path.join(root, '.superpowers/guide-media'), root)).not.toThrow()
    expect(() => assertGuideMediaDir('/repo/media-guide', root)).not.toThrow()
    expect(() => assertGuideMediaDir('/tmp/chieuhoi-guide', root)).not.toThrow()
  })
})

describe('forbiddenImageSources', () => {
  const sample = 'http://localhost:3300/api/archive-assets/file/TL-MAU-01-480x320.webp'
  it('cho qua ảnh mẫu, blob và ảnh không phải tư liệu', () => {
    expect(
      forbiddenImageSources([
        sample,
        '/api/archive-assets/file/TL-MAU-03.png?2026',
        '/_next/image?url=%2Fapi%2Farchive-assets%2Ffile%2FTL-MAU-02-960x640.webp&w=640&q=75',
        'blob:http://localhost:3300/abc',
        '/admin-guide/x.png',
      ]),
    ).toEqual([])
  })
  it('bắt ảnh tham khảo, kể cả dạng mã hoá', () => {
    const bad = [
      '/images/reference/lang-hoi.webp',
      'http://localhost:3300/images/reference/a.webp',
      '/_next/image?url=%2Fimages%2Freference%2Fa.webp&w=640',
      '/_next/image?url=%252Fimages%252Freference%252Fa.webp',
    ]
    expect(forbiddenImageSources(bad)).toEqual(bad)
  })
  it('bắt file tư liệu ảnh không phải ảnh mẫu', () => {
    const bad = [
      '/api/archive-assets/file/TL-001.webp',
      '/api/archive-assets/file/0c7e4d1a-uuid.png',
      '/_next/image?url=%2Fapi%2Farchive-assets%2Ffile%2FTL-001-480x320.webp&w=640',
      '/api/archive-assets/file/TL-MAU-01.jpg',
    ]
    expect(forbiddenImageSources(bad)).toEqual(bad)
  })
  it('tách srcset', () => {
    expect(srcsetUrls('/a.webp 480w, /b.webp 960w')).toEqual(['/a.webp', '/b.webp'])
    expect(srcsetUrls('')).toEqual([])
  })
})

describe('assertGuideDatabase', () => {
  it('chặn DB dev', () => {
    expect(() => assertGuideDatabase('postgres://postgres:postgres@localhost:5433/chieuhoi')).toThrow(/chieuhoi_test/)
  })
  it('chặn khi thiếu DATABASE_URI', () => {
    expect(() => assertGuideDatabase(undefined)).toThrow(/chieuhoi_test/)
    expect(() => assertGuideDatabase('')).toThrow(/chieuhoi_test/)
  })
  it('chặn khi chieuhoi_test chỉ nằm ngoài tên DB', () => {
    expect(() => assertGuideDatabase('postgres://chieuhoi_test:pw@localhost:5433/chieuhoi')).toThrow()
    expect(() => assertGuideDatabase('postgres://u:p@localhost:5433/chieuhoi?app=chieuhoi_test')).toThrow()
    expect(() => assertGuideDatabase('khong-phai-uri chieuhoi_test')).toThrow()
  })
  it('cho qua DB test', () => {
    expect(() => assertGuideDatabase('postgres://postgres:postgres@localhost:5433/chieuhoi_test')).not.toThrow()
  })
  it('thông báo không lộ mật khẩu trong URI', () => {
    expect(() => assertGuideDatabase('postgres://u:bi-mat-123@localhost:5433/chieuhoi')).toThrow(
      expect.objectContaining({ message: expect.not.stringContaining('bi-mat-123') }),
    )
  })
})

describe('GUIDE_SHOTS', () => {
  const REQUIRED = [
    'dang-nhap',
    'mo-menu',
    'menu-huong-dan',
    'trang-dau',
    'tai-anh-mo',
    'tai-anh-chon-file',
    'tai-anh-luu',
    'viet-bai-mo',
    'viet-bai-noi-dung',
    'gui-duyet-quy-trinh',
    'gui-duyet-luu',
    'xem-truoc',
    'loi-o-thieu',
    'duyet-danh-sach',
    'duyet-quyen-anh',
    'duyet-dang',
    'tao-tai-khoan',
  ]
  it('có đủ các id bắt buộc, không trùng', () => {
    const ids = GUIDE_SHOTS.map((s) => s.id)
    expect(new Set(ids).size).toBe(ids.length)
    for (const id of REQUIRED) expect(ids).toContain(id)
  })
  it('mo-menu có ảnh điện thoại; mọi ảnh có alt tiếng Việt', () => {
    expect(GUIDE_SHOTS.find((s) => s.id === 'mo-menu')?.mobile).toBe(true)
    for (const s of GUIDE_SHOTS) {
      expect(s.id).toMatch(/^[a-z0-9-]+$/)
      expect(s.alt.trim().length).toBeGreaterThan(10)
    }
  })
})
