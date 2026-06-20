// Normalisation de numéro de téléphone pour le rapprochement (matching).
// Les numéros sont stockés en formats variés (+216 52 880 311, 21652880311, 52880311…).
// On extrait le « cœur » = les 8 derniers chiffres (numéro tunisien) pour comparer.

export function phoneCore(input: string | null | undefined): string {
  const digits = (input ?? '').replace(/\D/g, '')
  return digits.length > 8 ? digits.slice(-8) : digits
}
