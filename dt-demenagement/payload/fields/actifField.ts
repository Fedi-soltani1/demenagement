import type { Field } from 'payload'

export const actifField: Field = {
  name: 'actif',
  label: '👁 Bloc visible sur le site',
  type: 'checkbox',
  defaultValue: true,
  admin: {
    description: 'Décocher pour masquer ce bloc sans le supprimer.',
    position: 'sidebar',
  },
}
