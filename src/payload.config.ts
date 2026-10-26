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
import { PageIntros } from './globals/PageIntros'
import { SiteSettings } from './globals/SiteSettings'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export default buildConfig({
  admin: {
    user: Users.slug,
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
    pool: {
      connectionString: process.env.DATABASE_URI || '',
    },
  }),
  sharp,
  plugins: [],
})
