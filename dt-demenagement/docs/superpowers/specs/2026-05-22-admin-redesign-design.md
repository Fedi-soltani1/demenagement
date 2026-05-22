# Admin Redesign — Deep Navy Professional Theme
**Date:** 2026-05-22  
**Status:** Approved  
**Scope:** Full Payload CMS admin visual overhaul — all pages, single theme

---

## 1. Goal

Replace the current dual light/dark Payload admin theme with a single, fixed **deep navy professional theme** that:
- Looks premium and impressive to the client (whose logo is red + white — perfect contrast on navy)
- Harmonizes every page in the admin (lists, forms, login, modals, tables, sidebar, topbar)
- Adds real business charts (line + donut) to the dashboard
- Introduces no regressions — all existing TypeScript, API logic, and Payload functionality unchanged

---

## 2. Color System

Single theme, no toggle. Applied via `:root` only.

```css
--bg-base:      #0b0e1a   /* page background */
--bg-card:      #111827   /* cards, sidebar, panels */
--bg-input:     #1a2235   /* form inputs, selects */
--border:       #1f2d47   /* all borders */
--text:         #e2e8f5   /* primary text */
--text-muted:   #64748b   /* labels, captions, icons */
--red:          #b52027   /* DT brand accent — unchanged */
--red-hover:    #d42833   /* button/link hover */
--red-glow:     rgba(181,32,39,0.12) /* halo on cards/hover */
--success:      #10b981
--warning:      #f59e0b
--danger:       #ef4444
```

All Payload CSS variable overrides (`--color-base-*`, `--theme-*`, `--color-blue-*`) map to this palette.

---

## 3. Layout Structure

```
┌─────────────────────────────────────────────────────────────┐
│  TOPBAR sticky — 3px red top stripe — Logo + breadcrumb     │
│  + notifications badge + user avatar                        │
├───────────┬─────────────────────────────────────────────────┤
│           │                                                 │
│  SIDEBAR  │  PAGE CONTENT (variable per page type)          │
│  bg-card  │                                                 │
│  240px    │                                                 │
│           │                                                 │
│  Nav      │                                                 │
│  groups   │                                                 │
│  + icons  │                                                 │
│           │                                                 │
└───────────┴─────────────────────────────────────────────────┘
```

Topbar: `height: 56px`, `bg-card`, `border-top: 3px solid #b52027`, sticky `z-index: 100`.  
Sidebar: `width: 240px`, `bg-card`, `border-right: 1px solid var(--border)`.

---

## 4. Dashboard Layout (AdminDashboard.tsx)

### 4.1 KPI Row — 4 cards
```
┌──────────────┐ ┌──────────────┐ ┌──────────────┐ ┌──────────────┐
│ 📦 Dossiers  │ │ 📅 RDV       │ │ ✉ Messages   │ │ 👥 Clients   │
│    247       │ │    18        │ │    34        │ │    89        │
│ +12 ce mois  │ │  5 nouveaux  │ │  8 non lus   │ │  +3 ce mois  │
└──────────────┘ └──────────────┘ └──────────────┘ └──────────────┘
```
Each card: `bg-card`, `border-left: 3px solid [color]`, value `28px bold white`, delta small green/red badge.  
Colors: Dossiers=red, RDV=blue(`#3b82f6`), Messages=orange(`#f59e0b`), Clients=green(`#10b981`).

### 4.2 Charts Row
```
┌─────────────────────────────────────┐  ┌──────────────────────┐
│  Line chart — Dossiers / 6 mois     │  │  Donut — Pipeline    │
│  X: Jan→Jun  Y: count               │  │  6 statuts colorés   │
│  Courbe #b52027, grille #1f2d47     │  │  Légende à droite    │
│  Tooltip navy                       │  │  Total au centre     │
└─────────────────────────────────────┘  └──────────────────────┘
  65% width                                 35% width
```
Library: **Recharts** (`recharts` npm package).  
- `LineChart` + `ResponsiveContainer` + custom `Tooltip` navy-styled  
- `PieChart` (donut via `innerRadius`) + `Legend`

### 4.3 Bottom Row
```
┌──────────────────────────────────┐  ┌────────────────────────┐
│  Derniers dossiers (table)       │  │  Mini calendrier RDV   │
│  5 colonnes: Client / Ville /    │  │  +                     │
│  Statut / Date / Actions         │  │  Accès rapide          │
└──────────────────────────────────┘  └────────────────────────┘
  65% width                              35% width
```

---

## 5. CSS Harmonization — All Page Types

### 5.1 Collection list pages (e.g. /admin/collections/demenagements)
- Table header: `bg-card`, text muted
- Table rows: `bg-base`, `border-bottom: 1px solid var(--border)`
- Row hover: `background: rgba(181,32,39,0.04)`
- Status badges: colored text on semi-transparent same-color bg
- "Créer" button: `bg: #b52027`, white text, `border-radius: 6px`
- Pagination: navy buttons, hover red

### 5.2 Document edit pages (e.g. /admin/collections/demenagements/[id])
- Page bg: `--bg-base`
- Section panels: `bg-card`, `border: 1px solid var(--border)`, `border-radius: 8px`
- Inputs/textareas: `bg: var(--bg-input)`, `border: 1px solid var(--border)`, `color: var(--text)`
- Input focus: `border-color: #b52027`, `box-shadow: 0 0 0 3px var(--red-glow)`
- Labels: `color: var(--text-muted)`, `font-size: 12px`, uppercase tracking
- Save button: red filled; Cancel: navy outlined

### 5.3 Login page
- Full-screen `bg-base`
- Centered card `bg-card`, `border-radius: 12px`, `border-top: 3px solid #b52027`
- AdminLogo centered at top
- Inputs: navy style

### 5.4 Modals
- `bg-card`, `border: 1px solid var(--border)`, `border-radius: 10px`
- Backdrop: `rgba(0,0,0,0.6)` + `backdrop-filter: blur(2px)`
- Header: muted label, close button

### 5.5 Toasts
- Success: `border-left: 3px solid #10b981`
- Error: `border-left: 3px solid #ef4444`
- Info: `border-left: 3px solid #3b82f6`
- All on `bg-card` navy background

### 5.6 Sidebar
- `bg-card`, group labels `text-muted 10px uppercase`
- Active link: `bg: rgba(181,32,39,0.1)`, `border-left: 2px solid #b52027`, text white
- Hover: `bg: rgba(255,255,255,0.04)`

---

## 6. API Extension (stats endpoint)

File: `app/api/admin/dashboard-stats/route.ts`. Current response shape preserved. New `monthly` field added:
```typescript
interface StatsResponse {
  // ... existing fields unchanged ...
  monthly: {
    labels: string[]          // ['Jan','Feb','Mar','Apr','May','Jun']
    dossiers: number[]        // count per month, last 6 months
  }
}
```
Query: `DATE_TRUNC('month', "createdAt")` GROUP BY month, last 6 months.

---

## 7. New Package

```
recharts ^2.12.0
```
Installed via `pnpm add recharts`.  
Charts imported with `dynamic(() => import(...), { ssr: false })` to avoid SSR issues.

---

## 8. Files Changed

| File | Change |
|---|---|
| `custom-admin.css` | Full rewrite — single navy theme, ~1,200 lines |
| `components/payload/AdminDashboard.tsx` | New layout: KPI cards + Line chart + Donut chart |
| `app/api/admin/dashboard-stats/route.ts` | Add `monthly` field to response |
| `package.json` + `pnpm-lock.yaml` | Add `recharts` |

**Files NOT touched:** All 15 other payload components, all 18 collections, all frontend pages, all migrations, all block components.

---

## 9. Success Criteria

- Every Payload admin page (list, edit, login, modal, toast) shows deep navy theme
- No TypeScript errors (`pnpm tsc --noEmit` passes)
- Dashboard shows 4 KPI cards + line chart + donut chart with real data
- Admin looks professional enough to demo directly to the client
- Zero regressions on existing features (RDV calendar, devis generator, chat, pipeline)
