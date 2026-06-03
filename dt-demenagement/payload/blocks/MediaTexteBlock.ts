import type { Block } from 'payload'
import { actifField } from '../fields/actifField'
import { sectionOptionsFields } from './shared/sectionOptionsFields'
import { typographieTitreField, typographieTexteField } from './shared/typographyFields'

export const MediaTexteBlock: Block = {
  slug: 'media-texte',
  labels: { singular: '🖼 Média + Texte', plural: 'Blocs Média + Texte' },
  fields: [
    actifField,
    {
      name: 'typeMedia',
      label: 'Type de média',
      type: 'select',
      defaultValue: 'image',
      dbName: 'tmed',
      admin: { description: 'Choisir une image ou une vidéo à afficher à côté du texte.' },
      options: [
        { label: 'Image', value: 'image' },
        { label: 'Vidéo', value: 'video' },
      ],
    },
    {
      name: 'image',
      label: 'Image',
      type: 'upload',
      relationTo: 'media',
      admin: { condition: (_, sibling) => sibling?.typeMedia !== 'video' },
    },
    {
      name: 'videoFichier',
      label: 'Vidéo — fichier MP4',
      type: 'upload',
      relationTo: 'media',
      admin: {
        condition: (_, sibling) => sibling?.typeMedia === 'video',
        description: 'Fichier MP4 uploadé. Prioritaire sur le lien YouTube.',
      },
    },
    {
      name: 'videoYoutube',
      label: 'Vidéo — lien YouTube',
      type: 'text',
      admin: {
        condition: (_, sibling) => sibling?.typeMedia === 'video',
        description: 'Ex : https://www.youtube.com/watch?v=XXXX (si pas de fichier MP4).',
      },
    },
    {
      name: 'position',
      label: 'Position du média',
      type: 'select',
      defaultValue: 'gauche',
      dbName: 'pos',
      options: [
        { label: 'Gauche', value: 'gauche' },
        { label: 'Droite', value: 'droite' },
        { label: 'Haut',   value: 'haut'   },
        { label: 'Bas',    value: 'bas'    },
      ],
    },
    {
      name: 'tailleImage',
      label: 'Taille du média',
      type: 'select',
      defaultValue: 'moyenne',
      dbName: 'timg',
      options: [
        { label: 'Petite',  value: 'petite'  },
        { label: 'Moyenne', value: 'moyenne' },
        { label: 'Grande',  value: 'grande'  },
      ],
    },
    {
      name: 'badge',
      label: 'Badge (optionnel)',
      type: 'text',
      localized: true,
    },
    {
      name: 'titre',
      label: 'Titre (optionnel)',
      type: 'text',
      localized: true,
    },
    {
      name: 'contenu',
      label: 'Contenu (optionnel)',
      type: 'richText',
      localized: true,
    },
    {
      name: 'boutons',
      label: 'Boutons (0 à 3)',
      type: 'array',
      maxRows: 3,
      fields: [
        {
          name: 'texte',
          label: 'Texte',
          type: 'text',
          localized: true,
          required: true,
        },
        {
          name: 'lien',
          label: 'Lien',
          type: 'text',
        },
        {
          name: 'style',
          type: 'select',
          label: 'Style',
          defaultValue: 'primaire',
          options: [
            { label: 'Primaire (rouge rempli)', value: 'primaire'   },
            { label: 'Secondaire (contour)',    value: 'secondaire' },
            { label: 'Téléphone (icône 📞)',     value: 'telephone'  },
          ],
        },
      ],
    },
    typographieTitreField,
    typographieTexteField,
    ...sectionOptionsFields,
  ],
}
