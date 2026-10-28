import { withPayload } from '@payloadcms/next/withPayload'
import type { NextConfig } from 'next'
import path from 'path'
import { fileURLToPath } from 'url'
import { assertDeployEnv } from './src/lib/env'

// Dừng build sớm khi cấu hình deploy thiếu hoặc nguy hiểm.
assertDeployEnv(process.env)

const __filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(__filename)

const nextConfig: NextConfig = {
  images: {
    // Dùng cỡ thumb/card/wide Payload tạo sẵn, không qua bộ tối ưu ảnh của Next.
    unoptimized: true,
    localPatterns: [
      {
        pathname: '/api/archive-assets/file/**',
      },
      // Ảnh tham khảo chỉ dùng cho dev/preview, không vào bản production.
      ...(process.env.APP_ENV !== 'production' ? [{ pathname: '/images/reference/**' }] : []),
    ],
  },
  webpack: (webpackConfig) => {
    webpackConfig.resolve.extensionAlias = {
      '.cjs': ['.cts', '.cjs'],
      '.js': ['.ts', '.tsx', '.js', '.jsx'],
      '.mjs': ['.mts', '.mjs'],
    }

    return webpackConfig
  },
  turbopack: {
    root: path.resolve(dirname),
  },
}

export default withPayload(nextConfig, { devBundleServerPackages: false })
