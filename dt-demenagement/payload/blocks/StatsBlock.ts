import type { Block } from 'payload'

export const StatsBlock: Block = {
  slug: 'stats',
  labels: { singular: '📊 Section Chiffres clés (compteurs animés)', plural: 'Sections Chiffres clés' },
  admin: { description: 'Affiche des statistiques avec animation de comptage au scroll (ex: 5 000+ déménagements, 15 ans d\'expérience).' },
  fields: [
    {
      name: 'titre',
      label: 'Titre de la section (optionnel)',
      type: 'text',
      localized: true,
      admin: { description: 'Ex: DT Déménagement en chiffres. Laisser vide pour afficher les stats sans titre.' },
    },
    {
      name: 'stats',
      label: 'Liste des statistiques',
      type: 'array',
      minRows: 1,
      maxRows: 6,
      admin: { description: 'Ajouter entre 2 et 6 chiffres clés. Ils s\'affichent en ligne sur desktop.' },
      fields: [
        {
          name: 'valeur',
          label: 'Valeur numérique',
          type: 'number',
          required: true,
          admin: { description: 'Ex: 5000 (le chiffre s\'animera de 0 à cette valeur)' },
        },
        {
          name: 'suffixe',
          label: 'Suffixe affiché après le chiffre',
          type: 'text',
          admin: { description: 'Ex: + pour "5000+", % pour "98%", ans pour "15 ans"' },
        },
        {
          name: 'libelle',
          label: 'Description du chiffre',
          type: 'text',
          required: true,
          localized: true,
          admin: { description: 'Ex: Déménagements réalisés / خبرة بالسنوات' },
        },
        {
          name: 'icone',
          label: 'Icône (nom Lucide — optionnel)',
          type: 'text',
          admin: { description: 'Ex: truck, users, star, award, package. Voir lucide.dev pour la liste complète.' },
        },
      ],
    },
    {
      name: 'animation',
      label: 'Activer l\'animation de comptage',
      type: 'checkbox',
      defaultValue: true,
      admin: { description: 'Si coché, les chiffres s\'animent de 0 à leur valeur finale quand la section apparaît à l\'écran.' },
    },
  ],
}
