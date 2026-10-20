import { defineConfig } from 'eslint/config'

import configDefault from '@ecssc/eslint-config/default'
import configTypescript from '@ecssc/eslint-config/typescript'

export default defineConfig(
  configDefault,
  configTypescript,
  { name: 'gloss/files-to-lint', files: ['**/*.{ts,mts}'] },
  {
    name: 'gloss/files-to-ignore',
    ignores: ['**/dist/**', '**/node_modules/**', '**/*.config.{js,ts,mjs,mts}'],
  },
  {
    name: 'gloss/rules',
    rules: {
      // Astro's virtual modules, such as astro:content, exist only inside an Astro build.
      'import-x/no-unresolved': ['error', { ignore: ['^astro:'] }],
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
    },
  }
)
