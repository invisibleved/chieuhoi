// @vitest-environment node
import { ESLint } from 'eslint'
import { describe, expect, it } from 'vitest'

const eslint = new ESLint({ cwd: process.cwd() })
const RULE = '@typescript-eslint/no-restricted-imports'

async function rulesFor(filePath: string, code: string) {
  const [res] = await eslint.lintText(code, { filePath })
  return res.messages.map((m) => m.ruleId)
}

describe('lint kiến trúc', () => {
  it('component không được import giá trị từ @/lib/content', async () => {
    expect(await rulesFor('src/components/x/Bad.tsx', "import { getMode } from '@/lib/content'\nexport const a = getMode\n")).toContain(RULE)
  })
  it('component được import type từ @/lib/content (không có thông báo lint nào)', async () => {
    expect(await rulesFor('src/components/x/Ok.tsx', "import type { Mode } from '@/lib/content'\nexport type A = Mode\n")).toEqual([])
  })
  it('component không được import giá trị từ @/collections/People', async () => {
    expect(await rulesFor('src/components/x/Bad3.tsx', "import { PERSON_CATEGORY_OPTIONS } from '@/collections/People'\nexport const a = PERSON_CATEGORY_OPTIONS\n")).toContain(RULE)
  })
  it('component không được import giá trị từ @/lib/content/visibility', async () => {
    expect(await rulesFor('src/components/x/Bad4.tsx', "import { showText } from '@/lib/content/visibility'\nexport const a = showText\n")).toContain(RULE)
  })
  it('component không được import @payload-config', async () => {
    expect(await rulesFor('src/components/x/Bad2.tsx', "import config from '@payload-config'\nexport default config\n")).toContain(RULE)
  })
  it('lib/content không được import component', async () => {
    expect(await rulesFor('src/lib/content/Bad.ts', "import { Button } from '@/components/ui/Button'\nexport default Button\n")).toContain(RULE)
  })
  it('hooks không được import component', async () => {
    expect(await rulesFor('src/hooks/x.ts', "import { Button } from '@/components/ui/Button'\nexport default Button\n")).toContain(RULE)
  })
  it('proxy không được import @/lib/content hay payload', async () => {
    expect(await rulesFor('src/proxy.ts', "import { getMode } from '@/lib/content'\nexport const a = getMode\n")).toContain(RULE)
    expect(await rulesFor('src/proxy.ts', "import { getPayload } from 'payload'\nexport const a = getPayload\n")).toContain(RULE)
  })
  it('proxy được import next/server, @/lib/env, @/lib/basicAuth', async () => {
    const code = "import { NextResponse } from 'next/server'\nimport { isStaging } from '@/lib/env'\nimport { checkBasicAuth } from '@/lib/basicAuth'\nexport const a = [NextResponse, isStaging, checkBasicAuth]\n"
    expect(await rulesFor('src/proxy.ts', code)).toEqual([])
  })
  it('env.ts không import gì', async () => {
    expect(await rulesFor('src/lib/env.ts', "import { x } from '@/lib/basicAuth'\nexport const a = x\n")).toContain(RULE)
    expect(await rulesFor('src/lib/env.ts', "import { createHash } from 'node:crypto'\nexport const a = createHash\n")).toContain(RULE)
    expect(await rulesFor('src/lib/env.ts', 'export const a = 1\n')).toEqual([])
  })
  it('basicAuth.ts chỉ được import node:crypto', async () => {
    expect(await rulesFor('src/lib/basicAuth.ts', "import { x } from '@/lib/env'\nexport const a = x\n")).toContain(RULE)
    expect(await rulesFor('src/lib/basicAuth.ts', "import { createHash } from 'node:crypto'\nexport const a = createHash\n")).toEqual([])
  })
  it('admin không được import component của site', async () => {
    expect(await rulesFor('src/admin/Bad.tsx', "import { Button } from '@/components/ui/Button'\nexport default Button\n")).toContain(RULE)
  })
  it('admin không được import @/lib/content', async () => {
    expect(await rulesFor('src/admin/Bad.tsx', "import { getMode } from '@/lib/content'\nexport default getMode\n")).toContain(RULE)
    expect(await rulesFor('src/admin/Bad.tsx', "import { showText } from '@/lib/content/visibility'\nexport default showText\n")).toContain(RULE)
  })
  it('admin được import @payloadcms/ui và @/access', async () => {
    const code = "import { Link } from '@payloadcms/ui'\nimport { isReviewer } from '@/access/roles'\nexport const a = [Link, isReviewer]\n"
    expect(await rulesFor('src/admin/Ok.tsx', code)).toEqual([])
  })
})
