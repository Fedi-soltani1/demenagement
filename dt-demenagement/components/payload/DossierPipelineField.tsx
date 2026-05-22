'use client'

import React from 'react'
import { useFormFields, useTheme } from '@payloadcms/ui'

const STEPS = [
  { value: 'devis_recu',     icon: '📥', short: 'Reçu'       },
  { value: 'confirme',       icon: '✅', short: 'Confirmé'    },
  { value: 'en_preparation', icon: '📦', short: 'Préparation' },
  { value: 'en_cours',       icon: '🚛', short: 'En cours'    },
  { value: 'livre',          icon: '🏁', short: 'Livré'       },
]

export default function DossierPipelineField() {
  const { theme } = useTheme()
  const isDark    = theme === 'dark'

  const live = useFormFields(([fields]: [Record<string, { value?: unknown }>, unknown]) => ({
    statut: fields.statut?.value as string | undefined,
  }))

  const statut     = live?.statut ?? 'devis_recu'
  const isAnnule   = statut === 'annule'
  const currentIdx = STEPS.findIndex((s) => s.value === statut)

  if (isAnnule) {
    return (
      <div style={{
        background:   isDark ? 'rgba(139,0,0,0.15)' : '#fef2f2',
        border:       `1px solid ${isDark ? 'rgba(220,38,38,0.3)' : '#fca5a5'}`,
        borderRadius: '8px',
        padding:      '12px 16px',
        marginBottom: '4px',
        display:      'flex',
        alignItems:   'center',
        gap:          '12px',
      }}>
        <span style={{ fontSize: '22px' }}>❌</span>
        <div>
          <div style={{ fontWeight: 700, color: isDark ? '#f87171' : '#b91c1c', fontSize: '13px' }}>Dossier annulé</div>
          <div style={{ fontSize: '11px', color: 'var(--dt-muted)', marginTop: '2px' }}>
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

          /* Theme-aware colors */
          const circleBg = current
            ? 'var(--dt-red)'
            : done
              ? (isDark ? 'rgba(22,163,74,0.2)' : '#d4edda')
              : 'var(--dt-surface2)'

          const circleBorder = current
            ? '3px solid var(--dt-red)'
            : done
              ? `2px solid ${isDark ? '#16a34a' : '#28a745'}`
              : '2px solid var(--dt-border)'

          const textColor = current
            ? 'var(--dt-red)'
            : done
              ? (isDark ? '#4ade80' : '#155724')
              : 'var(--dt-muted2)'

          return (
            <React.Fragment key={step.value}>
              {/* Step */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1, minWidth: 0 }}>
                <div style={{
                  width:      '38px',
                  height:     '38px',
                  borderRadius: '50%',
                  display:    'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize:   current ? '18px' : '15px',
                  background: circleBg,
                  border:     circleBorder,
                  boxShadow:  current ? '0 0 0 4px rgba(181,32,39,0.15)' : 'none',
                  color:      done ? (isDark ? '#4ade80' : '#28a745') : 'inherit',
                  flexShrink: 0,
                  transition: 'all 0.2s',
                }}>
                  {done ? '✓' : step.icon}
                </div>
                <div style={{
                  fontSize:   '10px',
                  marginTop:  '5px',
                  textAlign:  'center',
                  color:      textColor,
                  fontWeight: current ? 700 : done ? 600 : 400,
                  maxWidth:   '60px',
                  overflow:   'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}>
                  {step.short}
                </div>
              </div>

              {/* Connector */}
              {idx < STEPS.length - 1 && (
                <div style={{
                  height:     '2px',
                  flex:       1,
                  marginTop:  '18px',
                  background: idx < currentIdx
                    ? (isDark ? '#16a34a' : '#28a745')
                    : 'var(--dt-border)',
                  transition: 'background 0.2s',
                }} />
              )}
            </React.Fragment>
          )
        })}
      </div>
    </div>
  )
}
