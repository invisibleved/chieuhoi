import { postgresAdapter } from '@payloadcms/db-postgres'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import path from 'path'
import { buildConfig } from 'payload'
import { fileURLToPath } from 'url'
import sharp from 'sharp'
import { vi } from '@payloadcms/translations/languages/vi'

import { ArchiveAssets } from './collections/ArchiveAssets'
import { CraftSteps } from './collections/CraftSteps'
import { Makers } from './collections/Makers'
import { People } from './collections/People'
import { Products } from './collections/Products'
import { Stories } from './collections/Stories'
import { Sources } from './collections/Sources'
import { TimelineEvents } from './collections/TimelineEvents'
import { Users } from './collections/Users'
import { storagePlugins } from './storage'
import { defaultLayout, dashboardWidgets } from './admin/dashboard/layout'
import { PageIntros } from './globals/PageIntros'
import { SiteSettings } from './globals/SiteSettings'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

const config = buildConfig({
  admin: {
    user: Users.slug,
    meta: { titleSuffix: ' — Chiếu Hới' },
    theme: 'light',
    components: {
      graphics: { Logo: '/admin/Logo#Logo', Icon: '/admin/Icon#Icon' },
      Nav: '/admin/Nav#Nav',
      providers: ['/admin/AdminFonts#AdminFonts'],
      afterLogin: ['/admin/LoginHelp#LoginHelp'],
      afterNavLinks: ['/admin/guide/GuideNavLink#GuideNavLink'],
      views: {
        huongDan: { Component: '/admin/guide/GuideView#GuideView', path: '/huong-dan', exact: true },
      },
    },
    dashboard: { widgets: dashboardWidgets, defaultLayout },
    importMap: {
      baseDir: path.resolve(dirname),
    },
  },
  collections: [Users, Sources, TimelineEvents, ArchiveAssets, CraftSteps, Products, Stories, People, Makers],
  globals: [SiteSettings, PageIntros],
  i18n: { supportedLanguages: { vi }, fallbackLanguage: 'vi' },
  localization: { locales: [{ code: 'vi', label: 'Tiếng Việt' }], defaultLocale: 'vi' },
  graphQL: { disable: true },
  editor: lexicalEditor(),
  secret: process.env.PAYLOAD_SECRET || '',
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  db: postgresAdapter({
    // R23: chỉ dev tự đồng bộ schema; staging/production dùng migration (`npm run migrate`).
    push: process.env.APP_ENV === 'development',
    migrationDir: path.resolve(dirname, 'migrations'),
    pool: {
      connectionString: process.env.DATABASE_URI || '',
    },
  }),
  sharp,
  plugins: storagePlugins(process.env),
})

// Payload tự thêm widget `collections` (liệt kê mọi mục, kể cả Người dùng) sau khi chuẩn hoá cấu hình; gỡ để
// thay bằng widget `tat-ca-muc` đã lọc theo vai trò, kẻo người dùng thêm lại được từ chế độ sửa trang đầu.
export default config.then((c) => {
  if (c.admin.dashboard) c.admin.dashboard.widgets = c.admin.dashboard.widgets.filter((w) => w.slug !== 'collections')
  return c
})
