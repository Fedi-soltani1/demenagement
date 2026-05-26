import type { Block } from 'payload'
import { actifField } from '../fields/actifField'
import { sectionOptionsFields } from './shared/sectionOptionsFields'
import { typographieTitreField, typographieTexteField } from './shared/typographyFields'

export const PricingBlock: Block = {
  slug: 'pricing',
  labels: { singular: '💰 Section Tarifs (tableau de prix)', plural: 'Sections Tarifs' },
  fields: [
    actifField,
    {
      name: 'titre',
      label: 'Titre de la section',
      type: 'text',
      localized: true,
      admin: { description: 'Ex: Nos tarifs transparents' },
    },
    {
      name: 'sousTitre',
      label: 'Sous-titre (optionnel)',
      type: 'text',
      localized: true,
      admin: { description: 'Ex: Des prix clairs, sans surprise.' },
    },
    {
      name: 'formules',
      label: 'Formules tarifaires',
      type: 'array',
      minRows: 1,
      maxRows: 4,
      admin: { description: 'Ajouter les formules (1 à 4). La formule mise en avant sera visuellement distinguée.' },
      fields: [
        {
          name: 'nom',
          label: 'Nom de la formule',
          type: 'text',
          required: true,
          localized: true,
          admin: { description: 'Ex: Studio, F3-F4, Villa, Sur mesure' },
        },
        {
          name: 'prix',
          label: 'Prix affiché',
          type: 'text',
          localized: true,
          admin: { description: 'Ex: À partir de 350 DT, Sur devis, 150 DT / heure' },
        },
        {
          name: 'description',
          label: 'Description courte',
          type: 'text',
          localized: true,
          admin: { description: 'Ex: Idéal pour un petit logement' },
        },
        {
          name: 'caracteristiques',
          label: 'Caractéristiques incluses',
          type: 'array',
          minRows: 1,
          maxRows: 10,
          admin: { description: 'Liste des éléments inclus dans la formule.' },
          fields: [
            {
              name: 'texte',
              label: 'Élément',
              type: 'text',
              required: true,
              localized: true,
              admin: { description: 'Ex: Démontage des meubles inclus' },
            },
            {
              name: 'inclus',
              label: 'Inclus ?',
              type: 'checkbox',
              defaultValue: true,
              admin: { description: 'Décocher pour afficher comme non inclus (affiché barré)' },
            },
          ],
        },
        {
          name: 'misEnAvant',
          label: 'Mettre en avant ?',
          type: 'checkbox',
          defaultValue: false,
          admin: { description: 'La formule mise en avant sera visuellement distinguée (bordure rouge, badge).' },
        },
        {
          name: 'badgeTexte',
          label: 'Texte du badge (si mis en avant)',
          type: 'text',
          localized: true,
          admin: { description: 'Ex: Populaire, Recommandé, Meilleur choix' },
        },
        {
          name: 'ctaTexte',
          label: 'Texte du bouton',
          type: 'text',
          localized: true,
          admin: { description: 'Ex: Demander un devis, Choisir cette formule' },
        },
        {
          name: 'ctaLien',
          label: 'Lien du bouton',
          type: 'text',
          admin: { description: 'Ex: /contact, #devis, tel:+21620000000' },
        },
      ],
    },
    {
      name: 'noteDeBase',
      label: 'Note de bas de section (optionnelle)',
      type: 'text',
      localized: true,
      admin: { description: 'Ex: * Tarifs indicatifs, le devis final dépend du volume et de la distance.' },
    },
    typographieTitreField,
    typographieTexteField,
    ...sectionOptionsFields,
  ],
}
