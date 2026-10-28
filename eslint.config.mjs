import nextCoreWebVitals from 'eslint-config-next/core-web-vitals'
import nextTypescript from 'eslint-config-next/typescript'

const eslintConfig = [
  ...nextCoreWebVitals,
  ...nextTypescript,
  {
    rules: {
      '@typescript-eslint/ban-ts-comment': 'warn',
      '@typescript-eslint/no-empty-object-type': 'warn',
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-unused-vars': [
        'warn',
        {
          vars: 'all',
          args: 'after-used',
          ignoreRestSiblings: false,
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          destructuredArrayIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^(_|ignore)',
        },
      ],
    },
  },
  {
    files: ['src/components/**'],
    rules: {
      '@typescript-eslint/no-restricted-imports': [
        'error',
        {
          paths: [
            { name: 'payload', message: 'Component không gọi Payload. Xem CLAUDE.md#Kiến trúc.' },
            { name: '@payload-config', message: 'Component không gọi Payload. Xem CLAUDE.md#Kiến trúc.' },
            {
              name: '@/lib/content',
              allowTypeImports: true,
              message: 'Component chỉ được `import type` từ @/lib/content; dữ liệu do app (page/layout) truyền xuống. Xem CLAUDE.md#Kiến trúc.',
            },
          ],
          patterns: [
            {
              group: ['@/collections/*', '@/globals/*', '@/access/*', '@/seed/*'],
              message: 'Component không import tầng dữ liệu Payload. Xem CLAUDE.md#Kiến trúc.',
            },
            {
              group: ['@/lib/content/*'],
              allowTypeImports: true,
              message: 'Component chỉ được `import type` từ @/lib/content. Xem CLAUDE.md#Kiến trúc.',
            },
          ],
        },
      ],
    },
  },
  {
    files: ['src/lib/**', 'src/collections/**', 'src/globals/**', 'src/access/**', 'src/hooks/**'],
    rules: {
      '@typescript-eslint/no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['@/components/*', '@/app/*'],
              message: 'Tầng dữ liệu không import ngược lên components/app. Xem CLAUDE.md#Kiến trúc.',
            },
          ],
        },
      ],
    },
  },
  {
    files: ['src/proxy.ts'],
    rules: {
      '@typescript-eslint/no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              regex: '^(?!next/server$|@/lib/env$|@/lib/basicAuth$)',
              message: 'proxy chỉ được import next/server, @/lib/env và @/lib/basicAuth. Xem CLAUDE.md#Kiến trúc.',
            },
          ],
        },
      ],
    },
  },
  {
    ignores: ['.next/', 'src/payload-types.ts', 'src/payload-generated-schema.ts', 'src/migrations/'],
  },
]

export default eslintConfig
