import type { Field } from 'payload'

export const sectionOptionsFields: Field[] = [
  {
    name: 'sectionOptions',
    type: 'group',
    label: '⚙️ Options de section',
    admin: {
      description: 'Contrôles de mise en page — fond, espacement, taille, visibilité.',
    },
    fields: [
      {
        name: 'fond',
        type: 'select',
        label: 'Couleur de fond',
        options: [
          { label: 'Sombre (défaut)',     value: 'sombre'      },
          { label: 'Sombre alternatif',   value: 'sombre2'     },
          { label: 'Carte (gris foncé)',  value: 'carte'       },
          { label: 'Rouge (accent)',      value: 'rouge'       },
          { label: 'Transparent',        value: 'transparent' },
        ],
      },
      {
        name: 'imageFond',
        type: 'upload',
        relationTo: 'media',
        label: 'Image de fond',
        admin: { description: 'Remplace la couleur de fond. Format recommandé : 1920×1080 minimum.' },
      },
      {
        // dbName shortens enum: _pages_v_blocks_google_reviews_section_options_overlay_opacite = 67 chars → 59 chars
        name: 'overlayOpacite',
        type: 'select',
        label: 'Voile sombre sur l\'image',
        dbName: 'overlay',
        admin: { description: 'Assombrit l\'image pour améliorer la lisibilité du texte.' },
        options: [
          { label: 'Aucun',        value: 'aucun'  },
          { label: 'Léger (30%)', value: 'leger'  },
          { label: 'Moyen (50%)', value: 'moyen'  },
          { label: 'Fort  (70%)', value: 'fort'   },
        ],
      },
      {
        name: 'espacement',
        type: 'select',
        label: 'Espacement vertical',
        options: [
          { label: 'Serré  (32px)', value: 'serre'  },
          { label: 'Normal (64px)', value: 'normal' },
          { label: 'Large  (96px)', value: 'large'  },
        ],
      },
      {
        // dbName shortens enum: _pages_v_blocks_google_reviews_section_options_largeur_contenu = 67 chars → 59 chars
        name: 'largeurContenu',
        type: 'select',
        label: 'Largeur du contenu',
        dbName: 'largeur',
        options: [
          { label: 'Étroit      (672px)',  value: 'etroit' },
          { label: 'Normal      (896px)',  value: 'normal' },
          { label: 'Large      (1152px)', value: 'large'  },
          { label: 'Pleine largeur',       value: 'pleine' },
        ],
      },
      {
        name: 'hauteurMin',
        type: 'select',
        label: 'Hauteur minimale',
        options: [
          { label: 'Auto (suit le contenu)', value: 'auto'  },
          { label: 'Demi-écran (50vh)',       value: 'demi'  },
          { label: 'Plein écran (100vh)',     value: 'plein' },
        ],
      },
      {
        name: 'visibilite',
        type: 'select',
        label: 'Visibilité',
        options: [
          { label: 'Toujours visible',  value: 'toujours' },
          { label: 'Desktop seulement', value: 'desktop'  },
          { label: 'Mobile seulement',  value: 'mobile'   },
        ],
      },
      {
        name: 'ancreId',
        type: 'text',
        label: 'Ancre ID',
        admin: {
          description: 'Ex : "services" → le lien #services pointe sur cette section. Minuscules, sans espaces.',
        },
      },
      {
        // dbName shortens enum: _pages_v_blocks_google_reviews_section_options_niveau_titre = 64 chars → 58 chars
        name: 'niveauTitre',
        type: 'select',
        label: 'Niveau du titre (SEO)',
        dbName: 'niveau',
        admin: {
          description: 'Tag HTML du titre principal de cette section. Une seule H1 par page.',
        },
        options: [
          { label: 'H1 — Titre principal de la page', value: 'h1' },
          { label: 'H2 — Section principale',          value: 'h2' },
          { label: 'H3 — Sous-section',               value: 'h3' },
          { label: 'H4 — Sous-sous-section',          value: 'h4' },
        ],
      },
      {
        // dbName raccourcit l'enum : _services_v_blocks_instagram_feed_section_options_couleur_texte > 63 chars → couleur
        name: 'couleurTexte',
        type: 'select',
        label: 'Couleur du texte',
        dbName: 'couleur',
        admin: {
          description: 'Auto = texte clair sur fond sombre. Choisir Sombre si le fond est clair/transparent.',
        },
        options: [
          { label: 'Auto (selon fond)',        value: 'auto'   },
          { label: 'Clair (blanc/gris clair)', value: 'clair'  },
          { label: 'Sombre (noir/gris foncé)', value: 'sombre' },
        ],
      },
    ],
  },
]
