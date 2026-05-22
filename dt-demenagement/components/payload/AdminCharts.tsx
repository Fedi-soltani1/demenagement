'use client'

import React from 'react'
import {
  ResponsiveContainer,
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  PieChart, Pie, Cell,
} from 'recharts'

interface Props {
  monthly:  { labels: string[]; dossiers: number[] }
  pipeline: {
    devis_recu: number; confirme: number; en_preparation: number
    en_cours: number; livre: number; annule: number
  }
}

const T = {
  card: '#111827', input: '#1a2235', border: '#1f2d47',
  text: '#e2e8f5', muted: '#64748b', red: '#b52027',
} as const

const PIE_DATA_BASE = [
  { key: 'devis_recu',     name: 'Reçu',        color: '#f59e0b' },
  { key: 'confirme',       name: 'Confirmé',     color: '#10b981' },
  { key: 'en_preparation', name: 'Préparation',  color: '#3b82f6' },
  { key: 'en_cours',       name: 'En cours',     color: '#8b5cf6' },
  { key: 'livre',          name: 'Livré',        color: '#22d3ee' },
  { key: 'annule',         name: 'Annulé',       color: '#ef4444' },
] as const

function LineTooltip({ active, payload, label }: { active?: boolean; payload?: { value: number }[]; label?: string }) {
  if (!active || !payload?.length) return null
  return (
    <div style={{ background: T.input, border: `1px solid ${T.border}`, borderRadius: '8px', padding: '8px 12px' }}>
      <div style={{ fontSize: '11px', color: T.muted, marginBottom: '4px' }}>{label}</div>
      <div style={{ fontSize: '16px', fontWeight: 700, color: T.red }}>{payload[0]!.value} dossiers</div>
    </div>
  )
}

export default function AdminCharts({ monthly, pipeline }: Props) {
  const lineData = monthly.labels.map((mois, i) => ({ mois, dossiers: monthly.dossiers[i] ?? 0 }))

  const pieData = PIE_DATA_BASE
    .map(d => ({ name: d.name, color: d.color, value: pipeline[d.key] }))
    .filter(d => d.value > 0)

  const total = pieData.reduce((s, d) => s + d.value, 0)

  const cardStyle: React.CSSProperties = {
    background: T.card, borderRadius: '12px', padding: '20px',
    border: `1px solid ${T.border}`, boxShadow: '0 1px 3px rgba(0,0,0,0.3)',
  }
  const headerStyle: React.CSSProperties = {
    fontSize: '12px', fontWeight: 700, color: T.muted,
    textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '16px',
  }

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '65fr 35fr', gap: '16px' }}>

      {/* ── Line chart ── */}
      <div style={cardStyle}>
        <div style={headerStyle}>Dossiers — 6 derniers mois</div>
        <ResponsiveContainer width="100%" height={180}>
          <LineChart data={lineData} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={T.border} vertical={false} />
            <XAxis dataKey="mois" tick={{ fontSize: 11, fill: T.muted }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: T.muted }} axisLine={false} tickLine={false} allowDecimals={false} />
            <Tooltip content={<LineTooltip />} cursor={{ stroke: T.border }} />
            <Line
              type="monotone" dataKey="dossiers" stroke={T.red} strokeWidth={2.5}
              dot={{ r: 4, fill: T.red, stroke: T.card, strokeWidth: 2 }}
              activeDot={{ r: 6, fill: T.red, stroke: T.card, strokeWidth: 2 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* ── Donut chart ── */}
      <div style={cardStyle}>
        <div style={headerStyle}>Pipeline dossiers</div>
        {total === 0 ? (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '180px', color: T.muted, fontSize: '13px' }}>
            Aucun dossier actif
          </div>
        ) : (
          <>
            <div style={{ position: 'relative' }}>
              <ResponsiveContainer width="100%" height={160}>
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" innerRadius={48} outerRadius={72} paddingAngle={3} dataKey="value">
                    {pieData.map((d, i) => (
                      <Cell key={i} fill={d.color} stroke="transparent" />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(v: unknown, name: unknown) => { const n = Number(v); return [`${n} (${Math.round(n / total * 100)}%)`, String(name)] }}
                    contentStyle={{ background: T.input, border: `1px solid ${T.border}`, borderRadius: '8px', fontSize: '12px', color: T.text }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', textAlign: 'center', pointerEvents: 'none' }}>
                <div style={{ fontSize: '22px', fontWeight: 800, color: T.text, lineHeight: 1 }}>{total}</div>
                <div style={{ fontSize: '10px', color: T.muted }}>total</div>
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px', marginTop: '4px' }}>
              {pieData.map(d => (
                <div key={d.name} style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <div style={{ width: '7px', height: '7px', borderRadius: '2px', background: d.color, flexShrink: 0 }} />
                  <span style={{ fontSize: '10px', color: T.muted, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{d.name}</span>
                  <span style={{ fontSize: '11px', fontWeight: 700, color: T.text, marginLeft: 'auto' }}>{d.value}</span>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
