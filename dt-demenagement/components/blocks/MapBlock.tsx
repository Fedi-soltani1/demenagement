'use client'

import React, { useEffect, useRef } from 'react'
import { useTranslations } from 'next-intl'
import { motion } from 'framer-motion'
import { MapPin } from 'lucide-react'

const VILLES = [
  { nom: 'Tunis',    lat: 36.8190, lng: 10.1658 },
  { nom: 'Sfax',     lat: 34.7406, lng: 10.7603 },
  { nom: 'Sousse',   lat: 35.8288, lng: 10.6407 },
  { nom: 'Bizerte',  lat: 37.2744, lng: 9.8739  },
  { nom: 'Gabès',    lat: 33.8828, lng: 10.0982 },
  { nom: 'Kairouan', lat: 35.6712, lng: 10.1005 },
  { nom: 'Monastir', lat: 35.7643, lng: 10.8113 },
  { nom: 'Hammamet', lat: 36.4074, lng: 10.6156 },
  { nom: 'Nabeul',   lat: 36.4513, lng: 10.7375 },
  { nom: 'Djerba',   lat: 33.8665, lng: 10.8504 },
  { nom: 'Tozeur',   lat: 33.9197, lng: 8.1335  },
  { nom: 'Tataouine', lat: 32.9290, lng: 10.4513 },
]

const TILE_DARK  = 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
const TILE_LIGHT = 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png'

function LeafletMap() {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<unknown>(null)
  const tileLayerRef = useRef<{ setUrl(url: string): void } | null>(null)

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return

    let cleanup: (() => void) | undefined

    async function initMap() {
      const L = (await import('leaflet')).default
      await import('leaflet/dist/leaflet.css')

      if (!mapRef.current) return
      // Guard against strict-mode double-mount: Leaflet sets _leaflet_id on the container
      if ((mapRef.current as HTMLDivElement & { _leaflet_id?: number })._leaflet_id) return

      const map = L.map(mapRef.current, {
        center: [34.5, 9.5],
        zoom: 6,
        zoomControl: false,
        scrollWheelZoom: false,
        attributionControl: false,
      })

      const isLight = () => document.documentElement.dataset.theme === 'light'

      tileLayerRef.current = L.tileLayer(
        isLight() ? TILE_LIGHT : TILE_DARK,
        { maxZoom: 18 }
      ).addTo(map)

      // Swap tile layer when theme changes
      const observer = new MutationObserver(() => {
        if (!tileLayerRef.current) return
        tileLayerRef.current.setUrl(isLight() ? TILE_LIGHT : TILE_DARK)
      })
      observer.observe(document.documentElement, {
        attributes: true,
        attributeFilter: ['data-theme'],
      })

      const redIcon = L.divIcon({
        className: '',
        html: `<div style="
          width:12px;height:12px;
          background:#b52027;
          border:2px solid rgba(181,32,39,0.4);
          border-radius:50%;
          box-shadow:0 0 0 4px rgba(181,32,39,0.2);
        "></div>`,
        iconSize: [12, 12],
        iconAnchor: [6, 6],
      })

      VILLES.forEach((v) => {
        L.marker([v.lat, v.lng], { icon: redIcon })
          .addTo(map)
          .bindPopup(
            `<span style="font-family:sans-serif;font-size:12px;color:#111;font-weight:600">${v.nom}</span>`,
            { closeButton: false }
          )
      })

      mapInstanceRef.current = map

      cleanup = () => {
        observer.disconnect()
        map.remove()
        mapInstanceRef.current = null
        tileLayerRef.current = null
      }
    }

    initMap().catch(console.error)

    return () => cleanup?.()
  }, [])

  return (
    <div
      ref={mapRef}
      className="w-full h-[440px] lg:h-[520px] rounded-2xl overflow-hidden"
      style={{ background: 'var(--color-bg-card)' }}
      role="img"
      aria-label="Carte des zones d'intervention DT Déménagement en Tunisie"
    />
  )
}

export function MapBlock() {
  const t = useTranslations('Home.map')

  return (
    <section
      className="py-section px-container bg-[var(--color-bg-dark2)]"
      aria-labelledby="map-title"
    >
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          {/* Texte */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
          >
            <span className="inline-block mb-4 px-4 py-1.5 rounded-full border border-[var(--color-red)]/30 bg-[var(--color-red)]/8 text-[var(--color-red)] text-xs font-body font-semibold uppercase tracking-widest">
              {t('badge')}
            </span>
            <h2
              id="map-title"
              className="font-heading font-bold text-[var(--color-text-light)] mb-5"
              style={{ fontSize: 'clamp(1.8rem, 3.5vw, 3rem)' }}
            >
              {t('title')}
            </h2>
            <p className="font-body text-[var(--color-text-muted)] leading-relaxed mb-8">
              {t('subtitle')}
            </p>

            {/* Liste villes */}
            <div className="grid grid-cols-2 gap-2">
              {VILLES.map((v, i) => (
                <motion.div
                  key={v.nom}
                  className="flex items-center gap-2 font-body text-sm text-[var(--color-text-muted)]"
                  initial={{ opacity: 0, x: -10 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.3, delay: i * 0.04 }}
                >
                  <MapPin className="w-3.5 h-3.5 text-[var(--color-red)] flex-shrink-0" aria-hidden="true" />
                  {v.nom}
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Carte */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1], delay: 0.1 }}
          >
            <LeafletMap />
          </motion.div>
        </div>
      </div>
    </section>
  )
}
