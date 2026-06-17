// Mapping pur (sans I/O ni dépendance Payload/React) d'un lead vers les données
// de création d'un RDV (rendez-vous) ou d'un devis (demenagements). Testable isolément.

export interface LeadForConvert {
  nomPrenom:            string
  telephone:            string
  email?:               string | null
  service?:             string | null
  sourcePartenaire?:    number | string | null
  sourcePartenaireNom?: string | null
}

// Slugs valides pour servicesInclus (cf. options de la collection demenagements).
export const VALID_SERVICE_SLUGS: readonly string[] = [
  'transporteur-en-tunisie',
  'transfert-entreprises',
  'location-monte-meubles',
  'gardes-meubles',
  'services-emballage',
  'montage-demontage',
]

// Découpe "Prénom Nom" : 1er mot = prénom, reste = nom. nom requis côté RDV →
// placeholder explicite si absent (l'admin corrige ensuite).
export function splitNomPrenom(full: string): { prenom: string; nom: string } {
  const parts = full.trim().split(/\s+/).filter(Boolean)
  const prenom = parts[0] ?? '(à compléter)'
  const nom = parts.slice(1).join(' ') || '(à compléter)'
  return { prenom, nom }
}

function partnerFields(lead: LeadForConvert): Record<string, unknown> {
  return {
    ...(lead.sourcePartenaire    ? { sourcePartenaire: lead.sourcePartenaire } : {}),
    ...(lead.sourcePartenaireNom ? { sourcePartenaireNom: lead.sourcePartenaireNom } : {}),
  }
}

// Lead → données de création d'un rendez-vous (collection 'rendez-vous').
export function buildRdvData(lead: LeadForConvert): Record<string, unknown> {
  const { prenom, nom } = splitNomPrenom(lead.nomPrenom)
  return {
    statut:    'nouveau',
    type:      'client',
    prenom,
    nom,
    telephone: lead.telephone,
    whatsapp:  lead.telephone,
    ...(lead.email ? { email: lead.email } : {}),
    ...partnerFields(lead),
  }
}

// Lead → données de création d'un devis (collection 'demenagements').
// numeroDossier est généré par le hook beforeChange de la collection.
export function buildDevisData(lead: LeadForConvert): Record<string, unknown> {
  const service = lead.service ?? ''
  const validService = VALID_SERVICE_SLUGS.includes(service)
  return {
    statut:         'devis_recu',
    nomComplet:     lead.nomPrenom,
    ...(lead.email ? { clientId: lead.email } : {}),
    telephone:      lead.telephone,
    typeClient:     'particulier',
    adresseDepart:  { adresse: 'À compléter', ville: 'À compléter' },
    adresseArrivee: { adresse: 'À compléter', ville: 'À compléter' },
    ...(validService ? { servicesInclus: [service] } : {}),
    commentaire:    'Créé depuis un lead.',
    ...partnerFields(lead),
  }
}
