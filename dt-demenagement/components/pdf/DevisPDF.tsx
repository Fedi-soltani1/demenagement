import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer'

const RED    = '#b52027'
const GOLD   = '#c9a84c'
const DARK   = '#111111'
const GRAY   = '#4a4a4a'
const MUTED  = '#909090'
const LIGHT  = '#f4f4f4'
const BORDER = '#e2e2e2'
const WHITE  = '#ffffff'
const RED_BG = '#fdf0f1'

const s = StyleSheet.create({
  page: { fontFamily: 'Helvetica', fontSize: 9, color: GRAY, backgroundColor: WHITE },

  stripe: { position: 'absolute', top: 0, left: 0, bottom: 0, width: 4, backgroundColor: RED },

  // ── Header ──────────────────────────────────────────────────────────────────
  header: {
    backgroundColor: DARK,
    paddingTop: 22, paddingBottom: 20,
    paddingLeft: 44, paddingRight: 30,
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start',
  },
  companyNameRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 3 },
  companyBar: { width: 3, height: 20, backgroundColor: RED, marginRight: 8, borderRadius: 2 },
  companyName: { fontSize: 17, fontFamily: 'Helvetica-Bold', color: WHITE },
  companyTagline: { fontSize: 6, color: GOLD, letterSpacing: 1.8, marginLeft: 11, marginBottom: 8 },
  companyContact: { fontSize: 7, color: 'rgba(255,255,255,0.45)', lineHeight: 1.9, marginLeft: 11 },

  devisPanel: {
    backgroundColor: RED, borderRadius: 5,
    paddingVertical: 12, paddingHorizontal: 16,
    alignItems: 'flex-end', minWidth: 140,
  },
  devisWord: { fontSize: 24, fontFamily: 'Helvetica-Bold', color: WHITE, letterSpacing: 4 },
  devisNum:  { fontSize: 11, fontFamily: 'Helvetica-Bold', color: GOLD, marginTop: 3 },
  devisSep:  { height: 1, backgroundColor: 'rgba(255,255,255,0.2)', marginVertical: 7, alignSelf: 'stretch' },
  devisLbl:  { fontSize: 6, color: 'rgba(255,255,255,0.4)', letterSpacing: 0.5, marginBottom: 1 },
  devisVal:  { fontSize: 7.5, fontFamily: 'Helvetica-Bold', color: WHITE },

  goldBar: { height: 3, backgroundColor: GOLD },

  // ── Body ──────────────────────────────────────────────────────────────────
  body: { paddingTop: 16, paddingBottom: 52, paddingLeft: 44, paddingRight: 36 },

  // ── Section ──────────────────────────────────────────────────────────────
  section: { marginBottom: 12 },
  secHead: {
    flexDirection: 'row', alignItems: 'center',
    marginBottom: 7, paddingBottom: 5,
    borderBottomWidth: 1, borderBottomColor: BORDER,
  },
  secDot:   { width: 6, height: 6, backgroundColor: RED, borderRadius: 1, marginRight: 7 },
  secTitle: { fontSize: 7, fontFamily: 'Helvetica-Bold', color: RED, letterSpacing: 1.2, flex: 1 },
  secBadge: { fontSize: 6.5, color: MUTED, backgroundColor: LIGHT, paddingVertical: 2, paddingHorizontal: 6, borderRadius: 3 },

  // ── Client row ────────────────────────────────────────────────────────────
  cardRow: { flexDirection: 'row' },
  card: {
    flex: 1, backgroundColor: LIGHT, borderRadius: 3,
    paddingVertical: 7, paddingHorizontal: 9,
    borderLeftWidth: 2, borderLeftColor: BORDER, marginRight: 6,
  },
  cardLast: {
    flex: 1.4, backgroundColor: RED_BG, borderRadius: 3,
    paddingVertical: 7, paddingHorizontal: 9,
    borderLeftWidth: 2, borderLeftColor: RED,
  },
  cardLbl: { fontSize: 6, color: MUTED, letterSpacing: 0.5, marginBottom: 2 },
  cardVal: { fontSize: 8.5, fontFamily: 'Helvetica-Bold', color: DARK },

  // ── Move ─────────────────────────────────────────────────────────────────
  moveRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 6 },
  moveBox: { flex: 1, borderWidth: 1, borderColor: BORDER, borderRadius: 3 },
  moveHead: {
    backgroundColor: LIGHT, paddingVertical: 4, paddingHorizontal: 9,
    borderBottomWidth: 1, borderBottomColor: BORDER,
    flexDirection: 'row', alignItems: 'center',
  },
  moveDotR: { width: 5, height: 5, borderRadius: 3, backgroundColor: RED,      marginRight: 5 },
  moveDotG: { width: 5, height: 5, borderRadius: 3, backgroundColor: '#2a7a2a', marginRight: 5 },
  moveHdTxt:{ fontSize: 6.5, fontFamily: 'Helvetica-Bold', color: GRAY, letterSpacing: 0.8 },
  moveBody: { paddingVertical: 7, paddingHorizontal: 9 },
  moveAddr: { fontSize: 8, color: DARK, lineHeight: 1.5 },
  moveSub:  { fontSize: 6.5, color: MUTED, marginTop: 2 },

  moveArrow: { width: 28, alignItems: 'center', justifyContent: 'center' },
  arrowCircle: { width: 18, height: 18, borderRadius: 9, backgroundColor: RED, alignItems: 'center', justifyContent: 'center' },
  arrowTxt: { fontSize: 9, color: WHITE, fontFamily: 'Helvetica-Bold' },

  // Date / volume (inline under move boxes)
  metaRow: { flexDirection: 'row', marginTop: 0 },
  metaCell: {
    flex: 1, flexDirection: 'row', alignItems: 'center',
    borderWidth: 1, borderColor: BORDER, borderRadius: 3,
    paddingVertical: 5, paddingHorizontal: 8, marginRight: 6,
  },
  metaCellLast: {
    flex: 1, flexDirection: 'row', alignItems: 'center',
    borderWidth: 1, borderColor: BORDER, borderRadius: 3,
    paddingVertical: 5, paddingHorizontal: 8,
  },
  metaIcon: { width: 16, height: 16, borderRadius: 8, backgroundColor: RED_BG, alignItems: 'center', justifyContent: 'center', marginRight: 7 },
  metaIconTxt: { fontSize: 8, color: RED, fontFamily: 'Helvetica-Bold' },
  metaLbl: { fontSize: 6, color: MUTED, letterSpacing: 0.3, marginBottom: 1 },
  metaVal: { fontSize: 8.5, fontFamily: 'Helvetica-Bold', color: DARK },

  // ── Services ─────────────────────────────────────────────────────────────
  servBox: {
    borderWidth: 1, borderColor: BORDER, borderRadius: 3,
    backgroundColor: '#fafafa', paddingVertical: 3, paddingHorizontal: 10,
  },
  servGrid: { flexDirection: 'row', flexWrap: 'wrap' },
  servItem: { width: '50%', flexDirection: 'row', alignItems: 'center', paddingVertical: 4, paddingRight: 8 },
  servDot:  { width: 5, height: 5, borderRadius: 3, backgroundColor: GOLD, marginRight: 7 },
  servTxt:  { fontSize: 8, color: DARK },

  // ── Line items table ─────────────────────────────────────────────────────
  linesTable: { borderWidth: 1, borderColor: BORDER, borderRadius: 3, marginBottom: 8 },
  linesHead: {
    backgroundColor: LIGHT, flexDirection: 'row',
    paddingVertical: 5, paddingHorizontal: 9,
    borderBottomWidth: 1, borderBottomColor: BORDER,
  },
  linesHeadTxt: { fontSize: 6.5, fontFamily: 'Helvetica-Bold', color: MUTED, letterSpacing: 0.4 },
  lineRow: {
    flexDirection: 'row', paddingVertical: 5, paddingHorizontal: 9,
    borderBottomWidth: 1, borderBottomColor: BORDER,
  },
  lineRowLast: { flexDirection: 'row', paddingVertical: 5, paddingHorizontal: 9 },
  lineCell:  { fontSize: 8, color: DARK },
  lineCellR: { fontSize: 8, color: DARK, textAlign: 'right' },
  lineTotalRow: {
    backgroundColor: DARK, flexDirection: 'row',
    paddingVertical: 6, paddingHorizontal: 9,
  },
  lineTotalLbl: { fontSize: 7, fontFamily: 'Helvetica-Bold', color: 'rgba(255,255,255,0.45)', letterSpacing: 1 },
  lineTotalAmt: { fontSize: 8.5, fontFamily: 'Helvetica-Bold', color: GOLD, textAlign: 'right' },

  // ── Price ─────────────────────────────────────────────────────────────────
  priceTop: {
    backgroundColor: DARK, borderTopLeftRadius: 4, borderTopRightRadius: 4,
    paddingVertical: 7, paddingHorizontal: 14,
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
  },
  priceTopLbl: { fontSize: 7, fontFamily: 'Helvetica-Bold', color: 'rgba(255,255,255,0.4)', letterSpacing: 1.2 },
  priceTopBadge: { fontSize: 6.5, color: GOLD },
  priceMain: {
    backgroundColor: RED,
    paddingVertical: 14, paddingHorizontal: 18,
    flexDirection: 'row', justifyContent: 'center', alignItems: 'flex-end',
  },
  priceAmt:  { fontSize: 32, fontFamily: 'Helvetica-Bold', color: GOLD },
  priceCur:  { fontSize: 13, fontFamily: 'Helvetica-Bold', color: 'rgba(255,255,255,0.5)', marginLeft: 6, marginBottom: 4 },
  priceBot: {
    backgroundColor: '#1c0306', borderBottomLeftRadius: 4, borderBottomRightRadius: 4,
    paddingVertical: 7, paddingHorizontal: 14,
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
  },
  priceBotL: { fontSize: 7, color: 'rgba(255,255,255,0.3)' },
  priceBotR: { fontSize: 7, color: GOLD, fontFamily: 'Helvetica-Bold' },

  // ── Notes ─────────────────────────────────────────────────────────────────
  notesBox: {
    backgroundColor: '#fdf9ee', borderRadius: 3,
    paddingVertical: 8, paddingHorizontal: 12,
    borderWidth: 1, borderColor: '#e8d988',
    borderLeftWidth: 3, borderLeftColor: GOLD,
  },
  notesTxt: { fontSize: 8, color: '#444', lineHeight: 1.7 },

  // ── Signature ─────────────────────────────────────────────────────────────
  sigRow:    { flexDirection: 'row' },
  sigBox:    { flex: 1, borderWidth: 1, borderColor: BORDER, borderRadius: 3, marginRight: 10 },
  sigBoxLast:{ flex: 1, borderWidth: 1, borderColor: BORDER, borderRadius: 3 },
  sigHead:   { backgroundColor: LIGHT, paddingVertical: 5, paddingHorizontal: 9, borderBottomWidth: 1, borderBottomColor: BORDER },
  sigHdTxt:  { fontSize: 6.5, fontFamily: 'Helvetica-Bold', color: GRAY, letterSpacing: 0.4 },
  sigBody:   { paddingVertical: 8, paddingHorizontal: 10, minHeight: 48 },
  sigHint:   { fontSize: 6.5, color: '#ccc' },
  sigLine:   { borderBottomWidth: 1, borderBottomColor: BORDER, marginTop: 28 },
  sigCap:    { fontSize: 6, color: MUTED, marginTop: 3, textAlign: 'center' },

  // ── Footer ────────────────────────────────────────────────────────────────
  footer: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: DARK },
  footerGold: { height: 2, backgroundColor: GOLD },
  footerBody: {
    paddingVertical: 9, paddingHorizontal: 44,
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
  },
  footerL: { fontSize: 7.5, fontFamily: 'Helvetica-Bold', color: WHITE },
  footerSub: { fontSize: 6, color: '#444', marginTop: 1 },
  footerR: { fontSize: 6.5, color: '#555', textAlign: 'right', lineHeight: 1.8 },
})

// ── Types ─────────────────────────────────────────────────────────────────────

type Adresse = { adresse?: string; ville?: string; etage?: string; ascenseur?: boolean }

export type LigneDevis = {
  designation?: string
  quantite?:    number
  prixUnitaire?: number
}

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
  lignesDevis?:        LigneDevis[]
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
  return Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ')
}

function etageStr(e?: string): string {
  if (!e) return ''
  return e === 'RDC' ? 'Rez-de-chaussée' : `${e}e étage`
}

function adresseStr(a?: Adresse): string {
  if (!a) return '—'
  return [a.adresse, a.ville].filter(Boolean).join(', ') || '—'
}

const SERVICE_LABELS: Record<string, string> = {
  'transporteur-en-tunisie': 'Transporteur en Tunisie',
  'transfert-entreprises':   'Transfert Entreprises',
  'location-monte-meubles':  'Location Monte-Meubles',
  'gardes-meubles':          'Garde-Meubles / Stockage',
  'services-emballage':      'Service Emballage',
  'montage-demontage':       'Montage & Démontage',
}

// ── Component ─────────────────────────────────────────────────────────────────

export function DevisPDF({ dossier }: { dossier: Dossier }) {
  const validite   = dossier.devisValiditeJours ?? 30
  const expiration = addDays(validite)
  const today      = new Date().toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })
  const typeClient = dossier.typeClient === 'entreprise' ? 'ENTREPRISE' : 'PARTICULIER'
  const services   = (dossier.servicesInclus ?? []).map(sv => SERVICE_LABELS[sv] ?? sv)
  const prix       = dossier.prixTotalTTC

  return (
    <Document
      title={`Devis ${dossier.numeroDossier ?? ''} — DT Déménagement`}
      author="DT Déménagement Tunisie"
      subject="Devis de déménagement"
    >
      <Page size="A4" style={s.page}>

        <View style={s.stripe} />

        {/* HEADER */}
        <View style={s.header}>
          <View>
            <View style={s.companyNameRow}>
              <View style={s.companyBar} />
              <Text style={s.companyName}>DT Déménagement Tunisie</Text>
            </View>
            <Text style={s.companyTagline}>SOCIÉTÉ DE DÉMÉNAGEMENT PROFESSIONNEL</Text>
            <Text style={s.companyContact}>
              {'Tél : +216 52 880 311  |  +216 52 880 112\nEmail : contact@demenagement.tn  |  demenagement.tn'}
            </Text>
          </View>
          <View style={s.devisPanel}>
            <Text style={s.devisWord}>DEVIS</Text>
            <Text style={s.devisNum}>{dossier.numeroDossier ?? 'N/A'}</Text>
            <View style={s.devisSep} />
            <Text style={s.devisLbl}>DATE</Text>
            <Text style={s.devisVal}>{today}</Text>
            <Text style={[s.devisLbl, { marginTop: 5 }]}>VALABLE JUSQU'AU</Text>
            <Text style={s.devisVal}>{expiration}</Text>
          </View>
        </View>

        <View style={s.goldBar} />

        {/* BODY */}
        <View style={s.body}>

          {/* CLIENT */}
          <View style={s.section}>
            <View style={s.secHead}>
              <View style={s.secDot} />
              <Text style={s.secTitle}>INFORMATIONS CLIENT</Text>
              <Text style={s.secBadge}>{typeClient}</Text>
            </View>
            <View style={s.cardRow}>
              <View style={s.card}>
                <Text style={s.cardLbl}>NOM COMPLET</Text>
                <Text style={s.cardVal}>{dossier.nomComplet ?? '—'}</Text>
              </View>
              <View style={s.card}>
                <Text style={s.cardLbl}>TÉLÉPHONE</Text>
                <Text style={s.cardVal}>{dossier.telephone ?? '—'}</Text>
              </View>
              <View style={s.cardLast}>
                <Text style={s.cardLbl}>EMAIL</Text>
                <Text style={s.cardVal}>{dossier.clientId ?? '—'}</Text>
              </View>
            </View>
          </View>

          {/* DÉMÉNAGEMENT */}
          <View style={s.section}>
            <View style={s.secHead}>
              <View style={s.secDot} />
              <Text style={s.secTitle}>DÉTAILS DU DÉMÉNAGEMENT</Text>
              {dossier.dateDemenagement && <Text style={s.secBadge}>{fmtDate(dossier.dateDemenagement)}</Text>}
            </View>

            <View style={s.moveRow}>
              <View style={s.moveBox}>
                <View style={s.moveHead}>
                  <View style={s.moveDotR} /><Text style={s.moveHdTxt}>DÉPART</Text>
                </View>
                <View style={s.moveBody}>
                  <Text style={s.moveAddr}>{adresseStr(dossier.adresseDepart)}</Text>
                  {dossier.adresseDepart?.etage ? (
                    <Text style={s.moveSub}>
                      {etageStr(dossier.adresseDepart.etage)}{dossier.adresseDepart.ascenseur ? '  ·  Ascenseur' : ''}
                    </Text>
                  ) : null}
                </View>
              </View>

              <View style={s.moveArrow}>
                <View style={s.arrowCircle}>
                  <Text style={s.arrowTxt}>{'>'}</Text>
                </View>
              </View>

              <View style={s.moveBox}>
                <View style={s.moveHead}>
                  <View style={s.moveDotG} /><Text style={s.moveHdTxt}>ARRIVÉE</Text>
                </View>
                <View style={s.moveBody}>
                  <Text style={s.moveAddr}>{adresseStr(dossier.adresseArrivee)}</Text>
                  {dossier.adresseArrivee?.etage ? (
                    <Text style={s.moveSub}>
                      {etageStr(dossier.adresseArrivee.etage)}{dossier.adresseArrivee.ascenseur ? '  ·  Ascenseur' : ''}
                    </Text>
                  ) : null}
                </View>
              </View>
            </View>

            {(dossier.dateDemenagement || dossier.volumeM3) && (
              <View style={s.metaRow}>
                {dossier.dateDemenagement && (
                  <View style={dossier.volumeM3 ? s.metaCell : s.metaCellLast}>
                    <View style={s.metaIcon}><Text style={s.metaIconTxt}>i</Text></View>
                    <View>
                      <Text style={s.metaLbl}>DATE SOUHAITÉE</Text>
                      <Text style={s.metaVal}>{fmtDate(dossier.dateDemenagement)}</Text>
                    </View>
                  </View>
                )}
                {dossier.volumeM3 && (
                  <View style={s.metaCellLast}>
                    <View style={s.metaIcon}><Text style={s.metaIconTxt}>V</Text></View>
                    <View>
                      <Text style={s.metaLbl}>VOLUME</Text>
                      <Text style={s.metaVal}>{dossier.volumeM3} m³</Text>
                    </View>
                  </View>
                )}
              </View>
            )}
          </View>

          {/* SERVICES */}
          {services.length > 0 && (
            <View style={s.section}>
              <View style={s.secHead}>
                <View style={s.secDot} />
                <Text style={s.secTitle}>PRESTATIONS INCLUSES</Text>
                <Text style={s.secBadge}>{services.length} prestation{services.length > 1 ? 's' : ''}</Text>
              </View>
              <View style={s.servBox}>
                <View style={s.servGrid}>
                  {services.map((sv, i) => (
                    <View key={i} style={s.servItem}>
                      <View style={s.servDot} />
                      <Text style={s.servTxt}>{sv}</Text>
                    </View>
                  ))}
                </View>
              </View>
            </View>
          )}

          {/* TARIFICATION */}
          <View style={s.section}>
            <View style={s.secHead}>
              <View style={s.secDot} />
              <Text style={s.secTitle}>TARIFICATION</Text>
            </View>

            {/* Line items table — shown when lines are present */}
            {dossier.lignesDevis && dossier.lignesDevis.length > 0 && (
              <View style={s.linesTable}>
                <View style={s.linesHead}>
                  <Text style={[s.linesHeadTxt, { flex: 4 }]}>DÉSIGNATION / PRESTATION</Text>
                  <Text style={[s.linesHeadTxt, { flex: 1, textAlign: 'center' }]}>QTÉ</Text>
                  <Text style={[s.linesHeadTxt, { flex: 1.5, textAlign: 'right' }]}>P.U. (DT)</Text>
                  <Text style={[s.linesHeadTxt, { flex: 1.5, textAlign: 'right' }]}>TOTAL (DT)</Text>
                </View>
                {dossier.lignesDevis.map((l, i) => {
                  const qty   = l.quantite    ?? 1
                  const pu    = l.prixUnitaire ?? 0
                  const total = qty * pu
                  const isLast = i === (dossier.lignesDevis!.length - 1)
                  return (
                    <View key={i} style={isLast ? s.lineRowLast : s.lineRow}>
                      <Text style={[s.lineCell, { flex: 4 }]}>{l.designation ?? '—'}</Text>
                      <Text style={[s.lineCell, { flex: 1, textAlign: 'center' }]}>{qty}</Text>
                      <Text style={[s.lineCellR, { flex: 1.5 }]}>{fmtNum(pu)}</Text>
                      <Text style={[s.lineCellR, { flex: 1.5 }]}>{fmtNum(total)}</Text>
                    </View>
                  )
                })}
                <View style={s.lineTotalRow}>
                  <Text style={[s.lineTotalLbl, { flex: 1 }]}>TOTAL TTC</Text>
                  <Text style={s.lineTotalAmt}>
                    {prix != null ? `${fmtNum(prix)} DT` : '—'}
                  </Text>
                </View>
              </View>
            )}

            <View style={s.priceTop}>
              <Text style={s.priceTopLbl}>MONTANT TOTAL TTC</Text>
              <Text style={s.priceTopBadge}>Validité : {validite} jours</Text>
            </View>
            <View style={s.priceMain}>
              {prix != null ? (
                <>
                  <Text style={s.priceAmt}>{fmtNum(prix)}</Text>
                  <Text style={s.priceCur}>DT TTC</Text>
                </>
              ) : (
                <Text style={[s.priceAmt, { fontSize: 20, color: WHITE }]}>Prix sur demande</Text>
              )}
            </View>
            <View style={s.priceBot}>
              <Text style={s.priceBotL}>Valable jusqu'au {expiration}</Text>
              <Text style={s.priceBotR}>Émis le {today}</Text>
            </View>
          </View>

          {/* NOTES */}
          {dossier.devisNotes ? (
            <View style={s.section}>
              <View style={s.secHead}>
                <View style={s.secDot} />
                <Text style={s.secTitle}>NOTES ET CONDITIONS PARTICULIÈRES</Text>
              </View>
              <View style={s.notesBox}>
                <Text style={s.notesTxt}>{dossier.devisNotes}</Text>
              </View>
            </View>
          ) : null}

          {/* ACCEPTATION */}
          <View style={s.section}>
            <View style={s.secHead}>
              <View style={s.secDot} />
              <Text style={s.secTitle}>ACCEPTATION DU DEVIS</Text>
            </View>
            <View style={s.sigRow}>
              <View style={s.sigBox}>
                <View style={s.sigHead}><Text style={s.sigHdTxt}>BON POUR ACCORD — CLIENT</Text></View>
                <View style={s.sigBody}>
                  <Text style={s.sigHint}>Lu et approuvé</Text>
                  <View style={s.sigLine} />
                  <Text style={s.sigCap}>Signature  ·  Date : __________________</Text>
                </View>
              </View>
              <View style={s.sigBoxLast}>
                <View style={s.sigHead}><Text style={s.sigHdTxt}>CACHET DT DÉMÉNAGEMENT</Text></View>
                <View style={s.sigBody}>
                  <View style={s.sigLine} />
                  <Text style={s.sigCap}>+216 52 880 311  ·  contact@demenagement.tn</Text>
                </View>
              </View>
            </View>
          </View>

        </View>

        {/* FOOTER */}
        <View style={s.footer} fixed>
          <View style={s.footerGold} />
          <View style={s.footerBody}>
            <View>
              <Text style={s.footerL}>DT Déménagement Tunisie</Text>
              <Text style={s.footerSub}>Votre déménagement, notre priorité.</Text>
            </View>
            <Text style={s.footerR}>
              {'+216 52 880 311  ·  contact@demenagement.tn  ·  demenagement.tn\nCe devis est valable ' + validite + ' jours. Tout prix inclut MO, transport et emballage.'}
            </Text>
          </View>
        </View>

      </Page>
    </Document>
  )
}
