'use client'

import { useEffect, useRef, useState } from 'react'

// Actualités / nouveautés de l'entreprise (éditable — pourra être branché sur le CMS).
type Slide = { title: string; text: string; emoji: string; bg: string }

const SLIDES: Slide[] = [
  {
    title: 'Bienvenue dans votre espace',
    text: 'Créez et suivez vos demandes de déménagement en temps réel.',
    emoji: '🚚',
    bg: 'linear-gradient(135deg,#b52027 0%,#8a1820 55%,#5e0f14 100%)',
  },
  {
    title: 'Nouveau : champ WhatsApp',
    text: 'Ajoutez le numéro WhatsApp du client pour un suivi plus rapide.',
    emoji: '💬',
    bg: 'linear-gradient(135deg,#1b2a4a 0%,#243660 100%)',
  },
  {
    title: 'Parrainage & commissions',
    text: 'Chaque demande convertie en dossier est suivie dans votre espace.',
    emoji: '🤝',
    bg: 'linear-gradient(135deg,#3a2a0a 0%,#5e4410 60%,#7a5a12 100%)',
  },
]

const INTERVAL_MS = 5000

/** Carrousel d'actualités de l'espace partenaire (remplace l'ancienne box rouge). */
export function AgentNewsCarousel() {
  const [index, setIndex] = useState(0)
  const paused = useRef(false)

  useEffect(() => {
    const id = setInterval(() => {
      if (!paused.current) setIndex((i) => (i + 1) % SLIDES.length)
    }, INTERVAL_MS)
    return () => clearInterval(id)
  }, [])

  const slide = SLIDES[index] ?? SLIDES[0]!

  return (
    <div style={{ padding: '16px 18px 2px' }}>
      <div
        role="region"
        aria-label="Actualités DT Déménagement"
        onMouseEnter={() => { paused.current = true }}
        onMouseLeave={() => { paused.current = false }}
        onTouchStart={() => { paused.current = true }}
        style={{ position: 'relative', overflow: 'hidden', borderRadius: 18, boxShadow: '0 14px 38px rgba(0,0,0,0.4)' }}
      >
        <div style={{ position: 'relative', padding: '20px 18px', minHeight: 104, background: slide.bg, transition: 'background .5s ease' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: 17, fontWeight: 800, color: '#fff', lineHeight: 1.2 }}>{slide.title}</div>
              <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.82)', marginTop: 6 }}>{slide.text}</div>
            </div>
            <div aria-hidden="true" style={{ fontSize: 44, flexShrink: 0, filter: 'drop-shadow(0 6px 10px rgba(0,0,0,0.35))' }}>{slide.emoji}</div>
          </div>

          {/* Points de navigation */}
          <div style={{ display: 'flex', gap: 6, marginTop: 14 }}>
            {SLIDES.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setIndex(i)}
                aria-label={`Actualité ${i + 1}`}
                aria-current={i === index}
                style={{
                  width: i === index ? 20 : 8, height: 8, borderRadius: 4, border: 'none', padding: 0, cursor: 'pointer',
                  background: i === index ? '#fff' : 'rgba(255,255,255,0.45)', transition: 'width .3s ease',
                }}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
