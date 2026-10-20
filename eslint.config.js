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
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
    },
  }
)
