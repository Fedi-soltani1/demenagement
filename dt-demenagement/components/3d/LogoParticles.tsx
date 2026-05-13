'use client'

import React, { useRef, useMemo, useEffect } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import * as THREE from 'three'

const COUNT = 300

function Particles() {
  const meshRef = useRef<THREE.InstancedMesh>(null)
  const dummy   = useMemo(() => new THREE.Object3D(), [])

  const data = useMemo(() => {
    const positions: [number, number, number][] = []
    const speeds: number[] = []
    const phases: number[] = []
    for (let i = 0; i < COUNT; i++) {
      const angle = (i / COUNT) * Math.PI * 2
      const r = 1.2 + Math.random() * 0.8
      positions.push([Math.cos(angle) * r, (Math.random() - 0.5) * 2, Math.sin(angle) * r])
      speeds.push(0.3 + Math.random() * 0.7)
      phases.push(Math.random() * Math.PI * 2)
    }
    return { positions, speeds, phases }
  }, [])

  useFrame(({ clock }) => {
    if (!meshRef.current) return
    const t = clock.elapsedTime
    data.positions.forEach(([x, y, z], i) => {
      const s = data.speeds[i]!
      const ph = data.phases[i]!
      dummy.position.set(
        x + Math.sin(t * s + ph) * 0.1,
        y + Math.cos(t * s * 0.7 + ph) * 0.15,
        z + Math.sin(t * s * 0.5 + ph) * 0.1,
      )
      const scale = 0.6 + Math.sin(t * s + ph) * 0.4
      dummy.scale.setScalar(Math.max(0.1, scale))
      dummy.updateMatrix()
      meshRef.current!.setMatrixAt(i, dummy.matrix)
    })
    meshRef.current.instanceMatrix.needsUpdate = true
    meshRef.current.rotation.y = t * 0.12
  })

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, COUNT]}>
      <sphereGeometry args={[0.018, 4, 4]} />
      <meshBasicMaterial color="#b52027" transparent opacity={0.75} />
    </instancedMesh>
  )
}

function GoldRing() {
  const meshRef = useRef<THREE.Mesh>(null)
  useFrame(({ clock }) => {
    if (!meshRef.current) return
    meshRef.current.rotation.x = clock.elapsedTime * 0.2
    meshRef.current.rotation.z = clock.elapsedTime * 0.15
  })
  return (
    <mesh ref={meshRef}>
      <torusGeometry args={[1.6, 0.012, 8, 80]} />
      <meshBasicMaterial color="#c9a84c" transparent opacity={0.35} />
    </mesh>
  )
}

export default function LogoParticles() {
  return (
    <Canvas
      dpr={[1, 1.5]}
      performance={{ min: 0.5 }}
      frameloop="always"
      gl={{ antialias: false, powerPreference: 'high-performance', alpha: true }}
      camera={{ position: [0, 0, 4.5], fov: 50 }}
      style={{ background: 'transparent' }}
    >
      <Particles />
      <GoldRing />
    </Canvas>
  )
}
