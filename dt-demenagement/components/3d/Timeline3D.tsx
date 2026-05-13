'use client'

import React, { useRef, useMemo } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'

const EVENTS = [
  { year: '2005', label: 'Fondation DT' },
  { year: '2010', label: '1 000 clients' },
  { year: '2015', label: 'International' },
  { year: '2020', label: '5 000 clients' },
  { year: '2025', label: 'Leader Tunisie' },
]

const SPACING = 2.4

function TimelineScene() {
  const groupRef = useRef<THREE.Group>(null)
  const { size } = useThree()

  useFrame(({ clock, mouse }) => {
    if (!groupRef.current) return
    groupRef.current.rotation.y = Math.sin(clock.elapsedTime * 0.15) * 0.1 + mouse.x * 0.05
    groupRef.current.rotation.x = mouse.y * -0.03
  })

  const lineMat  = useMemo(() => new THREE.MeshStandardMaterial({ color: '#333333', metalness: 0.6, roughness: 0.4 }), [])
  const dotMat   = useMemo(() => new THREE.MeshStandardMaterial({ color: '#b52027', metalness: 0.4, roughness: 0.3 }), [])
  const goldMat  = useMemo(() => new THREE.MeshStandardMaterial({ color: '#c9a84c', metalness: 0.7, roughness: 0.2, emissive: '#c9a84c', emissiveIntensity: 0.2 }), [])

  const totalW = (EVENTS.length - 1) * SPACING
  const startX = -totalW / 2

  return (
    <group ref={groupRef}>
      {/* Axe horizontal */}
      <mesh material={lineMat} position={[0, 0, 0]}>
        <boxGeometry args={[totalW + 0.5, 0.04, 0.04]} />
      </mesh>

      {EVENTS.map((ev, i) => {
        const x = startX + i * SPACING
        return (
          <group key={ev.year} position={[x, 0, 0]}>
            {/* Point nodal */}
            <mesh material={i === EVENTS.length - 1 ? goldMat : dotMat}>
              <sphereGeometry args={[0.12, 10, 10]} />
            </mesh>
            {/* Tige verticale */}
            <mesh material={lineMat} position={[0, i % 2 === 0 ? 0.5 : -0.5, 0]}>
              <boxGeometry args={[0.03, 0.85, 0.03]} />
            </mesh>
          </group>
        )
      })}
    </group>
  )
}

export default function Timeline3D() {
  return (
    <Canvas
      dpr={[1, 1.5]}
      performance={{ min: 0.5 }}
      frameloop="demand"
      gl={{ antialias: false, powerPreference: 'high-performance', alpha: true }}
      camera={{ position: [0, 1.5, 7], fov: 45 }}
      style={{ background: 'transparent' }}
    >
      <ambientLight intensity={0.6} />
      <directionalLight position={[5, 8, 5]} intensity={0.8} />
      <directionalLight position={[-3, 2, -3]} intensity={0.3} color="#b52027" />

      <TimelineScene />
    </Canvas>
  )
}
