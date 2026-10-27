// @vitest-environment node
import { describe, expect, it } from 'vitest'

import type { ArchiveAsset, Person } from '@/payload-types'
import { isAssetPubliclyAllowed } from '@/access/assetRules'
import { docNumber, isUnverified, showText, toImageView, toPersonView } from '@/lib/content/visibility'

const asset = (over: Partial<ArchiveAsset> = {}): ArchiveAsset =>
  ({
    id: 1,
    alt: 'Khung dệt',
    url: '/media/a.webp',
    width: 800,
    height: 600,
    rights: 'permitted',
    subjectConsent: 'not_applicable',
    updatedAt: '',
    createdAt: '',
    ...over,
  }) as ArchiveAsset

const person = (over: Partial<Person> = {}): Person =>
  ({
    id: 1,
    workflow: 'published',
    slug: 'nguoi-a',
    name: 'Nguyễn Văn A',
    category: 'artisan',
    role: 'Nghệ nhân',
    portrait: asset(),
    quote: 'Nghề dệt là hồn làng.',
    quoteSource: { id: 2, sourceId: 'vietnamplus-2026', title: 'T', updatedAt: '', createdAt: '' },
    consent: { name: true, photo: true, quote: true },
    updatedAt: '',
    createdAt: '',
    ...over,
  }) as Person

describe('isUnverified', () => {
  it.each([null, undefined, '', '  ', 'Kiểu dệt: [cần xác minh].', '[Cần xác minh]', '[ cần xác minh ]'])(
    'true cho %j',
    (v) => expect(isUnverified(v)).toBe(true),
  )
  it.each(['Sinh tại làng Hải Triều', '[?]'])('false cho %j', (v) => expect(isUnverified(v)).toBe(false))
  it('chấp nhận nhiều khoảng trắng / NBSP', () => {
    expect(isUnverified('[cần  xác minh]')).toBe(true)
    expect(isUnverified('[cần\u00a0xác\u00a0minh]')).toBe(true)
    expect(isUnverified('[\u00a0cần xác minh\u00a0]')).toBe(true)
  })
  it('không có ngoặc thì không phải dấu', () => {
    expect(isUnverified('cần xác minh thêm')).toBe(false)
  })
  it('chuẩn hoá NFC', () => {
    expect(isUnverified('[cần xác minh]'.normalize('NFD'))).toBe(true)
  })
})

describe('dấu chưa xác minh mở rộng', () => {
  const marks = [
    '[cần xác minh]',
    'Ảnh: [tác giả — cần xác minh] · Địa điểm: x',
    '[Nhân vật — cần xin phép trước khi đăng]',
    '[chờ xác minh với cơ sở dệt]',
    '[Cần nguồn]',
  ]
  it.each(marks)('public ẩn, preview giữ nguyên văn: %j', (v) => {
    expect(isUnverified(v)).toBe(true)
    expect(showText(v, 'public')).toBeNull()
    expect(showText(v, 'preview')).toBe(v)
  })
  it('chi phí chấp nhận: [Cần Thơ] bị coi là chưa xác minh, [cần] thì không', () => {
    expect(isUnverified('[Cần Thơ]')).toBe(true)
    expect(isUnverified('[cần]')).toBe(false)
  })
  it.each(['[X] PHÚT ĐỌC', '[1]'])('không khớp %j', (v) => {
    expect(isUnverified(v)).toBe(false)
    expect(showText(v, 'public')).toBe(v)
  })
})

describe('showText', () => {
  it('public ẩn chuỗi unverified', () => {
    expect(showText('Kiểu dệt: [cần xác minh].', 'public')).toBeNull()
    expect(showText('', 'public')).toBeNull()
  })
  it('preview giữ nguyên văn / nhãn khi rỗng', () => {
    expect(showText('Kiểu dệt: [cần xác minh].', 'preview')).toBe('Kiểu dệt: [cần xác minh].')
    expect(showText('', 'preview')).toBe('[cần xác minh]')
    expect(showText(null, 'preview')).toBe('[cần xác minh]')
  })
})

describe('luật ảnh công khai', () => {
  it('subjectConsent null/undefined không công khai', () => {
    expect(toImageView(asset({ subjectConsent: null as never }), 'public')).toBeNull()
    expect(toImageView(asset({ subjectConsent: undefined as never }), 'public')).toBeNull()
    expect(isAssetPubliclyAllowed({ rights: 'permitted', subjectConsent: null })).toBe(false)
    expect(isAssetPubliclyAllowed({ rights: 'permitted' })).toBe(false)
  })
})

describe('toImageView: dấu [cần xác minh]', () => {
  it('public ẩn photographer và code chưa xác minh', () => {
    const v = toImageView(asset({ photographer: '[cần xác minh]', code: '[cần xác minh]' }), 'public')
    expect(v?.photographer).toBeNull()
    expect(v?.code).toBeNull()
  })
  it('public giữ photographer và code hợp lệ', () => {
    const v = toImageView(asset({ photographer: 'Anh A', code: 'TL-001' }), 'public')
    expect(v).toMatchObject({ photographer: 'Anh A', code: 'TL-001' })
  })
})

describe('toImageView', () => {
  it('null/number -> null', () => {
    expect(toImageView(null, 'preview')).toBeNull()
    expect(toImageView(5, 'preview')).toBeNull()
  })
  it('rights unknown: public null, preview có flag', () => {
    const a = asset({ rights: 'unknown' })
    expect(toImageView(a, 'public')).toBeNull()
    expect(toImageView(a, 'preview')?.flags).toContain('rights-not-permitted')
  })
  it('consent pending: public null, preview có flag', () => {
    const a = asset({ subjectConsent: 'pending' })
    expect(toImageView(a, 'public')).toBeNull()
    expect(toImageView(a, 'preview')?.flags).toContain('consent-pending')
  })
  it('ảnh hợp lệ', () => {
    const v = toImageView(asset({ sizes: { card: { url: '/c.webp' } } }), 'public')
    expect(v).toMatchObject({ url: '/media/a.webp', alt: 'Khung dệt', width: 800, flags: [] })
    expect(v?.sizes).toEqual({ card: '/c.webp' })
  })
})

describe('toPersonView', () => {
  it('category là nhãn tiếng Việt từ config; giá trị lạ/rỗng là null', () => {
    expect(toPersonView(person({ category: 'artisan' }), 'public').category).toBe('Nghệ nhân')
    expect(toPersonView(person({ category: 'craft-family' }), 'public').category).toBe('Gia đình làm nghề')
    expect(toPersonView(person({ category: 'khong-co' as never }), 'public').category).toBeNull()
    expect(toPersonView(person({ category: null }), 'public').category).toBeNull()
  })

  it('thiếu consent.name: ẩn tên, giữ ảnh, consentPending', () => {
    const v = toPersonView(person({ consent: { name: false, photo: true, quote: false } }), 'public')
    expect(v.name).toBeNull()
    expect(v.portrait).not.toBeNull()
    expect(v.consentPending).toBe(true)
  })
  it('ảnh rights unknown: không ra public', () => {
    const v = toPersonView(person({ portrait: asset({ rights: 'unknown' }) }), 'public')
    expect(v.portrait).toBeNull()
  })
  it('quote cần quoteSource', () => {
    expect(toPersonView(person({ quoteSource: null }), 'public').quote).toBeNull()
    expect(toPersonView(person({ quoteSource: 3 }), 'public').quote).toBeNull()
  })
  it('quote đủ điều kiện', () => {
    expect(toPersonView(person(), 'public').quote).toEqual({
      text: 'Nghề dệt là hồn làng.',
      sourceId: 'vietnamplus-2026',
    })
  })
  it('đủ consent: không pending', () => {
    const v = toPersonView(person(), 'public')
    expect(v.consentPending).toBe(false)
    expect(v.flags).toEqual([])
  })
  it('preview mọi consent false: hiện giá trị + flag', () => {
    const v = toPersonView(person({ consent: { name: false, photo: false, quote: false } }), 'preview')
    expect(v.name).not.toBeNull()
    expect(v.portrait).not.toBeNull()
    expect(v.quote).not.toBeNull()
    expect(v.flags).toContain('consent-pending')
    expect(new Set(v.flags).size).toBe(v.flags.length)
  })
  it('preview thiếu tên gắn unverified', () => {
    const v = toPersonView(person({ name: '' }), 'preview')
    expect(v.flags).toContain('unverified')
  })
  it('preview không có nguồn: hiện lời trích + unverified', () => {
    const v = toPersonView(person({ quoteSource: null }), 'preview')
    expect(v.quote).toEqual({ text: 'Nghề dệt là hồn làng.', sourceId: '' })
    expect(v.flags).toContain('unverified')
    expect(toPersonView(person({ quoteSource: 3 }), 'preview').quote?.sourceId).toBe('')
  })
  it('preview lời trích chứa dấu: nguyên văn', () => {
    const v = toPersonView(person({ quote: 'Dệt [cần xác minh].' }), 'preview')
    expect(v.quote?.text).toBe('Dệt [cần xác minh].')
    expect(v.flags).toContain('unverified')
  })
  it('public: alt chân dung bỏ khi chưa đồng ý tên', () => {
    const a = asset({ alt: 'Chân dung bà Nguyễn Thị A' })
    const v = toPersonView(person({ portrait: a, consent: { name: false, photo: true, quote: false } }), 'public')
    expect(v.name).toBeNull()
    expect(v.portrait?.alt).toBe('')
    expect(toPersonView(person({ portrait: a }), 'public').portrait?.alt).toBe('Chân dung bà Nguyễn Thị A')
  })
})

describe('docNumber', () => {
  it('lấy phần số của mã TL-<số>, mã khác trả null', () => {
    expect(docNumber('TL-002')).toBe('002')
    expect(docNumber('XX-1')).toBeNull()
    expect(docNumber('[cần xác minh]')).toBeNull()
    expect(docNumber(null)).toBeNull()
  })
  it('toImageView điền docNumber từ code đã lọc', () => {
    expect(toImageView(asset({ code: 'TL-007' }), 'public')?.docNumber).toBe('007')
    expect(toImageView(asset({ code: '[cần xác minh]' }), 'public')?.docNumber).toBeNull()
  })
})
