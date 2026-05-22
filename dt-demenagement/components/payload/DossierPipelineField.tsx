'use client'

import React from 'react'
import { useFormFields } from '@payloadcms/ui'

const STEPS = [
  { value: 'devis_recu',     icon: '📥', short: 'Reçu'       },
  { value: 'confirme',       icon: '✅', short: 'Confirmé'    },
  { value: 'en_preparation', icon: '📦', short: 'Préparation' },
  { value: 'en_cours',       icon: '🚛', short: 'En cours'    },
  { value: 'livre',          icon: '🏁', short: 'Livré'       },
]

export default function DossierPipelineField() {
  const live = useFormFields(([fields]: [Record<string, { value?: unknown }>, unknown]) => ({
    statut: fields.statut?.value as string | undefined,
  }))

  const statut     = live?.statut ?? 'devis_recu'
  const isAnnule   = statut === 'annule'
  const currentIdx = STEPS.findIndex((s) => s.value === statut)

  if (isAnnule) {
    return (
      <div style={{
        background: '#f8d7da', border: '1px solid #f5c6cb', borderRadius: '8px',
        padding: '12px 16px', marginBottom: '4px',
        display: 'flex', alignItems: 'center', gap: '12px',
      }}>
        <span style={{ fontSize: '22px' }}>❌</span>
        <div>
          <div style={{ fontWeight: 700, color: '#721c24', fontSize: '13px' }}>Dossier annulé</div>
          <div style={{ fontSize: '11px', color: '#999', marginTop: '2px' }}>
            Modifier le statut du dossier pour le réactiver.
          </div>
        </div>
      </div>
    )
  }

  return (
    <div style={{ marginBottom: '4px', padding: '12px 0' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start' }}>
        {STEPS.map((step, idx) => {
          const done    = idx < currentIdx
          const current = idx === currentIdx

          return (
            <React.Fragment key={step.value}>
              {/* Step */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1, minWidth: 0 }}>
                <div style={{
                  width: '38px', height: '38px', borderRadius: '50%',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: current ? '18px' : '15px',
                  background: current ? '#b52027' : done ? '#d4edda' : '#f0f0f0',
                  border:     current ? '3px solid #b52027' : done ? '2px solid #28a745' : '2px solid #ddd',
                  boxShadow:  current ? '0 0 0 4px rgba(181,32,39,0.15)' : 'none',
                  color:      done ? '#28a745' : 'inherit',
                  flexShrink: 0,
                }}>
                  {done ? '✓' : step.icon}
                </div>
                <div style={{
                  fontSize: '10px', marginTop: '5px', textAlign: 'center',
                  color:      current ? '#b52027' : done ? '#155724' : '#bbb',
                  fontWeight: current ? 700 : done ? 500 : 400,
                  maxWidth:   '60px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                }}>
                  {step.short}
                </div>
              </div>

              {/* Connector */}
              {idx < STEPS.length - 1 && (
                <div style={{
                  height: '2px', flex: 1, marginTop: '18px',
                  background: idx < currentIdx ? '#28a745' : '#e8e8e8',
                }} />
              )}
            </React.Fragment>
          )
        })}
      </div>
    </div>
  )
}
