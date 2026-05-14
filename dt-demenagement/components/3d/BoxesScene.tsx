'use client'

import React, { useRef, useMemo } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Float } from '@react-three/drei'
import * as THREE from 'three'

const BOX_MAT  = new THREE.MeshStandardMaterial({ color: '#b52027', metalness: 0.2, roughness: 0.6 })
const DARK_MAT = new THREE.MeshStandardMaterial({ color: '#1a1a1a', metalness: 0.8, roughness: 0.2 })

function MovingBox({ position, scale, speed, phase }: {
  position: [number, number, number]
  scale: number
  speed: number
  phase: number
}) {
  const groupRef = useRef<THREE.Group>(null)

  useFrame(({ clock }) => {
    if (!groupRef.current) return
    const t = clock.elapsedTime * speed + phase
    groupRef.current.rotation.x = t * 0.4
    groupRef.current.rotation.y = t * 0.6
    groupRef.current.position.y = position[1] + Math.sin(t) * 0.15
  })

  const s = scale
  return (
    <group ref={groupRef} position={position}>
      {/* Corps */}
      <mesh material={BOX_MAT}>
        <boxGeometry args={[s, s, s]} />
      </mesh>
      {/* Arêtes */}
      <lineSegments>
        <edgesGeometry args={[new THREE.BoxGeometry(s + 0.01, s + 0.01, s + 0.01)]} />
        <lineBasicMaterial color="#c9a84c" transparent opacity={0.5} />
      </lineSegments>
    </group>
  )
}

// Sol / surface de transport
function Floor() {
  return (
    <mesh material={DARK_MAT} rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.8, 0]}>
      <planeGeometry args={[10, 6]} />
    </mesh>
  )
}

export default function BoxesScene() {
  const boxes = useMemo(() => [
    { position: [-1.8,  0,    0.3] as [number,number,number], scale: 0.55, speed: 0.4, phase: 0     },
    { position: [ 0,    0.1, -0.2] as [number,number,number], scale: 0.7,  speed: 0.3, phase: 1.2   },
    { position: [ 1.7, -0.1,  0.2] as [number,number,number], scale: 0.45, speed: 0.5, phase: 2.4   },
    { position: [-0.8, -0.5, -0.6] as [number,number,number], scale: 0.35, speed: 0.6, phase: 0.7   },
    { position: [ 0.9, -0.4,  0.8] as [number,number,number], scale: 0.4,  speed: 0.35, phase: 3.1  },
  ], [])

  return (
    <Canvas
      dpr={[1, 1.5]}
      performance={{ min: 0.5 }}
      frameloop="always"
      gl={{ antialias: false, powerPreference: 'high-performance', alpha: true }}
      camera={{ position: [0, 1, 5], fov: 45 }}
      style={{ background: 'transparent' }}
    >
      <ambientLight intensity={0.5} />
      <directionalLight position={[4, 6, 4]} intensity={1.0} />
      <directionalLight position={[-3, 2, -2]} intensity={0.3} color="#b52027" />

      {boxes.map((b, i) => (
        <Float key={i} speed={b.speed * 2} floatIntensity={0.2} rotationIntensity={0.1}>
          <MovingBox {...b} />
        </Float>
      ))}

      <Floor />
    </Canvas>
  )
}
