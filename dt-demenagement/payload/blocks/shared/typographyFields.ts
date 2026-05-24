import type { Field } from 'payload'

function buildTypographieGroup(name: string, label: string): Field {
  return {
    name,
    type: 'group',
    label,
    fields: [
      {
        // dbName shortens enum: _pages_v_blocks_google_reviews_typographie_titre_taille_texte = 66 chars → 60 chars
        name: 'tailleTexte',
        type: 'select',
        label: 'Taille',
        dbName: 'taille',
        options: [
          { label: 'Petit',  value: 'petit'  },
          { label: 'Normal', value: 'normal' },
          { label: 'Grand',  value: 'grand'  },
        ],
      },
      {
        // dbName shortens enum: _pages_v_blocks_google_reviews_typographie_titre_alignement = 64 chars → 59 chars
        name: 'alignement',
        type: 'select',
        label: 'Alignement',
        dbName: 'align',
        options: [
          { label: 'Gauche', value: 'gauche' },
          { label: 'Centre', value: 'centre' },
          { label: 'Droite', value: 'droite' },
        ],
      },
      {
        name: 'poids',
        type: 'select',
        label: 'Poids',
        options: [
          { label: 'Normal', value: 'normal' },
          { label: 'Gras',   value: 'gras'   },
        ],
      },
    ],
  }
}

export const typographieTitreField: Field = buildTypographieGroup(
  'typographieTitre',
  '🔤 Typographie du titre',
)

export const typographieTexteField: Field = buildTypographieGroup(
  'typographieTexte',
  '🔤 Typographie du texte',
)
