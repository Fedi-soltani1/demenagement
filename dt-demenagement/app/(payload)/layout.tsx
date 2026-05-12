import type { ReactNode } from 'react'

// Le root app/layout.tsx gère <html> et <body>.
// Ce layout ne fournit que le contexte Payload CMS sans dupliquer la structure HTML.
export default function PayloadLayout({ children }: { children: ReactNode }) {
  return <>{children}</>
}
