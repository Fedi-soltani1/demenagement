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
  {
    // Composants injectés DANS le panneau d'administration Payload (qui est une SPA
    // avec son propre routage). Les liens <a href="/admin/..."> y sont VOULUS : ils
    // forcent un rechargement complet pour réinitialiser proprement la SPA admin.
    // next/link y ferait une navigation client qui peut laisser l'admin dans un état
    // incohérent. La règle no-html-link-for-pages est donc un faux positif ici.
    files: ['components/payload/**/*.{ts,tsx}'],
    rules: {
      '@next/next/no-html-link-for-pages': 'off',
    },
  },
  {
    // Composants @react-pdf/renderer : <Text> n'est PAS du HTML, donc &apos; s'afficherait
    // littéralement dans le PDF. La règle react/no-unescaped-entities est un faux positif ici.
    files: ['components/pdf/**/*.{ts,tsx}'],
    rules: {
      'react/no-unescaped-entities': 'off',
    },
  },
]

export default eslintConfig
