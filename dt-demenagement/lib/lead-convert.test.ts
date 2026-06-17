// Test unitaire (sans framework) : node:assert, lancé par tsx.
import assert from 'node:assert'
import { buildRdvData, buildDevisData, splitNomPrenom } from './lead-convert'

// — splitNomPrenom —
assert.deepEqual(splitNomPrenom('Ahmed Ben Ali'), { prenom: 'Ahmed', nom: 'Ben Ali' }, 'deux mots')
assert.deepEqual(splitNomPrenom('Ahmed'), { prenom: 'Ahmed', nom: '(à compléter)' }, 'un seul mot -> nom placeholder')
assert.deepEqual(splitNomPrenom('   '), { prenom: '(à compléter)', nom: '(à compléter)' }, 'vide -> placeholders')

// — buildRdvData —
const rdv = buildRdvData({ nomPrenom: 'Sami Trabelsi', telephone: '+216 22 333 444' })
assert.equal(rdv.statut, 'nouveau', 'rdv statut nouveau')
assert.equal(rdv.type, 'client', 'rdv type client')
assert.equal(rdv.prenom, 'Sami', 'rdv prenom')
assert.equal(rdv.nom, 'Trabelsi', 'rdv nom')
assert.equal(rdv.whatsapp, '+216 22 333 444', 'rdv whatsapp = telephone')
assert.equal('email' in rdv, false, 'rdv sans email si absent')

const rdvFull = buildRdvData({
  nomPrenom: 'Sami Trabelsi', telephone: '22', email: 'a@b.tn',
  sourcePartenaire: 7, sourcePartenaireNom: 'Agence X',
})
assert.equal(rdvFull.email, 'a@b.tn', 'rdv email présent')
assert.equal(rdvFull.sourcePartenaire, 7, 'rdv report partenaire id')
assert.equal(rdvFull.sourcePartenaireNom, 'Agence X', 'rdv report partenaire nom')

// — buildDevisData —
const devis = buildDevisData({ nomPrenom: 'Sami Trabelsi', telephone: '22', service: 'transporteur-en-tunisie' })
assert.equal(devis.statut, 'devis_recu', 'devis statut')
assert.equal(devis.nomComplet, 'Sami Trabelsi', 'devis nomComplet')
assert.equal(devis.typeClient, 'particulier', 'devis typeClient')
assert.equal('clientId' in devis, false, 'devis sans email si absent')
assert.deepEqual(devis.adresseDepart, { adresse: 'À compléter', ville: 'À compléter' }, 'adresse départ placeholder')
assert.deepEqual(devis.adresseArrivee, { adresse: 'À compléter', ville: 'À compléter' }, 'adresse arrivée placeholder')
assert.deepEqual(devis.servicesInclus, ['transporteur-en-tunisie'], 'service valide repris')
assert.equal(devis.commentaire, 'Créé depuis un lead.', 'commentaire')

const devisBad = buildDevisData({ nomPrenom: 'X Y', telephone: '22', service: 'autre-chose', email: 'a@b.tn' })
assert.equal('servicesInclus' in devisBad, false, 'service invalide -> ignoré')
assert.equal(devisBad.clientId, 'a@b.tn', 'devis email présent')

console.log('✅ lead-convert.test.ts — toutes les assertions passent')
