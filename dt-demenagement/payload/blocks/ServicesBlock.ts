import type { Block } from 'payload'

export const ServicesBlock: Block = {
  slug: 'services',
  labels: { singular: '🛠️ Section Services (liste de prestations)', plural: 'Sections Services' },
  fields: [
    {
      name: 'titre',
      label: 'Titre de la section',
      type: 'text',
      required: true,
      localized: true,
      admin: { description: 'Ex: Nos services de déménagement' },
    },
    {
      name: 'sousTitre',
      label: 'Sous-titre (phrase descriptive)',
      type: 'textarea',
      localized: true,
      admin: { description: 'Ex: De la préparation au déballage, nous gérons tout.' },
    },
    {
      name: 'services',
      label: 'Services à afficher',
      type: 'relationship',
      relationTo: 'services',
      hasMany: true,
      admin: { description: 'Sélectionner les services à afficher. Laisser vide pour afficher tous les services publiés. L\'ordre de sélection est respecté.' },
    },
    {
      name: 'ctaTexte',
      label: 'Texte du bouton (optionnel)',
      type: 'text',
      localized: true,
      admin: { description: 'Ex: Voir tous nos services. Laisser vide pour masquer le bouton.' },
    },
    {
      name: 'layout',
      label: 'Mise en page',
      type: 'select',
      defaultValue: 'grille',
      admin: { description: 'Choisir comment les services sont disposés visuellement.' },
      options: [
        { label: 'Grille 3 colonnes — cartes côte à côte', value: 'grille' },
        { label: 'Liste horizontale — services en ligne',   value: 'liste' },
        { label: 'Carrousel — défilement gauche/droite',    value: 'carrousel' },
      ],
    },
  ],
}
