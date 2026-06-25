import assert from 'node:assert'
import { agentStatutInfo, AGENT_STATUTS } from './agent-statut-labels'

assert.deepEqual([...AGENT_STATUTS], ['soumise', 'vue', 'acceptee', 'refusee', 'realisee'], 'ordre des jalons')
assert.equal(agentStatutInfo('soumise').label, 'Soumise', 'libellé soumise')
assert.equal(agentStatutInfo('realisee').label, 'Déménagement réalisé', 'libellé réalisé')
assert.equal(typeof agentStatutInfo('vue').color, 'string', 'couleur définie')
assert.equal(agentStatutInfo('inconnu').label, 'Inconnu', 'fallback robuste')
console.log('✅ agent-statut-labels OK')
