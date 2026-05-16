// eslint-config-next uses legacy eslintrc format — FlatCompat bridges it to ESLint 9 flat config
import { FlatCompat } from '@eslint/eslintrc'
import { fileURLToPath } from 'url'
import path from 'path'
import storybook from 'eslint-plugin-storybook'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const compat = new FlatCompat({ baseDirectory: __dirname })

const eslintConfig = [
  ...compat.extends('next/core-web-vitals'),
  {
    ignores: ['.next/**', 'out/**', 'build/**', 'next-env.d.ts'],
  },
  ...storybook.configs['flat/recommended'],
  {
    rules: {
      // Disabled: incorrectly flags valid SSR-hydration patterns (setMounted, localStorage init)
      // that are explicitly recommended in React docs.
      'react-hooks/set-state-in-effect': 'off',
    },
  },
]

export default eslintConfig
