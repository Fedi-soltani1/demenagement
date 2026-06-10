# Bouton WhatsApp → formulaire → Payload + récap WhatsApp — Plan d'implémentation

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Le bouton WhatsApp flottant du site ouvre le parcours structuré devis/RDV (popup existant) ; à la soumission, la demande va dans Payload (existant) ET un bouton ouvre WhatsApp vers DT avec un récap pré-tapé.

**Architecture:** Réutilisation maximale. Un helper pur partagé (`lib/whatsapp/recap.ts`) construit l'URL `wa.me`. On ajoute un « mode WhatsApp » au `DevisModal` existant (porté par un flag), on réécrit `WhatsAppButton` pour ouvrir ce mode, et on propage le flag `wa=1` jusqu'à la page `/devis` qui affiche un bouton récap sur l'écran de succès. Aucune route serveur ni route API modifiée.

**Tech Stack:** Next.js 15 (App Router), React 19, next-intl, Tailwind, TypeScript strict. Liens `wa.me` uniquement — pas d'API Meta.

**Vérification (pas de test runner dans le projet) :** chaque tâche se vérifie via `pnpm tsc --noEmit` + `pnpm lint`, et la tâche finale via `pnpm build` + test manuel à 375 px.

**Référence spec :** `docs/superpowers/specs/2026-06-10-whatsapp-bouton-formulaire-design.md`

---

### Task 1 : Helper pur `lib/whatsapp/recap.ts`

**Files:**
- Create: `lib/whatsapp/recap.ts`

- [ ] **Step 1 : Créer le fichier**

```typescript
// lib/whatsapp/recap.ts
// Construit l'URL wa.me vers le numéro DT avec un récap pré-tapé.
// Utilisé par DevisModal (RDV) et DevisForm (devis) côté succès.
import { COMPANY } from '@/lib/constants'

/**
 * Normalise un numéro en E.164 sans '+'.
 * Un numéro tunisien local à 8 chiffres (ex : "52 880 311") est préfixé par 216.
 */
export function normalizePhone(raw: string): string {
  const digits = raw.replace(/[\s\-().]/g, '').replace(/^\+/, '').replace(/^00/, '')
  return digits.length === 8 ? `216${digits}` : digits
}

export interface DevisRecap {
  kind:           'devis'
  numeroDossier?: string
  nom?:           string
  villeDepart?:   string
  villeArrivee?:  string
  service?:       string
}

export interface RdvRecap {
  kind:        'rdv'
  nom?:        string
  dateVisite?: string
  heure?:      string
}

export type RecapInput = DevisRecap | RdvRecap

/** Texte du message — tolérant aux champs manquants (segments vides omis). */
export function buildRecapText(input: RecapInput): string {
  const lines: string[] = []

  if (input.kind === 'devis') {
    lines.push(
      `Bonjour, je viens d'envoyer ma demande de devis${input.numeroDossier ? ` n° ${input.numeroDossier}` : ''} via le site.`,
    )
    const details: string[] = []
    if (input.nom) details.push(`Nom : ${input.nom}`)
    if (input.villeDepart && input.villeArrivee) details.push(`Trajet : ${input.villeDepart} → ${input.villeArrivee}`)
    if (input.service) details.push(`Service : ${input.service}`)
    if (details.length) lines.push(details.join(' · '))
  } else {
    lines.push('Bonjour, je viens de demander un rendez-vous via le site.')
    const details: string[] = []
    if (input.nom) details.push(`Nom : ${input.nom}`)
    if (input.dateVisite) details.push(`Date souhaitée : ${input.dateVisite}${input.heure ? ` ${input.heure}` : ''}`)
    if (details.length) lines.push(details.join(' · '))
  }

  lines.push('Merci !')
  return lines.join('\n')
}

/** URL wa.me vers le numéro DT (COMPANY.whatsapp) avec le récap encodé. */
export function buildRecapUrl(input: RecapInput): string {
  const phone = normalizePhone(COMPANY.whatsapp)
  return `https://wa.me/${phone}?text=${encodeURIComponent(buildRecapText(input))}`
}
```

- [ ] **Step 2 : Vérifier la compilation**

Run: `pnpm tsc --noEmit`
Expected: aucune erreur liée à `lib/whatsapp/recap.ts`.

- [ ] **Step 3 : Commit**

```bash
git add dt-demenagement/lib/whatsapp/recap.ts
git commit -m "feat(whatsapp): helper recap.ts — URL wa.me + normalisation numero TN"
```

---

### Task 2 : Mode WhatsApp dans `DevisModal`

**Files:**
- Modify: `components/layout/DevisModal.tsx`

> ⚠️ Le code a évolué (commits `d21f367` / `a2915d3`) : `open` prend déjà `{ ville?, service? }` et `handleChoiceDevis` ajoute `ville`/`service`. On **fusionne** `whatsapp` dans la signature existante, on ne la remplace pas.

- [ ] **Step 1 : Étendre la signature `open` du contexte + l'import du helper**

Dans `components/layout/DevisModal.tsx`, remplacer la déclaration du contexte :

```typescript
interface DevisModalContextValue {
  open:  (opts?: { ville?: string; service?: string }) => void
  close: () => void
}
```

par :

```typescript
interface DevisModalContextValue {
  open:  (opts?: { ville?: string; service?: string; whatsapp?: boolean }) => void
  close: () => void
}
```

Et ajouter l'import en tête (zone « composants internes ») :

```typescript
import { buildRecapUrl } from '@/lib/whatsapp/recap'
```

- [ ] **Step 2 : Ajouter le state `waMode` et le renseigner dans `open`**

Après la ligne `const [serviceContext,  setServiceContext]   = useState<string | undefined>(undefined)`, ajouter :

```typescript
  const [waMode,          setWaMode]           = useState(false)
```

Puis modifier la signature et le corps de `open` pour fusionner `whatsapp`. Remplacer :

```typescript
  const open = useCallback((opts?: { ville?: string; service?: string }) => {
    triggerRef.current = document.activeElement as HTMLElement
    setScreen('contact')
    setContact(CONTACT_INIT)
    setRdv(RDV_INIT)
    setErrors({})
    // opts priment sur l'auto-détection URL
    setVilleContext(opts?.ville   ?? autoVille)
    setServiceContext(opts?.service ?? autoService)
    setIsOpen(true)
  }, [autoVille, autoService])
```

par :

```typescript
  const open = useCallback((opts?: { ville?: string; service?: string; whatsapp?: boolean }) => {
    triggerRef.current = document.activeElement as HTMLElement
    setScreen('contact')
    setContact(CONTACT_INIT)
    setRdv(RDV_INIT)
    setErrors({})
    // opts priment sur l'auto-détection URL
    setVilleContext(opts?.ville   ?? autoVille)
    setServiceContext(opts?.service ?? autoService)
    setWaMode(opts?.whatsapp ?? false)
    setIsOpen(true)
  }, [autoVille, autoService])
```

- [ ] **Step 3 : Propager `wa=1` vers /devis quand on est en mode WhatsApp**

Dans `handleChoiceDevis`, remplacer :

```typescript
    const params = new URLSearchParams({ prenom, nom, telephone: contact.telephone })
    if (contact.email)   params.set('email',   contact.email)
    if (villeContext)    params.set('ville',    villeContext)
    if (serviceContext)  params.set('service',  serviceContext)
```

par :

```typescript
    const params = new URLSearchParams({ prenom, nom, telephone: contact.telephone })
    if (contact.email)   params.set('email',   contact.email)
    if (villeContext)    params.set('ville',    villeContext)
    if (serviceContext)  params.set('service',  serviceContext)
    if (waMode)          params.set('wa',       '1')
```

- [ ] **Step 4 : Bouton récap sur l'écran de succès (RDV)**

Dans le bloc `{screen === 'success' && (...)}`, juste avant le bouton « successClose » (`<button ... onClick={close}>{t('successClose')}</button>`), insérer :

```tsx
                      {waMode && (
                        <a
                          href={buildRecapUrl({
                            kind:       'rdv',
                            nom:        `${rdv.prenom} ${rdv.nom}`.trim(),
                            dateVisite: rdv.dateVisite,
                            heure:      rdv.heure,
                          })}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-8 py-3 rounded-xl bg-[#25D366] text-white font-body font-semibold text-sm hover:bg-[#1fba5a] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#25D366]"
                        >
                          {t('whatsappRecap')}
                        </a>
                      )}
```

> Note : `t('whatsappRecap')` est ajouté aux fichiers i18n en Task 5. On utilise un `<a>` (geste utilisateur direct) plutôt que `window.open` pour éviter les bloqueurs de pop-up.

- [ ] **Step 5 : Vérifier compilation + lint**

Run: `pnpm tsc --noEmit && pnpm lint`
Expected: aucune erreur. (La clé i18n manquante ne casse pas le build — `t()` renverra la clé en attendant la Task 5.)

- [ ] **Step 6 : Commit**

```bash
git add dt-demenagement/components/layout/DevisModal.tsx
git commit -m "feat(whatsapp): mode WhatsApp dans DevisModal (flag + recap RDV + wa=1)"
```

---

### Task 3 : Réécrire `WhatsAppButton` pour ouvrir le mode WhatsApp

**Files:**
- Modify: `components/layout/WhatsAppButton.tsx`

> Contexte : `WhatsAppButton` est déjà rendu à l'intérieur de `DevisModalProvider` (`app/(site)/[locale]/layout.tsx:79`), donc `useDevisModal()` est disponible. On supprime l'affichage « numéro + copier + chat direct » (décision : remplacement complet).

- [ ] **Step 1 : Remplacer tout le contenu du fichier**

```tsx
'use client'

import { useTranslations } from 'next-intl'
import { useDevisModal } from '@/components/layout/DevisModal'

function WhatsAppButton() {
  const t = useTranslations('Layout')
  const { open } = useDevisModal()

  return (
    <div className="fixed end-4 bottom-8 z-40">
      <button
        type="button"
        onClick={() => open({ whatsapp: true })}
        aria-label={t('whatsappLabel')}
        className={[
          'w-14 h-14 rounded-full',
          'flex items-center justify-center',
          'bg-[#25D366] text-white',
          'shadow-[0_4px_20px_rgba(37,211,102,0.4)]',
          'hover:scale-110 active:scale-95',
          'transition-transform duration-200',
          'focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#25D366]/50',
        ].join(' ')}
      >
        <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
        </svg>
      </button>
    </div>
  )
}

export { WhatsAppButton }
```

- [ ] **Step 2 : Vérifier compilation + lint**

Run: `pnpm tsc --noEmit && pnpm lint`
Expected: aucune erreur. (Les anciens états `showNumber`/`copied` et leurs imports `useState`/`COMPANY` ont disparu — vérifier qu'il ne reste aucun import inutilisé.)

- [ ] **Step 3 : Commit**

```bash
git add dt-demenagement/components/layout/WhatsAppButton.tsx
git commit -m "feat(whatsapp): le bouton flottant ouvre le parcours devis/RDV (mode WhatsApp)"
```

---

### Task 4 : Propager `wa=1` jusqu'au succès du formulaire devis

**Files:**
- Modify: `app/(site)/[locale]/devis/page.tsx`
- Modify: `components/devis/DevisForm.tsx`

- [ ] **Step 1 : Lire `wa` dans la page et le passer en prop**

Dans `app/(site)/[locale]/devis/page.tsx`, ajouter `wa` au type `searchParams` :

```typescript
  searchParams: Promise<{
    type?:      string
    prenom?:    string
    nom?:       string
    telephone?: string
    email?:     string
    ville?:     string
    pays?:      string
    wa?:        string
  }>
```

Récupérer `wa` dans le destructuring :

```typescript
  const { type, prenom, nom, telephone, email, ville, pays, wa } = await searchParams
```

Et passer la prop au composant (juste après `initialContact={{ ... }}`) :

```tsx
            <DevisForm
              type={activeType}
              locale={locale}
              whatsappRecap={wa === '1'}
              initialContact={{
                prenom,
                nom,
                telephone,
                email,
                departVille: ville ?? pays,
              }}
            />
```

- [ ] **Step 2 : Ajouter la prop `whatsappRecap` à `DevisForm` + l'import du helper**

Dans `components/devis/DevisForm.tsx`, ajouter l'import en tête (zone composants internes) :

```typescript
import { buildRecapUrl } from '@/lib/whatsapp/recap'
```

Modifier la signature du composant :

```typescript
export function DevisForm({
  type,
  locale,
  initialContact,
  whatsappRecap = false,
}: {
  type:            TypeDevis
  locale:          string
  initialContact?: InitialContact
  whatsappRecap?:  boolean
}) {
```

- [ ] **Step 3 : Bouton récap sur l'écran de succès du devis**

Dans le bloc `if (success) { return (...) }`, juste avant le `<Link href="/espace-client" ...>`, insérer :

```tsx
        {whatsappRecap && (
          <div className="mb-4">
            <a
              href={buildRecapUrl({
                kind:          'devis',
                numeroDossier: dossier || undefined,
                nom:           `${form.prenom} ${form.nom}`.trim(),
                villeDepart:   form.departVille,
                villeArrivee:  form.arriveeVille,
                service:       SERVICES.find((s) => s.value === form.services[0])?.label,
              })}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#25D366] text-white font-body font-semibold text-sm hover:bg-[#1fba5a] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#25D366]"
            >
              {/* Libellé en dur : ce fichier n'utilise pas next-intl (cohérent avec le reste du composant). */}
              📲 Envoyer le récap sur WhatsApp
            </a>
          </div>
        )}
```

- [ ] **Step 4 : Vérifier compilation + lint**

Run: `pnpm tsc --noEmit && pnpm lint`
Expected: aucune erreur. `SERVICES`, `form`, `dossier` sont déjà dans la portée du composant.

- [ ] **Step 5 : Commit**

```bash
git add dt-demenagement/app/(site)/[locale]/devis/page.tsx dt-demenagement/components/devis/DevisForm.tsx
git commit -m "feat(whatsapp): bouton recap WhatsApp sur le succes du formulaire devis (wa=1)"
```

---

### Task 5 : Libellé i18n du bouton récap (DevisModal)

**Files:**
- Modify: `messages/fr.json`
- Modify: `messages/ar.json`
- Modify: `messages/en.json`

> `DevisModal` utilise `useTranslations('DevisModal')`. Ajouter la clé `whatsappRecap` dans l'objet `DevisModal` des trois fichiers.

- [ ] **Step 1 : `messages/fr.json`** — dans l'objet `"DevisModal"`, ajouter :

```json
    "whatsappRecap": "📲 Envoyer le récap sur WhatsApp"
```

- [ ] **Step 2 : `messages/ar.json`** — dans l'objet `"DevisModal"`, ajouter :

```json
    "whatsappRecap": "📲 إرسال الملخص عبر واتساب"
```

- [ ] **Step 3 : `messages/en.json`** — dans l'objet `"DevisModal"`, ajouter :

```json
    "whatsappRecap": "📲 Send the summary on WhatsApp"
```

> Attention JSON : ajouter une virgule à la fin de la propriété précédente pour rester valide.

- [ ] **Step 4 : Vérifier la validité JSON + compilation**

Run: `pnpm tsc --noEmit`
Expected: aucune erreur. Vérifier qu'aucun des trois fichiers JSON n'a d'erreur de syntaxe (virgules).

- [ ] **Step 5 : Commit**

```bash
git add dt-demenagement/messages/fr.json dt-demenagement/messages/ar.json dt-demenagement/messages/en.json
git commit -m "i18n(whatsapp): libelle bouton recap WhatsApp (FR/AR/EN)"
```

---

### Task 6 : Vérification finale + suivi projet

**Files:**
- Modify: `SUIVI-PROJET.md`

- [ ] **Step 1 : Build complet**

Run: `pnpm build`
Expected: build réussi, aucune erreur TypeScript ni lint.

- [ ] **Step 2 : Test manuel (dev server)**

Run: `pnpm dev` puis dans le navigateur (penser à tester à 375 px de large) :
1. Cliquer le bouton WhatsApp flottant (bas-droite) → le popup s'ouvre sur l'écran « contact ».
2. Remplir nom + téléphone → Continuer → choisir **Rendez-vous** → remplir → Envoyer → l'écran succès affiche le bouton vert « 📲 Envoyer le récap sur WhatsApp » → le cliquer ouvre `wa.me` vers **+216 52 880 311** avec le récap pré-tapé.
3. Refaire : choisir **Devis** → on arrive sur `/devis?...&wa=1` → remplir tout le formulaire → Envoyer → l'écran succès affiche le bouton récap WhatsApp avec le **n° de dossier** dans le message.
4. Vérifier qu'un dossier/RDV est bien créé dans l'admin Payload (rien cassé côté Payload).

Expected: les deux parcours créent la demande dans Payload ET proposent le bouton récap WhatsApp fonctionnel.

- [ ] **Step 3 : Mettre à jour `SUIVI-PROJET.md`**

Mettre à jour le tableau des étapes + la section « 🎯 POINT DE REPRISE EXACT » + « 🤖 DERNIÈRE MISE À JOUR PAR CLAUDE CODE » pour refléter : feature « bouton WhatsApp → formulaire → Payload + récap » terminée sur la branche `feat/whatsapp-devis-link`. Prochaine action : implémenter la spec sortante `2026-06-10-whatsapp-devis-link-design.md`.

- [ ] **Step 4 : Commit**

```bash
git add SUIVI-PROJET.md
git commit -m "chore: suivi — feature bouton WhatsApp entrant terminee"
```

---

## Self-Review (couverture de la spec)

- **Bouton flottant ouvre le formulaire (remplacement complet)** → Task 3. ✅
- **Mode WhatsApp dans le popup + récap RDV** → Task 2. ✅
- **Devis = formulaire complet /devis via `wa=1` + récap avec n° dossier** → Task 4. ✅
- **Helper partagé `wa.me` + normalisation numéro** → Task 1. ✅
- **Bouton explicite (anti pop-up blocker)** → `<a>` en Task 2 & 4. ✅
- **Payload inchangé / pas de régression** → vérifié en Task 6 step 2. ✅
- **i18n (libellé DevisModal)** → Task 5. ✅ (DevisForm en dur, cohérent avec le fichier, noté.)
- **0 € / 0 compte Meta** → uniquement `wa.me`, aucune route serveur ajoutée. ✅
