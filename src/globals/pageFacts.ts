import type { Field } from 'payload'

const sourcesField = (label = 'Nguồn'): Field => ({
  name: 'sources', type: 'relationship', relationTo: 'sources', hasMany: true, label,
})

/** Một câu kèm nguồn, bản ngắn cho điện thoại và cờ ẩn trên điện thoại. */
export const citedSentenceFields = (opts: { required?: boolean } = {}): Field[] => [
  { name: 'text', type: 'textarea', label: 'Câu', required: opts.required ?? true, localized: true },
  { name: 'mobileText', type: 'textarea', label: 'Bản ngắn cho điện thoại', localized: true },
  { name: 'hideOnMobile', type: 'checkbox', label: 'Ẩn trên điện thoại' },
  sourcesField(),
]

export const pageSourcesField = (): Field => ({
  name: 'pageSources',
  type: 'relationship',
  relationTo: 'sources',
  hasMany: true,
  label: 'Nguồn tham khảo của trang',
  admin: { isSortable: true, description: 'Số [1], [2]… trên trang theo đúng thứ tự này.' },
})

const citedGroup = (name: string, label: string, required: boolean): Field => ({
  name, type: 'group', label, fields: citedSentenceFields({ required }),
})

export const villageFactsFields = (): Field[] => [
  {
    name: 'facts', type: 'array', label: 'Bảng thông tin đầu trang', labels: { singular: 'Dòng', plural: 'Các dòng' },
    admin: { components: { RowLabel: { path: '/admin/FieldRowLabel#FieldRowLabel', clientProps: { field: 'term', fallback: 'Dòng' } } } },
    fields: [
      { name: 'term', type: 'text', label: 'Mục', required: true, localized: true },
      { name: 'detail', type: 'textarea', label: 'Nội dung', required: true, localized: true },
      { name: 'detailMobile', type: 'textarea', label: 'Bản ngắn cho điện thoại', localized: true },
      { name: 'note', type: 'textarea', label: 'Ghi chú', localized: true },
      { name: 'noteMobile', type: 'textarea', label: 'Ghi chú ngắn cho điện thoại', localized: true },
      { name: 'editorNote', type: 'textarea', label: 'Ghi chú biên tập (chỉ hiện ở bản xem trước)', localized: true },
      sourcesField(),
    ],
  },
  {
    name: 'founder', type: 'group', label: 'Tổ nghề',
    fields: [
      {
        name: 'paragraphs', type: 'array', label: 'Đoạn', labels: { singular: 'Đoạn', plural: 'Các đoạn' }, dbName: 'lh_founder_paras',
        fields: [{ name: 'sentences', type: 'array', label: 'Câu', labels: { singular: 'Câu', plural: 'Các câu' }, dbName: 'lh_founder_sents', fields: citedSentenceFields() }],
      },
      { name: 'conflict', type: 'array', label: 'Hộp Các nguồn chưa thống nhất', labels: { singular: 'Câu', plural: 'Các câu' }, fields: citedSentenceFields() },
      { name: 'conflictEditorNote', type: 'textarea', label: 'Ghi chú biên tập cuối hộp', localized: true },
      { name: 'noPortrait', type: 'text', label: 'Dòng không có chân dung', localized: true },
    ],
  },
  {
    name: 'location', type: 'group', label: 'Vị trí',
    fields: [
      { name: 'text', type: 'textarea', label: 'Câu mô tả', localized: true },
      sourcesField(),
      { name: 'editorNote', type: 'textarea', label: 'Ghi chú biên tập', localized: true },
    ],
  },
  {
    name: 'heritage', type: 'group', label: 'Di sản hôm nay',
    fields: [
      { name: 'sentences', type: 'array', label: 'Câu', labels: { singular: 'Câu', plural: 'Các câu' }, dbName: 'lh_heritage_sents', fields: citedSentenceFields() },
      { name: 'editorNote', type: 'textarea', label: 'Ghi chú biên tập', localized: true },
    ],
  },
  pageSourcesField(),
]

export const craftFactsFields = (): Field[] => [
  {
    name: 'tools', type: 'array', label: 'Dụng cụ', labels: { singular: 'Dụng cụ', plural: 'Các dụng cụ' }, maxRows: 3,
    admin: {
      description: 'Ảnh lấy từ ô ảnh Dụng cụ 1–3 theo thứ tự dòng.',
      components: { RowLabel: { path: '/admin/FieldRowLabel#FieldRowLabel', clientProps: { field: 'name', fallback: 'Dụng cụ' } } },
    },
    fields: [
      { name: 'name', type: 'text', label: 'Tên dụng cụ', required: true, localized: true },
      citedGroup('note', 'Ghi chú', false),
    ],
  },
  {
    name: 'hand', type: 'group', label: 'Thẻ Dệt thủ công',
    fields: [
      { name: 'title', type: 'text', label: 'Tiêu đề thẻ', localized: true },
      citedGroup('text', 'Mô tả', false),
      citedGroup('note', 'Ghi chú', false),
    ],
  },
  {
    name: 'machine', type: 'group', label: 'Thẻ Dệt bằng máy',
    fields: [
      { name: 'title', type: 'text', label: 'Tiêu đề thẻ', localized: true },
      citedGroup('text', 'Mô tả', false),
      citedGroup('note', 'Ghi chú', false),
    ],
  },
  {
    name: 'compareRows', type: 'array', label: 'Bảng so sánh', labels: { singular: 'Hàng', plural: 'Các hàng' }, dbName: 'ndc_compare',
    admin: { components: { RowLabel: { path: '/admin/FieldRowLabel#FieldRowLabel', clientProps: { field: 'aspect', fallback: 'Hàng' } } } },
    fields: [
      { name: 'aspect', type: 'text', label: 'Khía cạnh', required: true, localized: true },
      { name: 'hand', type: 'textarea', label: 'Thủ công', localized: true },
      { name: 'machine', type: 'textarea', label: 'Bằng máy', localized: true },
      {
        name: 'mobile', type: 'textarea', label: 'Dòng cho điện thoại', localized: true,
        admin: { description: 'Mỗi dòng một ý. Để trống thì tự ghép: Thủ công: … · Máy: …' },
      },
      sourcesField(),
    ],
  },
  pageSourcesField(),
]
