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
  it('component được import type từ @/lib/content', async () => {
    expect(await rulesFor('src/components/x/Ok.tsx', "import type { Mode } from '@/lib/content'\nexport type A = Mode\n")).not.toContain(RULE)
  })
  it('component không được import @payload-config', async () => {
    expect(await rulesFor('src/components/x/Bad2.tsx', "import config from '@payload-config'\nexport default config\n")).toContain(RULE)
  })
  it('lib/content không được import component', async () => {
    expect(await rulesFor('src/lib/content/Bad.ts', "import { Button } from '@/components/ui/Button'\nexport default Button\n")).toContain(RULE)
  })
})
