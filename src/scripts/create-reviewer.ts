// Tạo người duyệt từ REVIEWER_EMAIL / REVIEWER_PASSWORD nếu chưa có. Chạy ở mọi APP_ENV.
import { getPayload } from 'payload'

async function main() {
  const email = process.env.REVIEWER_EMAIL
  const password = process.env.REVIEWER_PASSWORD
  if (!email || !password) throw new Error('Thiếu REVIEWER_EMAIL / REVIEWER_PASSWORD.')
  const { default: config } = await import('../payload.config')
  const payload = await getPayload({ config: await config })
  const found = await payload.find({
    collection: 'users',
    where: { email: { equals: email } },
    limit: 1,
    overrideAccess: true,
  })
  if (found.docs[0]) {
    console.log('Người duyệt đã tồn tại, bỏ qua.')
  } else {
    await payload.create({
      collection: 'users',
      data: { email, password, name: 'Người duyệt', role: 'reviewer' },
      overrideAccess: true,
      context: { skipFirstUserBootstrap: true },
    })
    console.log('Đã tạo người duyệt:', email)
  }
  await payload.destroy()
  process.exit(0)
}

await main().catch((err) => {
  console.error(err)
  process.exit(1)
})
