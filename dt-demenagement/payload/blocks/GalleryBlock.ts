import type { Block } from 'payload'
import { actifField } from '../fields/actifField'

export const GalleryBlock: Block = {
  slug: 'gallery',
  labels: { singular: '🖼️ Section Galerie photos', plural: 'Sections Galerie photos' },
  fields: [
    actifField,
    {
      name: 'titre',
      label: 'Titre de la galerie (optionnel)',
      type: 'text',
      localized: true,
      admin: { description: 'Ex: Notre équipe en action. Laisser vide pour afficher uniquement les photos.' },
    },
    {
      name: 'images',
      label: 'Photos de la galerie',
      type: 'array',
      minRows: 1,
      admin: { description: 'Ajouter les photos dans l\'ordre d\'affichage souhaité. Format recommandé : JPEG ou WebP, taille max 2MB.' },
      fields: [
        {
          name: 'image',
          label: 'Photo',
          type: 'upload',
          relationTo: 'media',
          required: true,
          admin: { description: 'Choisir une photo dans la médiathèque ou en télécharger une nouvelle.' },
        },
        {
          name: 'legende',
          label: 'Légende de la photo (optionnelle)',
          type: 'text',
          localized: true,
          admin: { description: 'Ex: Déménagement à Sousse — mars 2026. Affiché en survol et dans la lightbox.' },
        },
      ],
    },
    {
      name: 'colonnes',
      label: 'Nombre de colonnes',
      type: 'select',
      defaultValue: '3',
      admin: { description: 'Sur mobile, les colonnes se réduisent automatiquement à 1 ou 2.' },
      options: [
        { label: '2 colonnes — grandes photos', value: '2' },
        { label: '3 colonnes — équilibré (recommandé)', value: '3' },
        { label: '4 colonnes — nombreuses petites photos', value: '4' },
        { label: 'Masonry — hauteurs variables, style magazine', value: 'masonry' },
      ],
    },
    {
      name: 'lightbox',
      label: 'Activer le zoom au clic (lightbox)',
      type: 'checkbox',
      defaultValue: true,
      admin: { description: 'Si coché, un clic sur une photo l\'affiche en grand avec navigation gauche/droite.' },
    },
  ],
}
