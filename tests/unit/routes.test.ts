import { describe, expect, it } from 'vitest'

import { previewPathFor, previewUrl, safeInternalPath } from '@/lib/routes'
import type { PreviewCollection } from '@/lib/routes'

describe('routes', () => {
  it.each([
    ['stories', { slug: 'chuyen-a', workflow: 'draft' }, '/cau-chuyen/chuyen-a'],
    ['stories', { slug: 'y-tuong', workflow: 'idea' }, '/cau-chuyen'],
    ['stories', { workflow: 'draft' }, '/cau-chuyen'],
    ['people', { slug: 'ba-a' }, '/con-nguoi/ba-a'],
    ['people', {}, '/con-nguoi'],
    ['products', { slug: 'chieu 1' }, '/san-pham/chieu%201'],
    ['craft-steps', {}, '/nghe-det-chieu'],
    ['timeline-events', {}, '/lang-hoi'],
    ['makers', {}, '/san-pham'],
    ['archive-assets', { inArchive: true, code: 'TL-001' }, '/thu-vien?anh=TL-001'],
    ['archive-assets', { inArchive: false, code: 'TL-001' }, null],
    ['archive-assets', { inArchive: true }, null],
    ['site-settings', {}, '/'],
    ['page-intros', {}, '/'],
  ])('previewPathFor %s', (slug, doc, out) =>
    expect(previewPathFor(slug as PreviewCollection, doc)).toBe(out))

  it.each([
    ['/cau-chuyen/a', '/cau-chuyen/a'],
    ['/thu-vien?anh=TL-001', '/thu-vien?anh=TL-001'],
    ['//evil.example', '/'],
    ['/\\evil.example', '/'],
    ['https://evil.example', '/'],
    ['/%2F%2Fevil.example', '/'],
    ['javascript:alert(1)', '/'],
    ['', '/'],
    [null, '/'],
    [undefined, '/'],
    ['/admin', '/'],
    ['/admin?x=1', '/'],
    ['/admin/collections/users', '/'],
    ['/api', '/'],
    ['/api/users', '/'],
    ['/administrator', '/administrator'],
    ['/a\nb', '/'],
    ['/%E0%A4%A', '/'],
  ])('safeInternalPath(%j)', (raw, out) => expect(safeInternalPath(raw)).toBe(out))

  it('previewUrl mã hoá path', () =>
    expect(previewUrl('/thu-vien?anh=TL-001')).toBe('/preview?path=%2Fthu-vien%3Fanh%3DTL-001'))
})
