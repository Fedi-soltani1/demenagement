# Devis Modal — 3-Screen Flow + RDV Booking Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the existing DevisModal (which navigated directly to /devis) with a 3-screen flow: collect contact info → choose devis en ligne or visite domicile → pre-fill DevisForm or show RDV booking form inline.

**Architecture:**
- Screen 1 (contact): collects Nom & Prénom + Téléphone + Email (optional) — inside the existing modal shell
- Screen 2 (choice): two buttons — devis en ligne navigates to `/[locale]/devis` with contact pre-filled via URL params; visite shows screen 3 inside the modal
- Screen 3 (RDV): inline form → POST `/api/rdv` → saves to new `RendezVous` Payload collection → success screen

**Tech Stack:** Next.js 15, Payload CMS v3, PostgreSQL (Neon), Zod v4, framer-motion, next-intl, Tailwind v4, TypeScript strict

---

## File Map

| Action | File | Responsibility |
|--------|------|----------------|
| Modify | `messages/fr.json` | All new French i18n keys for the 3-screen flow |
| Modify | `messages/ar.json` | Arabic translations for same keys |
| Modify | `messages/en.json` | English translations for same keys |
| Create | `payload/collections/RendezVous.ts` | Payload collection schema for RDV bookings |
| Modify | `payload.config.ts` | Import + register RendezVous collection |
| **Manual** | Neon SQL Editor | Create `rendez_vous` table (push:false bug workaround) |
| Create | `app/api/rdv/route.ts` | POST endpoint: validate → save to Payload |
| Modify | `components/layout/DevisModal.tsx` | Full rewrite: 3-screen flow with AnimatePresence |
| Modify | `app/(site)/[locale]/devis/page.tsx` | Read prenom/nom/telephone/email from searchParams |
| Modify | `components/devis/DevisForm.tsx` | Accept `initialContact` prop, make email optional in step 0 |
| Modify | `app/api/devis/route.ts` | Make email optional in Zod schema + guard client upsert |

---

## Task 1 — i18n Keys (fr.json, ar.json, en.json)

**Files:**
- Modify: `messages/fr.json`
- Modify: `messages/ar.json`
- Modify: `messages/en.json`

- [ ] **Step 1: Replace the `DevisModal` block in `messages/fr.json`**

Find the existing `"DevisModal"` block and replace it entirely with:

```json
"DevisModal": {
  "close": "Fermer",
  "back": "Retour",

  "step1Title": "Devis Gratuit",
  "step1Subtitle": "Remplissez le formulaire et nous vous recontacterons rapidement.",
  "labelNomPrenom": "Nom et Prénom",
  "placeholderNomPrenom": "Ex: Ahmed Ben Ali",
  "labelTelephone": "Numéro de Téléphone",
  "placeholderTelephone": "Ex: +216 52 880 311",
  "labelEmail": "Email (optionnel)",
  "placeholderEmail": "Ex: contact@email.com",
  "errorRequired": "Ce champ est requis",
  "errorTelephone": "Ex : +216 52 880 311",
  "continue": "Continuer",

  "choiceTitle": "Comment souhaitez-vous procéder ?",
  "choiceDevisLabel": "Je veux recevoir un devis en ligne",
  "choiceDevisDesc": "Remplissez notre formulaire détaillé et recevez votre devis sous 24h.",
  "choiceRdvLabel": "Je veux réserver une visite d'un déménageur pour estimer mon déménagement",
  "choiceRdvDesc": "Un expert se déplace chez vous gratuitement pour évaluer votre projet.",

  "rdvTitle": "Demande de RDV pour visite",
  "rdvSubtitle": "Vous déménagez ? Remplissez ce formulaire pour organiser une visite à domicile 100 % gratuite, afin d'évaluer vos besoins et vous proposer immédiatement lors de la visite un devis adapté.",
  "rdvContact": "Pour toute question ou demande complémentaire, n'hésitez pas à nous contacter au 52 880 112.",
  "labelType": "Type",
  "labelNom": "Nom",
  "labelPrenom": "Prénom",
  "labelTelRdv": "Téléphone",
  "labelWhatsapp": "WhatsApp",
  "labelAdresse": "Adresse exacte",
  "placeholderAdresse": "Ex: 12 Rue de la République, Tunis",
  "labelDate": "Date de visite souhaitée",
  "labelHeure": "Heure",
  "typeClient": "Client",
  "typeEntreprise": "Entreprise",
  "typeAdministration": "Administration",
  "submit": "Demander ma visite gratuite",
  "submitting": "Envoi en cours…",

  "successTitle": "Demande reçue !",
  "successMessage": "Nous vous contacterons dans les plus brefs délais pour confirmer votre rendez-vous.",
  "successClose": "Fermer",

  "errorSubmit": "Une erreur est survenue. Veuillez réessayer ou nous appeler directement."
}
```

- [ ] **Step 2: Replace the `DevisModal` block in `messages/ar.json`**

```json
"DevisModal": {
  "close": "إغلاق",
  "back": "رجوع",

  "step1Title": "عرض سعر مجاني",
  "step1Subtitle": "املأ النموذج وسنتواصل معك في أقرب وقت.",
  "labelNomPrenom": "الاسم الكامل",
  "placeholderNomPrenom": "مثال: أحمد بن علي",
  "labelTelephone": "رقم الهاتف",
  "placeholderTelephone": "مثال: 311 880 52 216+",
  "labelEmail": "البريد الإلكتروني (اختياري)",
  "placeholderEmail": "مثال: contact@email.com",
  "errorRequired": "هذا الحقل مطلوب",
  "errorTelephone": "مثال: 311 880 52 216+",
  "continue": "متابعة",

  "choiceTitle": "كيف تريد أن تتابع؟",
  "choiceDevisLabel": "أريد استلام عرض سعر عبر الإنترنت",
  "choiceDevisDesc": "املأ نموذجنا التفصيلي واستلم عرض سعرك خلال 24 ساعة.",
  "choiceRdvLabel": "أريد حجز زيارة لتقدير تكلفة انتقالي",
  "choiceRdvDesc": "يأتي خبير إلى منزلك مجاناً لتقييم مشروع انتقالك.",

  "rdvTitle": "طلب موعد للزيارة",
  "rdvSubtitle": "هل تنتقل؟ املأ هذا النموذج لتنظيم زيارة منزلية مجانية 100%.",
  "rdvContact": "لأي استفسار، تواصل معنا على 52 880 112.",
  "labelType": "النوع",
  "labelNom": "اسم العائلة",
  "labelPrenom": "الاسم الأول",
  "labelTelRdv": "الهاتف",
  "labelWhatsapp": "واتساب",
  "labelAdresse": "العنوان الدقيق",
  "placeholderAdresse": "مثال: 12 شارع الجمهورية، تونس",
  "labelDate": "تاريخ الزيارة المطلوب",
  "labelHeure": "الساعة",
  "typeClient": "عميل",
  "typeEntreprise": "شركة",
  "typeAdministration": "إدارة",
  "submit": "طلب الزيارة المجانية",
  "submitting": "جارٍ الإرسال…",

  "successTitle": "تم استلام طلبك!",
  "successMessage": "سنتواصل معك في أقرب وقت لتأكيد الموعد.",
  "successClose": "إغلاق",

  "errorSubmit": "حدث خطأ. يرجى المحاولة مجدداً أو الاتصال بنا مباشرة."
}
```

- [ ] **Step 3: Replace the `DevisModal` block in `messages/en.json`**

```json
"DevisModal": {
  "close": "Close",
  "back": "Back",

  "step1Title": "Free Quote",
  "step1Subtitle": "Fill in the form and we'll get back to you shortly.",
  "labelNomPrenom": "Full Name",
  "placeholderNomPrenom": "E.g.: Ahmed Ben Ali",
  "labelTelephone": "Phone Number",
  "placeholderTelephone": "E.g.: +216 52 880 311",
  "labelEmail": "Email (optional)",
  "placeholderEmail": "E.g.: contact@email.com",
  "errorRequired": "This field is required",
  "errorTelephone": "E.g.: +216 52 880 311",
  "continue": "Continue",

  "choiceTitle": "How would you like to proceed?",
  "choiceDevisLabel": "I want to receive an online quote",
  "choiceDevisDesc": "Fill in our detailed form and receive your quote within 24h.",
  "choiceRdvLabel": "I want to book a home visit to estimate my move",
  "choiceRdvDesc": "An expert visits you for free to assess your moving project.",

  "rdvTitle": "Book a Home Visit",
  "rdvSubtitle": "Moving? Fill in this form to arrange a 100% free home visit to evaluate your needs and receive an on-the-spot quote.",
  "rdvContact": "For any questions, contact us at 52 880 112.",
  "labelType": "Type",
  "labelNom": "Last Name",
  "labelPrenom": "First Name",
  "labelTelRdv": "Phone",
  "labelWhatsapp": "WhatsApp",
  "labelAdresse": "Exact Address",
  "placeholderAdresse": "E.g.: 12 Rue de la République, Tunis",
  "labelDate": "Preferred Visit Date",
  "labelHeure": "Time",
  "typeClient": "Client",
  "typeEntreprise": "Business",
  "typeAdministration": "Administration",
  "submit": "Request my free visit",
  "submitting": "Sending…",

  "successTitle": "Request received!",
  "successMessage": "We'll contact you as soon as possible to confirm your appointment.",
  "successClose": "Close",

  "errorSubmit": "Something went wrong. Please try again or call us directly."
}
```

- [ ] **Step 4: Commit**

```bash
git add messages/fr.json messages/ar.json messages/en.json
git commit -m "feat: i18n — DevisModal 3-screen flow + RDV form keys"
```

---

## Task 2 — RendezVous Payload Collection

**Files:**
- Create: `payload/collections/RendezVous.ts`

- [ ] **Step 1: Create the file**

```typescript
import type { CollectionConfig } from 'payload'
import { isAdmin } from '../access/isAdmin'
import { isCommercial } from '../access/isClient'

const RendezVous: CollectionConfig = {
  slug: 'rendez-vous',
  labels: { singular: 'Rendez-vous visite', plural: 'Rendez-vous visites' },

  access: {
    read:   isCommercial,
    create: isAdmin,
    update: isCommercial,
    delete: isAdmin,
  },

  admin: {
    group: '📬 Demandes clients',
    useAsTitle: 'nom',
    defaultColumns: ['nom', 'prenom', 'telephone', 'dateVisite', 'statut', 'createdAt'],
    description: 'Demandes de visite à domicile reçues depuis le site. Contacter le client pour confirmer le RDV.',
  },

  fields: [
    {
      name: 'statut',
      label: 'Statut',
      type: 'select',
      required: true,
      defaultValue: 'nouveau',
      admin: { description: 'Mettre à jour après avoir contacté le client.' },
      options: [
        { label: '🆕 Nouveau — pas encore traité', value: 'nouveau' },
        { label: '✅ Confirmé — RDV validé',        value: 'confirme' },
        { label: '❌ Annulé',                        value: 'annule' },
      ],
    },
    {
      name: 'type',
      label: 'Type de client',
      type: 'select',
      required: true,
      defaultValue: 'client',
      options: [
        { label: 'Client',         value: 'client' },
        { label: 'Entreprise',     value: 'entreprise' },
        { label: 'Administration', value: 'administration' },
      ],
    },
    { name: 'nom',       label: 'Nom',       type: 'text',  required: true },
    { name: 'prenom',    label: 'Prénom',    type: 'text',  required: true },
    { name: 'telephone', label: 'Téléphone', type: 'text',  required: true },
    { name: 'whatsapp',  label: 'WhatsApp',  type: 'text',  required: true },
    { name: 'email',     label: 'Email',     type: 'email', required: false },
    { name: 'adresse',   label: 'Adresse',   type: 'text',  required: false },
    {
      name: 'dateVisite',
      label: 'Date de visite souhaitée',
      type: 'text',
      required: false,
      admin: { description: 'Format YYYY-MM-DD envoyé par le formulaire.' },
    },
    {
      name: 'heure',
      label: 'Heure souhaitée',
      type: 'text',
      required: false,
    },
  ],
}

export default RendezVous
```

- [ ] **Step 2: Commit**

```bash
git add payload/collections/RendezVous.ts
git commit -m "feat: Payload collection RendezVous — RDV visite domicile"
```

---

## Task 3 — Register RendezVous in payload.config.ts

**Files:**
- Modify: `payload.config.ts`

- [ ] **Step 1: Add the import after the existing Demenagements import**

In `payload.config.ts`, find:
```typescript
import Demenagements from './payload/collections/Demenagements'
import Settings from './payload/collections/Settings'
```

Replace with:
```typescript
import Demenagements from './payload/collections/Demenagements'
import RendezVous from './payload/collections/RendezVous'
import Settings from './payload/collections/Settings'
```

- [ ] **Step 2: Add RendezVous to the collections array**

Find:
```typescript
    Demenagements,
  ],
```

Replace with:
```typescript
    Demenagements,
    RendezVous,
  ],
```

- [ ] **Step 3: Commit**

```bash
git add payload.config.ts
git commit -m "feat: register RendezVous collection in Payload config"
```

---

## Task 4 — SQL Migration on Neon (manual — push:false workaround)

> ⚠️ `push: false` is active in `payload.config.ts` due to a drizzle-orm bug (see SUIVI-PROJET.md). New tables must be created manually on Neon.

**Files:** None — SQL run directly in the Neon console.

- [ ] **Step 1: Open Neon SQL Editor**

Go to [console.neon.tech](https://console.neon.tech) → select the project → open **SQL Editor**.

- [ ] **Step 2: Run the CREATE TABLE statement**

```sql
CREATE TABLE IF NOT EXISTS rendez_vous (
  id          SERIAL PRIMARY KEY,
  statut      VARCHAR(20)  NOT NULL DEFAULT 'nouveau',
  type        VARCHAR(20)  NOT NULL DEFAULT 'client',
  nom         VARCHAR(100) NOT NULL,
  prenom      VARCHAR(100) NOT NULL,
  telephone   VARCHAR(30)  NOT NULL,
  whatsapp    VARCHAR(30)  NOT NULL,
  email       VARCHAR(200),
  adresse     TEXT,
  date_visite VARCHAR(20),
  heure       VARCHAR(10),
  updated_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  created_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);
```

- [ ] **Step 3: Verify the table was created**

```sql
SELECT column_name, data_type FROM information_schema.columns
WHERE table_name = 'rendez_vous'
ORDER BY ordinal_position;
```

Expected: 13 rows (id, statut, type, nom, prenom, telephone, whatsapp, email, adresse, date_visite, heure, updated_at, created_at).

---

## Task 5 — API Route /api/rdv

**Files:**
- Create: `app/api/rdv/route.ts`

- [ ] **Step 1: Create the file**

```typescript
import { NextResponse } from 'next/server'
import { z } from 'zod'
import { getPayload } from 'payload'
import config from '@payload-config'

const TEL_RE = /^\+?[0-9\s\-()\s]{8,20}$/

const rdvSchema = z.object({
  website:    z.string().max(0, 'Bot').optional(),
  type:       z.enum(['client', 'entreprise', 'administration']),
  nom:        z.string().min(2).max(100),
  prenom:     z.string().min(2).max(100),
  telephone:  z.string().regex(TEL_RE),
  whatsapp:   z.string().regex(TEL_RE),
  email:      z.string().optional(),
  adresse:    z.string().max(300).optional(),
  dateVisite: z.string().optional(),
  heure:      z.string().optional(),
})

export async function POST(request: Request) {
  let body: unknown
  try { body = await request.json() } catch {
    return NextResponse.json({ error: 'Corps invalide' }, { status: 400 })
  }

  if ((body as Record<string, unknown>).website) {
    return NextResponse.json({ error: 'Bot détecté' }, { status: 400 })
  }

  const result = rdvSchema.safeParse(body)
  if (!result.success) {
    return NextResponse.json({ error: result.error.flatten() }, { status: 422 })
  }

  const d = result.data

  const payload = await getPayload({ config })

  const rdv = await payload.create({
    collection: 'rendez-vous',
    data: {
      statut:     'nouveau',
      type:       d.type,
      nom:        d.nom,
      prenom:     d.prenom,
      telephone:  d.telephone,
      whatsapp:   d.whatsapp,
      email:      d.email ?? '',
      adresse:    d.adresse ?? '',
      dateVisite: d.dateVisite ?? '',
      heure:      d.heure ?? '',
    },
    overrideAccess: true,
  })

  return NextResponse.json({ success: true, id: rdv.id }, { status: 201 })
}
```

- [ ] **Step 2: Test the endpoint with curl**

```bash
curl -s -X POST http://localhost:3001/api/rdv \
  -H "Content-Type: application/json" \
  -d '{"type":"client","nom":"Ben Ali","prenom":"Ahmed","telephone":"+216 52 880 311","whatsapp":"+216 52 880 311","adresse":"12 Rue Test, Tunis","dateVisite":"2026-06-15","heure":"10:00"}' | python -m json.tool
```

Expected response:
```json
{ "success": true, "id": 1 }
```

- [ ] **Step 3: Commit**

```bash
git add app/api/rdv/route.ts
git commit -m "feat: POST /api/rdv — save RDV visite to Payload RendezVous"
```

---

## Task 6 — Rewrite DevisModal.tsx

**Files:**
- Modify: `components/layout/DevisModal.tsx`

- [ ] **Step 1: Replace the entire file content**

```typescript
'use client'

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  useTransition,
} from 'react'
import type { ReactNode } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { useTranslations } from 'next-intl'
import { ArrowRight, ArrowLeft, X, ClipboardList, Calendar, CheckCircle } from 'lucide-react'

// ─── Context ──────────────────────────────────────────────────────────────────

interface DevisModalContextValue {
  open: () => void
  close: () => void
}

const DevisModalContext = createContext<DevisModalContextValue | null>(null)

export function useDevisModal(): DevisModalContextValue {
  const ctx = useContext(DevisModalContext)
  if (!ctx) throw new Error('useDevisModal must be used inside DevisModalProvider')
  return ctx
}

// ─── Types ────────────────────────────────────────────────────────────────────

type Screen = 'contact' | 'choice' | 'rdv' | 'success'

interface ContactData {
  nomPrenom:  string
  telephone:  string
  email:      string
}

interface RdvData {
  type:       'client' | 'entreprise' | 'administration'
  nom:        string
  prenom:     string
  telephone:  string
  whatsapp:   string
  adresse:    string
  dateVisite: string
  heure:      string
}

interface FieldErrors {
  nomPrenom?:   string
  telephone?:   string
  rdvNom?:      string
  rdvPrenom?:   string
  rdvTelephone?: string
  rdvWhatsapp?: string
  submit?:      string
}

// ─── Constants ────────────────────────────────────────────────────────────────

const TEL_RE = /^\+?[0-9\s\-()\s]{8,20}$/

const CONTACT_INIT: ContactData = { nomPrenom: '', telephone: '', email: '' }

const RDV_INIT: RdvData = {
  type: 'client', nom: '', prenom: '',
  telephone: '', whatsapp: '',
  adresse: '', dateVisite: '', heure: '',
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function splitNomPrenom(full: string): { prenom: string; nom: string } {
  const parts = full.trim().split(/\s+/)
  if (parts.length === 1) return { prenom: parts[0] ?? '', nom: '' }
  return { prenom: parts[0] ?? '', nom: parts.slice(1).join(' ') }
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function FieldWrapper({
  label,
  required,
  error,
  children,
}: {
  label: string
  required?: boolean
  error?: string
  children: ReactNode
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="font-body text-sm font-medium text-[var(--color-text-light)]">
        {label}
        {required && (
          <span className="text-[var(--color-red)] ms-0.5" aria-hidden="true">*</span>
        )}
      </label>
      {children}
      {error && (
        <p className="font-body text-xs text-[var(--color-red)]" role="alert">
          {error}
        </p>
      )}
    </div>
  )
}

const inputCls = (error?: string) =>
  `w-full rounded-xl border bg-transparent px-4 py-2.5 font-body text-sm
   text-[var(--color-text-light)] placeholder:text-[var(--color-text-muted)]
   focus:outline-none transition-colors ${
     error
       ? 'border-[var(--color-red)]'
       : 'border-[var(--color-border)] focus:border-[var(--color-red)]/60'
   }`

// Phone input with +216 prefix badge
function TelInput({
  value,
  onChange,
  placeholder = '52 880 311',
  error,
}: {
  value: string
  onChange: (v: string) => void
  placeholder?: string
  error?: string
}) {
  const raw = value.startsWith('+216') ? value.replace(/^\+216\s?/, '') : value
  return (
    <div
      className={`flex rounded-xl border overflow-hidden transition-colors ${
        error
          ? 'border-[var(--color-red)]'
          : 'border-[var(--color-border)] focus-within:border-[var(--color-red)]/60'
      }`}
    >
      <span className="flex items-center px-3 py-2.5 bg-white/[0.04] border-e border-[var(--color-border)] font-mono text-sm text-[var(--color-text-muted)] select-none shrink-0">
        +216
      </span>
      <input
        type="tel"
        value={raw}
        onChange={(e) => onChange('+216 ' + e.target.value)}
        placeholder={placeholder}
        aria-invalid={!!error}
        className="flex-1 bg-transparent px-3 py-2.5 font-body text-sm text-[var(--color-text-light)] placeholder:text-[var(--color-text-muted)] focus:outline-none"
      />
    </div>
  )
}

// ─── Provider ─────────────────────────────────────────────────────────────────

export function DevisModalProvider({ children }: { children: ReactNode }) {
  const t          = useTranslations('DevisModal')
  const router     = useRouter()
  const pathname   = usePathname()
  const dialogRef  = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLElement | null>(null)

  const [isOpen,     setIsOpen]     = useState(false)
  const [screen,     setScreen]     = useState<Screen>('contact')
  const [contact,    setContact]    = useState<ContactData>(CONTACT_INIT)
  const [rdv,        setRdv]        = useState<RdvData>(RDV_INIT)
  const [errors,     setErrors]     = useState<FieldErrors>({})
  const [isPending,  startTransition] = useTransition()

  const open = useCallback(() => {
    triggerRef.current = document.activeElement as HTMLElement
    setScreen('contact')
    setContact(CONTACT_INIT)
    setRdv(RDV_INIT)
    setErrors({})
    setIsOpen(true)
  }, [])

  const close = useCallback(() => {
    setIsOpen(false)
    setTimeout(() => triggerRef.current?.focus(), 50)
  }, [])

  useEffect(() => {
    if (!isOpen) return
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') close() }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [isOpen, close])

  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [isOpen])

  useEffect(() => {
    if (isOpen) dialogRef.current?.focus()
  }, [isOpen])

  // ── Screen 1 → 2 ────────────────────────────────────────────────────────────

  function handleContactContinue() {
    const errs: FieldErrors = {}
    if (!contact.nomPrenom.trim())            errs.nomPrenom  = t('errorRequired')
    if (!TEL_RE.test(contact.telephone))      errs.telephone  = t('errorTelephone')
    if (Object.keys(errs).length > 0) { setErrors(errs); return }
    setErrors({})
    setScreen('choice')
  }

  // ── Screen 2 → /devis ───────────────────────────────────────────────────────

  function handleChoiceDevis() {
    const { prenom, nom } = splitNomPrenom(contact.nomPrenom)
    const params = new URLSearchParams({ prenom, nom, telephone: contact.telephone })
    if (contact.email) params.set('email', contact.email)
    const locale = pathname.split('/')[1] ?? 'fr'
    close()
    router.push(`/${locale}/devis?${params.toString()}`)
  }

  // ── Screen 2 → 3 ────────────────────────────────────────────────────────────

  function handleChoiceRdv() {
    const { prenom, nom } = splitNomPrenom(contact.nomPrenom)
    setRdv((prev) => ({
      ...prev,
      nom,
      prenom,
      telephone: contact.telephone,
      whatsapp:  contact.telephone,
    }))
    setErrors({})
    setScreen('rdv')
  }

  // ── Screen 3 submit ──────────────────────────────────────────────────────────

  function handleRdvSubmit() {
    const errs: FieldErrors = {}
    if (!rdv.nom.trim())                  errs.rdvNom       = t('errorRequired')
    if (!rdv.prenom.trim())               errs.rdvPrenom    = t('errorRequired')
    if (!TEL_RE.test(rdv.telephone))      errs.rdvTelephone = t('errorTelephone')
    if (!TEL_RE.test(rdv.whatsapp))       errs.rdvWhatsapp  = t('errorTelephone')
    if (Object.keys(errs).length > 0) { setErrors(errs); return }
    setErrors({})

    startTransition(async () => {
      try {
        const res = await fetch('/api/rdv', {
          method:  'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type:       rdv.type,
            nom:        rdv.nom,
            prenom:     rdv.prenom,
            telephone:  rdv.telephone,
            whatsapp:   rdv.whatsapp,
            email:      contact.email,
            adresse:    rdv.adresse,
            dateVisite: rdv.dateVisite,
            heure:      rdv.heure,
          }),
        })
        if (!res.ok) throw new Error('server')
        setScreen('success')
      } catch {
        setErrors({ submit: t('errorSubmit') })
      }
    })
  }

  // ── Modal width: wider for the RDV form ─────────────────────────────────────

  const maxW = screen === 'rdv' ? 'sm:max-w-xl' : 'sm:max-w-lg'

  // ── Header title per screen ──────────────────────────────────────────────────

  const titles: Record<Screen, string> = {
    contact: t('step1Title'),
    choice:  t('choiceTitle'),
    rdv:     t('rdvTitle'),
    success: t('successTitle'),
  }

  return (
    <DevisModalContext.Provider value={{ open, close }}>
      {children}

      {isOpen && (
        <>
          {/* Overlay */}
          <div
            className="fixed inset-0 z-[9980] bg-black/70 backdrop-blur-sm"
            onClick={close}
            aria-hidden="true"
          />

          {/* Dialog */}
          <div
            ref={dialogRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="devis-modal-title"
            tabIndex={-1}
            className={`fixed inset-x-4 top-1/2 -translate-y-1/2 z-[9981]
              sm:inset-x-auto sm:start-1/2 sm:-translate-x-1/2 sm:w-full ${maxW}
              focus-visible:outline-none`}
          >
            <div className="bg-[var(--color-bg-card)] border border-[var(--color-border)] rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">

              {/* ── Header ── */}
              <div className="flex items-center gap-2 px-6 py-4 border-b border-[var(--color-border)] shrink-0">
                {(screen === 'choice' || screen === 'rdv') && (
                  <button
                    type="button"
                    onClick={() => setScreen(screen === 'rdv' ? 'choice' : 'contact')}
                    aria-label={t('back')}
                    className="w-8 h-8 flex items-center justify-center text-[var(--color-text-muted)] hover:text-[var(--color-text-light)] transition-colors rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-red)]"
                  >
                    <ArrowLeft className="w-4 h-4" aria-hidden="true" />
                  </button>
                )}
                <h2
                  id="devis-modal-title"
                  className="flex-1 font-heading text-lg font-semibold text-[var(--color-text-light)]"
                >
                  {titles[screen]}
                </h2>
                <button
                  type="button"
                  onClick={close}
                  aria-label={t('close')}
                  className="w-8 h-8 flex items-center justify-center text-[var(--color-text-muted)] hover:text-[var(--color-red)] transition-colors rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-red)]"
                >
                  <X className="w-[18px] h-[18px]" aria-hidden="true" />
                </button>
              </div>

              {/* ── Body (scrollable) ── */}
              <div className="overflow-y-auto flex-1">
                <AnimatePresence mode="wait" initial={false}>

                  {/* ── Screen 1: Contact ── */}
                  {screen === 'contact' && (
                    <motion.div
                      key="contact"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.18 }}
                      className="px-6 py-6 flex flex-col gap-5"
                    >
                      <p className="font-body text-sm text-[var(--color-text-muted)]">
                        {t('step1Subtitle')}
                      </p>

                      <FieldWrapper label={t('labelNomPrenom')} required error={errors.nomPrenom}>
                        <input
                          type="text"
                          value={contact.nomPrenom}
                          onChange={(e) => setContact((p) => ({ ...p, nomPrenom: e.target.value }))}
                          onBlur={() => {
                            if (!contact.nomPrenom.trim())
                              setErrors((p) => ({ ...p, nomPrenom: t('errorRequired') }))
                            else
                              setErrors((p) => ({ ...p, nomPrenom: undefined }))
                          }}
                          placeholder={t('placeholderNomPrenom')}
                          aria-required="true"
                          aria-invalid={!!errors.nomPrenom}
                          className={inputCls(errors.nomPrenom)}
                        />
                      </FieldWrapper>

                      <FieldWrapper label={t('labelTelephone')} required error={errors.telephone}>
                        <input
                          type="tel"
                          value={contact.telephone}
                          onChange={(e) => setContact((p) => ({ ...p, telephone: e.target.value }))}
                          onBlur={() => {
                            if (!TEL_RE.test(contact.telephone))
                              setErrors((p) => ({ ...p, telephone: t('errorTelephone') }))
                            else
                              setErrors((p) => ({ ...p, telephone: undefined }))
                          }}
                          placeholder={t('placeholderTelephone')}
                          aria-required="true"
                          aria-invalid={!!errors.telephone}
                          className={inputCls(errors.telephone)}
                        />
                      </FieldWrapper>

                      <FieldWrapper label={t('labelEmail')}>
                        <input
                          type="email"
                          value={contact.email}
                          onChange={(e) => setContact((p) => ({ ...p, email: e.target.value }))}
                          placeholder={t('placeholderEmail')}
                          className={inputCls()}
                        />
                      </FieldWrapper>

                      <button
                        type="button"
                        onClick={handleContactContinue}
                        className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-[var(--color-red)] text-white font-body font-semibold text-sm hover:bg-[var(--color-red-dark)] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-red)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-bg-card)]"
                      >
                        {t('continue')}
                        <ArrowRight className="w-4 h-4" aria-hidden="true" />
                      </button>
                    </motion.div>
                  )}

                  {/* ── Screen 2: Choice ── */}
                  {screen === 'choice' && (
                    <motion.div
                      key="choice"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.18 }}
                      className="px-6 py-6 flex flex-col gap-4"
                    >
                      {[
                        {
                          icon: <ClipboardList className="w-6 h-6 text-[var(--color-red)] shrink-0 mt-0.5" aria-hidden="true" />,
                          label: t('choiceDevisLabel'),
                          desc:  t('choiceDevisDesc'),
                          onClick: handleChoiceDevis,
                        },
                        {
                          icon: <Calendar className="w-6 h-6 text-[var(--color-red)] shrink-0 mt-0.5" aria-hidden="true" />,
                          label: t('choiceRdvLabel'),
                          desc:  t('choiceRdvDesc'),
                          onClick: handleChoiceRdv,
                        },
                      ].map(({ icon, label, desc, onClick }) => (
                        <button
                          key={label}
                          type="button"
                          onClick={onClick}
                          className="group flex items-start gap-4 p-5 rounded-xl border border-[var(--color-border)] hover:border-[var(--color-red)] hover:bg-[var(--color-red)]/5 transition-all duration-200 text-start focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-red)]"
                        >
                          {icon}
                          <div className="flex-1 min-w-0">
                            <p className="font-body font-semibold text-sm text-[var(--color-text-light)] mb-1 leading-snug">
                              {label}
                            </p>
                            <p className="font-body text-xs text-[var(--color-text-muted)] leading-relaxed">
                              {desc}
                            </p>
                          </div>
                          <ArrowRight className="w-4 h-4 text-[var(--color-text-muted)] group-hover:text-[var(--color-red)] shrink-0 mt-1 transition-colors" aria-hidden="true" />
                        </button>
                      ))}
                    </motion.div>
                  )}

                  {/* ── Screen 3: RDV Form ── */}
                  {screen === 'rdv' && (
                    <motion.div
                      key="rdv"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.18 }}
                      className="px-6 py-6 flex flex-col gap-4"
                    >
                      <p className="font-body text-sm text-[var(--color-text-muted)] leading-relaxed">
                        {t('rdvSubtitle')}
                      </p>
                      <p className="font-body text-xs text-[var(--color-gold)] border border-[var(--color-gold)]/20 bg-[var(--color-gold)]/5 rounded-lg px-3 py-2">
                        {t('rdvContact')}
                      </p>

                      {/* Type */}
                      <FieldWrapper label={t('labelType')} required>
                        <select
                          value={rdv.type}
                          onChange={(e) => setRdv((p) => ({ ...p, type: e.target.value as RdvData['type'] }))}
                          className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-card)] px-4 py-2.5 font-body text-sm text-[var(--color-text-light)] focus:outline-none focus:border-[var(--color-red)]/60 transition-colors"
                        >
                          <option value="client">{t('typeClient')}</option>
                          <option value="entreprise">{t('typeEntreprise')}</option>
                          <option value="administration">{t('typeAdministration')}</option>
                        </select>
                      </FieldWrapper>

                      {/* Nom + Prénom */}
                      <div className="grid grid-cols-2 gap-3">
                        <FieldWrapper label={t('labelNom')} required error={errors.rdvNom}>
                          <input
                            type="text"
                            value={rdv.nom}
                            onChange={(e) => setRdv((p) => ({ ...p, nom: e.target.value }))}
                            placeholder="Ben Ali"
                            aria-required="true"
                            aria-invalid={!!errors.rdvNom}
                            className={inputCls(errors.rdvNom)}
                          />
                        </FieldWrapper>
                        <FieldWrapper label={t('labelPrenom')} required error={errors.rdvPrenom}>
                          <input
                            type="text"
                            value={rdv.prenom}
                            onChange={(e) => setRdv((p) => ({ ...p, prenom: e.target.value }))}
                            placeholder="Ahmed"
                            aria-required="true"
                            aria-invalid={!!errors.rdvPrenom}
                            className={inputCls(errors.rdvPrenom)}
                          />
                        </FieldWrapper>
                      </div>

                      {/* Téléphone + WhatsApp */}
                      <div className="grid grid-cols-2 gap-3">
                        <FieldWrapper label={t('labelTelRdv')} required error={errors.rdvTelephone}>
                          <TelInput
                            value={rdv.telephone}
                            onChange={(v) => setRdv((p) => ({ ...p, telephone: v }))}
                            error={errors.rdvTelephone}
                          />
                        </FieldWrapper>
                        <FieldWrapper label={t('labelWhatsapp')} required error={errors.rdvWhatsapp}>
                          <TelInput
                            value={rdv.whatsapp}
                            onChange={(v) => setRdv((p) => ({ ...p, whatsapp: v }))}
                            error={errors.rdvWhatsapp}
                          />
                        </FieldWrapper>
                      </div>

                      {/* Adresse */}
                      <FieldWrapper label={t('labelAdresse')}>
                        <input
                          type="text"
                          value={rdv.adresse}
                          onChange={(e) => setRdv((p) => ({ ...p, adresse: e.target.value }))}
                          placeholder={t('placeholderAdresse')}
                          className={inputCls()}
                        />
                      </FieldWrapper>

                      {/* Date + Heure */}
                      <div className="grid grid-cols-2 gap-3">
                        <FieldWrapper label={t('labelDate')}>
                          <input
                            type="date"
                            value={rdv.dateVisite}
                            min={new Date().toISOString().split('T')[0]}
                            onChange={(e) => setRdv((p) => ({ ...p, dateVisite: e.target.value }))}
                            className={inputCls()}
                          />
                        </FieldWrapper>
                        <FieldWrapper label={t('labelHeure')}>
                          <input
                            type="time"
                            value={rdv.heure}
                            min="08:00"
                            max="18:00"
                            step="1800"
                            onChange={(e) => setRdv((p) => ({ ...p, heure: e.target.value }))}
                            className={inputCls()}
                          />
                        </FieldWrapper>
                      </div>

                      {/* Submit error */}
                      {errors.submit && (
                        <p className="font-body text-xs text-[var(--color-red)] text-center" role="alert">
                          {errors.submit}
                        </p>
                      )}

                      {/* Submit button */}
                      <button
                        type="button"
                        onClick={handleRdvSubmit}
                        disabled={isPending}
                        className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-[var(--color-red)] text-white font-body font-semibold text-sm hover:bg-[var(--color-red-dark)] disabled:opacity-60 disabled:cursor-not-allowed transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-red)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-bg-card)] mt-1"
                      >
                        {isPending ? t('submitting') : t('submit')}
                      </button>
                    </motion.div>
                  )}

                  {/* ── Screen 4: Success ── */}
                  {screen === 'success' && (
                    <motion.div
                      key="success"
                      initial={{ opacity: 0, scale: 0.96 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.22 }}
                      className="px-6 py-12 flex flex-col items-center gap-5 text-center"
                    >
                      <CheckCircle className="w-14 h-14 text-emerald-500" aria-hidden="true" />
                      <div>
                        <h3 className="font-heading text-xl font-bold text-[var(--color-text-light)] mb-2">
                          {t('successTitle')}
                        </h3>
                        <p className="font-body text-sm text-[var(--color-text-muted)] max-w-xs mx-auto leading-relaxed">
                          {t('successMessage')}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={close}
                        className="px-8 py-3 rounded-xl bg-[var(--color-red)] text-white font-body font-semibold text-sm hover:bg-[var(--color-red-dark)] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-red)]"
                      >
                        {t('successClose')}
                      </button>
                    </motion.div>
                  )}

                </AnimatePresence>
              </div>
            </div>
          </div>
        </>
      )}
    </DevisModalContext.Provider>
  )
}
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
pnpm tsc --noEmit
```

Expected: 0 errors.

- [ ] **Step 3: Manually test the modal in the browser**

Open http://localhost:3001/fr — click any "Devis" button.

Checklist:
- [ ] Screen 1 shows Nom & Prénom, Téléphone, Email
- [ ] Clicking "Continuer" without filling fields shows inline errors
- [ ] Filling valid data and clicking "Continuer" shows Screen 2
- [ ] Back arrow on Screen 2 returns to Screen 1 with data preserved
- [ ] "Je veux recevoir un devis en ligne" closes modal and navigates to /fr/devis

- [ ] **Step 4: Commit**

```bash
git add components/layout/DevisModal.tsx
git commit -m "feat: DevisModal — 3-screen flow (contact → choice → RDV form)"
```

---

## Task 7 — Pre-fill DevisForm from URL params

**Files:**
- Modify: `app/(site)/[locale]/devis/page.tsx`
- Modify: `components/devis/DevisForm.tsx`
- Modify: `app/api/devis/route.ts`

### Part A — devis/page.tsx: read searchParams and pass to DevisForm

- [ ] **Step 1: Update the searchParams type and pass initialContact**

In `app/(site)/[locale]/devis/page.tsx`, find:

```typescript
interface PageProps {
  params: Promise<{ locale: string }>
  searchParams: Promise<{ type?: string }>
}
```

Replace with:

```typescript
interface PageProps {
  params: Promise<{ locale: string }>
  searchParams: Promise<{
    type?:      string
    prenom?:    string
    nom?:       string
    telephone?: string
    email?:     string
  }>
}
```

- [ ] **Step 2: Destructure the new params and pass them to DevisForm**

Find:

```typescript
  const { type } = await searchParams
```

Replace with:

```typescript
  const { type, prenom, nom, telephone, email } = await searchParams
```

Find:

```typescript
            <DevisForm type={activeType} locale={locale} />
```

Replace with:

```typescript
            <DevisForm
              type={activeType}
              locale={locale}
              initialContact={{ prenom, nom, telephone, email }}
            />
```

### Part B — DevisForm.tsx: accept initialContact prop + make email optional

- [ ] **Step 3: Add `initialContact` to the component's props interface and use it**

In `components/devis/DevisForm.tsx`, find:

```typescript
export function DevisForm({ type, locale }: { type: TypeDevis; locale: string }) {
```

Replace with:

```typescript
interface InitialContact {
  prenom?:    string
  nom?:       string
  telephone?: string
  email?:     string
}

export function DevisForm({
  type,
  locale,
  initialContact,
}: {
  type:            TypeDevis
  locale:          string
  initialContact?: InitialContact
}) {
```

- [ ] **Step 4: Use `initialContact` to seed the form state**

Find:

```typescript
  const [form,       setForm]       = useState<FormData>(INITIAL)
```

Replace with:

```typescript
  const [form, setForm] = useState<FormData>(() => ({
    ...INITIAL,
    prenom:    initialContact?.prenom    ?? '',
    nom:       initialContact?.nom       ?? '',
    telephone: initialContact?.telephone ?? '',
    email:     initialContact?.email     ?? '',
  }))
```

- [ ] **Step 5: Make email optional in step-0 validation**

Find:

```typescript
    if (step === 0) return !!(form.prenom.trim() && form.nom.trim() && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email) && form.telephone)
```

Replace with:

```typescript
    if (step === 0) return !!(form.prenom.trim() && form.nom.trim() && form.telephone.trim())
```

### Part C — /api/devis/route.ts: make email optional in schema and guard client upsert

- [ ] **Step 6: Make email optional in the Zod schema**

In `app/api/devis/route.ts`, find:

```typescript
  email:      z.string().email(),
```

Replace with:

```typescript
  email:      z.string().optional(),
```

- [ ] **Step 7: Guard the client upsert block so it only runs when email is provided**

Find:

```typescript
  // Upsert fiche client avec les données complètes du formulaire
  const existingClient = await payload.find({
```

Replace with:

```typescript
  // Upsert fiche client — uniquement si l'email est fourni
  if (d.email) await (async () => {
  const existingClient = await payload.find({
```

And find the closing of that block:

```typescript
    })
  }

  // Résoudre les URLs publiques des photos pour l'email
```

Replace with:

```typescript
    })
  }
  })()

  // Résoudre les URLs publiques des photos pour l'email
```

> ⚠️ Note: Also guard the email sending in the same file — the `sendEmail(d.email, ...)` line. Wrap it:

Find:

```typescript
      await Promise.all([
        sendEmail(d.email, `Votre demande de devis DT Déménagement — ${numeroDossier}`, buildClientEmail(d.prenom, numeroDossier)),
        sendEmail(env.EMAIL_DEVIS_TO, `Nouveau devis ${numeroDossier} — ${d.type} — ${d.prenom} ${d.nom}`, buildInternalEmail(d, numeroDossier, photoUrls)),
      ])
```

Replace with:

```typescript
      const emailPromises = [
        sendEmail(env.EMAIL_DEVIS_TO, `Nouveau devis ${numeroDossier} — ${d.type} — ${d.prenom} ${d.nom}`, buildInternalEmail(d, numeroDossier, photoUrls)),
      ]
      if (d.email) {
        emailPromises.push(
          sendEmail(d.email, `Votre demande de devis DT Déménagement — ${numeroDossier}`, buildClientEmail(d.prenom, numeroDossier))
        )
      }
      await Promise.all(emailPromises)
```

- [ ] **Step 8: Verify TypeScript compiles**

```bash
pnpm tsc --noEmit
```

Expected: 0 errors.

- [ ] **Step 9: Test the pre-fill end-to-end**

1. Open http://localhost:3001/fr
2. Click "Devis gratuit" → fill contact info → click "Je veux recevoir un devis en ligne"
3. Verify you land on `/fr/devis?prenom=...&nom=...&telephone=...`
4. Verify the DevisForm step 0 is pre-filled with the name and phone from the modal
5. Verify you can advance to step 1 without re-entering those fields

- [ ] **Step 10: Commit**

```bash
git add app/(site)/[locale]/devis/page.tsx components/devis/DevisForm.tsx app/api/devis/route.ts
git commit -m "feat: pre-fill DevisForm from modal contact data via URL params"
```

---

## Task 8 — Final Integration Commit

- [ ] **Step 1: Full TypeScript + lint check**

```bash
pnpm tsc --noEmit && pnpm lint
```

Expected: 0 errors, 0 warnings.

- [ ] **Step 2: End-to-end smoke test — RDV path**

1. Click "Devis gratuit" on home page
2. Fill: Nom "Ben Ali Ahmed", Téléphone "+216 52 880 311", Email blank
3. Click "Continuer" → see Screen 2
4. Click "Je veux réserver une visite" → see Screen 3 (RDV form)
5. Verify Nom "Ali Ahmed" and Prénom "Ben" are pre-filled (split from "Ben Ali Ahmed")
6. Verify Téléphone and WhatsApp show "+216 52 880 311" pre-filled
7. Fill Date and Heure → click "Demander ma visite gratuite"
8. Verify success screen appears
9. Open http://localhost:3001/admin → Rendez-vous visites → verify the new record appears

- [ ] **Step 3: Update SUIVI-PROJET.md**

Update the "POINT DE REPRISE EXACT" section with the new status.

- [ ] **Step 4: Final commit**

```bash
git add SUIVI-PROJET.md
git commit -m "chore: suivi — DevisModal 3-screen flow + RDV booking complet"
```

---

## Self-Review Checklist

- [x] **Spec coverage**: All user requirements covered — contact form (screen 1), choice screen (screen 2), devis pre-fill (path A), RDV form with all specified fields (path B), success screen
- [x] **No placeholders**: All code blocks are complete, no TBDs
- [x] **Type consistency**: `RdvData['type']` used consistently in Task 6; `InitialContact` defined once in Task 7 and referenced by DevisForm; `RendezVous` collection slug `'rendez-vous'` matches API route `payload.create({ collection: 'rendez-vous' })`
- [x] **SQL table**: Column names use snake_case matching Payload drizzle adapter convention (`date_visite`, `updated_at`)
- [x] **email optional guard**: Both the client upsert AND the confirmation email are guarded with `if (d.email)` in Task 7
- [x] **Back navigation**: Screen 2 back → Screen 1, Screen 3 back → Screen 2 (implemented in header button logic)
- [x] **Data preserved on back**: `contact` state is never reset when moving between screens, `rdv` state is pre-filled from `contact` when entering screen 3
