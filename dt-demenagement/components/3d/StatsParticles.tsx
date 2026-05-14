'use client'

import React, { useRef, useMemo } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import * as THREE from 'three'

const COUNT = 200

// Generated at module load — avoids Math.random during render (react-hooks/purity)
// pos is intentionally mutable (particles drift continuously in useFrame)
const DOTS_DATA = (() => {
  const pos: [number, number, number][] = []
  const vel: [number, number, number][] = []
  for (let i = 0; i < COUNT; i++) {
    pos.push([(Math.random() - 0.5) * 8, (Math.random() - 0.5) * 4, (Math.random() - 0.5) * 2 - 1])
    vel.push([(Math.random() - 0.5) * 0.004, (Math.random() - 0.5) * 0.003, 0])
  }
  return { pos, vel }
})()

function FloatingDots() {
  const meshRef = useRef<THREE.InstancedMesh>(null)
  const dummy   = useMemo(() => new THREE.Object3D(), [])

  useFrame(() => {
    if (!meshRef.current) return
    DOTS_DATA.pos.forEach((p, i) => {
      p[0] += DOTS_DATA.vel[i]![0]
      p[1] += DOTS_DATA.vel[i]![1]
      if (p[0] > 4 || p[0] < -4) DOTS_DATA.vel[i]![0] *= -1
      if (p[1] > 2 || p[1] < -2) DOTS_DATA.vel[i]![1] *= -1
      dummy.position.set(...p)
      dummy.updateMatrix()
      meshRef.current!.setMatrixAt(i, dummy.matrix)
    })
    meshRef.current.instanceMatrix.needsUpdate = true
  })

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, COUNT]}>
      <sphereGeometry args={[0.012, 4, 4]} />
      <meshBasicMaterial color="#c9a84c" transparent opacity={0.5} />
    </instancedMesh>
  )
}

export default function StatsParticles() {
  return (
    <Canvas
      dpr={[1, 1.5]}
      performance={{ min: 0.5 }}
      frameloop="always"
      gl={{ antialias: false, powerPreference: 'high-performance', alpha: true }}
      camera={{ position: [0, 0, 5], fov: 60 }}
      style={{ background: 'transparent', position: 'absolute', inset: 0, pointerEvents: 'none' }}
    >
      <FloatingDots />
    </Canvas>
  )
}
