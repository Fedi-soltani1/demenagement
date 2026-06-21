// Normalisation de numéro de téléphone pour le rapprochement (matching).
// Les numéros sont stockés en formats variés (+216 52 880 311, 21652880311, 52880311…).
// On extrait le « cœur » = les 8 derniers chiffres (numéro tunisien) pour comparer.

export function phoneCore(input: string | null | undefined): string {
  const digits = (input ?? '').replace(/\D/g, '')
  return digits.length > 8 ? digits.slice(-8) : digits
}

// Normalisation canonique d'un numéro tunisien pour servir d'identité stable.
// Retire +216 / 216 / 00216 et séparateurs ; un numéro national à 8 chiffres devient
// « 216XXXXXXXX ». Un numéro étranger garde tous ses chiffres (distinct d'un tunisien).
export function normalizePhoneTN(input: string | null | undefined): string {
  let d = (input ?? '').replace(/\D/g, '')
  if (d.startsWith('00216')) d = d.slice(5)
  else if (d.startsWith('216')) d = d.slice(3)
  if (d.length === 8) return `216${d}`
  return d
}

// Affichage « joli » d'un numéro pour les humains. Un numéro tunisien canonique
// (216 + 8 chiffres) devient « +216 XX XXX XXX » ; un numéro étranger devient « +<chiffres> » ;
// une valeur vide reste vide. Accepte n'importe quel format en entrée (normalise d'abord).
export function formatPhoneTN(input: string | null | undefined): string {
  const d = normalizePhoneTN(input)
  if (!d) return ''
  if (d.startsWith('216') && d.length === 11) {
    const n = d.slice(3) // 8 chiffres nationaux
    return `+216 ${n.slice(0, 2)} ${n.slice(2, 5)} ${n.slice(5, 8)}`
  }
  return `+${d}`
}
