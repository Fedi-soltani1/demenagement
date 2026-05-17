import type { Block } from 'payload'

export const MapBlock: Block = {
  slug: 'map',
  labels: { singular: '🗺️ Section Carte des zones d\'intervention', plural: 'Sections Carte' },
  admin: { description: 'Carte interactive affichant les villes et pays où DT Déménagement intervient. Les données viennent des collections "Villes" et "Pays".' },
  fields: [
    {
      name: 'titre',
      label: 'Titre de la section',
      type: 'text',
      required: true,
      localized: true,
      admin: { description: 'Ex: Nous intervenons partout en Tunisie et à l\'international' },
    },
    {
      name: 'sousTitre',
      label: 'Sous-titre (optionnel)',
      type: 'textarea',
      localized: true,
      admin: { description: 'Ex: De Tunis à Sfax, de Paris à Montréal — nous déménageons vos affaires partout.' },
    },
    {
      name: 'mode',
      label: 'Zone géographique à afficher',
      type: 'select',
      defaultValue: 'tunisie',
      admin: { description: 'Choisir l\'étendue de la carte selon le contexte de la page.' },
      options: [
        { label: '🇹🇳 Tunisie — villes tunisiennes uniquement',       value: 'tunisie' },
        { label: '🌍 International — pays européens et autres',        value: 'europe' },
        { label: '🌐 Tunisie + International — carte complète',        value: 'complet' },
      ],
    },
    {
      name: 'villes',
      label: 'Villes tunisiennes à afficher (sélection manuelle)',
      type: 'relationship',
      relationTo: 'villes',
      hasMany: true,
      admin: { description: 'Laisser vide pour afficher automatiquement toutes les villes publiées.' },
    },
    {
      name: 'pays',
      label: 'Pays internationaux à afficher (sélection manuelle)',
      type: 'relationship',
      relationTo: 'pays',
      hasMany: true,
      admin: { description: 'Laisser vide pour afficher automatiquement tous les pays publiés.' },
    },
  ],
}
