import { Forbidden } from 'payload'
import type {
  CollectionBeforeChangeHook,
  CollectionConfig,
  GlobalBeforeChangeHook,
  SelectField,
} from 'payload'

import { isLoggedIn, isReviewer, isReviewerUser } from '@/access/roles'

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

/**
 * Chặn người không phải reviewer đăng. Dùng được cho cả collection và global.
 * Payload đã gán data._status = 'published' cho update không draft, và 'draft'
 * cho draft:true; lưu nháp trên bản đã đăng chỉ tạo version mới, không gỡ đăng.
 * Validate của field bị bỏ qua khi lưu nháp, nên workflow cũng kiểm ở đây.
 */
export const guardPublish: CollectionBeforeChangeHook & GlobalBeforeChangeHook = ({
  data,
  originalDoc,
  req,
}) => {
  if (isReviewerUser(req.user)) return data
  const d = (data ?? {}) as { _status?: unknown; workflow?: unknown }
  const wasPublished = (originalDoc as { workflow?: unknown } | undefined)?.workflow === 'published'
  // data của update có thể mang sẵn workflow cũ: chỉ chặn khi là thay đổi mới.
  if (d._status === 'published' || (d.workflow === 'published' && !wasPublished)) {
    throw new Forbidden(req.t)
  }
  return data
}

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
  hooks: { beforeChange: [guardPublish, syncWorkflow] },
} satisfies Partial<CollectionConfig>
