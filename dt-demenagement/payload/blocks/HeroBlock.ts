import type { Block } from 'payload'
import { actifField } from '../fields/actifField'

export const HeroBlock: Block = {
  slug: 'hero',
  labels: { singular: '🦸 Section Hero (grande bannière d\'accueil)', plural: 'Sections Hero' },
  fields: [
    actifField,
    {
      name: 'badge',
      label: 'Badge accroche (petit texte au-dessus du titre)',
      type: 'text',
      localized: true,
      admin: { description: 'Ex: N°1 du déménagement en Tunisie' },
    },
    {
      name: 'titre',
      label: 'Titre principal (grand)',
      type: 'text',
      required: true,
      localized: true,
      admin: { description: 'Ex: Déménagez en toute sérénité à travers toute la Tunisie' },
    },
    {
      name: 'sousTitre',
      label: 'Sous-titre (phrase descriptive)',
      type: 'textarea',
      localized: true,
      admin: { description: 'Ex: Plus de 5 000 déménagements réalisés. Devis gratuit en 2h.' },
    },
    {
      name: 'ctaPrimaire',
      type: 'group',
      label: 'Bouton principal (rouge)',
      fields: [
        { name: 'texte', label: 'Texte du bouton', type: 'text', localized: true, required: true, admin: { description: 'Ex: Devis gratuit' } },
        { name: 'lien',  label: 'Lien du bouton',  type: 'text', required: true,  admin: { description: 'Ex: /fr/devis' } },
      ],
    },
    {
      name: 'ctaSecondaire',
      type: 'group',
      label: 'Bouton secondaire (optionnel)',
      fields: [
        { name: 'texte', label: 'Texte du bouton', type: 'text', localized: true, admin: { description: 'Ex: Nos services' } },
        { name: 'lien',  label: 'Lien du bouton',  type: 'text', admin: { description: 'Ex: /fr/services' } },
      ],
    },
    {
      name: 'videoYoutube',
      label: 'Vidéo YouTube de fond (optionnelle)',
      type: 'text',
      admin: {
        description: 'Coller le lien YouTube (ex: https://www.youtube.com/watch?v=ABC123). Prioritaire sur l\'image si les deux sont renseignés. Muette, en boucle, sans contrôles.',
      },
    },
    {
      name: 'imageHero',
      label: 'Image de fond (optionnelle)',
      type: 'upload',
      relationTo: 'media',
      admin: { description: 'Image affichée si la scène 3D est désactivée et aucune vidéo YouTube renseignée.' },
    },
    {
      name: 'afficher3D',
      label: 'Afficher l\'animation 3D (camion)',
      type: 'checkbox',
      defaultValue: true,
      admin: { description: 'Désactivée automatiquement sur mobile. Décocher pour afficher la vidéo ou l\'image à la place.' },
    },
  ],
}
