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
    // Illustrative documentation code samples — not shipped app code, so they
    // shouldn't gate the build. tsc still type-checks them.
    'docs/**',
    'next-env.d.ts',
    'resolvers.js',
    '*.test.js',
    '*.test.jsx',
    // Gitignored local scratch/debug files (see .gitignore) — never shipped.
    'test-person-profile-feature.ts',
    'verify-parsing-logic.ts',
  ]),
])
