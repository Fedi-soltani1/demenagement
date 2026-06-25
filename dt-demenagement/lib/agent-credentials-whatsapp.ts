// Compose le message WhatsApp d'identifiants envoyé à un agent immobilier (via le bot).
export function buildAgentCredentialsWhatsApp(input: {
  prenom: string
  email: string
  tempPassword: string
  appUrl: string
}): string {
  return [
    `Bonjour ${input.prenom},`,
    '',
    'Votre accès agent *DT Déménagement Tunisie* est prêt.',
    '',
    `🔑 Identifiant : ${input.email}`,
    `🔒 Mot de passe : ${input.tempPassword}`,
    `📲 Application : ${input.appUrl}`,
    '',
    'Sur mobile, ajoutez l\'application à votre écran d\'accueil pour l\'utiliser comme une app.',
  ].join('\n')
}
