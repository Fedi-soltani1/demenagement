import type { Block } from 'payload'

// Raccourcit les noms d'enum (espacement/hauteurMin/visibilite) pour que les tables
// de versioning (_services_v_, _villes_v_…) restent ≤ 63 caractères (limite PostgreSQL).
// À appliquer via .map(withShortSectionOptions) sur les blocs d'une collection versionnée.
export function withShortSectionOptions(block: Block): Block {
  const cloned = JSON.parse(JSON.stringify(block)) as Block
  const fields = cloned.fields as Array<Record<string, unknown>>
  const grp = fields.find((f) => f['name'] === 'sectionOptions') as
    | { fields?: Array<Record<string, unknown>> }
    | undefined
  if (grp?.fields) {
    for (const f of grp.fields) {
      if (f['name'] === 'espacement') f['dbName'] = 'esp'
      if (f['name'] === 'hauteurMin')  f['dbName'] = 'haut'
      if (f['name'] === 'visibilite') f['dbName'] = 'vis'
    }
  }
  return cloned
}
