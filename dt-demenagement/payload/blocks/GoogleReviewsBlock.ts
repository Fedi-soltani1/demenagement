import type { Block } from 'payload'
import { actifField } from '../fields/actifField'
import { sectionOptionsFields } from './shared/sectionOptionsFields'
import { typographieTitreField } from './shared/typographyFields'

export const GoogleReviewsBlock: Block = {
  slug: 'google-reviews',
  labels: { singular: '⭐ Section Avis Google', plural: 'Sections Avis Google' },
  fields: [
    actifField,
    {
      name: 'titre',
      label: 'Titre de la section',
      type: 'text',
      required: true,
      localized: true,
      admin: { description: 'Ex: Nos clients parlent de nous sur Google' },
    },
    {
      name: 'afficherNoteGlobale',
      label: 'Afficher la note moyenne et le nombre total d\'avis',
      type: 'checkbox',
      defaultValue: true,
      admin: { description: 'Si coché, affiche un badge "4.9/5 basé sur 312 avis" en haut de la section.' },
    },
    {
      name: 'nombreAvis',
      label: 'Nombre d\'avis à afficher',
      type: 'number',
      defaultValue: 6,
      admin: { description: 'Les avis les plus récents sont affichés en priorité. Recommandé : 6 avis.' },
    },
    {
      name: 'noteMinimum',
      label: 'Note minimum pour afficher un avis',
      type: 'select',
      defaultValue: '4',
      admin: { description: 'Filtrer pour n\'afficher que les bons avis et protéger la réputation.' },
      options: [
        { label: 'Tous les avis (1 étoile et plus)',  value: '1' },
        { label: '3 étoiles et plus',                  value: '3' },
        { label: '4 étoiles et plus (recommandé)',     value: '4' },
        { label: '5 étoiles uniquement (excellent)',   value: '5' },
      ],
    },
    typographieTitreField,
    ...sectionOptionsFields,
  ],
}
