// Test unitaire (sans framework) : node:assert, lancé par tsx.
import assert from 'node:assert'
import { buildDossierData, buildNomComplet, mapTypeClient } from './rdv-to-dossier'

// — buildNomComplet —
assert.equal(buildNomComplet('Sami', 'Trabelsi'), 'Sami Trabelsi', 'prénom + nom')
assert.equal(buildNomComplet('Sami', ''), 'Sami', 'nom vide')
assert.equal(buildNomComplet('', ''), '(à compléter)', 'vide -> placeholder')
assert.equal(buildNomComplet(null, null), '(à compléter)', 'null -> placeholder')

// — mapTypeClient —
assert.equal(mapTypeClient('client'), 'particulier', 'client -> particulier')
assert.equal(mapTypeClient('entreprise'), 'entreprise', 'entreprise -> entreprise')
assert.equal(mapTypeClient('administration'), 'entreprise', 'administration -> entreprise')
assert.equal(mapTypeClient(undefined), 'particulier', 'absent -> particulier')

// — buildDossierData (minimal) —
const min = buildDossierData({ prenom: 'Sami', nom: 'Trabelsi', telephone: '+216 22 333 444' })
assert.equal(min.statut, 'devis_recu', 'statut entrée pipeline')
assert.equal(min.nomComplet, 'Sami Trabelsi', 'nomComplet composé')
assert.equal(min.telephone, '+216 22 333 444', 'téléphone repris')
assert.equal(min.typeClient, 'particulier', 'typeClient par défaut')
assert.equal('clientId' in min, false, 'pas d\'email -> pas de clientId')
assert.deepEqual(min.adresseDepart, { adresse: 'À compléter', ville: 'À compléter' }, 'départ placeholder si pas d\'adresse')
assert.deepEqual(min.adresseArrivee, { adresse: 'À compléter', ville: 'À compléter' }, 'arrivée placeholder')
assert.equal(min.commentaire, 'Créé depuis un rendez-vous de visite confirmé.', 'commentaire générique')

// — buildDossierData (complet) —
const full = buildDossierData({
  prenom: 'Leila', nom: 'Ben Salah', telephone: '22', email: 'leila@ex.tn',
  type: 'entreprise', adresse: '12 rue des Orangers, Tunis',
  dateVisite: '2026-07-01', heure: '10h00',
  sourcePartenaire: 7, sourcePartenaireNom: 'Agence X',
})
assert.equal(full.clientId, 'leila@ex.tn', 'email -> clientId')
assert.equal(full.typeClient, 'entreprise', 'entreprise repris')
assert.deepEqual(full.adresseDepart, { adresse: '12 rue des Orangers, Tunis', ville: 'À compléter' }, 'adresse visite -> départ')
assert.equal(full.commentaire, 'Créé depuis un RDV de visite confirmé le 2026-07-01 à 10h00.', 'commentaire daté')
assert.equal(full.sourcePartenaire, 7, 'partenaire id repris')
assert.equal(full.sourcePartenaireNom, 'Agence X', 'partenaire nom repris')

console.log('✅ rdv-to-dossier.test.ts — toutes les assertions passent')
