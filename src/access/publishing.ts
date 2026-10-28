import { Forbidden } from 'payload'
import type {
  CollectionBeforeChangeHook,
  CollectionBeforeOperationHook,
  GlobalBeforeOperationHook,
  PayloadRequest,
  CollectionConfig,
  GlobalBeforeChangeHook,
  GeneratePreviewURL,
  SelectField,
} from 'payload'

import { isLoggedIn, isReviewer, isReviewerUser } from '@/access/roles'
import { previewPathFor, previewUrl } from '@/lib/routes'
import type { PreviewCollection } from '@/lib/routes'

type WorkflowValue = 'idea' | 'draft' | 'in_review' | 'published'

/** Trường trạng thái quy trình biên tập. `idea` chỉ có khi allowIdea. */
export function workflowField(options: { allowIdea?: boolean } = {}): SelectField {
  return {
    name: 'workflow',
    type: 'select',
    label: 'Quy trình',
    defaultValue: 'draft',
    required: true,
    options: [
      ...(options.allowIdea ? [{ label: 'Ý tưởng', value: 'idea' }] : []),
      { label: 'Bản nháp', value: 'draft' },
      { label: 'Chờ duyệt', value: 'in_review' },
      { label: 'Đã đăng', value: 'published' },
    ],
    validate: (value, { req }) => {
      if (value === 'published' && !isReviewerUser(req.user)) {
        return 'Chỉ người duyệt được đặt trạng thái "Đã đăng".'
      }
      return true
    },
    admin: { position: 'sidebar' },
  }
}

const DRAFT_ARG_KEY = 'publishingDraftArg'

/**
 * beforeOperation cho collection và global: ghi lại đối số `draft` của thao tác
 * vào req.context để guardPublish biết đây có phải lưu nháp hay không.
 * Phải đứng trong hooks.beforeOperation cùng với guardPublish.
 */
export const recordDraftArg = ((hookArgs: { args: { draft?: boolean; req: PayloadRequest } }) => {
  const { args } = hookArgs
  args.req.context = { ...args.req.context, [DRAFT_ARG_KEY]: Boolean(args.draft) }
  return args
}) as unknown as CollectionBeforeOperationHook & GlobalBeforeOperationHook

/** Trạng thái của bản chính (đang hiển thị công khai), không phải bản nháp mới nhất. */
async function isLivePublished(args: {
  collection?: { slug: string }
  global?: { slug: string }
  originalDoc?: { id?: number | string }
  req: PayloadRequest
}): Promise<boolean> {
  const { collection, global, originalDoc, req } = args
  if (global) {
    const live = await req.payload.findGlobal({
      slug: global.slug as never,
      draft: false,
      depth: 0,
      overrideAccess: true,
      req,
    })
    return (live as { _status?: string })._status === 'published'
  }
  if (collection && originalDoc?.id !== undefined) {
    const live = await req.payload.findByID({
      collection: collection.slug as never,
      id: originalDoc.id,
      draft: false,
      depth: 0,
      overrideAccess: true,
      req,
    })
    return (live as { _status?: string })._status === 'published'
  }
  return false
}

/**
 * Chặn người không phải reviewer đăng, gỡ đăng hoặc sửa trực tiếp bản đã đăng.
 * Dùng được cho cả collection và global (kèm recordDraftArg ở beforeOperation).
 * - data._status/workflow = 'published' bị chặn (field validate bị bỏ qua khi lưu
 *   nháp nên workflow cũng kiểm ở đây; so với originalDoc vì data mang giá trị cũ).
 * - Khi bản chính đang đăng, chỉ cho lưu nháp (draft:true, tạo version mới). Mọi
 *   cập nhật không phải nháp ghi thẳng vào bản chính nên bị từ chối, kể cả
 *   `_status: 'draft'` (gỡ đăng) hay không có `_status`.
 */
export const guardPublish = (async (args: {
  data?: unknown
  originalDoc?: unknown
  req: PayloadRequest
  collection?: { slug: string }
  global?: { slug: string }
}) => {
  const { data, originalDoc, req } = args
  if (isReviewerUser(req.user)) return data
  const d = (data ?? {}) as { _status?: unknown; workflow?: unknown }
  const wasPublished = (originalDoc as { workflow?: unknown } | undefined)?.workflow === 'published'
  if (d._status === 'published' || (d.workflow === 'published' && !wasPublished)) {
    throw new Forbidden(req.t)
  }
  const isDraftSave = Boolean(req.context?.[DRAFT_ARG_KEY])
  if (
    !isDraftSave &&
    originalDoc &&
    (await isLivePublished({ ...args, originalDoc: originalDoc as { id?: number | string } }))
  ) {
    throw new Forbidden(req.t)
  }
  return data
}) as CollectionBeforeChangeHook & GlobalBeforeChangeHook

/** Reviewer đăng thì workflow thành published (trừ khi là ý tưởng). */
export const syncWorkflow: CollectionBeforeChangeHook = ({ data }) => {
  const d = data as { _status?: string; workflow?: WorkflowValue }
  if (d._status === 'published' && (d.workflow === 'draft' || d.workflow === 'in_review')) {
    return { ...data, workflow: 'published' }
  }
  return data
}

export const contentCollectionDefaults = {
  versions: { drafts: true },
  access: {
    read: isLoggedIn,
    create: isLoggedIn,
    update: isLoggedIn,
    delete: isReviewer,
  },
  hooks: {
    beforeOperation: [recordDraftArg],
    beforeChange: [guardPublish, syncWorkflow],
  },
} satisfies Partial<CollectionConfig>

/** admin.preview: đường dẫn tới trang công khai qua route /preview, hoặc null (ẩn nút). */
export function previewFor(slug: PreviewCollection): GeneratePreviewURL {
  return (doc) => {
    const p = previewPathFor(slug, doc)
    return p ? previewUrl(p) : null
  }
}
