import type { Block } from 'payload'
import { actifField } from '../fields/actifField'

export const AboutBlock: Block = {
  slug: 'about',
  labels: { singular: '🏢 Section À propos de DT Déménagement', plural: 'Sections À propos' },
  fields: [
    actifField,
    {
      name: 'badge',
      label: 'Accroche au-dessus du titre (optionnelle)',
      type: 'text',
      localized: true,
      admin: { description: 'Petit texte mis en valeur au-dessus du titre. Ex: Notre histoire / Depuis 2009' },
    },
    {
      name: 'titre',
      label: 'Titre principal',
      type: 'text',
      required: true,
      localized: true,
      admin: { description: 'Ex: DT Déménagement, votre partenaire de confiance depuis 15 ans' },
    },
    {
      name: 'texte',
      label: 'Texte de présentation',
      type: 'textarea',
      required: true,
      localized: true,
      admin: { description: 'Paragraphe décrivant l\'histoire, les valeurs ou la mission de l\'entreprise. 3 à 5 phrases recommandées.' },
    },
    {
      name: 'image',
      label: 'Photo de l\'entreprise (équipe, camion, dépôt…)',
      type: 'upload',
      relationTo: 'media',
      admin: { description: 'Photo affichée à côté du texte. Ratio 4:3 recommandé. Ex: photo de l\'équipe, du dépôt, d\'un déménagement en cours.' },
    },
    {
      name: 'videoUrl',
      label: 'Vidéo YouTube à la place de l\'image (optionnelle)',
      type: 'text',
      admin: { description: 'Lien YouTube normal ou embed. Ex: https://www.youtube.com/watch?v=XXXXX — La conversion en embed est automatique. Si renseignée, un bouton Play apparaît sur la photo.' },
    },
    {
      name: 'ctaTexte',
      label: 'Texte du bouton "En savoir plus" (optionnel)',
      type: 'text',
      localized: true,
      admin: { description: 'Ex: Découvrir notre histoire / Rencontrer l\'équipe. Laisser vide pour masquer le bouton.' },
    },
    {
      name: 'stats',
      label: 'Statistiques (4 max — laisser vide pour valeurs par défaut)',
      type: 'array',
      maxRows: 4,
      admin: { description: 'Chiffres clés affichés sous le texte. Si vide, les valeurs de la traduction sont utilisées (5 000 déménagements, 15 ans, etc.).' },
      fields: [
        {
          name: 'valeur',
          label: 'Valeur numérique',
          type: 'number',
          required: true,
          admin: { description: 'Ex: 5000' },
        },
        {
          name: 'suffixe',
          label: 'Suffixe après le chiffre',
          type: 'text',
          admin: { description: 'Ex: + pour "5000+", ans pour "15 ans"' },
        },
        {
          name: 'label',
          label: 'Description du chiffre',
          type: 'text',
          required: true,
          localized: true,
          admin: { description: 'Ex: Déménagements réalisés / Années d\'expérience / Clients satisfaits' },
        },
      ],
    },
    {
      name: 'imagePosition',
      label: 'Position de la photo / vidéo',
      type: 'select',
      defaultValue: 'gauche',
      options: [
        { label: 'Photo à gauche, texte à droite', value: 'gauche' },
        { label: 'Texte à gauche, photo à droite', value: 'droite' },
      ],
    },
  ],
}
