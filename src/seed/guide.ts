// Dữ liệu mẫu cho ảnh chụp trang Hướng dẫn trong admin. Chạy bằng `npm run guide:seed` (DB chieuhoi_test).
// Xoá sạch DB test rồi tạo lại: 2 tài khoản mẫu, 3 ảnh tự sinh bằng sharp, 2 bài viết, 1 người, 1 sản phẩm.
// Không dùng ảnh tham khảo. Mật khẩu ngẫu nhiên chỉ ghi vào .superpowers/guide-users.json (gitignore), không in ra.
// `payload run` chỉ đợi top-level await nên main() phải được await ở cuối file.
import { randomBytes } from 'crypto'
import { mkdirSync, writeFileSync } from 'fs'
import path from 'path'
import type { Payload } from 'payload'

import { assertGuideDatabase, assertGuideMediaDir, assertSeedAllowed } from './guard'
import { sampleImage } from './sampleImage'

const GUIDE_USERS_FILE = path.resolve(process.cwd(), '.superpowers/guide-users.json')

const USERS = {
  reviewer: { email: 'nguoi-duyet@example.com', name: 'Người duyệt (mẫu)', role: 'reviewer' as const },
  editor: { email: 'bien-tap@example.com', name: 'Biên tập viên (mẫu)', role: 'editor' as const },
}

const IMAGES = [
  { code: 'TL-MAU-01', color: '#C3A46C', ink: '#1F1A14', title: 'Ảnh mẫu 1 (mẫu)', alt: 'Ô màu vàng rơm có chữ Ảnh mẫu (mẫu).' },
  { code: 'TL-MAU-02', color: '#344B3D', ink: '#F3EBDD', title: 'Ảnh mẫu 2 (mẫu)', alt: 'Ô màu xanh làng có chữ Ảnh mẫu (mẫu).' },
  { code: 'TL-MAU-03', color: '#A04435', ink: '#F3EBDD', title: 'Ảnh mẫu 3 (mẫu)', alt: 'Ô màu đỏ son có chữ Ảnh mẫu (mẫu).' },
]

/** Rich text một đoạn. */
function paragraph(text: string) {
  return {
    root: {
      type: 'root',
      version: 1,
      direction: 'ltr' as const,
      format: '' as const,
      indent: 0,
      children: [
        {
          type: 'paragraph',
          version: 1,
          direction: 'ltr' as const,
          format: '' as const,
          indent: 0,
          textFormat: 0,
          children: [{ type: 'text', version: 1, text, format: 0, mode: 'normal', style: '', detail: 0 }],
        },
      ],
    },
  }
}

/** Xoá mọi bản ghi của mọi collection (kể cả phiên, khoá tài liệu và tuỳ chọn của người dùng cũ). */
async function wipe(payload: Payload): Promise<void> {
  for (const collection of payload.config.collections) {
    if (collection.slug === 'payload-migrations') continue
    await payload.delete({
      collection: collection.slug as 'users',
      where: { id: { exists: true } },
      overrideAccess: true,
      context: { skipLastReviewerGuard: true },
    })
  }
}

async function seedGuide(payload: Payload): Promise<void> {
  await wipe(payload)

  const passwords = { reviewer: randomBytes(18).toString('base64url'), editor: randomBytes(18).toString('base64url') }
  const reviewer = await payload.create({
    collection: 'users',
    data: { ...USERS.reviewer, password: passwords.reviewer },
    overrideAccess: true,
    context: { skipFirstUserBootstrap: true },
  })
  await payload.create({
    collection: 'users',
    data: { ...USERS.editor, password: passwords.editor },
    overrideAccess: true,
    context: { skipFirstUserBootstrap: true },
  })
  mkdirSync(path.dirname(GUIDE_USERS_FILE), { recursive: true })
  writeFileSync(
    GUIDE_USERS_FILE,
    JSON.stringify(
      {
        reviewer: { email: USERS.reviewer.email, password: passwords.reviewer },
        editor: { email: USERS.editor.email, password: passwords.editor },
      },
      null,
      2,
    ),
    { mode: 0o600 },
  )

  const user = { ...reviewer, collection: 'users' as const }
  const imageIds: number[] = []
  for (const img of IMAGES) {
    const data = await sampleImage(img.color, img.ink)
    const doc = await payload.create({
      collection: 'archive-assets',
      data: {
        code: img.code,
        title: img.title,
        alt: img.alt,
        description: 'Ảnh tự sinh cho trang hướng dẫn (mẫu).',
        category: 'weaving',
        era: 'now',
        rights: 'permitted',
        subjectConsent: 'not_applicable',
      },
      file: { data, mimetype: 'image/png', name: `${img.code}.png`, size: data.length },
      overrideAccess: true,
      user,
    })
    imageIds.push(doc.id)
  }

  const stories = [
    { slug: 'bai-nhap-mau', title: 'Bài viết nháp (mẫu)', workflow: 'draft' as const, cover: imageIds[0] },
    { slug: 'bai-cho-duyet-mau', title: 'Bài viết chờ duyệt (mẫu)', workflow: 'in_review' as const, cover: imageIds[1] },
  ]
  for (const s of stories) {
    await payload.create({
      collection: 'stories',
      data: {
        ...s,
        sapo: 'Đoạn mở đầu ngắn của bài viết (mẫu).',
        category: 'village-memory',
        body: paragraph('Nội dung bài viết viết ở đây (mẫu).') as never,
        _status: 'draft',
      },
      draft: true,
      overrideAccess: true,
      user,
    })
  }

  await payload.create({
    collection: 'people',
    data: {
      slug: 'nguoi-01',
      name: 'Nghệ nhân (mẫu)',
      category: 'artisan',
      role: 'Thợ dệt chiếu (mẫu)',
      intro: 'Câu giới thiệu ngắn (mẫu).',
      portrait: imageIds[2],
      workflow: 'draft',
      _status: 'draft',
    },
    draft: true,
    overrideAccess: true,
    user,
  })

  await payload.create({
    collection: 'products',
    data: {
      slug: 'san-pham-mau',
      code: 'HIỆN VẬT MẪU',
      name: 'Chiếu mẫu (mẫu)',
      group: 'traditional',
      summary: 'Tóm tắt ngắn về sản phẩm (mẫu).',
      images: [imageIds[0]],
      workflow: 'draft',
      _status: 'draft',
    },
    draft: true,
    overrideAccess: true,
    user,
  })
}

async function main() {
  assertGuideDatabase(process.env.DATABASE_URI)
  // Kiểm trước khi nạp payload.config (staticDir đọc MEDIA_DIR lúc nạp): wipe() không được xoá file trong media/ của dev.
  assertGuideMediaDir(process.env.MEDIA_DIR, process.cwd())
  assertSeedAllowed(process.env)
  const { default: config } = await import('../payload.config')
  const { getPayload } = await import('payload')
  const payload = await getPayload({ config: await config })
  await seedGuide(payload)
  const counts: Record<string, number> = {}
  for (const slug of ['users', 'archive-assets', 'stories', 'people', 'products'] as const) {
    counts[slug] = (await payload.count({ collection: slug, overrideAccess: true })).totalDocs
  }
  console.log('Dữ liệu mẫu hướng dẫn xong (mật khẩu ở .superpowers/guide-users.json):', counts)
  await payload.destroy()
  process.exit(0)
}

if (!process.env.VITEST) {
  await main().catch((err) => {
    console.error(err instanceof Error ? err.message : err)
    process.exit(1)
  })
}
