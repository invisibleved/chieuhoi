import { LinkFeature, lexicalEditor } from '@payloadcms/richtext-lexical'

/**
 * Trình soạn thảo cho nội dung công khai: không Upload, không Relationship,
 * liên kết chỉ tới URL ngoài (không trỏ vào document nội bộ). Tránh nhúng document
 * chưa được phép (ảnh, người, thợ) vào nội dung.
 */
export const restrictedEditor = (extra: Parameters<typeof lexicalEditor>[0] extends infer O ? O extends { features?: infer F } ? (F extends (...a: never[]) => (infer R)[] ? R[] : never) : never : never = []) =>
  lexicalEditor({
    features: ({ defaultFeatures }) => [
      ...defaultFeatures.filter((f) => !['upload', 'relationship', 'link'].includes(f.key)),
      LinkFeature({ enabledCollections: [] }),
      ...extra,
    ],
  })
