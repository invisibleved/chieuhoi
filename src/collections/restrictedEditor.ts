import { LinkFeature, lexicalEditor } from '@payloadcms/richtext-lexical'
import type { Block } from 'payload'

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

/**
 * Khối chú thích nguồn trong dòng (cite): lớp content đánh số theo lần trích đầu tiên và dẫn tới danh sách
 * "Ghi chú nguồn" (R4). Dùng chung cho thân bài (Stories.body) và câu chuyện chân dung (People.story).
 * Hàm trả bản mới mỗi lần: Payload sửa trực tiếp cấu hình block khi sanitize.
 */
export const citeInlineBlock = (): Block => ({
  slug: 'cite',
  fields: [{ name: 'source', type: 'relationship', relationTo: 'sources', required: true }],
})
