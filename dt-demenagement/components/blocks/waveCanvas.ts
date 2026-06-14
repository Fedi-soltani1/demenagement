import type React from 'react'
import { useEffect } from 'react'

// Canvas d'ondes animées — fond « hero » de DT (charte rouge/or). Réutilisé par le
// HeroBlock (accueil) et la landing partenaire.

export type Point = { x: number; y: number }

export interface WaveConfig {
  offset: number
  amplitude: number
  frequency: number
  color: string
  opacity: number
}

export const WAVES: WaveConfig[] = [
  { offset: 0,             amplitude: 70, frequency: 0.003,  color: 'rgba(181, 32, 39, 0.8)',   opacity: 0.45 },
  { offset: Math.PI / 2,   amplitude: 90, frequency: 0.0026, color: 'rgba(201, 168, 76, 0.65)', opacity: 0.35 },
  { offset: Math.PI,       amplitude: 60, frequency: 0.0034, color: 'rgba(138, 24, 32, 0.7)',   opacity: 0.28 },
  { offset: Math.PI * 1.5, amplitude: 80, frequency: 0.0022, color: 'rgba(181, 32, 39, 0.3)',   opacity: 0.22 },
  { offset: Math.PI * 2,   amplitude: 55, frequency: 0.004,  color: 'rgba(240, 236, 230, 0.15)', opacity: 0.15 },
]

/** Anime un canvas plein écran avec des ondes réactives à la souris. */
export function useWaveCanvas(canvasRef: React.RefObject<HTMLCanvasElement | null>, active: boolean) {
  useEffect(() => {
    if (!active) return
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let animationId: number
    let time = 0

    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const mouseInfluence  = prefersReduced ? 8 : 65
    const influenceRadius = prefersReduced ? 150 : 300
    const smoothing       = prefersReduced ? 0.04 : 0.1

    const mouseRef: Point    = { x: 0, y: 0 }
    const targetMouse: Point = { x: 0, y: 0 }

    const resize = () => {
      canvas.width  = canvas.offsetWidth
      canvas.height = canvas.offsetHeight
      mouseRef.x = targetMouse.x = canvas.width / 2
      mouseRef.y = targetMouse.y = canvas.height / 2
    }

    const onMouseMove  = (e: MouseEvent) => { targetMouse.x = e.clientX; targetMouse.y = e.clientY }
    const onMouseLeave = () => { targetMouse.x = canvas.width / 2; targetMouse.y = canvas.height / 2 }

    resize()
    window.addEventListener('resize', resize)
    window.addEventListener('mousemove', onMouseMove)
    window.addEventListener('mouseleave', onMouseLeave)

    const drawWave = (wave: WaveConfig) => {
      ctx.save()
      ctx.beginPath()
      for (let x = 0; x <= canvas.width; x += 3) {
        const dx   = x - mouseRef.x
        const dy   = canvas.height / 2 - mouseRef.y
        const dist = Math.sqrt(dx * dx + dy * dy)
        const infl = Math.max(0, 1 - dist / influenceRadius)
        const mfx  = infl * mouseInfluence * Math.sin(time * 0.001 + x * 0.01 + wave.offset)
        const y =
          canvas.height / 2 +
          Math.sin(x * wave.frequency + time * 0.002 + wave.offset) * wave.amplitude +
          Math.sin(x * wave.frequency * 0.4 + time * 0.003) * (wave.amplitude * 0.4) +
          mfx
        x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y)
      }
      ctx.lineWidth   = 2.5
      ctx.strokeStyle = wave.color
      ctx.globalAlpha = wave.opacity
      ctx.shadowBlur  = 30
      ctx.shadowColor = wave.color
      ctx.stroke()
      ctx.restore()
    }

    let isLight = document.documentElement.dataset.theme === 'light'
    const observer = new MutationObserver(() => {
      isLight = document.documentElement.dataset.theme === 'light'
    })
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] })

    const animate = () => {
      time += 1
      mouseRef.x += (targetMouse.x - mouseRef.x) * smoothing
      mouseRef.y += (targetMouse.y - mouseRef.y) * smoothing

      const grad = ctx.createLinearGradient(0, 0, 0, canvas.height)
      if (isLight) {
        grad.addColorStop(0, '#f5f0eb')
        grad.addColorStop(1, '#ebe7e0')
      } else {
        grad.addColorStop(0, '#0a0a0a')
        grad.addColorStop(1, '#111111')
      }
      ctx.fillStyle = grad
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      ctx.globalAlpha = 1
      ctx.shadowBlur  = 0
      WAVES.forEach(drawWave)

      animationId = requestAnimationFrame(animate)
    }

    animationId = requestAnimationFrame(animate)

    return () => {
      window.removeEventListener('resize', resize)
      window.removeEventListener('mousemove', onMouseMove)
      window.removeEventListener('mouseleave', onMouseLeave)
      cancelAnimationFrame(animationId)
      observer.disconnect()
    }
  }, [canvasRef, active])
}
