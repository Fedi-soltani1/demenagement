# Design Spec — Devis Form UI Polish

**Date:** 2026-05-19  
**Status:** Approved  
**Scope:** Visual and interaction redesign of the 6-step devis form. No changes to data flow, API, or validation logic.

---

## Problem

1. Native `<select>` for étage renders with broken dark-mode styling (browser default)
2. Form feels static and generic — no per-step context or personality
3. Elevator input is a small checkbox — hard to notice on mobile
4. Service buttons lack visual differentiation (no icons)
5. No animated feedback between steps — transitions feel abrupt

---

## Approved Design

### 1. Step Hero Header

Each step gets a full-width header above the fields:

```
┌─────────────────────────────────────────────┐
│  ┌──┐                                        │
│  │🔴│  Vos coordonnées          Étape 1/6    │
│  └──┘  Pour vous envoyer votre confirmation │
│        et votre numéro de dossier           │
└─────────────────────────────────────────────┘
```

- **Icon**: Lucide icon in a `w-10 h-10` rounded-xl, `bg-[var(--color-red)]/10 border border-[var(--color-red)]/20`, icon in red
- **Title**: `font-heading text-xl font-bold text-[var(--color-text-light)]`
- **Subtitle**: `font-body text-sm text-[var(--color-text-muted)]`
- **Counter**: `font-body text-xs text-[var(--color-text-muted)] uppercase tracking-wide` — top right

Per-step content:

| Step | Lucide Icon | Title | Subtitle |
|---|---|---|---|
| 0 | `UserRound` | Vos coordonnées | Pour vous envoyer votre confirmation et numéro de dossier |
| 1 | `MapPin` | Adresse de départ | D'où partiront vos affaires ? |
| 2 | `Home` | Adresse d'arrivée | La destination finale de votre déménagement |
| 3 | `Package` | Vos besoins | Sélectionnez les services qui correspondent à votre projet |
| 4 | `Camera` | Photos (optionnel) | Des photos nous évitent une visite et accélèrent votre devis |
| 5 | `ClipboardCheck` | Tout est correct ? | Vérifiez vos informations avant d'envoyer |

---

### 2. Étage — Button Grid (replaces `<select>`)

```
Étage
┌─────┬─────┬─────┐
│ RDC │  1  │  2  │
├─────┼─────┼─────┤
│  3  │  4  │ 5+  │
└─────┴─────┴─────┘
```

- 6 buttons, 3-column grid
- Selected: `bg-[var(--color-red)]/15 border-[var(--color-red)]/40 text-[var(--color-red)]`
- Unselected: `bg-white/[0.02] border-white/8 text-[var(--color-text-muted)] hover:border-white/15`
- `font-body text-sm font-medium py-2.5 rounded-xl`
- Full label on desktop (Rez-de-chaussée / 1er étage), abbreviated on mobile (RDC / 1 / 2…)

---

### 3. Ascenseur — Toggle Pill (replaces checkbox)

```
Ascenseur disponible ?
  [ Non  |  Oui ]
```

- Two-button toggle: "Non" and "Oui"
- Active side gets red background, inactive is glass
- Full width on mobile, `w-48` on desktop
- Uses `role="group"` + `aria-pressed` for accessibility

---

### 4. Progress Bar

Thin `h-1` bar directly below the stepper pills:

- Container: `w-full h-1 bg-white/10 rounded-full`
- Fill: `bg-[var(--color-red)] rounded-full transition-all duration-500`
- Width: `${(step / (STEPS.length - 1)) * 100}%`

---

### 5. Animated Step Transitions

- **Advance**: current step slides out left (`translateX(-100%)`), next slides in from right (`translateX(100%) → 0`)
- **Go back**: reversed direction
- **Duration**: 250ms `ease-out`
- **Properties**: `transform` + `opacity` only (GPU-accelerated)
- **Reduced motion**: instant swap, no animation
- **Implementation**: CSS keyframe classes toggled by JS, or inline `style` + CSS transitions

---

### 6. Service Cards with Icons

Each service button gets a Lucide icon:

| Service | Icon |
|---|---|
| Transporteur en Tunisie | `Truck` |
| Transfert Entreprises | `Building2` |
| Location Monte-Meubles | `ArrowUpDown` |
| Gardes Meubles | `Warehouse` |
| Services Emballage | `PackageOpen` |
| Montage / Démontage | `Wrench` |

Card layout: icon (left, 16px) + label (right). Selected: red icon + text, subtle red glow. Taller padding (`py-3.5`).

---

## Files to Modify

- `components/devis/DevisForm.tsx` — step hero, progress bar, transitions, toggle pill, floor grid, service icons
- No new files needed (all changes within DevisForm.tsx)

---

## Out of Scope

- API / validation / localStorage logic — unchanged
- StepPhotos.tsx / StepRecapitulatif.tsx — UI left as-is
- PhotoUploadZone.tsx — UI left as-is
