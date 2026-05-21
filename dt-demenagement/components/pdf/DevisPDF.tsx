import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer'

// ── Palette ───────────────────────────────────────────────────────────────────
const RED    = '#b52027'
const GOLD   = '#c9a84c'
const DARK   = '#0f0f0f'
const DARK2  = '#1c1c1c'
const GRAY   = '#555555'
const MUTED  = '#8a8a8a'
const LIGHT  = '#f4f4f4'
const LIGHT2 = '#fafafa'
const BORDER = '#e2e2e2'
const WHITE  = '#ffffff'
const RED_BG = '#fdf0f1'
const GOLD_BG = '#fdf9ee'

// ── Styles ────────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  page: { fontFamily: 'Helvetica', fontSize: 9, color: DARK2, backgroundColor: WHITE },

  // decorative left stripe
  stripe: { position: 'absolute', top: 0, left: 0, bottom: 0, width: 5, backgroundColor: RED },

  // ── Header ──────────────────────────────────────────────────────────────────
  header: {
    backgroundColor: DARK,
    paddingTop: 26, paddingBottom: 24,
    paddingLeft: 50, paddingRight: 36,
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start',
  },
  companyNameRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
  companyBar:  { width: 3, height: 24, backgroundColor: RED, marginRight: 10, borderRadius: 2 },
  companyName: { fontSize: 19, fontFamily: 'Helvetica-Bold', color: WHITE, letterSpacing: 0.3 },
  companyTagline: { fontSize: 6.5, color: GOLD, letterSpacing: 2, marginLeft: 13, marginBottom: 10 },
  companyContact: { fontSize: 7.5, color: 'rgba(255,255,255,0.5)', lineHeight: 1.9, marginLeft: 13 },

  // Devis panel
  devisPanel: {
    backgroundColor: RED, borderRadius: 6,
    paddingVertical: 14, paddingHorizontal: 18,
    alignItems: 'flex-end', minWidth: 152,
  },
  devisWord:   { fontSize: 28, fontFamily: 'Helvetica-Bold', color: WHITE, letterSpacing: 5 },
  devisNum:    { fontSize: 12, fontFamily: 'Helvetica-Bold', color: GOLD, marginTop: 4 },
  devisDivider:{ height: 1, backgroundColor: 'rgba(255,255,255,0.2)', marginVertical: 8, alignSelf: 'stretch' },
  devisDateLbl:{ fontSize: 6, color: 'rgba(255,255,255,0.45)', letterSpacing: 0.5, marginBottom: 2 },
  devisDateVal:{ fontSize: 8, fontFamily: 'Helvetica-Bold', color: WHITE },

  // ── Gold bar ─────────────────────────────────────────────────────────────────
  goldBar: { height: 4, backgroundColor: GOLD },

  // ── Body ─────────────────────────────────────────────────────────────────────
  body: { paddingTop: 20, paddingBottom: 70, paddingLeft: 50, paddingRight: 40 },

  // ── Section ──────────────────────────────────────────────────────────────────
  section: { marginBottom: 16 },
  sectionHead: {
    flexDirection: 'row', alignItems: 'center',
    marginBottom: 9, paddingBottom: 6,
    borderBottomWidth: 1, borderBottomColor: BORDER,
  },
  sectionDot:   { width: 7, height: 7, backgroundColor: RED, borderRadius: 2, marginRight: 8 },
  sectionTitle: { fontSize: 7.5, fontFamily: 'Helvetica-Bold', color: RED, letterSpacing: 1.5, flex: 1 },
  sectionBadge: { fontSize: 7, color: MUTED, backgroundColor: LIGHT, paddingVertical: 2, paddingHorizontal: 7, borderRadius: 3 },

  // ── Client cards ─────────────────────────────────────────────────────────────
  cardRow: { flexDirection: 'row' },
  card: {
    flex: 1, backgroundColor: LIGHT, borderRadius: 4,
    paddingVertical: 9, paddingHorizontal: 10,
    borderLeftWidth: 2, borderLeftColor: BORDER, marginRight: 7,
  },
  cardLast: {
    flex: 1, backgroundColor: RED_BG, borderRadius: 4,
    paddingVertical: 9, paddingHorizontal: 10,
    borderLeftWidth: 2, borderLeftColor: RED,
  },
  cardLabel: { fontSize: 6.5, color: MUTED, letterSpacing: 0.5, marginBottom: 3 },
  cardValue: { fontSize: 9, fontFamily: 'Helvetica-Bold', color: DARK2 },

  // ── Move boxes ───────────────────────────────────────────────────────────────
  moveRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  moveBox: { flex: 1, borderWidth: 1, borderColor: BORDER, borderRadius: 4 },
  moveHead: {
    backgroundColor: LIGHT, paddingVertical: 5, paddingHorizontal: 10,
    borderBottomWidth: 1, borderBottomColor: BORDER,
    flexDirection: 'row', alignItems: 'center',
  },
  moveDotRed:   { width: 6, height: 6, borderRadius: 3, backgroundColor: RED,      marginRight: 6 },
  moveDotGreen: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#2d7a2d', marginRight: 6 },
  moveHeadText: { fontSize: 7, fontFamily: 'Helvetica-Bold', color: GRAY, letterSpacing: 1 },
  moveBody:     { paddingVertical: 9, paddingHorizontal: 10 },
  moveAddress:  { fontSize: 8.5, color: DARK2, lineHeight: 1.6 },
  moveSub:      { fontSize: 7, color: MUTED, marginTop: 2 },

  moveArrow: { width: 34, alignItems: 'center', justifyContent: 'center' },
  arrowCircle: {
    width: 20, height: 20, borderRadius: 10,
    backgroundColor: RED, alignItems: 'center', justifyContent: 'center',
  },
  arrowText: { fontSize: 10, color: WHITE, fontFamily: 'Helvetica-Bold' },

  // ── Date / volume row ─────────────────────────────────────────────────────────
  infoRow: { flexDirection: 'row' },
  infoCell: {
    flex: 1, flexDirection: 'row', alignItems: 'center',
    borderWidth: 1, borderColor: BORDER, borderRadius: 4,
    paddingVertical: 7, paddingHorizontal: 10, marginRight: 7,
  },
  infoCellLast: {
    flex: 1, flexDirection: 'row', alignItems: 'center',
    borderWidth: 1, borderColor: BORDER, borderRadius: 4,
    paddingVertical: 7, paddingHorizontal: 10,
  },
  infoBadge: {
    width: 20, height: 20, borderRadius: 10,
    backgroundColor: RED_BG, alignItems: 'center', justifyContent: 'center', marginRight: 8,
  },
  infoBadgeText: { fontSize: 10, color: RED, fontFamily: 'Helvetica-Bold' },
  infoLabel: { fontSize: 6.5, color: MUTED, letterSpacing: 0.5, marginBottom: 2 },
  infoValue: { fontSize: 9, fontFamily: 'Helvetica-Bold', color: DARK2 },

  // ── Services ─────────────────────────────────────────────────────────────────
  servicesBox: {
    borderWidth: 1, borderColor: BORDER, borderRadius: 4,
    backgroundColor: LIGHT2, paddingVertical: 4, paddingHorizontal: 12,
  },
  servicesGrid: { flexDirection: 'row', flexWrap: 'wrap' },
  serviceItem: { width: '50%', flexDirection: 'row', alignItems: 'center', paddingVertical: 5, paddingRight: 10 },
  serviceDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: GOLD, marginRight: 8 },
  serviceText: { fontSize: 8.5, color: DARK2 },

  // ── Price ────────────────────────────────────────────────────────────────────
  priceTopBar: {
    backgroundColor: DARK2,
    borderTopLeftRadius: 4, borderTopRightRadius: 4,
    paddingVertical: 9, paddingHorizontal: 16,
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
  },
  priceTopLabel: { fontSize: 7.5, fontFamily: 'Helvetica-Bold', color: 'rgba(255,255,255,0.45)', letterSpacing: 1.5 },
  priceTopBadge: { fontSize: 7, color: GOLD },

  priceMainBox: {
    backgroundColor: RED,
    paddingVertical: 16, paddingHorizontal: 20,
    flexDirection: 'row', justifyContent: 'center', alignItems: 'flex-end',
  },
  priceAmount: { fontSize: 36, fontFamily: 'Helvetica-Bold', color: GOLD },
  priceCurrency: { fontSize: 14, fontFamily: 'Helvetica-Bold', color: 'rgba(255,255,255,0.55)', marginLeft: 7, marginBottom: 5 },

  priceBottomBar: {
    backgroundColor: '#1e0408',
    borderBottomLeftRadius: 4, borderBottomRightRadius: 4,
    paddingVertical: 8, paddingHorizontal: 16,
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
  },
  priceBottomLeft:  { fontSize: 7.5, color: 'rgba(255,255,255,0.35)' },
  priceBottomRight: { fontSize: 7.5, color: GOLD, fontFamily: 'Helvetica-Bold' },

  // ── Notes ────────────────────────────────────────────────────────────────────
  notesBox: {
    backgroundColor: GOLD_BG, borderRadius: 4,
    paddingVertical: 10, paddingHorizontal: 14,
    borderWidth: 1, borderColor: '#e8d988',
    borderLeftWidth: 3, borderLeftColor: GOLD,
  },
  notesText: { fontSize: 8.5, color: '#444', lineHeight: 1.8 },

  // ── Conditions ───────────────────────────────────────────────────────────────
  condBox: {
    backgroundColor: LIGHT, borderRadius: 4,
    paddingVertical: 10, paddingHorizontal: 14,
    borderWidth: 1, borderColor: BORDER,
  },
  condRow:   { flexDirection: 'row', marginBottom: 3 },
  condBullet:{ fontSize: 7.5, color: RED, width: 10, lineHeight: 1.65 },
  condText:  { flex: 1, fontSize: 7.5, color: GRAY, lineHeight: 1.65 },

  // ── Signature ────────────────────────────────────────────────────────────────
  sigRow: { flexDirection: 'row' },
  sigBox: { flex: 1, borderWidth: 1, borderColor: BORDER, borderRadius: 4, marginRight: 10 },
  sigBoxLast: { flex: 1, borderWidth: 1, borderColor: BORDER, borderRadius: 4 },
  sigHead: {
    backgroundColor: LIGHT, paddingVertical: 6, paddingHorizontal: 10,
    borderBottomWidth: 1, borderBottomColor: BORDER,
  },
  sigHeadText: { fontSize: 7, fontFamily: 'Helvetica-Bold', color: GRAY, letterSpacing: 0.5 },
  sigBody: { paddingVertical: 10, paddingHorizontal: 12, minHeight: 60 },
  sigHint: { fontSize: 7, color: '#ccc' },
  sigLine: { borderBottomWidth: 1, borderBottomColor: BORDER, marginTop: 36 },
  sigCaption: { fontSize: 6.5, color: MUTED, marginTop: 4, textAlign: 'center' },

  // ── Footer ───────────────────────────────────────────────────────────────────
  footer: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: DARK },
  footerGold: { height: 3, backgroundColor: GOLD },
  footerBody: {
    paddingVertical: 11, paddingHorizontal: 50,
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
  },
  footerCompany: { fontSize: 9, fontFamily: 'Helvetica-Bold', color: WHITE },
  footerSub:     { fontSize: 7, color: '#555', marginTop: 2 },
  footerInfo:    { fontSize: 7.5, color: '#666', lineHeight: 1.8, textAlign: 'right' },
})

// ── Types ─────────────────────────────────────────────────────────────────────

type Adresse = { adresse?: string; ville?: string; etage?: string; ascenseur?: boolean }

export type Dossier = {
  numeroDossier?:      string
  nomComplet?:         string
  clientId?:           string
  telephone?:          string
  typeClient?:         string
  dateDemenagement?:   string
  adresseDepart?:      Adresse
  adresseArrivee?:     Adresse
  servicesInclus?:     string[]
  volumeM3?:           number
  prixTotalTTC?:       number
  devisValiditeJours?: number
  devisNotes?:         string
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function fmtDate(iso?: string): string {
  if (!iso) return '—'
  try { return new Date(iso).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' }) }
  catch { return iso }
}

function addDays(days: number): string {
  const d = new Date()
  d.setDate(d.getDate() + days)
  return d.toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })
}

function fmtNum(n: number): string {
  return Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ')
}

function etageStr(e?: string): string {
  if (!e) return ''
  return e === 'RDC' ? 'Rez-de-chaussée' : `${e}ème étage`
}

function adresseStr(a?: Adresse): string {
  if (!a) return '—'
  const parts = [a.adresse, a.ville].filter(Boolean)
  return parts.length ? parts.join(', ') : '—'
}

const SERVICE_LABELS: Record<string, string> = {
  'transporteur-en-tunisie': 'Transporteur en Tunisie',
  'transfert-entreprises':   'Transfert Entreprises',
  'location-monte-meubles':  'Location Monte-Meubles',
  'gardes-meubles':          'Garde-Meubles / Stockage',
  'services-emballage':      'Service Emballage',
  'montage-demontage':       'Montage & Démontage',
}

const CONDITIONS = [
  "Ce devis est établi sur la base des informations communiquées par le client.",
  "Les prix incluent la main-d'oeuvre, le transport, l'emballage et la protection du mobilier.",
  "Toute modification de volume ou de prestation fera l'objet d'un avenant écrit.",
  "Le devis accepté vaut contrat. Un acompte de 30 % est requis à la signature.",
  "Annulation à moins de 48 h : des frais de déplacement pourront être facturés.",
]

// ── PDF Component ─────────────────────────────────────────────────────────────

export function DevisPDF({ dossier }: { dossier: Dossier }) {
  const validite   = dossier.devisValiditeJours ?? 30
  const expiration = addDays(validite)
  const today      = new Date().toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })
  const typeClient = dossier.typeClient === 'entreprise' ? 'ENTREPRISE' : 'PARTICULIER'
  const services   = (dossier.servicesInclus ?? []).map(sv => SERVICE_LABELS[sv] ?? sv)
  const prix       = dossier.prixTotalTTC

  const etageDepart  = etageStr(dossier.adresseDepart?.etage)
  const etageArrivee = etageStr(dossier.adresseArrivee?.etage)

  return (
    <Document
      title={`Devis ${dossier.numeroDossier ?? ''} — DT Déménagement Tunisie`}
      author="DT Déménagement Tunisie"
      subject="Devis de déménagement"
    >
      <Page size="A4" style={s.page}>

        {/* Left red stripe */}
        <View style={s.stripe} />

        {/* ── HEADER ── */}
        <View style={s.header}>
          <View>
            <View style={s.companyNameRow}>
              <View style={s.companyBar} />
              <Text style={s.companyName}>DT Déménagement Tunisie</Text>
            </View>
            <Text style={s.companyTagline}>SOCIÉTÉ DE DÉMÉNAGEMENT PROFESSIONNEL</Text>
            <Text style={s.companyContact}>
              {'Tél : +216 52 880 311  |  +216 52 880 112\nEmail : contact@demenagement.tn\nSite : demenagement.tn  |  Tunis, Tunisie'}
            </Text>
          </View>

          <View style={s.devisPanel}>
            <Text style={s.devisWord}>DEVIS</Text>
            <Text style={s.devisNum}>{dossier.numeroDossier ?? 'N/A'}</Text>
            <View style={s.devisDivider} />
            <Text style={s.devisDateLbl}>DATE D'ÉMISSION</Text>
            <Text style={s.devisDateVal}>{today}</Text>
            <Text style={[s.devisDateLbl, { marginTop: 7 }]}>VALIDE JUSQU'AU</Text>
            <Text style={s.devisDateVal}>{expiration}</Text>
          </View>
        </View>

        {/* Gold separator */}
        <View style={s.goldBar} />

        {/* ── BODY ── */}
        <View style={s.body}>

          {/* CLIENT */}
          <View style={s.section}>
            <View style={s.sectionHead}>
              <View style={s.sectionDot} />
              <Text style={s.sectionTitle}>INFORMATIONS CLIENT</Text>
              <Text style={s.sectionBadge}>{typeClient}</Text>
            </View>
            <View style={s.cardRow}>
              <View style={s.card}>
                <Text style={s.cardLabel}>NOM COMPLET</Text>
                <Text style={s.cardValue}>{dossier.nomComplet ?? '—'}</Text>
              </View>
              <View style={s.card}>
                <Text style={s.cardLabel}>TÉLÉPHONE</Text>
                <Text style={s.cardValue}>{dossier.telephone ?? '—'}</Text>
              </View>
              <View style={s.cardLast}>
                <Text style={s.cardLabel}>EMAIL</Text>
                <Text style={s.cardValue}>{dossier.clientId ?? '—'}</Text>
              </View>
            </View>
          </View>

          {/* DÉMÉNAGEMENT */}
          <View style={s.section}>
            <View style={s.sectionHead}>
              <View style={s.sectionDot} />
              <Text style={s.sectionTitle}>DÉTAILS DU DÉMÉNAGEMENT</Text>
              {dossier.dateDemenagement && (
                <Text style={s.sectionBadge}>{fmtDate(dossier.dateDemenagement)}</Text>
              )}
            </View>

            {/* Départ → Arrivée */}
            <View style={s.moveRow}>
              <View style={s.moveBox}>
                <View style={s.moveHead}>
                  <View style={s.moveDotRed} />
                  <Text style={s.moveHeadText}>DÉPART</Text>
                </View>
                <View style={s.moveBody}>
                  <Text style={s.moveAddress}>{adresseStr(dossier.adresseDepart)}</Text>
                  {etageDepart ? (
                    <Text style={s.moveSub}>
                      {etageDepart}{dossier.adresseDepart?.ascenseur ? '  •  Avec ascenseur' : ''}
                    </Text>
                  ) : null}
                </View>
              </View>

              <View style={s.moveArrow}>
                <View style={s.arrowCircle}>
                  <Text style={s.arrowText}>{'>'}</Text>
                </View>
              </View>

              <View style={s.moveBox}>
                <View style={s.moveHead}>
                  <View style={s.moveDotGreen} />
                  <Text style={s.moveHeadText}>ARRIVÉE</Text>
                </View>
                <View style={s.moveBody}>
                  <Text style={s.moveAddress}>{adresseStr(dossier.adresseArrivee)}</Text>
                  {etageArrivee ? (
                    <Text style={s.moveSub}>
                      {etageArrivee}{dossier.adresseArrivee?.ascenseur ? '  •  Avec ascenseur' : ''}
                    </Text>
                  ) : null}
                </View>
              </View>
            </View>

            {/* Date + volume */}
            {(dossier.dateDemenagement || dossier.volumeM3) && (
              <View style={s.infoRow}>
                {dossier.dateDemenagement && (
                  <View style={dossier.volumeM3 ? s.infoCell : s.infoCellLast}>
                    <View style={s.infoBadge}>
                      <Text style={s.infoBadgeText}>i</Text>
                    </View>
                    <View>
                      <Text style={s.infoLabel}>DATE SOUHAITÉE</Text>
                      <Text style={s.infoValue}>{fmtDate(dossier.dateDemenagement)}</Text>
                    </View>
                  </View>
                )}
                {dossier.volumeM3 && (
                  <View style={s.infoCellLast}>
                    <View style={s.infoBadge}>
                      <Text style={s.infoBadgeText}>V</Text>
                    </View>
                    <View>
                      <Text style={s.infoLabel}>VOLUME ESTIMÉ</Text>
                      <Text style={s.infoValue}>{dossier.volumeM3} m³</Text>
                    </View>
                  </View>
                )}
              </View>
            )}
          </View>

          {/* SERVICES */}
          {services.length > 0 && (
            <View style={s.section}>
              <View style={s.sectionHead}>
                <View style={s.sectionDot} />
                <Text style={s.sectionTitle}>PRESTATIONS INCLUSES</Text>
                <Text style={s.sectionBadge}>{services.length} prestation{services.length > 1 ? 's' : ''}</Text>
              </View>
              <View style={s.servicesBox}>
                <View style={s.servicesGrid}>
                  {services.map((sv, i) => (
                    <View key={i} style={s.serviceItem}>
                      <View style={s.serviceDot} />
                      <Text style={s.serviceText}>{sv}</Text>
                    </View>
                  ))}
                </View>
              </View>
            </View>
          )}

          {/* TARIFICATION */}
          <View style={s.section}>
            <View style={s.sectionHead}>
              <View style={s.sectionDot} />
              <Text style={s.sectionTitle}>TARIFICATION</Text>
            </View>
            <View style={s.priceTopBar}>
              <Text style={s.priceTopLabel}>MONTANT TOTAL TOUTES TAXES COMPRISES</Text>
              <Text style={s.priceTopBadge}>Validité : {validite} jours</Text>
            </View>
            <View style={s.priceMainBox}>
              {prix != null ? (
                <>
                  <Text style={s.priceAmount}>{fmtNum(prix)}</Text>
                  <Text style={s.priceCurrency}>DT TTC</Text>
                </>
              ) : (
                <Text style={[s.priceAmount, { fontSize: 22, color: WHITE }]}>
                  Prix sur demande
                </Text>
              )}
            </View>
            <View style={s.priceBottomBar}>
              <Text style={s.priceBottomLeft}>Valide jusqu'au : {expiration}</Text>
              <Text style={s.priceBottomRight}>Émis le : {today}</Text>
            </View>
          </View>

          {/* NOTES (optional) */}
          {dossier.devisNotes ? (
            <View style={s.section}>
              <View style={s.sectionHead}>
                <View style={s.sectionDot} />
                <Text style={s.sectionTitle}>NOTES ET CONDITIONS PARTICULIÈRES</Text>
              </View>
              <View style={s.notesBox}>
                <Text style={s.notesText}>{dossier.devisNotes}</Text>
              </View>
            </View>
          ) : null}

          {/* CONDITIONS GÉNÉRALES */}
          <View style={s.section}>
            <View style={s.sectionHead}>
              <View style={s.sectionDot} />
              <Text style={s.sectionTitle}>CONDITIONS GÉNÉRALES</Text>
            </View>
            <View style={s.condBox}>
              {CONDITIONS.map((c, i) => (
                <View key={i} style={s.condRow}>
                  <Text style={s.condBullet}>•</Text>
                  <Text style={s.condText}>{c}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* ACCEPTATION */}
          <View style={s.section}>
            <View style={s.sectionHead}>
              <View style={s.sectionDot} />
              <Text style={s.sectionTitle}>ACCEPTATION DU DEVIS</Text>
            </View>
            <View style={s.sigRow}>
              <View style={s.sigBox}>
                <View style={s.sigHead}>
                  <Text style={s.sigHeadText}>BON POUR ACCORD — CLIENT</Text>
                </View>
                <View style={s.sigBody}>
                  <Text style={s.sigHint}>Lu et approuvé</Text>
                  <View style={s.sigLine} />
                  <Text style={s.sigCaption}>Signature  •  Date : __________________</Text>
                </View>
              </View>
              <View style={s.sigBoxLast}>
                <View style={s.sigHead}>
                  <Text style={s.sigHeadText}>CACHET DT DÉMÉNAGEMENT</Text>
                </View>
                <View style={s.sigBody}>
                  <View style={s.sigLine} />
                  <Text style={s.sigCaption}>Contactez-nous : +216 52 880 311</Text>
                </View>
              </View>
            </View>
          </View>

        </View>

        {/* ── FOOTER ── */}
        <View style={s.footer} fixed>
          <View style={s.footerGold} />
          <View style={s.footerBody}>
            <View>
              <Text style={s.footerCompany}>DT Déménagement Tunisie</Text>
              <Text style={s.footerSub}>Votre déménagement, notre priorité.</Text>
            </View>
            <Text style={s.footerInfo}>
              {'+216 52 880 311  •  contact@demenagement.tn  •  demenagement.tn\nCe devis est valable ' + validite + ' jours à compter du ' + today + '.'}
            </Text>
          </View>
        </View>

      </Page>
    </Document>
  )
}
