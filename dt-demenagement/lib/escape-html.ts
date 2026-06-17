// Échappe les caractères HTML sensibles avant d'injecter une valeur fournie par
// l'utilisateur dans un email HTML (nom, téléphone, adresse, commentaire…).
// Évite qu'un champ malveillant casse la mise en page de l'email ou injecte un
// lien/markup indésirable côté boîte mail de l'admin.
export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}
