// @vitest-environment node
import { describe, expect, it } from 'vitest'

import { assertGuideDatabase } from '@/seed/guard'
import { GUIDE_SHOTS } from '@/admin/guide/shots'

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
    'trang-dau',
    'tai-anh-chon-file',
    'tai-anh-luu',
    'viet-bai-mo',
    'viet-bai-noi-dung',
    'gui-duyet-quy-trinh',
    'gui-duyet-luu',
    'xem-truoc',
    'menu-dien-thoai',
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
  it('menu-dien-thoai có ảnh điện thoại; mọi ảnh có alt tiếng Việt', () => {
    expect(GUIDE_SHOTS.find((s) => s.id === 'menu-dien-thoai')?.mobile).toBe(true)
    for (const s of GUIDE_SHOTS) {
      expect(s.id).toMatch(/^[a-z0-9-]+$/)
      expect(s.alt.trim().length).toBeGreaterThan(10)
    }
  })
})
