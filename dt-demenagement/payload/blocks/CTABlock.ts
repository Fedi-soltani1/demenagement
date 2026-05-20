import type { Block } from 'payload'

export const CTABlock: Block = {
  slug: 'cta',
  labels: { singular: '📣 Section Appel à l\'action (bannière incitative)', plural: 'Sections Appel à l\'action' },
  fields: [
    {
      name: 'titre',
      label: 'Titre accrocheur',
      type: 'text',
      required: true,
      localized: true,
      admin: { description: 'Ex: Prêt à déménager ? Obtenez votre devis gratuit en 2 minutes.' },
    },
    {
      name: 'sousTitre',
      label: 'Sous-titre (optionnel)',
      type: 'textarea',
      localized: true,
      admin: { description: 'Ex: Notre équipe vous répond dans les 2 heures. Aucun engagement.' },
    },
    {
      name: 'boutonPrimaire',
      type: 'group',
      label: 'Bouton principal (rouge, obligatoire)',
      fields: [
        {
          name: 'texte',
          label: 'Texte du bouton',
          type: 'text',
          required: true,
          localized: true,
          admin: { description: 'Ex: Demander un devis gratuit' },
        },
        {
          name: 'lien',
          label: 'Lien du bouton',
          type: 'text',
          required: true,
          admin: { description: 'Ex: /fr/devis ou /fr/contact' },
        },
      ],
    },
    {
      name: 'boutonSecondaire',
      type: 'group',
      label: 'Bouton secondaire (optionnel)',
      fields: [
        {
          name: 'texte',
          label: 'Texte du bouton',
          type: 'text',
          localized: true,
          admin: { description: 'Ex: Appeler maintenant. Laisser vide pour masquer.' },
        },
        {
          name: 'lien',
          label: 'Lien du bouton',
          type: 'text',
          admin: { description: 'Ex: tel:+21652880311 ou /fr/contact' },
        },
      ],
    },
    {
      name: 'couleurFond',
      label: 'Couleur de fond de la bannière',
      type: 'select',
      defaultValue: 'rouge',
      admin: { description: 'Le rouge attire l\'attention. Le noir est plus sobre et élégant.' },
      options: [
        { label: '🔴 Rouge — accrocheur, fort (recommandé)', value: 'rouge' },
        { label: '⬛ Noir — sobre, élégant',                  value: 'noir' },
        { label: '🌑 Foncé — sombre, professionnel',          value: 'fonce' },
      ],
    },
    {
      name: 'imageBackground',
      label: 'Image d\'arrière-plan (optionnel)',
      type: 'upload',
      relationTo: 'media',
      admin: { description: 'Photo affichée derrière le texte avec une semi-transparence. Ex: photo de camion, d\'équipe, de ville.' },
    },
  ],
}
