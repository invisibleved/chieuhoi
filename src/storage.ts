import { s3Storage } from '@payloadcms/storage-s3'
import type { Plugin } from 'payload'

type Env = Record<string, string | undefined>

/**
 * Lưu ảnh tư liệu trên S3/R2 khi có S3_BUCKET; không có thì plugin tắt và Payload lưu vào media/ (dev).
 * alwaysInsertFields: plugin luôn thêm cột `prefix`/`_objectKey`, kể cả khi tắt, để schema (và migration)
 * giống nhau giữa dev và staging/production.
 * R7: không bật disablePayloadAccessControl, file vẫn đi qua Payload và quyền đọc của collection.
 * R8: clientUploads để ảnh tải thẳng từ trình duyệt lên bucket (cần CORS PUT, xem docs/DEPLOY.md).
 */
export function storagePlugins(env: Env, factory: typeof s3Storage = s3Storage): Plugin[] {
  return [
    factory({
      enabled: Boolean(env.S3_BUCKET),
      alwaysInsertFields: true,
      collections: { 'archive-assets': true },
      bucket: env.S3_BUCKET ?? '',
      clientUploads: true,
      config: {
        endpoint: env.S3_ENDPOINT,
        region: env.S3_REGION ?? 'auto',
        forcePathStyle: true,
        credentials: {
          accessKeyId: env.S3_ACCESS_KEY_ID ?? '',
          secretAccessKey: env.S3_SECRET_ACCESS_KEY ?? '',
        },
      },
    }),
  ]
}
