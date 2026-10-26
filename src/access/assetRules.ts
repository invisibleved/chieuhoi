import type { Where } from 'payload'

// Không phụ thuộc gì: luật công khai duy nhất của ảnh, dùng cho cả collection và hàm hiển thị.
export function isAssetPubliclyAllowed(doc: {
  rights?: string | null
  subjectConsent?: string | null
}): boolean {
  return (
    doc.rights === 'permitted' &&
    (doc.subjectConsent === 'not_applicable' || doc.subjectConsent === 'given')
  )
}

/** Cùng luật với isAssetPubliclyAllowed, dạng truy vấn Payload cho khách. */
export const publicAssetQuery: Where = {
  and: [
    { rights: { equals: 'permitted' } },
    { subjectConsent: { in: ['not_applicable', 'given'] } },
  ],
}
