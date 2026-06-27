import type { CollectionConfig } from 'payload'
import { isAdmin } from '../access/isAdmin'
import { upsertClient } from '../../lib/upsert-client'
import { splitNomPrenom } from '../../lib/lead-convert'
import { sendDossierClientEmail } from '../../lib/emails/dossier-client'
import { normalizePhoneTN } from '../../lib/phone'

const etageOptions = [
  { label: 'RDC', value: 'RDC' },
  { label: '1er étage', value: '1' },
  { label: '2ème étage', value: '2' },
  { label: '3ème étage', value: '3' },
  { label: '4ème étage', value: '4' },
  { label: '5ème +', value: '5+' },
]

const Demenagements: CollectionConfig = {
  slug: 'demenagements',
  labels: { singular: 'Dossier déménagement', plural: 'Dossiers déménagement' },

  access: {
    read:   isAdmin,
    create: isAdmin,
    update: isAdmin,
    delete: isAdmin,
  },

  admin: {
    group: '🚚 Opérations',
    useAsTitle: 'numeroDossier',
    defaultColumns: ['numeroDossier', 'nomComplet', 'telephone', 'statut', 'dateDemenagement', 'devisStatut', 'prixTotalTTC'],
    listSearchableFields: ['numeroDossier', 'nomComplet', 'telephone', 'clientId', 'sourcePartenaireNom'],
    description: 'Chaque ligne = une demande de devis reçue. Modifier le "Statut du dossier" pour que le client voie l\'avancement en temps réel.',
    components: {
      beforeListTable: ['@/components/payload/DossierExportButton'],
    },
  },

  hooks: {
    // À la création d'un dossier (manuel OU depuis un RDV), si un email client est saisi
    // (champ clientId) : on crée/met à jour sa fiche client (espace client) ET on lui
    // envoie le MÊME email de confirmation + magic link que depuis le site.
    // Le site (/api/devis) envoie déjà cet email → il pose context.skipClientConfirmation
    // pour que le hook ne le renvoie pas (anti-doublon).
    afterChange: [
      async ({ doc, operation, req }: {
        doc: Record<string, unknown>
        operation: string
        req: import('payload').PayloadRequest
      }) => {
        if (operation !== 'create') return
        const email = String(doc.clientId ?? '').trim()
        if (!email) return
        const { prenom, nom } = splitNomPrenom(String(doc.nomComplet ?? ''))

        await upsertClient(req.payload, {
          email,
          telephone: doc.telephone ? String(doc.telephone) : undefined,
          prenom,
          nom,
        }).catch((e: unknown) => {
          req.payload.logger.error(`[demenagements] upsert client échoué : ${e instanceof Error ? e.message : String(e)}`)
        })

        const skip = Boolean((req.context as Record<string, unknown> | undefined)?.skipClientConfirmation)
        if (!skip) {
          await sendDossierClientEmail({
            email,
            prenom,
            numeroDossier: String(doc.numeroDossier ?? ''),
          }).catch((e: unknown) => {
            req.payload.logger.error(`[demenagements] email confirmation client échoué : ${e instanceof Error ? e.message : String(e)}`)
          })
        }
      },
    ],
    beforeChange: [
      ({ data }: { data: Record<string, unknown> }) => {
        if (!data.numeroDossier) {
          const year = new Date().getFullYear()
          const suffix = Math.floor(1000 + Math.random() * 9000)
          data = { ...data, numeroDossier: `DT-${year}-${suffix}` }
        }
        return data
      },
      ({ data }: { data: Record<string, unknown> }) => {
        if (typeof data.telephone === 'string' && data.telephone.trim()) {
          data.telephone = normalizePhoneTN(data.telephone)
        }
        return data
      },
    ],
    beforeDelete: [
      async ({ id, req }: { id: string | number; req: import('payload').PayloadRequest }) => {
        // Delete all messages linked to this dossier before deleting it.
        // Without this, the PostgreSQL FK constraint on messages.demenagement (NOT NULL)
        // blocks the delete and causes a silent failure in the admin UI.
        const linked = await req.payload.find({
          collection: 'messages',
          where: { demenagement: { equals: id } },
          limit: 0,
          overrideAccess: true,
          req,
        })
        if (linked.totalDocs > 0) {
          await Promise.all(
            linked.docs.map((msg: { id: string | number }) =>
              req.payload.delete({
                collection: 'messages',
                id: msg.id,
                overrideAccess: true,
                req,
              })
            )
          )
        }
      },
    ],
  },

  fields: [
    // ── Barre de progression (toujours visible en haut) ───────────────────────
    {
      name: 'pipelineStatus',
      type: 'ui',
      label: '📍 Avancement',
      admin: {
        components: { Field: '@/components/payload/DossierPipelineField' },
      },
    },

    // ── Tabs ──────────────────────────────────────────────────────────────────
    {
      type: 'tabs',
      tabs: [

        // ── Tab 1 : Client ────────────────────────────────────────────────────
        {
          label: '👤 Client',
          fields: [
            {
              type: 'row',
              fields: [
                {
                  name: 'nomComplet',
                  label: 'Nom complet',
                  type: 'text',
                  admin: {
                    width: '50%',
                    placeholder: 'Prénom Nom',
                    components: { Cell: '@/components/payload/DossierClientCell' },
                  },
                },
                {
                  name: 'telephone',
                  label: 'Téléphone',
                  type: 'text',
                  admin: { width: '50%', placeholder: '+216 XX XXX XXX', components: { Cell: '@/components/payload/PhoneCell' } },
                },
              ],
            },
            {
              type: 'row',
              fields: [
                {
                  name: 'clientId',
                  label: 'Email',
                  type: 'text',
                  admin: {
                    width: '50%',
                    placeholder: 'client@email.com',
                    description: 'Optionnel pour les dossiers créés manuellement.',
                  },
                },
                {
                  name: 'typeClient',
                  label: 'Type de client',
                  type: 'select',
                  options: [
                    { label: 'Particulier', value: 'particulier' },
                    { label: 'Entreprise',  value: 'entreprise' },
                  ],
                  admin: { width: '50%' },
                },
              ],
            },
            {
              name: 'commentaire',
              label: 'Message / Notes',
              type: 'textarea',
              admin: { placeholder: 'Message du client ou notes de l\'admin…' },
            },
            {
              name: 'sourcePartenaire',
              label: 'Partenaire affilié',
              type: 'relationship',
              relationTo: 'affiliates',
              admin: {
                readOnly: true,
                condition: (data: Record<string, unknown>) => Boolean(data.sourcePartenaire),
              },
            },
            {
              name: 'sourcePartenaireNom',
              label: 'Nom du partenaire',
              type: 'text',
              admin: {
                readOnly: true,
                description: 'Conservé même si le partenaire est supprimé.',
                condition: (data: Record<string, unknown>) => Boolean(data.sourcePartenaireNom),
              },
            },
            {
              name: 'clientAccessActions',
              type: 'ui',
              admin: {
                components: { Field: '@/components/payload/ClientAccessActions' },
              },
            },
          ],
        },

        // ── Tab 2 : Adresses ──────────────────────────────────────────────────
        {
          label: '📍 Adresses',
          fields: [
            {
              name: 'adresseDepart',
              type: 'group',
              label: '📦 Départ',
              fields: [
                {
                  type: 'row',
                  fields: [
                    {
                      name: 'adresse',
                      label: 'Rue / Adresse',
                      type: 'text',
                      required: true,
                      admin: { width: '70%', placeholder: '12 rue des Orangers' },
                    },
                    {
                      name: 'etage',
                      label: 'Étage',
                      type: 'select',
                      options: etageOptions,
                      admin: { width: '30%' },
                    },
                  ],
                },
                {
                  type: 'row',
                  fields: [
                    {
                      name: 'ville',
                      label: 'Ville',
                      type: 'text',
                      required: true,
                      admin: { width: '70%', placeholder: 'Tunis' },
                    },
                    {
                      name: 'ascenseur',
                      label: 'Ascenseur',
                      type: 'checkbox',
                      defaultValue: false,
                      admin: { width: '30%' },
                    },
                  ],
                },
                { name: 'lat', label: 'Lat', type: 'number', admin: { condition: () => false } },
                { name: 'lng', label: 'Lng', type: 'number', admin: { condition: () => false } },
              ],
            },
            {
              name: 'adresseArrivee',
              type: 'group',
              label: '🏠 Arrivée',
              fields: [
                {
                  type: 'row',
                  fields: [
                    {
                      name: 'adresse',
                      label: 'Rue / Adresse',
                      type: 'text',
                      required: true,
                      admin: { width: '70%', placeholder: '5 avenue Habib Bourguiba' },
                    },
                    {
                      name: 'etage',
                      label: 'Étage',
                      type: 'select',
                      options: etageOptions,
                      admin: { width: '30%' },
                    },
                  ],
                },
                {
                  type: 'row',
                  fields: [
                    {
                      name: 'ville',
                      label: 'Ville',
                      type: 'text',
                      required: true,
                      admin: { width: '70%', placeholder: 'Sfax' },
                    },
                    {
                      name: 'ascenseur',
                      label: 'Ascenseur',
                      type: 'checkbox',
                      defaultValue: false,
                      admin: { width: '30%' },
                    },
                  ],
                },
                { name: 'lat', label: 'Lat', type: 'number', admin: { condition: () => false } },
                { name: 'lng', label: 'Lng', type: 'number', admin: { condition: () => false } },
              ],
            },
            {
              type: 'collapsible',
              label: '📸 Photos envoyées par le client',
              admin: { initCollapsed: false },
              fields: [
                {
                  name: 'photosDepart',
                  label: 'Accès départ',
                  type: 'upload',
                  relationTo: 'media',
                  hasMany: true,
                  admin: {
                    description: 'Escalier, couloir, parking au départ.',
                    components: { Field: '@/components/payload/PhotosUploaderField' },
                  },
                },
                {
                  name: 'photosArrivee',
                  label: 'Accès arrivée',
                  type: 'upload',
                  relationTo: 'media',
                  hasMany: true,
                  admin: {
                    description: "Escalier, couloir, parking à l'arrivée.",
                    components: { Field: '@/components/payload/PhotosUploaderField' },
                  },
                },
                {
                  name: 'photosMeubles',
                  label: 'Meubles & objets',
                  type: 'upload',
                  relationTo: 'media',
                  hasMany: true,
                  admin: {
                    description: 'Photos pour estimer le volume.',
                    components: { Field: '@/components/payload/PhotosUploaderField' },
                  },
                },
                {
                  name: 'photoActions',
                  type: 'ui',
                  admin: {
                    components: { Field: '@/components/payload/DemenagementPhotoActions' },
                  },
                },
              ],
            },
          ],
        },

        // ── Tab 3 : Dossier ───────────────────────────────────────────────────
        {
          label: '🗓 Dossier',
          fields: [
            {
              type: 'row',
              fields: [
                {
                  name: 'statut',
                  label: 'Statut',
                  type: 'select',
                  required: true,
                  defaultValue: 'devis_recu',
                  options: [
                    { label: 'Devis reçu', value: 'devis_recu' },
                    { label: 'Confirmé',   value: 'confirme' },
                    { label: 'En cours',   value: 'en_cours' },
                    { label: 'Livré',      value: 'livre' },
                    { label: 'Annulé',     value: 'annule' },
                  ],
                  admin: {
                    width: '50%',
                    description: '👆 Ce champ est visible par le client dans son espace.',
                    components: { Cell: '@/components/payload/DossierStatutCell' },
                  },
                },
                {
                  name: 'dateDemenagement',
                  label: 'Date souhaitée',
                  type: 'date',
                  admin: { width: '50%', description: 'À confirmer avec le client.' },
                },
              ],
            },
            {
              name: 'servicesInclus',
              label: 'Services demandés',
              type: 'select',
              hasMany: true,
              options: [
                { label: 'Transporteur en Tunisie',  value: 'transporteur-en-tunisie' },
                { label: 'Transfert Entreprises',    value: 'transfert-entreprises' },
                { label: 'Location Monte-Meubles',   value: 'location-monte-meubles' },
                { label: 'Garde-Meubles / Stockage', value: 'gardes-meubles' },
                { label: 'Service Emballage',         value: 'services-emballage' },
                { label: 'Montage & Démontage',       value: 'montage-demontage' },
              ],
            },
            {
              name: 'numeroDossier',
              label: 'Numéro de dossier',
              type: 'text',
              unique: true,
              admin: {
                readOnly: true,
                description: 'Généré automatiquement à la création.',
                components: { Cell: '@/components/payload/DossierNumeroCell' },
              },
            },
          ],
        },

        // ── Tab 4 : Devis ─────────────────────────────────────────────────────
        {
          label: '💰 Devis',
          fields: [
            {
              type: 'row',
              fields: [
                {
                  name: 'devisStatut',
                  label: 'Statut',
                  type: 'select',
                  defaultValue: 'brouillon',
                  options: [
                    { label: 'Brouillon', value: 'brouillon' },
                    { label: 'Envoyé',    value: 'envoye'    },
                    { label: 'Accepté',   value: 'accepte'   },
                    { label: 'Refusé',    value: 'refuse'    },
                  ],
                  admin: {
                    width: '50%',
                    components: { Cell: '@/components/payload/DevisStatutCell' },
                  },
                },
                {
                  name: 'prixTotalTTC',
                  label: 'Prix total TTC (DT)',
                  type: 'number',
                  admin: {
                    width: '50%',
                    placeholder: 'ex : 850',
                  },
                },
              ],
            },
            {
              name: 'devisNotes',
              label: 'Corps du devis',
              type: 'textarea',
              defaultValue: `Prestations incluses : chargement, transport et déchargement par une équipe professionnelle — matériel de protection fourni (couvertures, sangles, film plastique).

Ce devis est établi sur la base des informations communiquées. Tout volume supplémentaire ou prestation additionnelle fera l'objet d'un avenant.

Conditions : devis valable 30 jours à compter de sa date d'émission — paiement à la livraison — prix TTC.`,
              admin: {
                description: 'Apparaît dans le PDF du devis. Modifiable avant envoi.',
                rows: 7,
              },
            },
            {
              name: 'devisCommentaireClient',
              label: 'Commentaire du client',
              type: 'textarea',
              admin: {
                readOnly: true,
                condition: (data: Record<string, unknown>) => Boolean(data.devisCommentaireClient),
              },
            },
            {
              name: 'devisGenerateur',
              type: 'ui',
              label: '🚀 Générer et envoyer le devis',
              admin: {
                components: { Field: '@/components/payload/DevisGenerator' },
              },
            },
          ],
        },

        // ── Tab 5 : Facture ───────────────────────────────────────────────────
        {
          label: '🧾 Facture',
          fields: [
            // Always mounted — shows lock UI when devis not accepted, null when accepted
            {
              name: 'factureLock',
              type: 'ui',
              admin: {
                components: { Field: '@/components/payload/FactureLock' },
              },
            },
            // All real fields only appear once devis is accepted
            {
              type: 'row',
              fields: [
                {
                  name: 'factureStatut',
                  label: 'Statut',
                  type: 'select',
                  defaultValue: 'brouillon',
                  options: [
                    { label: 'Brouillon',  value: 'brouillon'  },
                    { label: 'Émise',      value: 'emise'      },
                    { label: 'Payée',      value: 'payee'      },
                    { label: 'En retard',  value: 'en_retard'  },
                  ],
                  admin: {
                    width: '34%',
                    condition: (data: Record<string, unknown>) => data.devisStatut === 'accepte',
                  },
                },
                {
                  name: 'facturePrixTTC',
                  label: 'Montant total TTC (DT)',
                  type: 'number',
                  admin: {
                    width: '33%',
                    placeholder: 'ex : 850',
                    condition: (data: Record<string, unknown>) => data.devisStatut === 'accepte',
                  },
                },
                {
                  name: 'factureTauxTVA',
                  label: 'Taux TVA (%)',
                  type: 'number',
                  defaultValue: 19,
                  admin: {
                    width: '33%',
                    placeholder: '19',
                    description: 'Taux appliqué sur le HT (standard Tunisie : 19 %).',
                    condition: (data: Record<string, unknown>) => data.devisStatut === 'accepte',
                  },
                },
              ],
            },
            {
              type: 'row',
              fields: [
                {
                  name: 'factureEmiseLe',
                  label: 'Émise le',
                  type: 'date',
                  admin: {
                    width: '50%',
                    readOnly: true,
                    description: "Mis à jour automatiquement lors de l'envoi.",
                    condition: (data: Record<string, unknown>) => data.devisStatut === 'accepte',
                  },
                },
                {
                  name: 'factureEcheanceLe',
                  label: "Date d'échéance",
                  type: 'date',
                  validate: (val: unknown) => {
                    if (!val) return true
                    const selected = new Date(val as string)
                    const today = new Date()
                    today.setHours(0, 0, 0, 0)
                    if (selected < today) return "La date d'échéance ne peut pas être dans le passé."
                    return true
                  },
                  admin: {
                    width: '50%',
                    condition: (data: Record<string, unknown>) => data.devisStatut === 'accepte',
                  },
                },
              ],
            },
            {
              name: 'factureNotes',
              label: 'Notes / Coordonnées bancaires',
              type: 'textarea',
              admin: {
                placeholder: 'Mode de paiement, RIB, instructions de paiement…',
                rows: 4,
                condition: (data: Record<string, unknown>) => data.devisStatut === 'accepte',
              },
            },
            {
              name: 'factureGenerateur',
              label: '🧾 Générer et envoyer la facture',
              type: 'ui',
              admin: {
                components: { Field: '@/components/payload/FactureGenerator' },
                condition: (data: Record<string, unknown>) => data.devisStatut === 'accepte',
              },
            },
          ],
        },

        // ── Tab 6 : Messagerie ────────────────────────────────────────────────
        {
          label: '💬 Messagerie',
          fields: [
            {
              name: 'messagerie',
              type: 'ui',
              label: '💬 Messagerie',
              admin: {
                components: { Field: '@/components/payload/MessageChatField' },
              },
            },
          ],
        },
      ],
    },

    // ── Champs hors formulaire (données API + cellules liste) ─────────────────
    { name: 'devisValiditeJours',type: 'number',   label: 'Validité devis',   admin: { hidden: true }, defaultValue: 30 },
    { name: 'devisEnvoyeLe',     type: 'text',     label: 'Devis envoyé le',  admin: { hidden: true } },
    { name: 'devisReponduLe',    type: 'text',     label: 'Devis répondu le', admin: { hidden: true } },
    {
      name: 'lignesDevis',
      type: 'array',
      label: 'Lignes du devis',
      admin: { hidden: true },
      fields: [
        { name: 'designation',  label: 'Désignation', type: 'text'   },
        { name: 'quantite',     label: 'Qté',          type: 'number', defaultValue: 1 },
        { name: 'prixUnitaire', label: 'Prix',         type: 'number' },
      ],
    },
    {
      name: 'notesRapides',
      label: '⚡ Notes rapides',
      type: 'textarea',
      admin: {
        hidden: true,
        components: { Cell: '@/components/payload/DossierNotesCell' },
      },
    },
  ],
}

export default Demenagements
