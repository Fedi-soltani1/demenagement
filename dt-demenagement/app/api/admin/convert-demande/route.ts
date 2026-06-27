import { NextRequest } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'
import { z } from 'zod'
import { resolveIdentity } from '@/lib/login-link'

const schema = z.object({ demandeId: z.union([z.string(), z.number()]) })

type DemandeDoc = {
  id: string | number
  type?: string
  statut?: string
  clientNom?: string
  clientTelephone?: string
  clientEmail?: string
  villeDepart?: string
  villeArrivee?: string
  adresseDepart?: string
  adresseArrivee?: string
  dateApprox?: string
  typeBien?: string
  notes?: string
  agent?: unknown
  dossierLie?: unknown
  rdvLie?: unknown
}

const relId = (rel: unknown): string | number | undefined =>
  typeof rel === 'object' && rel !== null ? (rel as { id: string | number }).id : (rel as string | number | undefined)

export async function POST(request: NextRequest): Promise<Response> {
  try {
    const payload = await getPayload({ config })
    const { user } = await payload.auth({ headers: request.headers })
    if (!user || (user as { collection?: string }).collection !== 'admins' || (user as { role?: string }).role !== 'super-admin') {
      return Response.json({ error: 'Non autorisé — réservé au super-admin.' }, { status: 401 })
    }

    const body: unknown = await request.json()
    const parsed = schema.safeParse(body)
    if (!parsed.success) return Response.json({ error: 'Données invalides' }, { status: 422 })

    const demande = await payload
      .findByID({ collection: 'demandes-agents', id: parsed.data.demandeId, overrideAccess: true })
      .catch(() => null) as DemandeDoc | null
    if (!demande) return Response.json({ error: 'Demande introuvable' }, { status: 404 })

    // ── Guards ────────────────────────────────────────────────────────────────
    if (demande.dossierLie || demande.rdvLie) {
      return Response.json({ error: 'Cette demande a déjà été convertie.' }, { status: 409 })
    }
    if (demande.statut === 'refusee') {
      return Response.json({ error: 'Une demande refusée ne peut pas être convertie.' }, { status: 422 })
    }

    // ── Source fields ───────────────────────────────────────────────────────────
    const clientNom    = String(demande.clientNom ?? '').trim()
    const clientTel     = String(demande.clientTelephone ?? '').trim()
    const clientEmail   = typeof demande.clientEmail === 'string' ? demande.clientEmail.trim() : ''
    const villeDepart   = String(demande.villeDepart ?? '').trim()
    const villeArrivee  = String(demande.villeArrivee ?? '').trim()
    const adrDepart     = String(demande.adresseDepart ?? '').trim()
    const adrArrivee    = String(demande.adresseArrivee ?? '').trim()
    const dateApprox    = String(demande.dateApprox ?? '').trim()
    const typeBien      = String(demande.typeBien ?? '').trim()
    const notes         = String(demande.notes ?? '').trim()
    const agentId       = relId(demande.agent)

    // ── type 'rendez-vous' → RDV ────────────────────────────────────────────────
    if (demande.type === 'rendez-vous') {
      const adresse = [adrDepart || villeDepart, villeArrivee ? `→ ${villeArrivee}` : '', notes]
        .filter(Boolean)
        .join(' · ')
      const rdv = await payload.create({
        collection: 'rendez-vous',
        data: {
          type: 'client',
          statut: 'nouveau',
          nom: clientNom || '—',
          prenom: '—',
          telephone: clientTel,
          whatsapp: clientTel,
          email: clientEmail || undefined,
          adresse: adresse || undefined,
          dateVisite: dateApprox || undefined,
        },
        overrideAccess: true,
      }) as { id: string | number }

      await payload.update({
        collection: 'demandes-agents',
        id: demande.id,
        data: { rdvLie: rdv.id, statut: 'acceptee' },
        overrideAccess: true,
      })
      payload.logger.info(`[convert-demande] demande ${String(demande.id)} → RDV ${String(rdv.id)}`)
      return Response.json({ success: true, target: 'rdv', id: rdv.id })
    }

    // ── type 'devis' → Dossier déménagement ──────────────────────────────────────
    const commentaire = [
      `Issu d'une demande agent (#${String(demande.id)}${agentId != null ? ` — agent ${String(agentId)}` : ''}).`,
      dateApprox ? `Date approximative : ${dateApprox}.` : '',
      typeBien   ? `Type de bien : ${typeBien}.`         : '',
      notes      ? `Notes : ${notes}`                    : '',
    ].filter(Boolean).join('\n')

    // clientId est NOT NULL : vrai email si fourni, sinon identité téléphone synthétique
    // « <canonique>@wa.client » → le client pourra accéder à son espace via son numéro.
    const clientId = resolveIdentity({ email: clientEmail || undefined, telephone: clientTel })

    const dossierData: Record<string, unknown> = {
      nomComplet:  clientNom,
      telephone:   clientTel,
      clientId,
      typeClient:  'particulier',
      statut:      'devis_recu',
      commentaire,
      adresseDepart:  { adresse: adrDepart  || villeDepart  || '—', ville: villeDepart  || '—', ascenseur: false },
      adresseArrivee: { adresse: adrArrivee || villeArrivee || '—', ville: villeArrivee || '—', ascenseur: false },
    }

    const dossier = await payload.create({
      collection: 'demenagements',
      data: dossierData,
      overrideAccess: true,
      // Pas d'email de confirmation si on n'a qu'une identité téléphone synthétique.
      context: clientEmail ? {} : { skipClientConfirmation: true },
    }) as { id: string | number; numeroDossier?: string }

    await payload.update({
      collection: 'demandes-agents',
      id: demande.id,
      data: { dossierLie: dossier.id, statut: 'acceptee' },
      overrideAccess: true,
    })
    payload.logger.info(`[convert-demande] demande ${String(demande.id)} → dossier ${String(dossier.id)}`)
    return Response.json({ success: true, target: 'dossier', id: dossier.id, numeroDossier: dossier.numeroDossier })
  } catch (err) {
    console.error('[convert-demande] error:', err)
    const msg = err instanceof Error ? err.message : String(err)
    return Response.json({ error: `Erreur : ${msg}` }, { status: 500 })
  }
}
