# Admin Redesign — Deep Navy Professional Theme

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the current dual-theme Payload admin with a single deep-navy professional theme, add a Recharts line chart + donut chart to the dashboard, and expose monthly dossier data from the stats API.

**Architecture:** Pure CSS override via `custom-admin.css` (single `:root` navy token block replaces dual light/dark blocks); `AdminDashboard.tsx` gets a `THEME` constant, updated inline styles, new `KPICard` component, and a dynamic-imported `AdminCharts` component; stats API gains a `monthly` field and `clientsTotal`.

**Tech Stack:** Next.js 15, Payload CMS v3, Recharts ^2.x, TypeScript strict, pnpm

---

## Task 1 — Install recharts

**Files:**
- Modify: `package.json`

- [ ] **Step 1: Install recharts**

```powershell
cd "C:\Users\SIGMA IT\Desktop\Demenagement\dt-demenagement"
pnpm add recharts
```

Expected output: `+ recharts X.X.X` added to dependencies.

- [ ] **Step 2: Verify TypeScript types are bundled**

```powershell
pnpm tsc --noEmit 2>&1 | Select-String "recharts"
```

Expected: no output (recharts ships its own types).

- [ ] **Step 3: Commit**

```powershell
git add package.json pnpm-lock.yaml
git commit -m "chore: install recharts for admin dashboard charts"
```

---

## Task 2 — Extend stats API with monthly data and client count

**Files:**
- Modify: `app/api/admin/dashboard-stats/route.ts`

- [ ] **Step 1: Add `clientsTotal` and `monthly` queries**

Replace the entire file content with:

```typescript
import { NextRequest } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'

async function safeCount(p: Promise<{ totalDocs: number }>): Promise<number> {
  try { return (await p).totalDocs } catch { return 0 }
}
async function safeFind<T>(p: Promise<{ docs: T[]; totalDocs: number }>) {
  try { return await p } catch { return { docs: [] as T[], totalDocs: 0 } }
}

export async function GET(request: NextRequest): Promise<Response> {
  try {
    const payload = await getPayload({ config })
    const { user } = await payload.auth({ headers: request.headers })
    if (!user || (user as { collection?: string }).collection !== 'admins') {
      return Response.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const cutoff48h  = new Date(Date.now() - 48 * 3600 * 1000).toISOString()
    const cutoff24h  = new Date(Date.now() - 24 * 3600 * 1000).toISOString()
    const todayStr   = new Date().toISOString().slice(0, 10)
    const todayStart = new Date(); todayStart.setHours(0, 0, 0, 0)
    const todayEnd   = new Date(); todayEnd.setHours(23, 59, 59, 999)

    // Build last-6-months date ranges
    const now = new Date()
    const monthRanges = Array.from({ length: 6 }, (_, i) => {
      const d     = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1)
      const start = new Date(d.getFullYear(), d.getMonth(), 1)
      const end   = new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59, 999)
      const label = ['Jan','Fév','Mar','Avr','Mai','Jun','Jul','Aoû','Sep','Oct','Nov','Déc'][d.getMonth()]
      return { start, end, label }
    })

    const [
      devis_recu, confirme, en_preparation, en_cours, livre, annule,
      rdvNouveaux, rdvConfirmes,
      messagesNonLus,
      recentDossiers,
      recentRDV,
      clientsTotal,
    ] = await Promise.all([
      payload.count({ collection: 'demenagements', where: { statut: { equals: 'devis_recu'     } }, overrideAccess: true }),
      payload.count({ collection: 'demenagements', where: { statut: { equals: 'confirme'       } }, overrideAccess: true }),
      payload.count({ collection: 'demenagements', where: { statut: { equals: 'en_preparation' } }, overrideAccess: true }),
      payload.count({ collection: 'demenagements', where: { statut: { equals: 'en_cours'       } }, overrideAccess: true }),
      payload.count({ collection: 'demenagements', where: { statut: { equals: 'livre'          } }, overrideAccess: true }),
      payload.count({ collection: 'demenagements', where: { statut: { equals: 'annule'         } }, overrideAccess: true }),
      payload.count({ collection: 'rendez-vous',   where: { statut: { equals: 'nouveau'        } }, overrideAccess: true }),
      payload.count({ collection: 'rendez-vous',   where: { statut: { equals: 'confirme'       } }, overrideAccess: true }),
      payload.count({ collection: 'messages',      where: { and: [{ auteur: { equals: 'client' } }, { lu: { equals: false } }] }, overrideAccess: true }),
      payload.find({ collection: 'demenagements', sort: '-createdAt', limit: 8, overrideAccess: true }),
      payload.find({ collection: 'rendez-vous',   sort: '-createdAt', limit: 6, overrideAccess: true }),
      safeCount(payload.count({ collection: 'clients', overrideAccess: true })),
    ])

    const [urgentDossiers, urgentMessages, todayRDV, todayDemenagements, ...monthlyCounts] = await Promise.all([
      safeCount(payload.count({
        collection: 'demenagements',
        where: { and: [{ statut: { equals: 'devis_recu' } }, { createdAt: { less_than: cutoff48h } }] },
        overrideAccess: true,
      })),
      safeCount(payload.count({
        collection: 'messages',
        where: { and: [{ auteur: { equals: 'client' } }, { lu: { equals: false } }, { createdAt: { less_than: cutoff24h } }] },
        overrideAccess: true,
      })),
      safeFind(payload.find({
        collection: 'rendez-vous',
        where: { dateVisite: { equals: todayStr } },
        limit: 20,
        overrideAccess: true,
      })),
      safeCount(payload.count({
        collection: 'demenagements',
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        where: { and: [
          { statut: { in: ['devis_recu', 'confirme', 'en_preparation', 'en_cours'] } },
          { dateDemenagement: { greater_than_or_equal: todayStart.toISOString() } as any },
          { dateDemenagement: { less_than_or_equal:    todayEnd.toISOString()   } as any },
        ]},
        overrideAccess: true,
      })),
      ...monthRanges.map(({ start, end }) =>
        safeCount(payload.count({
          collection: 'demenagements',
          where: { and: [
            { createdAt: { greater_than_or_equal: start.toISOString() } },
            { createdAt: { less_than_or_equal:    end.toISOString()   } },
          ]},
          overrideAccess: true,
        }))
      ),
    ])

    const recentDossierDocs = recentDossiers.docs.map((d) => ({
      id:            d.id,
      numeroDossier: d.numeroDossier,
      nomComplet:    d.nomComplet,
      telephone:     d.telephone,
      statut:        d.statut,
      devisStatut:   d.devisStatut,
      createdAt:     d.createdAt,
    }))

    const recentRDVDocs = recentRDV.docs.map((r) => ({
      id:         r.id,
      nom:        r.nom,
      prenom:     r.prenom,
      telephone:  r.telephone,
      whatsapp:   r.whatsapp,
      dateVisite: r.dateVisite,
      heure:      r.heure,
      statut:     r.statut,
      type:       r.type,
      createdAt:  r.createdAt,
    }))

    const todayRDVDocs = todayRDV.docs.map((r) => ({
      id:        r.id,
      nom:       r.nom,
      prenom:    r.prenom,
      telephone: r.telephone,
      heure:     r.heure,
      statut:    r.statut,
    }))

    return Response.json({
      dossiers: {
        devis_recu:     devis_recu.totalDocs,
        confirme:       confirme.totalDocs,
        en_preparation: en_preparation.totalDocs,
        en_cours:       en_cours.totalDocs,
        livre:          livre.totalDocs,
        annule:         annule.totalDocs,
        total:          devis_recu.totalDocs + confirme.totalDocs + en_preparation.totalDocs + en_cours.totalDocs + livre.totalDocs + annule.totalDocs,
      },
      rdv:            { nouveaux: rdvNouveaux.totalDocs, confirmes: rdvConfirmes.totalDocs },
      messagesNonLus: messagesNonLus.totalDocs,
      clientsTotal,
      recentDossiers: recentDossierDocs,
      recentRDV:      recentRDVDocs,
      urgent:         { dossiers: urgentDossiers, messages: urgentMessages },
      aujourd_hui:    { rdv: todayRDV.totalDocs, rdvList: todayRDVDocs, demenagements: todayDemenagements },
      monthly: {
        labels:   monthRanges.map(m => m.label),
        dossiers: monthlyCounts,
      },
    })
  } catch (err) {
    console.error('[dashboard-stats]', err)
    return Response.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
```

- [ ] **Step 2: TypeScript check**

```powershell
cd "C:\Users\SIGMA IT\Desktop\Demenagement\dt-demenagement"
pnpm tsc --noEmit 2>&1 | Select-String "dashboard-stats"
```

Expected: no output.

- [ ] **Step 3: Commit**

```powershell
git add app/api/admin/dashboard-stats/route.ts
git commit -m "feat: stats API — add monthly dossier counts + clientsTotal"
```

---

## Task 3 — Create AdminCharts.tsx

**Files:**
- Create: `components/payload/AdminCharts.tsx`

- [ ] **Step 1: Create the file**

Create `components/payload/AdminCharts.tsx` with this exact content:

```tsx
'use client'

import React from 'react'
import {
  ResponsiveContainer,
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  PieChart, Pie, Cell,
} from 'recharts'

interface Props {
  monthly:  { labels: string[]; dossiers: number[] }
  pipeline: {
    devis_recu: number; confirme: number; en_preparation: number
    en_cours: number; livre: number; annule: number
  }
}

const T = {
  card: '#111827', input: '#1a2235', border: '#1f2d47',
  text: '#e2e8f5', muted: '#64748b', red: '#b52027',
} as const

const PIE_DATA_BASE = [
  { key: 'devis_recu',     name: 'Reçu',        color: '#f59e0b' },
  { key: 'confirme',       name: 'Confirmé',     color: '#10b981' },
  { key: 'en_preparation', name: 'Préparation',  color: '#3b82f6' },
  { key: 'en_cours',       name: 'En cours',     color: '#8b5cf6' },
  { key: 'livre',          name: 'Livré',        color: '#22d3ee' },
  { key: 'annule',         name: 'Annulé',       color: '#ef4444' },
] as const

function LineTooltip({ active, payload, label }: { active?: boolean; payload?: { value: number }[]; label?: string }) {
  if (!active || !payload?.length) return null
  return (
    <div style={{ background: T.input, border: `1px solid ${T.border}`, borderRadius: '8px', padding: '8px 12px' }}>
      <div style={{ fontSize: '11px', color: T.muted, marginBottom: '4px' }}>{label}</div>
      <div style={{ fontSize: '16px', fontWeight: 700, color: T.red }}>{payload[0].value} dossiers</div>
    </div>
  )
}

export default function AdminCharts({ monthly, pipeline }: Props) {
  const lineData = monthly.labels.map((mois, i) => ({ mois, dossiers: monthly.dossiers[i] ?? 0 }))

  const pieData = PIE_DATA_BASE
    .map(d => ({ name: d.name, color: d.color, value: pipeline[d.key] }))
    .filter(d => d.value > 0)

  const total = pieData.reduce((s, d) => s + d.value, 0)

  const cardStyle: React.CSSProperties = {
    background: T.card, borderRadius: '12px', padding: '20px',
    border: `1px solid ${T.border}`, boxShadow: '0 1px 3px rgba(0,0,0,0.3)',
  }
  const headerStyle: React.CSSProperties = {
    fontSize: '12px', fontWeight: 700, color: T.muted,
    textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '16px',
  }

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '65fr 35fr', gap: '16px' }}>

      {/* ── Line chart ── */}
      <div style={cardStyle}>
        <div style={headerStyle}>Dossiers — 6 derniers mois</div>
        <ResponsiveContainer width="100%" height={180}>
          <LineChart data={lineData} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={T.border} vertical={false} />
            <XAxis dataKey="mois" tick={{ fontSize: 11, fill: T.muted }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: T.muted }} axisLine={false} tickLine={false} allowDecimals={false} />
            <Tooltip content={<LineTooltip />} cursor={{ stroke: T.border }} />
            <Line
              type="monotone" dataKey="dossiers" stroke={T.red} strokeWidth={2.5}
              dot={{ r: 4, fill: T.red, stroke: T.card, strokeWidth: 2 }}
              activeDot={{ r: 6, fill: T.red, stroke: T.card, strokeWidth: 2 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* ── Donut chart ── */}
      <div style={cardStyle}>
        <div style={headerStyle}>Pipeline dossiers</div>
        {total === 0 ? (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '180px', color: T.muted, fontSize: '13px' }}>
            Aucun dossier actif
          </div>
        ) : (
          <>
            <div style={{ position: 'relative' }}>
              <ResponsiveContainer width="100%" height={160}>
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" innerRadius={48} outerRadius={72} paddingAngle={3} dataKey="value">
                    {pieData.map((d, i) => (
                      <Cell key={i} fill={d.color} stroke="transparent" />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(v: number, name: string) => [`${v} (${Math.round(v / total * 100)}%)`, name]}
                    contentStyle={{ background: T.input, border: `1px solid ${T.border}`, borderRadius: '8px', fontSize: '12px', color: T.text }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', textAlign: 'center', pointerEvents: 'none' }}>
                <div style={{ fontSize: '22px', fontWeight: 800, color: T.text, lineHeight: 1 }}>{total}</div>
                <div style={{ fontSize: '10px', color: T.muted }}>total</div>
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px', marginTop: '4px' }}>
              {pieData.map(d => (
                <div key={d.name} style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <div style={{ width: '7px', height: '7px', borderRadius: '2px', background: d.color, flexShrink: 0 }} />
                  <span style={{ fontSize: '10px', color: T.muted, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{d.name}</span>
                  <span style={{ fontSize: '11px', fontWeight: 700, color: T.text, marginLeft: 'auto' }}>{d.value}</span>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
```

- [ ] **Step 2: TypeScript check**

```powershell
pnpm tsc --noEmit 2>&1 | Select-String "AdminCharts"
```

Expected: no output.

- [ ] **Step 3: Commit**

```powershell
git add components/payload/AdminCharts.tsx
git commit -m "feat: AdminCharts — recharts line + donut for dashboard"
```

---

## Task 4 — Rebuild AdminDashboard.tsx

**Files:**
- Modify: `components/payload/AdminDashboard.tsx`

- [ ] **Step 1: Replace the entire file with the navy-themed version**

Replace `components/payload/AdminDashboard.tsx` with this complete content:

```tsx
'use client'

import React, { useEffect, useState } from 'react'
import dynamic from 'next/dynamic'

// ── Theme constants ────────────────────────────────────────────────────────────
const T = {
  bg:      '#0b0e1a',
  card:    '#111827',
  input:   '#1a2235',
  border:  '#1f2d47',
  text:    '#e2e8f5',
  muted:   '#64748b',
  red:     '#b52027',
  success: '#10b981',
  warning: '#f59e0b',
  danger:  '#ef4444',
  blue:    '#3b82f6',
} as const

// ── Types ──────────────────────────────────────────────────────────────────────
interface DossierRow {
  id: number; numeroDossier?: string; nomComplet?: string
  telephone?: string; statut?: string; devisStatut?: string; createdAt: string
}
interface TodayRDV { id: number; nom?: string; prenom?: string; telephone?: string; heure?: string; statut?: string }
interface Stats {
  dossiers: { devis_recu: number; confirme: number; en_preparation: number; en_cours: number; livre: number; annule: number; total: number }
  rdv:             { nouveaux: number; confirmes: number }
  messagesNonLus:  number
  clientsTotal:    number
  recentDossiers:  DossierRow[]
  urgent:          { dossiers: number; messages: number }
  aujourd_hui:     { rdv: number; rdvList: TodayRDV[]; demenagements: number }
  monthly:         { labels: string[]; dossiers: number[] }
}

// ── AdminCharts — dynamic (recharts needs browser) ────────────────────────────
const AdminCharts = dynamic(() => import('./AdminCharts'), {
  ssr: false,
  loading: () => (
    <div style={{ display: 'grid', gridTemplateColumns: '65fr 35fr', gap: '16px' }}>
      {[0, 1].map(i => (
        <div key={i} style={{ background: T.card, borderRadius: '12px', border: `1px solid ${T.border}`, height: '240px',
          backgroundImage: `linear-gradient(90deg, ${T.card} 25%, ${T.input} 50%, ${T.card} 75%)`,
          backgroundSize: '300% 100%', animation: 'dt-shimmer 1.6s ease-in-out infinite' }} />
      ))}
    </div>
  ),
})

// ── Helpers ────────────────────────────────────────────────────────────────────
function pad2(n: number) { return String(n).padStart(2, '0') }
const MOIS        = ['Janvier','Février','Mars','Avril','Mai','Juin','Juillet','Août','Septembre','Octobre','Novembre','Décembre']
const JOURS_SHORT = ['L','M','M','J','V','S','D']

const STATUT_PILL: Record<string, { label: string; color: string; bg: string }> = {
  devis_recu:     { label: '📥 Reçu',        color: '#fbbf24', bg: 'rgba(251,191,36,0.12)' },
  confirme:       { label: '✅ Confirmé',     color: '#10b981', bg: 'rgba(16,185,129,0.12)' },
  en_preparation: { label: '📦 Préparation',  color: '#3b82f6', bg: 'rgba(59,130,246,0.12)' },
  en_cours:       { label: '🚛 En cours',     color: '#8b5cf6', bg: 'rgba(139,92,246,0.12)' },
  livre:          { label: '🏁 Livré',        color: '#22d3ee', bg: 'rgba(34,211,238,0.12)' },
  annule:         { label: '❌ Annulé',       color: '#ef4444', bg: 'rgba(239,68,68,0.12)'  },
}
const DEVIS_PILL: Record<string, { label: string; color: string; bg: string }> = {
  brouillon: { label: 'Brouillon', color: '#fbbf24', bg: 'rgba(251,191,36,0.12)' },
  envoye:    { label: 'Envoyé',    color: '#10b981', bg: 'rgba(16,185,129,0.12)' },
  accepte:   { label: 'Accepté',   color: '#3b82f6', bg: 'rgba(59,130,246,0.12)' },
  refuse:    { label: 'Refusé',    color: '#ef4444', bg: 'rgba(239,68,68,0.12)'  },
}

function Pill({ statut, map }: { statut: string; map: Record<string, { label: string; color: string; bg: string }> }) {
  const s = map[statut] ?? { label: statut, color: T.muted, bg: 'rgba(100,116,155,0.12)' }
  return (
    <span style={{ fontSize: '10px', fontWeight: 700, padding: '2px 8px', borderRadius: '20px', background: s.bg, color: s.color, whiteSpace: 'nowrap' as const }}>
      {s.label}
    </span>
  )
}

function relTime(iso: string) {
  const h = (Date.now() - new Date(iso).getTime()) / 3600000
  if (h < 1) return `${Math.floor(h * 60)}min`
  if (h < 24) return `${Math.floor(h)}h`
  return `${Math.floor(h / 24)}j`
}

// ── Skeleton shimmer ───────────────────────────────────────────────────────────
function Skel({ w = '100%', h = '16px', r = '5px', style = {} }: { w?: string; h?: string; r?: string; style?: React.CSSProperties }) {
  return (
    <div style={{
      width: w, height: h, borderRadius: r,
      backgroundImage: `linear-gradient(90deg, ${T.card} 25%, ${T.input} 50%, ${T.card} 75%)`,
      backgroundSize: '300% 100%',
      animation: 'dt-shimmer 1.6s ease-in-out infinite',
      ...style,
    }} />
  )
}

// ── KPI Card ───────────────────────────────────────────────────────────────────
function KPICard({ icon, label, value, sub, accent, loading, href }: {
  icon: string; label: string; value: number; sub: string
  accent: string; loading: boolean; href: string
}) {
  return (
    <a href={href} style={{ textDecoration: 'none', display: 'block' }}>
      <div
        style={{
          background: T.card, borderRadius: '10px', padding: '18px 20px',
          border: `1px solid ${T.border}`, borderLeft: `3px solid ${accent}`,
          boxShadow: '0 1px 3px rgba(0,0,0,0.3)', cursor: 'pointer',
          transition: 'box-shadow 0.15s, transform 0.15s',
        }}
        onMouseEnter={e => {
          const el = e.currentTarget as HTMLDivElement
          el.style.boxShadow = `0 4px 14px rgba(0,0,0,0.4), 0 0 0 1px ${accent}30`
          el.style.transform  = 'translateY(-2px)'
        }}
        onMouseLeave={e => {
          const el = e.currentTarget as HTMLDivElement
          el.style.boxShadow = '0 1px 3px rgba(0,0,0,0.3)'
          el.style.transform  = 'translateY(0)'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
          <span style={{ fontSize: '22px' }}>{icon}</span>
        </div>
        <div style={{ fontSize: '28px', fontWeight: 800, color: T.text, lineHeight: 1, marginBottom: '4px' }}>
          {loading ? <Skel w="60px" h="28px" r="6px" /> : value}
        </div>
        <div style={{ fontSize: '12px', color: T.muted, fontWeight: 500, marginBottom: '2px' }}>{label}</div>
        <div style={{ fontSize: '11px', color: accent, fontWeight: 600 }}>{sub}</div>
      </div>
    </a>
  )
}

// ── Mini Calendar ──────────────────────────────────────────────────────────────
interface MiniRDV { dateVisite?: string; statut?: string }

function MiniCalendar() {
  const [rdvs, setRdvs] = useState<MiniRDV[]>([])
  const now      = new Date()
  const year     = now.getFullYear()
  const month    = now.getMonth()
  const todayKey = `${year}-${pad2(month + 1)}-${pad2(now.getDate())}`

  useEffect(() => {
    const firstDay = `${year}-${pad2(month + 1)}-01`
    const lastDay  = `${year}-${pad2(month + 1)}-${pad2(new Date(year, month + 1, 0).getDate())}`
    fetch(`/api/rendez-vous?where[dateVisite][greater_than_or_equal]=${firstDay}&where[dateVisite][less_than_or_equal]=${lastDay}&limit=100`, { credentials: 'include' })
      .then(r => r.ok ? r.json() : Promise.reject())
      .then((d: { docs: MiniRDV[] }) => setRdvs(d.docs ?? []))
      .catch(() => {})
  }, [year, month])

  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const startDow    = (new Date(year, month, 1).getDay() + 6) % 7
  const cells: (number | null)[] = [...Array(startDow).fill(null), ...Array.from({ length: daysInMonth }, (_, i) => i + 1)]
  while (cells.length % 7 !== 0) cells.push(null)

  function dayKey(d: number) { return `${year}-${pad2(month + 1)}-${pad2(d)}` }
  function rdvsForDay(d: number) { return rdvs.filter(r => r.dateVisite === dayKey(d)) }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
        <div style={{ fontSize: '13px', fontWeight: 700, color: T.text }}>{MOIS[month]} {year}</div>
        <a href="/admin/rdv-calendar" style={{ fontSize: '11px', color: T.red, textDecoration: 'none', fontWeight: 600 }}>Vue complète →</a>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', marginBottom: '2px' }}>
        {JOURS_SHORT.map((j, i) => (
          <div key={`h-${i}`} style={{ textAlign: 'center', fontSize: '10px', fontWeight: 700, color: i >= 5 ? T.red : T.muted, paddingBottom: '4px' }}>{j}</div>
        ))}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '2px' }}>
        {cells.map((day, idx) => {
          if (!day) return <div key={`e-${idx}`} />
          const key     = dayKey(day)
          const dayRdvs = rdvsForDay(day)
          const isToday = key === todayKey
          const isWknd  = idx % 7 >= 5
          return (
            <a key={key} href="/admin/rdv-calendar" style={{ textDecoration: 'none' }}>
              <div style={{
                aspectRatio: '1', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                borderRadius: '6px', cursor: 'pointer',
                background: isToday ? T.red : dayRdvs.length > 0 ? 'rgba(181,32,39,0.12)' : 'transparent',
              }}>
                <span style={{ fontSize: '11px', fontWeight: isToday ? 800 : 400, color: isToday ? '#fff' : isWknd ? T.red : T.text, lineHeight: 1 }}>{day}</span>
                {dayRdvs.length > 0 && !isToday && (
                  <div style={{ display: 'flex', gap: '2px', marginTop: '2px' }}>
                    {dayRdvs.slice(0, 3).map((r, i) => (
                      <div key={i} style={{ width: '4px', height: '4px', borderRadius: '50%', background: r.statut === 'confirme' ? '#22c55e' : r.statut === 'annule' ? '#ef4444' : '#f59e0b' }} />
                    ))}
                  </div>
                )}
              </div>
            </a>
          )
        })}
      </div>
      <div style={{ display: 'flex', gap: '12px', marginTop: '12px', paddingTop: '10px', borderTop: `1px solid ${T.border}` }}>
        {[{ color: '#f59e0b', label: 'Nouveau' }, { color: '#22c55e', label: 'Confirmé' }, { color: '#ef4444', label: 'Annulé' }].map(l => (
          <div key={l.label} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: l.color }} />
            <span style={{ fontSize: '10px', color: T.muted }}>{l.label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

// ── Pipeline Bar ───────────────────────────────────────────────────────────────
function PipelineBar({ icon, label, value, max, color, loading }: { icon: string; label: string; value: number; max: number; color: string; loading?: boolean }) {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '20px 1fr auto', alignItems: 'center', gap: '10px' }}>
      <span style={{ fontSize: '14px' }}>{icon}</span>
      <div style={{ position: 'relative', height: '6px', background: 'rgba(255,255,255,0.06)', borderRadius: '3px', overflow: 'hidden' }}>
        {loading
          ? <div style={{ position: 'absolute', inset: 0, backgroundImage: `linear-gradient(90deg, ${T.card} 25%, ${T.border} 50%, ${T.card} 75%)`, backgroundSize: '300% 100%', animation: 'dt-shimmer 1.6s infinite' }} />
          : <div style={{ position: 'absolute', left: 0, top: 0, height: '100%', width: `${pct}%`, background: color, borderRadius: '3px', transition: 'width 0.5s' }} />
        }
      </div>
      <div style={{ fontSize: '13px', fontWeight: 700, color: T.text, minWidth: '28px', textAlign: 'right' as const }}>
        {loading ? <Skel w="28px" h="14px" /> : value}
      </div>
      <span style={{ fontSize: '11px', color: T.muted, gridColumn: '2 / 3', marginTop: '-2px' }}>{label}</span>
    </div>
  )
}

// ── Quick Link ─────────────────────────────────────────────────────────────────
function QuickLink({ icon, label, sub, href, badge, badgeColor }: {
  icon: string; label: string; sub?: string; href: string; badge?: number; badgeColor?: string
}) {
  return (
    <a href={href} style={{ textDecoration: 'none', display: 'block' }}>
      <div
        className="dt-quicklink"
        style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 14px', borderRadius: '8px', background: T.input, border: `1px solid ${T.border}`, transition: 'box-shadow 0.15s, border-color 0.15s', cursor: 'pointer' }}
        onMouseEnter={e => { const el = e.currentTarget as HTMLDivElement; el.style.boxShadow = '0 2px 10px rgba(181,32,39,0.2)'; el.style.borderColor = `${T.red}50` }}
        onMouseLeave={e => { const el = e.currentTarget as HTMLDivElement; el.style.boxShadow = 'none'; el.style.borderColor = T.border }}
      >
        <span style={{ fontSize: '18px', flexShrink: 0 }}>{icon}</span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: '12px', fontWeight: 700, color: T.text, whiteSpace: 'nowrap' as const, overflow: 'hidden', textOverflow: 'ellipsis' }}>{label}</div>
          {sub && <div style={{ fontSize: '10px', color: T.muted, marginTop: '1px' }}>{sub}</div>}
        </div>
        {badge !== undefined && badge > 0 && (
          <span style={{ fontSize: '10px', fontWeight: 800, padding: '2px 7px', borderRadius: '10px', background: badgeColor ?? 'rgba(251,191,36,0.15)', color: T.warning, flexShrink: 0 }}>{badge}</span>
        )}
        <span style={{ fontSize: '14px', color: T.muted, flexShrink: 0 }}>›</span>
      </div>
    </a>
  )
}

// ── Main Component ─────────────────────────────────────────────────────────────
export default function AdminDashboard() {
  const [stats,   setStats]   = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState(false)

  useEffect(() => {
    const hide = () => {
      document.querySelectorAll<HTMLElement>(
        '.dashboard__card-list, .dashboard__globals, .dashboard__welcome-block'
      ).forEach(el => { el.style.display = 'none' })
      document.querySelectorAll<HTMLElement>('.dashboard > .eyebrow, .dashboard > h1').forEach(el => {
        el.style.display = 'none'
      })
      if (/\/admin\/?$/.test(window.location.pathname)) {
        document.querySelectorAll<HTMLElement>('.view-description').forEach(el => {
          el.style.display = 'none'
        })
      }
    }
    const t1 = setTimeout(hide, 0)
    const t2 = setTimeout(hide, 150)
    const t3 = setTimeout(hide, 500)
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3) }
  }, [])

  const load = () => {
    setLoading(true); setError(false)
    fetch('/api/admin/dashboard-stats', { credentials: 'include' })
      .then(r => r.ok ? r.json() : Promise.reject())
      .then((d: Stats) => { setStats(d); setLoading(false) })
      .catch(() => { setError(true); setLoading(false) })
  }

  useEffect(load, [])

  const pipelineMax = stats
    ? Math.max(stats.dossiers.devis_recu, stats.dossiers.confirme, stats.dossiers.en_preparation, stats.dossiers.en_cours, stats.dossiers.livre, stats.dossiers.annule, 1)
    : 1

  const card: React.CSSProperties = { background: T.card, borderRadius: '12px', padding: '20px', border: `1px solid ${T.border}`, boxShadow: '0 1px 3px rgba(0,0,0,0.3)' }
  const hdr:  React.CSSProperties = { fontSize: '12px', fontWeight: 700, color: T.muted, textTransform: 'uppercase' as const, letterSpacing: '0.5px', marginBottom: '14px' }

  return (
    <div className="dt-admin-dashboard" style={{ fontFamily: 'system-ui, -apple-system, sans-serif', paddingBottom: '48px', background: T.bg }}>

      <style>{`
        @keyframes dt-shimmer { 0% { background-position: 300% 0 } 100% { background-position: -300% 0 } }
        @keyframes dt-spin    { to { transform: rotate(360deg) } }
      `}</style>

      {error && (
        <div style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)', borderRadius: '8px', padding: '12px 16px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span>⚠️</span>
          <span style={{ fontSize: '13px', color: '#ef4444' }}>Erreur de chargement des statistiques.</span>
          <button onClick={load} style={{ marginLeft: 'auto', fontSize: '11px', color: T.red, background: 'none', border: 'none', cursor: 'pointer', fontWeight: 700 }}>Réessayer →</button>
        </div>
      )}

      {/* ── KPI Row ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '20px' }}>
        <KPICard loading={loading} icon="📦" label="Dossiers total"    value={stats?.dossiers.total ?? 0}                                         sub={`${stats?.dossiers.devis_recu ?? 0} en attente`}   accent={T.red}     href="/admin/collections/demenagements" />
        <KPICard loading={loading} icon="📅" label="RDV actifs"        value={(stats?.rdv.nouveaux ?? 0) + (stats?.rdv.confirmes ?? 0)}           sub={`${stats?.rdv.nouveaux ?? 0} nouveaux`}            accent={T.blue}    href="/admin/collections/rendez-vous" />
        <KPICard loading={loading} icon="✉️"  label="Messages non lus"  value={stats?.messagesNonLus ?? 0}                                         sub={`${stats?.urgent.messages ?? 0} urgents`}          accent={T.warning} href="/admin/collections/messages" />
        <KPICard loading={loading} icon="👥" label="Clients total"     value={stats?.clientsTotal ?? 0}                                           sub="base clients"                                      accent={T.success} href="/admin/collections/clients" />
      </div>

      {/* ── Charts Row ── */}
      <div style={{ marginBottom: '20px' }}>
        {stats && !loading
          ? <AdminCharts monthly={stats.monthly} pipeline={stats.dossiers} />
          : (
            <div style={{ display: 'grid', gridTemplateColumns: '65fr 35fr', gap: '16px' }}>
              {[0, 1].map(i => <div key={i} style={{ ...card, height: '240px' }} />)}
            </div>
          )
        }
      </div>

      {/* ── Aujourd'hui strip ── */}
      <div style={{ ...card, display: 'flex', alignItems: 'center', gap: '32px', flexWrap: 'wrap' as const, marginBottom: '20px', borderRadius: '10px', padding: '14px 20px' }}>
        <div style={{ fontSize: '12px', fontWeight: 700, color: T.red, textTransform: 'uppercase' as const, letterSpacing: '0.5px', flexShrink: 0 }}>Aujourd&apos;hui</div>
        <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' as const }}>
          {loading ? <><Skel w="80px" /><Skel w="80px" /><Skel w="80px" /></> : (
            <>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span>📅</span><span style={{ fontSize: '13px', color: T.text, fontWeight: 600 }}>{stats?.aujourd_hui.rdv ?? 0} RDV</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span>🚛</span><span style={{ fontSize: '13px', color: T.text, fontWeight: 600 }}>{stats?.aujourd_hui.demenagements ?? 0} déménagements</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span>✉️</span>
                <span style={{ fontSize: '13px', color: (stats?.messagesNonLus ?? 0) > 0 ? T.warning : T.muted, fontWeight: 600 }}>
                  {stats?.messagesNonLus ?? 0} messages
                </span>
              </div>
              {(stats?.urgent.dossiers ?? 0) > 0 && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span>⚠️</span><span style={{ fontSize: '13px', color: T.danger, fontWeight: 600 }}>{stats!.urgent.dossiers} devis urgents</span>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* ── Row: Calendar + Quick Links ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: '16px', marginBottom: '16px' }}>
        <div className="dt-card" style={card}>
          <div style={hdr}>Calendrier des RDV</div>
          <MiniCalendar />
        </div>
        <div className="dt-card" style={card}>
          <div style={hdr}>Accès rapide</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <QuickLink icon="📋" label="Dossiers"    sub={loading ? '…' : `${stats?.dossiers.total ?? 0} total`}                                href="/admin/collections/demenagements" badge={stats?.dossiers.devis_recu}   />
            <QuickLink icon="📅" label="Rendez-vous" sub={loading ? '…' : `${(stats?.rdv.nouveaux ?? 0) + (stats?.rdv.confirmes ?? 0)} actifs`} href="/admin/collections/rendez-vous"  badge={stats?.rdv.nouveaux}          />
            <QuickLink icon="✉️"  label="Messages"   sub={loading ? '…' : `${stats?.messagesNonLus ?? 0} non lus`}                               href="/admin/collections/messages"     badge={stats?.messagesNonLus}        />
            <QuickLink icon="👥" label="Clients"     sub="liste complète"                                                                         href="/admin/collections/clients" />
            <QuickLink icon="🗓️" label="Calendrier"  sub="vue agenda"                                                                             href="/admin/rdv-calendar" />
          </div>
        </div>
      </div>

      {/* ── Row: Pipeline + RDV stats ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
        <div className="dt-card" style={card}>
          <div style={{ ...hdr, marginBottom: '16px' }}>Pipeline dossiers</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <PipelineBar loading={loading} icon="📥" label="Devis reçu"     value={stats?.dossiers.devis_recu     ?? 0} max={pipelineMax} color="#f59e0b" />
            <PipelineBar loading={loading} icon="✅" label="Confirmé"        value={stats?.dossiers.confirme       ?? 0} max={pipelineMax} color="#10b981" />
            <PipelineBar loading={loading} icon="📦" label="En préparation"  value={stats?.dossiers.en_preparation ?? 0} max={pipelineMax} color="#3b82f6" />
            <PipelineBar loading={loading} icon="🚛" label="En cours"        value={stats?.dossiers.en_cours       ?? 0} max={pipelineMax} color="#8b5cf6" />
            <PipelineBar loading={loading} icon="🏁" label="Livré"           value={stats?.dossiers.livre          ?? 0} max={pipelineMax} color="#22d3ee" />
            <PipelineBar loading={loading} icon="❌" label="Annulé"          value={stats?.dossiers.annule         ?? 0} max={pipelineMax} color="#ef4444" />
          </div>
        </div>
        <div className="dt-card" style={card}>
          <div style={{ ...hdr, marginBottom: '16px' }}>Rendez-vous visites</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
            {loading ? <><Skel h="60px" r="8px" /><Skel h="60px" r="8px" /></> : (
              <>
                <div style={{ background: T.input, borderRadius: '8px', padding: '12px', border: `1px solid ${T.border}` }}>
                  <div style={{ fontSize: '22px', fontWeight: 800, color: T.warning }}>{stats?.rdv.nouveaux ?? 0}</div>
                  <div style={{ fontSize: '11px', color: T.muted, marginTop: '2px' }}>Nouveaux</div>
                </div>
                <div style={{ background: T.input, borderRadius: '8px', padding: '12px', border: `1px solid ${T.border}` }}>
                  <div style={{ fontSize: '22px', fontWeight: 800, color: T.success }}>{stats?.rdv.confirmes ?? 0}</div>
                  <div style={{ fontSize: '11px', color: T.muted, marginTop: '2px' }}>Confirmés</div>
                </div>
              </>
            )}
          </div>
          {!loading && (stats?.aujourd_hui.rdvList ?? []).length > 0 && (
            <div>
              <div style={{ fontSize: '11px', color: T.muted, fontWeight: 700, textTransform: 'uppercase' as const, letterSpacing: '0.5px', marginBottom: '8px' }}>Aujourd&apos;hui</div>
              {stats!.aujourd_hui.rdvList.slice(0, 4).map(r => (
                <div key={r.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', padding: '3px 0' }}>
                  <span style={{ color: T.text }}>{r.prenom} {r.nom}</span>
                  <span style={{ color: T.muted }}>{r.heure ?? '—'}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Recent dossiers table ── */}
      <div className="dt-card" style={card}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <div style={{ fontSize: '12px', fontWeight: 700, color: T.muted, textTransform: 'uppercase' as const, letterSpacing: '0.5px' }}>Derniers dossiers reçus</div>
          <a href="/admin/collections/demenagements" style={{ fontSize: '11px', color: T.red, textDecoration: 'none', fontWeight: 700, padding: '5px 12px', border: `1px solid ${T.red}30`, borderRadius: '6px' }}>Voir tous →</a>
        </div>
        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {[1,2,3,4].map(i => <Skel key={i} h="36px" r="6px" />)}
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                {['Dossier','Client','Statut','Devis','Reçu',''].map(h => (
                  <th key={h} style={{ textAlign: 'left', fontSize: '10px', fontWeight: 700, color: T.muted, textTransform: 'uppercase' as const, letterSpacing: '0.5px', paddingBottom: '10px', borderBottom: `1px solid ${T.border}` }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {(stats?.recentDossiers ?? []).map((d, i) => (
                <tr key={d.id} style={{ borderBottom: `1px solid ${i < (stats?.recentDossiers.length ?? 0) - 1 ? T.border : 'transparent'}` }}>
                  <td style={{ padding: '10px 0', fontSize: '12px', color: T.muted }}>{d.numeroDossier ?? `#${d.id}`}</td>
                  <td style={{ padding: '10px 0', fontSize: '13px', color: T.text, fontWeight: 500 }}>{d.nomComplet ?? '—'}</td>
                  <td style={{ padding: '10px 0' }}>{d.statut     ? <Pill statut={d.statut}     map={STATUT_PILL} /> : '—'}</td>
                  <td style={{ padding: '10px 0' }}>{d.devisStatut ? <Pill statut={d.devisStatut} map={DEVIS_PILL}  /> : '—'}</td>
                  <td style={{ padding: '10px 0', fontSize: '11px', color: T.muted }}>{relTime(d.createdAt)}</td>
                  <td style={{ padding: '10px 0', textAlign: 'right' as const }}>
                    <a href={`/admin/collections/demenagements/${d.id}`} style={{ fontSize: '11px', color: T.red, textDecoration: 'none', fontWeight: 600 }}>Ouvrir →</a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
```

- [ ] **Step 2: TypeScript check**

```powershell
pnpm tsc --noEmit 2>&1 | Select-String "AdminDashboard"
```

Expected: no output.

- [ ] **Step 3: Commit**

```powershell
git add components/payload/AdminDashboard.tsx
git commit -m "feat: AdminDashboard — deep navy theme, KPI cards, dynamic charts"
```

---

## Task 5 — Rewrite custom-admin.css (single deep navy theme)

**Files:**
- Modify: `custom-admin.css`

- [ ] **Step 1: Replace the entire file with the navy theme**

Replace `custom-admin.css` with this complete content:

```css
/*
 * DT Déménagement Tunisie — Admin CSS
 * Single deep-navy theme — #0b0e1a base, #b52027 DT red accent
 */

/* ═══════════════════════════════════════════
   TOKENS — DEEP NAVY (single theme, no toggle)
   ═══════════════════════════════════════════ */

:root {
  /* Base scale: 0 = darkest (#0b0e1a) → 1000 = white */
  --color-base-0:      11,  14,  26;
  --color-base-50:     17,  24,  39;
  --color-base-100:    26,  34,  53;
  --color-base-150:    30,  42,  66;
  --color-base-200:    31,  45,  71;
  --color-base-250:    45,  58,  88;
  --color-base-300:    60,  75, 107;
  --color-base-350:    80,  95, 130;
  --color-base-400:   100, 116, 155;
  --color-base-450:   120, 135, 170;
  --color-base-500:   145, 158, 190;
  --color-base-550:   165, 175, 205;
  --color-base-600:   185, 192, 218;
  --color-base-650:   205, 210, 229;
  --color-base-700:   218, 222, 237;
  --color-base-750:   228, 232, 243;
  --color-base-800:   236, 239, 247;
  --color-base-850:   242, 244, 251;
  --color-base-900:   247, 249, 253;
  --color-base-950:   252, 253, 255;
  --color-base-1000:  255, 255, 255;

  /* Blue → DT red */
  --color-blue-50:    255, 240, 241;
  --color-blue-100:   254, 220, 222;
  --color-blue-200:   251, 180, 183;
  --color-blue-250:   240, 140, 144;
  --color-blue-300:   225, 100, 106;
  --color-blue-350:   210,  70,  78;
  --color-blue-400:   195,  50,  58;
  --color-blue-450:   181,  32,  39;
  --color-blue-500:   160,  25,  32;
  --color-blue-550:   140,  20,  26;
  --color-blue-600:   120,  15,  20;
  --color-blue-650:   100,  10,  15;
  --color-blue-700:    80,   8,  12;
  --color-blue-750:    60,   5,   9;
  --color-blue-800:    45,   3,   6;
  --color-blue-850:    30,   2,   4;
  --color-blue-900:    18,   1,   2;
  --color-blue-950:     8,   0,   1;
  --color-blue-1000:    4,   0,   0;

  /* Semantic Payload variables */
  --theme-elevation-0:    rgb(var(--color-base-0));
  --theme-elevation-50:   rgb(var(--color-base-50));
  --theme-elevation-100:  rgb(var(--color-base-100));
  --theme-elevation-150:  rgb(var(--color-base-150));
  --theme-elevation-200:  rgb(var(--color-base-200));
  --theme-elevation-500:  rgb(var(--color-base-500));
  --theme-elevation-800:  rgb(var(--color-base-800));
  --theme-elevation-1000: rgb(var(--color-base-1000));
  --theme-text:           #e2e8f5;
  --theme-text-muted:     #64748b;
  --theme-border-color:   rgb(var(--color-base-200));
  --theme-bg:             rgb(var(--color-base-0));
}

/* ═══════════════════════════════════════════
   GLOBAL
   ═══════════════════════════════════════════ */

html, body, .payload-admin {
  background: #0b0e1a !important;
  color: #e2e8f5 !important;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif !important;
}

/* ═══════════════════════════════════════════
   TOP HEADER BAR
   ═══════════════════════════════════════════ */

.app-header,
header.app-header {
  background: #111827 !important;
  border-bottom: 1px solid #1f2d47 !important;
  box-shadow: 0 1px 0 #1f2d47, 0 2px 8px rgba(0,0,0,0.4) !important;
  height: 56px !important;
  border-top: 3px solid #b52027 !important;
  position: sticky !important;
  top: 0 !important;
  z-index: 100 !important;
}

.app-header__content,
.app-header > div {
  height: 100% !important;
  display: flex !important;
  align-items: center !important;
  padding: 0 20px !important;
  gap: 12px !important;
}

.step-nav,
.app-header .step-nav {
  display: flex !important;
  align-items: center !important;
  gap: 6px !important;
  font-size: 12px !important;
  color: #64748b !important;
}

.step-nav__step a,
.step-nav a {
  color: #e2e8f5 !important;
  text-decoration: none !important;
  font-weight: 600 !important;
  font-size: 12.5px !important;
}

.step-nav__step:not(:last-child)::after,
.step-nav__chevron {
  content: '›' !important;
  color: #1f2d47 !important;
  margin: 0 2px !important;
}

.app-header .account,
.app-header .nav__controls {
  display: flex !important;
  align-items: center !important;
  gap: 8px !important;
  margin-left: auto !important;
}

.app-header .account__button,
.app-header button {
  background: transparent !important;
  border: 1px solid #1f2d47 !important;
  border-radius: 6px !important;
  color: #e2e8f5 !important;
  font-size: 12px !important;
  padding: 5px 10px !important;
  cursor: pointer !important;
  transition: background 0.15s, border-color 0.15s !important;
}

.app-header .account__button:hover,
.app-header button:hover {
  background: rgba(181,32,39,0.1) !important;
  border-color: rgba(181,32,39,0.4) !important;
}

.app-header .locale-picker select,
.app-header select {
  background: #1a2235 !important;
  border: 1px solid #1f2d47 !important;
  color: #e2e8f5 !important;
  border-radius: 5px !important;
  font-size: 12px !important;
  padding: 4px 8px !important;
}

/* ═══════════════════════════════════════════
   SIDEBAR / NAV
   ═══════════════════════════════════════════ */

.nav,
.nav__wrap,
aside.nav {
  background: #111827 !important;
  border-right: 1px solid #1f2d47 !important;
}

.nav__scroll {
  padding: 12px 0 !important;
}

/* Group separators */
.nav__group-label,
.nav .group-label {
  font-size: 9px !important;
  font-weight: 700 !important;
  color: #64748b !important;
  text-transform: uppercase !important;
  letter-spacing: 1px !important;
  padding: 14px 16px 4px !important;
  margin-top: 4px !important;
}

/* Nav links */
.nav__link,
.nav a {
  display: flex !important;
  align-items: center !important;
  gap: 10px !important;
  padding: 8px 16px !important;
  font-size: 13px !important;
  font-weight: 500 !important;
  color: #94a3b8 !important;
  text-decoration: none !important;
  border-radius: 6px !important;
  margin: 1px 8px !important;
  transition: background 0.12s, color 0.12s !important;
  border-left: 2px solid transparent !important;
}

.nav__link:hover,
.nav a:hover {
  background: rgba(255,255,255,0.04) !important;
  color: #e2e8f5 !important;
}

.nav__link--active,
.nav a[aria-current='page'],
.nav a.active {
  background: rgba(181,32,39,0.1) !important;
  color: #e2e8f5 !important;
  border-left-color: #b52027 !important;
  font-weight: 600 !important;
}

/* Nav icons */
.nav__link svg,
.nav a svg {
  width: 16px !important;
  height: 16px !important;
  opacity: 0.7 !important;
}

/* ═══════════════════════════════════════════
   PAGE TITLE / BREADCRUMB BAR
   ═══════════════════════════════════════════ */

.view-description,
.view-description__content {
  background: #111827 !important;
  border-bottom: 1px solid #1f2d47 !important;
  padding: 12px 24px !important;
}

.view-description h1,
.view-description h2 {
  color: #e2e8f5 !important;
  font-size: 18px !important;
  font-weight: 700 !important;
}

.view-description p,
.view-description .eyebrow {
  color: #64748b !important;
  font-size: 12px !important;
}

/* ═══════════════════════════════════════════
   MAIN CONTENT LAYOUT
   ═══════════════════════════════════════════ */

.render-fields,
.collection-list,
.document-fields,
.document-controls {
  background: #0b0e1a !important;
}

.gutter--left {
  padding-left: 24px !important;
}

/* ═══════════════════════════════════════════
   COLLECTION LIST TABLE
   ═══════════════════════════════════════════ */

.table {
  background: #111827 !important;
  border: 1px solid #1f2d47 !important;
  border-radius: 10px !important;
  overflow: hidden !important;
}

.table table {
  width: 100% !important;
  border-collapse: collapse !important;
}

.table thead th,
.table th {
  background: #111827 !important;
  color: #64748b !important;
  font-size: 10px !important;
  font-weight: 700 !important;
  text-transform: uppercase !important;
  letter-spacing: 0.5px !important;
  padding: 10px 16px !important;
  border-bottom: 1px solid #1f2d47 !important;
}

.table tbody tr,
.table tr {
  border-bottom: 1px solid #1f2d47 !important;
  transition: background 0.1s !important;
}

.table tbody tr:last-child {
  border-bottom: none !important;
}

.table tbody tr:hover {
  background: rgba(181,32,39,0.04) !important;
}

.table td,
.table tbody td {
  padding: 12px 16px !important;
  font-size: 13px !important;
  color: #e2e8f5 !important;
  background: transparent !important;
}

/* Sort icons */
.sort-column__asc,
.sort-column__desc {
  color: #b52027 !important;
}

/* ═══════════════════════════════════════════
   LIST CONTROLS (search, filter, pagination)
   ═══════════════════════════════════════════ */

.list-controls,
.list-controls__wrap {
  background: #111827 !important;
  border-bottom: 1px solid #1f2d47 !important;
  padding: 10px 20px !important;
}

.list-controls input,
.search-filter input {
  background: #1a2235 !important;
  border: 1px solid #1f2d47 !important;
  border-radius: 6px !important;
  color: #e2e8f5 !important;
  font-size: 13px !important;
  padding: 7px 12px !important;
}

.list-controls input:focus,
.search-filter input:focus {
  outline: none !important;
  border-color: #b52027 !important;
  box-shadow: 0 0 0 3px rgba(181,32,39,0.12) !important;
}

.list-controls input::placeholder {
  color: #64748b !important;
}

.pagination__page-info {
  color: #64748b !important;
  font-size: 12px !important;
}

.pagination button,
.pagination__button {
  background: #1a2235 !important;
  border: 1px solid #1f2d47 !important;
  color: #e2e8f5 !important;
  border-radius: 5px !important;
  padding: 5px 10px !important;
  font-size: 12px !important;
  cursor: pointer !important;
  transition: background 0.12s, border-color 0.12s !important;
}

.pagination button:hover,
.pagination__button:hover {
  background: rgba(181,32,39,0.1) !important;
  border-color: rgba(181,32,39,0.4) !important;
  color: #e2e8f5 !important;
}

/* ═══════════════════════════════════════════
   BUTTONS
   ═══════════════════════════════════════════ */

.btn--style-primary,
button.btn--style-primary,
a.btn--style-primary {
  background: #b52027 !important;
  color: #ffffff !important;
  border: none !important;
  border-radius: 6px !important;
  font-weight: 600 !important;
  font-size: 13px !important;
  padding: 8px 16px !important;
  cursor: pointer !important;
  transition: background 0.15s, box-shadow 0.15s, transform 0.1s !important;
}

.btn--style-primary:hover {
  background: #d42833 !important;
  box-shadow: 0 4px 12px rgba(181,32,39,0.3) !important;
  transform: translateY(-1px) !important;
}

.btn--style-secondary,
button.btn--style-secondary {
  background: transparent !important;
  color: #e2e8f5 !important;
  border: 1px solid #1f2d47 !important;
  border-radius: 6px !important;
  font-size: 13px !important;
  padding: 7px 14px !important;
  cursor: pointer !important;
  transition: background 0.12s, border-color 0.12s !important;
}

.btn--style-secondary:hover {
  background: rgba(255,255,255,0.04) !important;
  border-color: #2a3d5a !important;
}

/* New / Create button in list header */
.collection-list__header .btn--style-primary,
.list-header .btn--style-primary {
  background: #b52027 !important;
}

/* ═══════════════════════════════════════════
   DOCUMENT EDIT — FORM & FIELDS
   ═══════════════════════════════════════════ */

.document-fields__wrap,
.render-fields__wrap {
  background: #0b0e1a !important;
}

/* Field groups / sections */
.field-type,
.render-fields .field-type {
  margin-bottom: 18px !important;
}

/* Labels */
.field-label,
label.field-label {
  color: #64748b !important;
  font-size: 11px !important;
  font-weight: 700 !important;
  text-transform: uppercase !important;
  letter-spacing: 0.5px !important;
  margin-bottom: 5px !important;
}

/* Text / number inputs */
.field-type input[type='text'],
.field-type input[type='email'],
.field-type input[type='password'],
.field-type input[type='number'],
.field-type input[type='tel'],
.field-type input[type='url'],
.field-type input[type='date'],
.field-type textarea,
input.text-field,
textarea.textarea-field {
  background: #1a2235 !important;
  border: 1px solid #1f2d47 !important;
  border-radius: 6px !important;
  color: #e2e8f5 !important;
  font-size: 13px !important;
  padding: 8px 12px !important;
  width: 100% !important;
  transition: border-color 0.15s, box-shadow 0.15s !important;
}

.field-type input:focus,
.field-type textarea:focus,
input.text-field:focus,
textarea.textarea-field:focus {
  outline: none !important;
  border-color: #b52027 !important;
  box-shadow: 0 0 0 3px rgba(181,32,39,0.12) !important;
}

.field-type input::placeholder,
.field-type textarea::placeholder {
  color: #64748b !important;
}

/* Selects */
.field-type select,
select.field-select {
  background: #1a2235 !important;
  border: 1px solid #1f2d47 !important;
  border-radius: 6px !important;
  color: #e2e8f5 !important;
  font-size: 13px !important;
  padding: 8px 12px !important;
}

/* Rich text / Lexical */
.rich-text-lexical,
.lexical-editor,
.ContentEditable__root {
  background: #1a2235 !important;
  border: 1px solid #1f2d47 !important;
  border-radius: 6px !important;
  color: #e2e8f5 !important;
  min-height: 120px !important;
  padding: 10px 14px !important;
}

/* Lexical toolbar */
.lexical-toolbar,
.toolbar {
  background: #111827 !important;
  border-bottom: 1px solid #1f2d47 !important;
  padding: 6px 10px !important;
}

.lexical-toolbar button,
.toolbar button {
  background: transparent !important;
  border: none !important;
  color: #94a3b8 !important;
  border-radius: 4px !important;
  padding: 4px 6px !important;
}

.lexical-toolbar button:hover,
.toolbar button:hover {
  background: rgba(255,255,255,0.06) !important;
  color: #e2e8f5 !important;
}

/* Document sidebar (save panel) */
.document-controls,
.document-controls__content {
  background: #111827 !important;
  border-left: 1px solid #1f2d47 !important;
  padding: 16px !important;
}

.document-controls__label,
.document-controls .label {
  color: #64748b !important;
  font-size: 10px !important;
  font-weight: 700 !important;
  text-transform: uppercase !important;
  letter-spacing: 0.5px !important;
}

/* Save status */
.document-controls .pill--style-success {
  background: rgba(16,185,129,0.12) !important;
  color: #10b981 !important;
}

/* ═══════════════════════════════════════════
   ARRAYS + BLOCKS
   ═══════════════════════════════════════════ */

.array-field__row,
.blocks-field__block {
  background: #111827 !important;
  border: 1px solid #1f2d47 !important;
  border-radius: 8px !important;
  margin-bottom: 8px !important;
  padding: 12px !important;
}

.array-field__row-handle,
.blocks-field__block-handle {
  color: #64748b !important;
}

.array-field__add-button,
.blocks-field__add-button {
  border: 1px dashed #1f2d47 !important;
  background: transparent !important;
  color: #64748b !important;
  border-radius: 6px !important;
  padding: 8px !important;
  width: 100% !important;
  font-size: 12px !important;
  cursor: pointer !important;
  transition: border-color 0.12s, color 0.12s !important;
}

.array-field__add-button:hover,
.blocks-field__add-button:hover {
  border-color: #b52027 !important;
  color: #b52027 !important;
}

/* ═══════════════════════════════════════════
   TABS
   ═══════════════════════════════════════════ */

.tabs-field__tabs,
.tabs__nav {
  background: #111827 !important;
  border-bottom: 1px solid #1f2d47 !important;
  display: flex !important;
  gap: 4px !important;
  padding: 0 16px !important;
}

.tabs-field__tab-button,
.tabs__tab {
  background: transparent !important;
  border: none !important;
  color: #64748b !important;
  font-size: 13px !important;
  font-weight: 500 !important;
  padding: 10px 14px !important;
  cursor: pointer !important;
  border-bottom: 2px solid transparent !important;
  transition: color 0.12s, border-color 0.12s !important;
}

.tabs-field__tab-button:hover,
.tabs__tab:hover {
  color: #e2e8f5 !important;
}

.tabs-field__tab-button--active,
.tabs__tab--active,
.tabs__tab[aria-selected='true'] {
  color: #e2e8f5 !important;
  border-bottom-color: #b52027 !important;
  font-weight: 600 !important;
}

/* ═══════════════════════════════════════════
   STATUS PILLS
   ═══════════════════════════════════════════ */

.pill {
  display: inline-flex !important;
  align-items: center !important;
  padding: 2px 10px !important;
  border-radius: 20px !important;
  font-size: 11px !important;
  font-weight: 700 !important;
}

.pill--style-success {
  background: rgba(16,185,129,0.12) !important;
  color: #10b981 !important;
}

.pill--style-error {
  background: rgba(239,68,68,0.12) !important;
  color: #ef4444 !important;
}

.pill--style-warning {
  background: rgba(245,158,11,0.12) !important;
  color: #f59e0b !important;
}

/* ═══════════════════════════════════════════
   TOASTS
   ═══════════════════════════════════════════ */

.toast,
.payload-toast {
  background: #111827 !important;
  border: 1px solid #1f2d47 !important;
  border-radius: 8px !important;
  color: #e2e8f5 !important;
  font-size: 13px !important;
  box-shadow: 0 4px 16px rgba(0,0,0,0.4) !important;
  padding: 12px 16px !important;
}

.toast--success {
  border-left: 3px solid #10b981 !important;
}

.toast--error {
  border-left: 3px solid #ef4444 !important;
}

.toast--warning {
  border-left: 3px solid #f59e0b !important;
}

.toast--info {
  border-left: 3px solid #3b82f6 !important;
}

/* ═══════════════════════════════════════════
   MODALS
   ═══════════════════════════════════════════ */

.modal__backdrop,
.drawer__backdrop {
  background: rgba(0,0,0,0.6) !important;
  backdrop-filter: blur(2px) !important;
}

.modal__content,
.modal-content,
.drawer__content {
  background: #111827 !important;
  border: 1px solid #1f2d47 !important;
  border-radius: 10px !important;
  color: #e2e8f5 !important;
  box-shadow: 0 20px 60px rgba(0,0,0,0.5) !important;
}

.modal__header,
.drawer__header {
  border-bottom: 1px solid #1f2d47 !important;
  padding: 16px 20px !important;
}

.modal__header h1,
.modal__header h2,
.modal__header h3 {
  color: #e2e8f5 !important;
  font-size: 16px !important;
  font-weight: 700 !important;
}

/* ═══════════════════════════════════════════
   CHECKBOXES + TOGGLES
   ═══════════════════════════════════════════ */

.checkbox-input__input:checked,
.checkbox-input input:checked {
  accent-color: #b52027 !important;
}

.toggle,
.toggle__input:checked + .toggle__label {
  background: #b52027 !important;
}

/* ═══════════════════════════════════════════
   RELATIONSHIP / SELECT FIELDS
   ═══════════════════════════════════════════ */

.react-select__control,
.relationship-field .react-select__control {
  background: #1a2235 !important;
  border: 1px solid #1f2d47 !important;
  border-radius: 6px !important;
  color: #e2e8f5 !important;
  min-height: 38px !important;
}

.react-select__control:hover {
  border-color: #2a3d5a !important;
}

.react-select__control--is-focused {
  border-color: #b52027 !important;
  box-shadow: 0 0 0 3px rgba(181,32,39,0.12) !important;
}

.react-select__menu {
  background: #111827 !important;
  border: 1px solid #1f2d47 !important;
  border-radius: 8px !important;
  box-shadow: 0 8px 24px rgba(0,0,0,0.4) !important;
}

.react-select__option {
  background: transparent !important;
  color: #e2e8f5 !important;
  font-size: 13px !important;
  padding: 8px 12px !important;
}

.react-select__option:hover,
.react-select__option--is-focused {
  background: rgba(181,32,39,0.08) !important;
}

.react-select__option--is-selected {
  background: rgba(181,32,39,0.15) !important;
  color: #e2e8f5 !important;
}

.react-select__single-value,
.react-select__multi-value__label {
  color: #e2e8f5 !important;
}

.react-select__multi-value {
  background: rgba(181,32,39,0.12) !important;
  border-radius: 4px !important;
}

.react-select__placeholder {
  color: #64748b !important;
}

.react-select__input-container {
  color: #e2e8f5 !important;
}

.react-select__indicator svg {
  fill: #64748b !important;
}

/* ═══════════════════════════════════════════
   MEDIA / FILE UPLOAD
   ═══════════════════════════════════════════ */

.upload__dropzone,
.file-field__dropzone {
  background: #1a2235 !important;
  border: 2px dashed #1f2d47 !important;
  border-radius: 8px !important;
  color: #64748b !important;
  transition: border-color 0.15s !important;
}

.upload__dropzone:hover {
  border-color: #b52027 !important;
  color: #e2e8f5 !important;
}

/* ═══════════════════════════════════════════
   SCROLLBAR
   ═══════════════════════════════════════════ */

::-webkit-scrollbar              { width: 6px; height: 6px; }
::-webkit-scrollbar-track        { background: #0b0e1a; }
::-webkit-scrollbar-thumb        { background: #1f2d47; border-radius: 3px; }
::-webkit-scrollbar-thumb:hover  { background: #2a3d5a; }

/* ═══════════════════════════════════════════
   LOGIN PAGE
   ═══════════════════════════════════════════ */

.login {
  background: #0b0e1a !important;
  min-height: 100vh !important;
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
}

.login__wrap {
  background: #111827 !important;
  border: 1px solid #1f2d47 !important;
  border-radius: 12px !important;
  border-top: 3px solid #b52027 !important;
  padding: 36px 32px !important;
  width: 100% !important;
  max-width: 420px !important;
  box-shadow: 0 20px 60px rgba(0,0,0,0.5) !important;
}

.login h1 {
  color: #e2e8f5 !important;
  font-size: 20px !important;
  font-weight: 700 !important;
  margin-bottom: 24px !important;
  text-align: center !important;
}

.login input {
  background: #1a2235 !important;
  border: 1px solid #1f2d47 !important;
  border-radius: 6px !important;
  color: #e2e8f5 !important;
  font-size: 13px !important;
  padding: 10px 14px !important;
  width: 100% !important;
  transition: border-color 0.15s, box-shadow 0.15s !important;
}

.login input:focus {
  outline: none !important;
  border-color: #b52027 !important;
  box-shadow: 0 0 0 3px rgba(181,32,39,0.12) !important;
}

.login input::placeholder {
  color: #64748b !important;
}

.login .btn--style-primary {
  width: 100% !important;
  padding: 10px !important;
  font-size: 14px !important;
  margin-top: 8px !important;
}

.login label,
.login .field-label {
  color: #64748b !important;
  font-size: 11px !important;
  font-weight: 700 !important;
  text-transform: uppercase !important;
  letter-spacing: 0.5px !important;
}
```

- [ ] **Step 2: Verify no build errors**

```powershell
pnpm tsc --noEmit 2>&1 | head -20
```

Expected: no TypeScript errors (CSS changes don't affect TS).

- [ ] **Step 3: Commit**

```powershell
git add custom-admin.css
git commit -m "feat: custom-admin.css — full deep navy single theme, all pages harmonized"
```

---

## Task 6 — Final integration check

- [ ] **Step 1: Start dev server**

```powershell
pnpm dev
```

Wait for `✓ Ready` message.

- [ ] **Step 2: Open admin and check each page type**

Open in browser: `http://localhost:3000/admin`

Verify each page type looks correct:
1. **Dashboard** (`/admin`) — navy bg, 4 KPI cards visible, line chart + donut visible after load
2. **Collection list** (`/admin/collections/demenagements`) — table on navy, red hover on rows
3. **Document edit** (`/admin/collections/demenagements/[id]`) — inputs navy bg, red focus ring
4. **Login** (`/admin/logout` then visit `/admin`) — navy card with red top stripe
5. **Sidebar** — dark navy, active link red left border

- [ ] **Step 3: Final TypeScript check**

```powershell
pnpm tsc --noEmit
```

Expected: zero errors.

- [ ] **Step 4: Final commit + push**

```powershell
git add -A
git commit -m "chore: admin redesign complete — deep navy theme + charts + KPIs"
git push origin main
```
