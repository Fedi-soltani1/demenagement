import type { Access } from 'payload'

type UserWithRole = { role?: string }

// Rôle SEO : gère TOUT le contenu du site (pages, services, blog, FAQ, villes,
// pays, témoignages, avis, partenaires, newsletter…). Séparation stricte avec le
// super-admin qui, lui, gère l'opérationnel (dossiers, messages, RDV, leads, clients).
export const isSeo: Access = ({ req: { user } }) =>
  Boolean(user && (user as UserWithRole).role === 'seo')

// Super-admin OU SEO — réservé aux ressources réellement partagées par les deux
// rôles : Médias (les photos de devis y sont stockées) et Réglages (config + matricule).
export const isAdminOrSeo: Access = ({ req: { user } }) => {
  const role = (user as UserWithRole | undefined)?.role
  return role === 'super-admin' || role === 'seo'
}
