import { Document, Page, Text, View, StyleSheet, Line, Svg } from '@react-pdf/renderer'

const RED   = '#b52027'
const GOLD  = '#c9a84c'
const DARK  = '#1a1a1a'
const LIGHT = '#f8f5f0'
const MUTED = '#666666'
const BORDER = '#e0e0e0'

const s = StyleSheet.create({
  page: {
    fontFamily: 'Helvetica',
    fontSize: 9,
    color: DARK,
    paddingTop: 40,
    paddingBottom: 50,
    paddingHorizontal: 40,
  },
  // Header
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 },
  companyBlock: { flex: 1 },
  companyName: { fontSize: 18, fontFamily: 'Helvetica-Bold', color: RED, marginBottom: 2 },
  companySub: { fontSize: 8, color: GOLD, fontFamily: 'Helvetica-Bold', letterSpacing: 1, marginBottom: 6 },
  companyInfo: { fontSize: 8, color: MUTED, lineHeight: 1.5 },
  devisBlock: { alignItems: 'flex-end' },
  devisTitle: { fontSize: 14, fontFamily: 'Helvetica-Bold', color: DARK, marginBottom: 4 },
  devisNum: { fontSize: 10, fontFamily: 'Helvetica-Bold', color: RED, marginBottom: 2 },
  devisDate: { fontSize: 8, color: MUTED },
  divider: { borderBottomWidth: 2, borderBottomColor: RED, marginBottom: 16 },
  dividerGold: { borderBottomWidth: 1, borderBottomColor: GOLD, marginBottom: 12 },
  // Section
  sectionTitle: { fontSize: 9, fontFamily: 'Helvetica-Bold', color: RED, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 },
  // Grid
  row2: { flexDirection: 'row', gap: 16, marginBottom: 12 },
  col: { flex: 1 },
  // Info card
  infoCard: { backgroundColor: '#fafafa', borderWidth: 1, borderColor: BORDER, borderRadius: 4, padding: 10, marginBottom: 12 },
  label: { fontSize: 7, color: MUTED, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 2 },
  value: { fontSize: 9, color: DARK, fontFamily: 'Helvetica-Bold' },
  valueNormal: { fontSize: 9, color: DARK },
  // Services list
  serviceRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
  bullet: { width: 12, fontSize: 12, color: GOLD },
  // Price box
  priceBox: {
    backgroundColor: RED,
    borderRadius: 4,
    padding: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  priceLabel: { color: '#fff', fontSize: 11, fontFamily: 'Helvetica-Bold' },
  priceValue: { color: GOLD, fontSize: 20, fontFamily: 'Helvetica-Bold' },
  // Notes
  notesBox: { borderWidth: 1, borderColor: BORDER, borderRadius: 4, padding: 10, marginBottom: 16 },
  notesText: { fontSize: 8, color: DARK, lineHeight: 1.6 },
  // Footer
  footer: { position: 'absolute', bottom: 25, left: 40, right: 40, borderTopWidth: 1, borderTopColor: BORDER, paddingTop: 8 },
  footerText: { fontSize: 7, color: MUTED, textAlign: 'center', lineHeight: 1.5 },
  footerBold: { fontSize: 7, color: RED, textAlign: 'center', fontFamily: 'Helvetica-Bold' },
})

type Adresse = { adresse?: string; ville?: string; etage?: string; ascenseur?: boolean }

type Dossier = {
  numeroDossier?: string
  nomComplet?: string
  clientId?: string
  telephone?: string
  typeClient?: string
  dateDemenagement?: string
  adresseDepart?: Adresse
  adresseArrivee?: Adresse
  servicesInclus?: string[]
  volumeM3?: number
  prixTotalTTC?: number
  devisValiditeJours?: number
  devisNotes?: string
}

function formatDate(iso?: string): string {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })
}

function addDays(iso: string, days: number): string {
  const d = new Date(iso)
  d.setDate(d.getDate() + days)
  return d.toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })
}

const SERVICE_LABELS: Record<string, string> = {
  'transporteur-en-tunisie': 'Transporteur en Tunisie',
  'transfert-entreprises':   'Transfert Entreprises',
  'location-monte-meubles':  'Location Monte-Meubles',
  'gardes-meubles':          'Garde-Meubles / Stockage',
  'services-emballage':      'Service Emballage',
  'montage-demontage':       'Montage & Démontage',
}

function etageLabel(e?: string): string {
  if (!e) return ''
  if (e === 'RDC') return 'Rez-de-chaussée'
  return `${e}ème étage`
}

function adresseStr(a?: Adresse): string {
  if (!a) return '—'
  const parts = [a.adresse, a.ville].filter(Boolean).join(', ')
  const etage = etageLabel(a.etage)
  const asc = a.ascenseur ? 'avec ascenseur' : ''
  return [parts, etage, asc].filter(Boolean).join(' — ')
}

export function DevisPDF({ dossier }: { dossier: Dossier }) {
  const today = new Date().toISOString()
  const validite = dossier.devisValiditeJours ?? 30
  const expiration = addDays(today, validite)
  const services = (dossier.servicesInclus ?? []).map(s => SERVICE_LABELS[s] ?? s)
  const typeClient = dossier.typeClient === 'entreprise' ? 'Entreprise' : 'Particulier'

  return (
    <Document title={`Devis ${dossier.numeroDossier ?? ''} — DT Déménagement`} author="DT Déménagement Tunisie">
      <Page size="A4" style={s.page}>

        {/* ─── Header ─── */}
        <View style={s.headerRow}>
          <View style={s.companyBlock}>
            <Text style={s.companyName}>DT Déménagement Tunisie</Text>
            <Text style={s.companySub}>SOCIÉTÉ DE DÉMÉNAGEMENT PROFESSIONNEL</Text>
            <Text style={s.companyInfo}>
              Tél: +216 52 880 311  |  +216 52 880 112{'\n'}
              Email: contact@demenagement.tn{'\n'}
              Web: demenagement.tn  |  Tunis, Tunisie
            </Text>
          </View>
          <View style={s.devisBlock}>
            <Text style={s.devisTitle}>DEVIS</Text>
            <Text style={s.devisNum}>{dossier.numeroDossier ?? 'N/A'}</Text>
            <Text style={s.devisDate}>Date : {formatDate(today)}</Text>
            <Text style={s.devisDate}>Valide jusqu'au : {expiration}</Text>
          </View>
        </View>

        <View style={s.divider} />

        {/* ─── Client info ─── */}
        <Text style={s.sectionTitle}>Informations client</Text>
        <View style={s.row2}>
          <View style={s.infoCard}>
            <Text style={s.label}>Nom complet</Text>
            <Text style={s.value}>{dossier.nomComplet ?? '—'}</Text>
          </View>
          <View style={s.infoCard}>
            <Text style={s.label}>Type</Text>
            <Text style={s.value}>{typeClient}</Text>
          </View>
          <View style={s.infoCard}>
            <Text style={s.label}>Téléphone</Text>
            <Text style={s.value}>{dossier.telephone ?? '—'}</Text>
          </View>
          <View style={s.infoCard}>
            <Text style={s.label}>Email</Text>
            <Text style={s.value}>{dossier.clientId ?? '—'}</Text>
          </View>
        </View>

        {/* ─── Addresses ─── */}
        <Text style={s.sectionTitle}>Détails du déménagement</Text>
        <View style={s.row2}>
          <View style={[s.infoCard, s.col]}>
            <Text style={s.label}>Adresse de départ</Text>
            <Text style={s.valueNormal}>{adresseStr(dossier.adresseDepart)}</Text>
          </View>
          <View style={[s.infoCard, s.col]}>
            <Text style={s.label}>Adresse d'arrivée</Text>
            <Text style={s.valueNormal}>{adresseStr(dossier.adresseArrivee)}</Text>
          </View>
        </View>
        <View style={s.row2}>
          {dossier.dateDemenagement && (
            <View style={s.infoCard}>
              <Text style={s.label}>Date souhaitée</Text>
              <Text style={s.value}>{formatDate(dossier.dateDemenagement)}</Text>
            </View>
          )}
          {dossier.volumeM3 && (
            <View style={s.infoCard}>
              <Text style={s.label}>Volume estimé</Text>
              <Text style={s.value}>{dossier.volumeM3} m³</Text>
            </View>
          )}
        </View>

        {/* ─── Services ─── */}
        {services.length > 0 && (
          <>
            <Text style={s.sectionTitle}>Services demandés</Text>
            <View style={s.infoCard}>
              {services.map((sv, i) => (
                <View key={i} style={s.serviceRow}>
                  <Text style={s.bullet}>•</Text>
                  <Text style={s.valueNormal}>{sv}</Text>
                </View>
              ))}
            </View>
          </>
        )}

        {/* ─── Price ─── */}
        <View style={s.priceBox}>
          <Text style={s.priceLabel}>Prix Total TTC</Text>
          <Text style={s.priceValue}>
            {dossier.prixTotalTTC != null ? `${dossier.prixTotalTTC.toLocaleString('fr-TN')} DT` : 'Sur demande'}
          </Text>
        </View>

        {/* ─── Notes ─── */}
        {dossier.devisNotes && (
          <>
            <Text style={s.sectionTitle}>Notes et conditions</Text>
            <View style={s.notesBox}>
              <Text style={s.notesText}>{dossier.devisNotes}</Text>
            </View>
          </>
        )}

        {/* ─── Footer ─── */}
        <View style={s.footer} fixed>
          <Text style={s.footerBold}>
            DT Déménagement Tunisie — Votre déménagement, notre priorité.
          </Text>
          <Text style={s.footerText}>
            Ce devis est valable {validite} jours à compter de sa date d'émission.{'\n'}
            Pour accepter ce devis, contactez-nous au +216 52 880 311 ou par email: contact@demenagement.tn
          </Text>
        </View>

      </Page>
    </Document>
  )
}
