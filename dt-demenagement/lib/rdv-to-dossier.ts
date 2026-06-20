// Mapping pur (sans I/O ni dépendance Payload/React) d'un rendez-vous de visite
// vers les données de création d'un dossier déménagement (collection 'demenagements').
// Préremplit ce qu'on connaît ; les champs manquants sont laissés à l'admin
// (placeholders « À compléter » sur les champs requis). Testable isolément.

export interface RdvForConvert {
  nom?:                 string | null
  prenom?:              string | null
  telephone?:           string | null
  email?:               string | null
  type?:                string | null // 'client' | 'entreprise' | 'administration'
  adresse?:             string | null
  dateVisite?:          string | null // "YYYY-MM-DD"
  heure?:               string | null
  sourcePartenaire?:    number | string | null
  sourcePartenaireNom?: string | null
}

// Type de client RDV → typeClient du dossier (particulier | entreprise).
export function mapTypeClient(type?: string | null): 'particulier' | 'entreprise' {
  return type === 'entreprise' || type === 'administration' ? 'entreprise' : 'particulier'
}

// Compose le nom complet à partir de prénom + nom (placeholder si vide).
export function buildNomComplet(prenom?: string | null, nom?: string | null): string {
  const full = [prenom, nom].map((s) => (s ?? '').trim()).filter(Boolean).join(' ')
  return full || '(à compléter)'
}

// Rendez-vous → données de création d'un dossier déménagement.
// numeroDossier est généré par le hook beforeChange de la collection.
export function buildDossierData(rdv: RdvForConvert): Record<string, unknown> {
  const commentaire = rdv.dateVisite
    ? `Créé depuis un RDV de visite confirmé le ${rdv.dateVisite}${rdv.heure ? ` à ${rdv.heure}` : ''}.`
    : 'Créé depuis un rendez-vous de visite confirmé.'

  return {
    statut:         'devis_recu',
    nomComplet:     buildNomComplet(rdv.prenom, rdv.nom),
    telephone:      (rdv.telephone ?? '').trim(),
    ...(rdv.email ? { clientId: rdv.email } : {}),
    typeClient:     mapTypeClient(rdv.type),
    adresseDepart:  { adresse: (rdv.adresse ?? '').trim() || 'À compléter', ville: 'À compléter' },
    adresseArrivee: { adresse: 'À compléter', ville: 'À compléter' },
    commentaire,
    ...(rdv.sourcePartenaire    ? { sourcePartenaire: rdv.sourcePartenaire } : {}),
    ...(rdv.sourcePartenaireNom ? { sourcePartenaireNom: rdv.sourcePartenaireNom } : {}),
  }
}
