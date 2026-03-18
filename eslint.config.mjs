import { defineConfig, globalIgnores } from 'eslint/config'
import nextVitals from 'eslint-config-next/core-web-vitals'
import nextTypeScript from 'eslint-config-next/typescript'

export default defineConfig([
  ...nextVitals,
  ...nextTypeScript,
  {
    rules: {
      'import/no-unresolved': 'off',
      'no-console': 'off',
    },
  },
  globalIgnores([
    'src/components/ui/**',
    'next-env.d.ts',
    'resolvers.js',
    '*.test.js',
    '*.test.jsx',
  ]),
])
