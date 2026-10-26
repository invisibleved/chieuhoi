import { BlocksFeature } from '@payloadcms/richtext-lexical'
import type { CollectionConfig } from 'payload'

import { restrictedEditor } from './restrictedEditor'
import { contentCollectionDefaults, workflowField } from '@/access/publishing'

/** Nguồn duy nhất của nhãn chuyên mục; lớp content map value -> label từ đây. */
export const STORY_CATEGORY_OPTIONS = [
  { label: 'Lịch sử', value: 'history' },
  { label: 'Ký ức làng quê', value: 'village-memory' },
  { label: 'Nghề truyền thống', value: 'traditional-craft' },
  { label: 'Con người', value: 'people' },
  { label: 'Đời sống hôm nay', value: 'life-today' },
]

export const Stories: CollectionConfig = {
  slug: 'stories',
  labels: { singular: 'Bài viết', plural: 'Bài viết' },
  admin: { useAsTitle: 'title', defaultColumns: ['title', 'category', 'workflow'] },
  ...contentCollectionDefaults,
  fields: [
    workflowField({ allowIdea: true }),
    { name: 'slug', type: 'text', label: 'Đường dẫn', required: true, unique: true },
    { name: 'title', type: 'text', label: 'Tiêu đề', localized: true },
    { name: 'sapo', type: 'textarea', label: 'Sapo', localized: true },
    {
      name: 'category',
      type: 'select',
      label: 'Chuyên mục',
      options: STORY_CATEGORY_OPTIONS,
    },
    { name: 'cover', type: 'relationship', relationTo: 'archive-assets', label: 'Ảnh bìa' },
    {
      name: 'body',
      type: 'richText',
      label: 'Nội dung',
      localized: true,
      editor: restrictedEditor([
        BlocksFeature({
          inlineBlocks: [
            {
              slug: 'cite',
              fields: [
                { name: 'source', type: 'relationship', relationTo: 'sources', required: true },
              ],
            },
          ],
        }),
      ]),
    },
    { name: 'editor', type: 'text', label: 'Biên tập viên' },
    { name: 'readingMinutes', type: 'number', label: 'Số phút đọc' },
    { name: 'sources', type: 'relationship', relationTo: 'sources', hasMany: true, label: 'Nguồn' },
  ],
}
