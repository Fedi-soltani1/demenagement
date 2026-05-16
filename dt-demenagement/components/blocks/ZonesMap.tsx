'use client'

import React, { useEffect, useRef } from 'react'

export interface MapVille {
  nom: string
  slug: string
  lat: number
  lng: number
  region: string
}

export interface MapPays {
  nom: string
  slug: string
  drapeau: string
  lat: number
  lng: number
}

interface ZonesMapProps {
  villes: MapVille[]
  pays: MapPays[]
  locale: string
}

const TILE_DARK  = 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
const TILE_LIGHT = 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png'

export function ZonesMap({ villes, pays, locale }: ZonesMapProps) {
  const mapRef       = useRef<HTMLDivElement>(null)
  const instanceRef  = useRef<unknown>(null)
  const tileLayerRef = useRef<unknown>(null)

  useEffect(() => {
    if (!mapRef.current) return

    let cancelled = false

    async function init() {
      const L = (await import('leaflet')).default
      await import('leaflet/dist/leaflet.css')

      if (cancelled || !mapRef.current) return

      // Détruire toute instance résiduelle (StrictMode / hot reload)
      if (instanceRef.current) {
        ;(instanceRef.current as ReturnType<typeof L.map>).remove()
        instanceRef.current = null
      }
      const container = mapRef.current as HTMLElement & { _leaflet_id?: number }
      if (container._leaflet_id) delete container._leaflet_id

      const map = L.map(mapRef.current, {
        center: [34.5, 9.0],
        zoom: 6,
        zoomControl: true,
        scrollWheelZoom: false,
        attributionControl: false,
      })

      const isLight = () => document.documentElement.dataset.theme === 'light'

      const tileLayer = L.tileLayer(isLight() ? TILE_LIGHT : TILE_DARK, {
        maxZoom: 18,
      }).addTo(map)
      tileLayerRef.current = tileLayer

      // Suivre les changements de thème
      const observer = new MutationObserver(() => {
        ;(tileLayerRef.current as { setUrl: (url: string) => void } | null)
          ?.setUrl(isLight() ? TILE_LIGHT : TILE_DARK)
      })
      observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] })

      // Icône ville tunisienne — point rouge pulsant
      const tunisIcon = L.divIcon({
        className: '',
        html: `<div style="
          position:relative;width:14px;height:14px;
        ">
          <div style="
            width:14px;height:14px;
            background:#b52027;border-radius:50%;
            box-shadow:0 0 0 3px rgba(181,32,39,0.25),0 0 0 6px rgba(181,32,39,0.1);
          "></div>
        </div>`,
        iconSize: [14, 14],
        iconAnchor: [7, 7],
      })

      // Icône pays européen — drapeau
      function paysIcon(drapeau: string) {
        return L.divIcon({
          className: '',
          html: `<div style="
            font-size:22px;line-height:1;
            filter:drop-shadow(0 2px 4px rgba(0,0,0,0.5));
          ">${drapeau}</div>`,
          iconSize: [28, 28],
          iconAnchor: [14, 14],
        })
      }

      // Markers villes tunisiennes
      villes.forEach((v) => {
        L.marker([v.lat, v.lng], { icon: tunisIcon })
          .addTo(map)
          .bindPopup(
            `<div style="font-family:sans-serif;min-width:120px">
               <strong style="font-size:13px;color:#111">${v.nom}</strong>
               <br/><span style="font-size:11px;color:#666">${v.region}</span>
               <br/><a href="/${locale}/villes/${v.slug}" style="font-size:11px;color:#b52027;font-weight:600;text-decoration:none;">
                 Voir la page →
               </a>
             </div>`,
            { closeButton: false, maxWidth: 160 }
          )
      })

      // Markers pays européens
      pays.forEach((p) => {
        L.marker([p.lat, p.lng], { icon: paysIcon(p.drapeau) })
          .addTo(map)
          .bindPopup(
            `<div style="font-family:sans-serif;min-width:100px">
               <strong style="font-size:13px;color:#111">${p.nom}</strong>
               <br/><span style="font-size:11px;color:#666">Déménagement international</span>
             </div>`,
            { closeButton: false, maxWidth: 150 }
          )
      })

      // Polygone Tunisie (bounding box approx)
      L.polygon([
        [37.5, 8.2], [37.5, 11.6],
        [30.2, 11.6], [30.2, 8.2],
      ], {
        color: '#b52027',
        fillColor: '#b52027',
        fillOpacity: 0.06,
        weight: 1.5,
        dashArray: '4 4',
      }).addTo(map)

      if (cancelled) { map.remove(); observer.disconnect(); return }
      instanceRef.current = map

      return () => observer.disconnect()
    }

    init().catch(console.error)
    return () => {
      cancelled = true
      if (instanceRef.current) {
        ;(instanceRef.current as { remove: () => void }).remove()
        instanceRef.current = null
      }
    }
  }, [villes, pays, locale])

  return (
    <div
      ref={mapRef}
      className="w-full h-[520px] lg:h-[640px] rounded-2xl overflow-hidden"
      style={{ background: 'var(--color-bg-card)' }}
      role="img"
      aria-label="Carte interactive des zones d'intervention DT Déménagement"
    />
  )
}
