import type { Block } from 'payload'

export const PartnersBlock: Block = {
  slug: 'partners',
  labels: { singular: '🤝 Section Partenaires & Certifications', plural: 'Sections Partenaires' },
  fields: [
    {
      name: 'titre',
      label: 'Titre de la section (optionnel)',
      type: 'text',
      localized: true,
      admin: { description: 'Ex: Ils nous font confiance. Laisser vide pour afficher uniquement les logos.' },
    },
    {
      name: 'partenaires',
      label: 'Partenaires à afficher (sélection manuelle)',
      type: 'relationship',
      relationTo: 'partners',
      hasMany: true,
      admin: { description: 'Laisser vide pour afficher automatiquement tous les partenaires publiés dans l\'ordre défini. Sinon, choisir et ordonner manuellement.' },
    },
    {
      name: 'affichage',
      label: 'Mode d\'affichage des logos',
      type: 'select',
      defaultValue: 'defilement',
      admin: { description: 'Défilement automatique = logos qui défilent en boucle. Grille = logos fixes sur la page.' },
      options: [
        { label: 'Défilement automatique (bande continue — recommandé)', value: 'defilement' },
        { label: 'Grille statique — logos fixes et espacés',              value: 'grille' },
      ],
    },
  ],
}
