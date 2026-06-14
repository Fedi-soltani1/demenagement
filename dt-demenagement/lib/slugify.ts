/** Transforme un texte en slug d'URL : minuscules, sans accents, mots séparés par des tirets. */
export function slugify(input: string): string {
  return input
    .normalize('NFD')                  // décompose les caractères accentués
    .replace(/[̀-ͯ]/g, '')   // retire les diacritiques (accents)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')       // tout ce qui n'est pas alphanumérique -> tiret
    .replace(/^-+|-+$/g, '')           // retire les tirets en début/fin
}
