import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer'

const RED    = '#b52027'
const GOLD   = '#c9a84c'
const DARK   = '#1a1a1a'
const DARKBG = '#111111'
const MUTED  = '#666666'
const LIGHT  = '#f9f9f9'
const BORDER = '#e0e0e0'
const WHITE  = '#ffffff'

const s = StyleSheet.create({
  page: { fontFamily: 'Helvetica', fontSize: 9, color: DARK, backgroundColor: WHITE },

  // ── Top header band ────────────────────────────────────────────────────────
  headerBand: {
    backgroundColor: RED,
    paddingHorizontal: 40,
    paddingTop: 28,
    paddingBottom: 24,
  },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  companyName: { fontSize: 22, fontFamily: 'Helvetica-Bold', color: WHITE, marginBottom: 3 },
  companySub:  { fontSize: 8, color: 'rgba(255,255,255,0.65)', letterSpacing: 2, marginBottom: 8 },
  companyInfo: { fontSize: 8, color: 'rgba(255,255,255,0.8)', lineHeight: 1.7 },

  devisPanel: {
    backgroundColor: 'rgba(0,0,0,0.22)',
    borderRadius: 6,
    padding: 14,
    alignItems: 'flex-end',
    minWidth: 148,
  },
  devisTitle: { fontSize: 22, fontFamily: 'Helvetica-Bold', color: WHITE, letterSpacing: 3 },
  devisNum:   { fontSize: 11, fontFamily: 'Helvetica-Bold', color: GOLD, marginTop: 3 },
  devisDate:  { fontSize: 8, color: 'rgba(255,255,255,0.7)', marginTop: 3, lineHeight: 1.6 },

  // ── Gold accent bar ────────────────────────────────────────────────────────
  goldBar: { height: 4, backgroundColor: GOLD },

  // ── Body ──────────────────────────────────────────────────────────────────
  body: { paddingHorizontal: 40, paddingTop: 22, paddingBottom: 60 },

  // ── Section ──────────────────────────────────────────────────────────────
  section:     { marginBottom: 18 },
  sectionHead: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  sectionBar:  { width: 3, height: 12, backgroundColor: RED, marginRight: 8, borderRadius: 2 },
  sectionTitle:{ fontSize: 8.5, fontFamily: 'Helvetica-Bold', color: RED, textTransform: 'uppercase', letterSpacing: 1.2 },

  // ── Client info grid ──────────────────────────────────────────────────────
  row:        { flexDirection: 'row', marginBottom: 8 },
  cell:       { flex: 1, backgroundColor: LIGHT, borderWidth: 1, borderColor: BORDER, borderRadius: 4, padding: 9, marginRight: 8 },
  cellLast:   { flex: 1, backgroundColor: LIGHT, borderWidth: 1, borderColor: BORDER, borderRadius: 4, padding: 9 },
  cellLabel:  { fontSize: 7, color: MUTED, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 3 },
  cellValue:  { fontSize: 9, fontFamily: 'Helvetica-Bold', color: DARK },
  cellValueNormal: { fontSize: 9, color: DARK, lineHeight: 1.5 },

  // ── Services table ────────────────────────────────────────────────────────
  serviceTable: { borderWidth: 1, borderColor: BORDER, borderRadius: 4 },
  serviceHeader:{ backgroundColor: '#f0f0f0', flexDirection: 'row', padding: '7 10', borderBottomWidth: 1, borderBottomColor: BORDER },
  serviceHeaderText: { fontSize: 8, fontFamily: 'Helvetica-Bold', color: MUTED, textTransform: 'uppercase', letterSpacing: 0.5 },
  serviceRow:   { flexDirection: 'row', alignItems: 'center', padding: '8 10', borderBottomWidth: 1, borderBottomColor: BORDER },
  serviceRowLast: { flexDirection: 'row', alignItems: 'center', padding: '8 10' },
  serviceDot:   { width: 6, height: 6, backgroundColor: GOLD, borderRadius: 3, marginRight: 10 },
  serviceText:  { fontSize: 9, color: DARK },

  // ── Price box ────────────────────────────────────────────────────────────
  priceBox: {
    backgroundColor: RED,
    borderRadius: 6,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 0,
  },
  priceLabelGroup: { flexDirection: 'column' },
  priceMainLabel:  { fontSize: 12, fontFamily: 'Helvetica-Bold', color: WHITE },
  priceSubLabel:   { fontSize: 8, color: 'rgba(255,255,255,0.65)', marginTop: 3 },
  priceAmount:     { fontSize: 26, fontFamily: 'Helvetica-Bold', color: GOLD },

  // ── Notes ────────────────────────────────────────────────────────────────
  notesBox: {
    backgroundColor: '#fffef5',
    borderWidth: 1,
    borderColor: '#e0d8a0',
    borderRadius: 4,
    padding: 12,
  },
  notesText: { fontSize: 8.5, color: '#444', lineHeight: 1.75 },

  // ── Signature zone ───────────────────────────────────────────────────────
  sigRow: { flexDirection: 'row', marginTop: 8 },
  sigBox: {
    flex: 1,
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 4,
    padding: '10 12',
    minHeight: 64,
    marginRight: 12,
  },
  sigBoxLast: {
    flex: 1,
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 4,
    padding: '10 12',
    minHeight: 64,
  },
  sigLabel:   { fontSize: 7.5, color: MUTED, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4 },
  sigLine:    { borderBottomWidth: 1, borderBottomColor: '#d0d0d0', marginTop: 36 },
  sigCaption: { fontSize: 7, color: '#bbb', marginTop: 4, textAlign: 'center' },

  // ── Footer ───────────────────────────────────────────────────────────────
  footer: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    backgroundColor: DARKBG,
    paddingHorizontal: 40,
    paddingVertical: 12,
  },
  footerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  footerLeft: { flexDirection: 'column' },
  footerName: { fontSize: 9, fontFamily: 'Helvetica-Bold', color: WHITE },
  footerSub:  { fontSize: 7, color: '#888', marginTop: 2 },
  footerRight:{ fontSize: 7, color: '#888', textAlign: 'right', lineHeight: 1.7 },
  footerGold: { width: '100%', height: 2, backgroundColor: GOLD, marginBottom: 8 },
})

// ── Types ─────────────────────────────────────────────────────────────────────

type Adresse = { adresse?: string; ville?: string; etage?: string; ascenseur?: boolean }

type Dossier = {
  numeroDossier?:    string
  nomComplet?:       string
  clientId?:         string
  telephone?:        string
  typeClient?:       string
  dateDemenagement?: string
  adresseDepart?:    Adresse
  adresseArrivee?:   Adresse
  servicesInclus?:   string[]
  volumeM3?:         number
  prixTotalTTC?:     number
  devisValiditeJours?: number
  devisNotes?:       string
  commentaire?:      string
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function fmtDate(iso?: string): string {
  if (!iso) return '—'
  try {
    return new Date(iso).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })
  } catch { return iso }
}

function addDays(days: number): string {
  const d = new Date()
  d.setDate(d.getDate() + days)
  return d.toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })
}

function etageStr(e?: string): string {
  if (!e) return ''
  return e === 'RDC' ? 'Rez-de-chaussée' : `${e}ème étage`
}

function adresseStr(a?: Adresse): string {
  if (!a) return '—'
  return [a.adresse, a.ville, etageStr(a.etage), a.ascenseur ? 'avec ascenseur' : ''].filter(Boolean).join(' — ')
}

const SERVICE_LABELS: Record<string, string> = {
  'transporteur-en-tunisie': 'Transporteur en Tunisie',
  'transfert-entreprises':   'Transfert Entreprises',
  'location-monte-meubles':  'Location Monte-Meubles',
  'gardes-meubles':          'Garde-Meubles / Stockage',
  'services-emballage':      'Service Emballage',
  'montage-demontage':       'Montage & Démontage',
}

// ── PDF Component ─────────────────────────────────────────────────────────────

export function DevisPDF({ dossier }: { dossier: Dossier }) {
  const validite   = dossier.devisValiditeJours ?? 30
  const expiration = addDays(validite)
  const today      = new Date().toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })
  const typeClient = dossier.typeClient === 'entreprise' ? 'Entreprise' : 'Particulier'
  const services   = (dossier.servicesInclus ?? []).map(s => SERVICE_LABELS[s] ?? s)
  const prix       = dossier.prixTotalTTC

  return (
    <Document
      title={`Devis ${dossier.numeroDossier ?? ''} — DT Déménagement Tunisie`}
      author="DT Déménagement Tunisie"
      subject="Devis de déménagement"
    >
      <Page size="A4" style={s.page}>

        {/* ── Header band ────────────────────────────────────────────── */}
        <View style={s.headerBand}>
          <View style={s.headerRow}>
            <View>
              <Text style={s.companyName}>DT Déménagement Tunisie</Text>
              <Text style={s.companySub}>SOCIÉTÉ DE DÉMÉNAGEMENT PROFESSIONNEL</Text>
              <Text style={s.companyInfo}>
                {'Tél : +216 52 880 311  |  +216 52 880 112\n'}
                {'Email : contact@demenagement.tn\n'}
                {'Web : demenagement.tn  |  Tunis, Tunisie'}
              </Text>
            </View>
            <View style={s.devisPanel}>
              <Text style={s.devisTitle}>DEVIS</Text>
              <Text style={s.devisNum}>{dossier.numeroDossier ?? 'N/A'}</Text>
              <Text style={s.devisDate}>{'Date : ' + today + '\nValide jusqu\'au : ' + expiration}</Text>
            </View>
          </View>
        </View>

        {/* ── Gold accent ────────────────────────────────────────────── */}
        <View style={s.goldBar} />

        {/* ── Body ───────────────────────────────────────────────────── */}
        <View style={s.body}>

          {/* Client */}
          <View style={s.section}>
            <View style={s.sectionHead}>
              <View style={s.sectionBar} />
              <Text style={s.sectionTitle}>Informations client</Text>
            </View>
            <View style={s.row}>
              <View style={s.cell}>
                <Text style={s.cellLabel}>Nom complet</Text>
                <Text style={s.cellValue}>{dossier.nomComplet ?? '—'}</Text>
              </View>
              <View style={s.cell}>
                <Text style={s.cellLabel}>Type</Text>
                <Text style={s.cellValue}>{typeClient}</Text>
              </View>
              <View style={s.cell}>
                <Text style={s.cellLabel}>Téléphone</Text>
                <Text style={s.cellValue}>{dossier.telephone ?? '—'}</Text>
              </View>
              <View style={s.cellLast}>
                <Text style={s.cellLabel}>Email</Text>
                <Text style={s.cellValue}>{dossier.clientId ?? '—'}</Text>
              </View>
            </View>
          </View>

          {/* Déménagement */}
          <View style={s.section}>
            <View style={s.sectionHead}>
              <View style={s.sectionBar} />
              <Text style={s.sectionTitle}>Détails du déménagement</Text>
            </View>
            <View style={s.row}>
              <View style={[s.cell, { flex: 1 }]}>
                <Text style={s.cellLabel}>📦 Adresse de départ</Text>
                <Text style={s.cellValueNormal}>{adresseStr(dossier.adresseDepart)}</Text>
              </View>
              <View style={[s.cellLast, { flex: 1 }]}>
                <Text style={s.cellLabel}>🏠 Adresse d'arrivée</Text>
                <Text style={s.cellValueNormal}>{adresseStr(dossier.adresseArrivee)}</Text>
              </View>
            </View>
            <View style={s.row}>
              {dossier.dateDemenagement && (
                <View style={s.cell}>
                  <Text style={s.cellLabel}>Date souhaitée</Text>
                  <Text style={s.cellValue}>{fmtDate(dossier.dateDemenagement)}</Text>
                </View>
              )}
              {dossier.volumeM3 && (
                <View style={dossier.dateDemenagement ? s.cell : s.cellLast}>
                  <Text style={s.cellLabel}>Volume estimé</Text>
                  <Text style={s.cellValue}>{dossier.volumeM3} m³</Text>
                </View>
              )}
            </View>
          </View>

          {/* Services */}
          {services.length > 0 && (
            <View style={s.section}>
              <View style={s.sectionHead}>
                <View style={s.sectionBar} />
                <Text style={s.sectionTitle}>Services inclus</Text>
              </View>
              <View style={s.serviceTable}>
                <View style={s.serviceHeader}>
                  <Text style={s.serviceHeaderText}>Prestation</Text>
                </View>
                {services.map((sv, i) => (
                  <View key={i} style={i === services.length - 1 ? s.serviceRowLast : s.serviceRow}>
                    <View style={s.serviceDot} />
                    <Text style={s.serviceText}>{sv}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Price */}
          <View style={s.section}>
            <View style={s.sectionHead}>
              <View style={s.sectionBar} />
              <Text style={s.sectionTitle}>Tarification</Text>
            </View>
            <View style={s.priceBox}>
              <View style={s.priceLabelGroup}>
                <Text style={s.priceMainLabel}>Prix Total TTC</Text>
                <Text style={s.priceSubLabel}>
                  {'Toutes taxes comprises — validité ' + validite + ' jours'}
                </Text>
              </View>
              <Text style={s.priceAmount}>
                {prix != null ? `${prix.toLocaleString('fr-TN')} DT` : 'Sur demande'}
              </Text>
            </View>
          </View>

          {/* Notes */}
          {dossier.devisNotes && (
            <View style={s.section}>
              <View style={s.sectionHead}>
                <View style={s.sectionBar} />
                <Text style={s.sectionTitle}>Notes et conditions particulières</Text>
              </View>
              <View style={s.notesBox}>
                <Text style={s.notesText}>{dossier.devisNotes}</Text>
              </View>
            </View>
          )}

          {/* Signature zone */}
          <View style={s.section}>
            <View style={s.sectionHead}>
              <View style={s.sectionBar} />
              <Text style={s.sectionTitle}>Acceptation du devis</Text>
            </View>
            <View style={s.sigRow}>
              <View style={s.sigBox}>
                <Text style={s.sigLabel}>Signature du client</Text>
                <Text style={{ fontSize: 7, color: '#ccc', marginBottom: 2 }}>Lu et approuvé</Text>
                <View style={s.sigLine} />
                <Text style={s.sigCaption}>Date : ____________________</Text>
              </View>
              <View style={s.sigBoxLast}>
                <Text style={s.sigLabel}>Cachet DT Déménagement</Text>
                <View style={s.sigLine} />
                <Text style={s.sigCaption}>Pour accepter, contactez-nous au +216 52 880 311</Text>
              </View>
            </View>
          </View>

        </View>

        {/* ── Footer ─────────────────────────────────────────────────── */}
        <View style={s.footer} fixed>
          <View style={s.footerGold} />
          <View style={s.footerRow}>
            <View style={s.footerLeft}>
              <Text style={s.footerName}>DT Déménagement Tunisie</Text>
              <Text style={s.footerSub}>Votre déménagement, notre priorité.</Text>
            </View>
            <Text style={s.footerRight}>
              {'Ce devis est valable ' + validite + ' jours à compter du ' + today + '.\n'}
              {'contact@demenagement.tn  |  demenagement.tn'}
            </Text>
          </View>
        </View>

      </Page>
    </Document>
  )
}
