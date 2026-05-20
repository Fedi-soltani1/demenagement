import type { Block } from 'payload'

export const CustomBlock: Block = {
  slug: 'custom',
  labels: { singular: '✏️ Section Libre (contenu personnalisé)', plural: 'Sections Libres' },
  fields: [
    {
      name: 'titre',
      label: 'Titre de la section (optionnel)',
      type: 'text',
      localized: true,
      admin: { description: 'Titre principal de ce bloc libre.' },
    },
    {
      name: 'sousTitre',
      label: 'Sous-titre (optionnel)',
      type: 'text',
      localized: true,
      admin: { description: 'Phrase d\'accroche sous le titre.' },
    },
    {
      name: 'contenu',
      label: 'Contenu texte riche (optionnel)',
      type: 'richText',
      localized: true,
      admin: { description: 'Texte mis en forme : paragraphes, listes, gras, italique, liens, etc.' },
    },
    {
      name: 'imagePrincipale',
      label: 'Image principale (optionnelle)',
      type: 'upload',
      relationTo: 'media',
      admin: { description: 'Affichée à côté du texte selon la mise en page choisie.' },
    },
    {
      name: 'galerie',
      label: 'Galerie d\'images supplémentaires (optionnelle)',
      type: 'array',
      admin: { description: 'Photos additionnelles affichées en grille sous le contenu principal.' },
      fields: [
        {
          name: 'image',
          label: 'Photo',
          type: 'upload',
          relationTo: 'media',
          required: true,
        },
      ],
    },
    {
      name: 'cta',
      type: 'group',
      label: 'Bouton d\'action (optionnel)',
      fields: [
        {
          name: 'texte',
          label: 'Texte du bouton',
          type: 'text',
          localized: true,
          admin: { description: 'Ex: En savoir plus / Contactez-nous. Laisser vide pour masquer le bouton.' },
        },
        {
          name: 'lien',
          label: 'Lien du bouton',
          type: 'text',
          admin: { description: 'Ex: /fr/contact ou https://... pour un lien externe.' },
        },
      ],
    },
    {
      name: 'couleurFond',
      label: 'Couleur de fond',
      type: 'select',
      defaultValue: 'noir',
      options: [
        { label: '⬛ Noir — fond principal du site (#0a0a0a)',   value: 'noir' },
        { label: '🌑 Foncé — légèrement plus clair (#111111)',   value: 'fonce' },
        { label: '🔴 Rouge — accrocheur (#b52027)',              value: 'rouge' },
        { label: '⬜ Blanc crème — mode clair (#f8f5f0)',        value: 'blanc' },
      ],
    },
    {
      name: 'layout',
      label: 'Disposition du contenu',
      type: 'select',
      defaultValue: 'centre',
      admin: { description: 'Choisir comment texte et image sont positionnés.' },
      options: [
        { label: 'Centré — texte au centre, pas d\'image côté', value: 'centre' },
        { label: 'Image à gauche, texte à droite',              value: 'gauche' },
        { label: 'Texte à gauche, image à droite',              value: 'droite' },
        { label: 'Pleine largeur — occupe toute la page',       value: 'pleine-largeur' },
      ],
    },
    {
      name: 'espacement',
      label: 'Espacement vertical (marges haut/bas)',
      type: 'select',
      defaultValue: 'normal',
      options: [
        { label: 'Normal — espacement standard',          value: 'normal' },
        { label: 'Large — plus d\'espace, section aérée', value: 'large' },
        { label: 'Compact — moins d\'espace, section dense', value: 'compact' },
      ],
    },
  ],
}
