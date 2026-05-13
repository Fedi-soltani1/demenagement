'use client'

import React, { useRef, useMemo } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import * as THREE from 'three'

const ASPHALT_MAT = new THREE.MeshStandardMaterial({ color: '#111111', roughness: 0.9, metalness: 0 })
const LINE_MAT    = new THREE.MeshStandardMaterial({ color: '#c9a84c', roughness: 0.7, metalness: 0 })
const SKY_MAT     = new THREE.MeshStandardMaterial({ color: '#0a0a0a', roughness: 1, metalness: 0, side: THREE.BackSide })

// Lignes de route qui défilent (illusion de mouvement)
function RoadLines() {
  const COUNT = 12
  const linesRef = useRef<THREE.InstancedMesh>(null)
  const dummy    = useMemo(() => new THREE.Object3D(), [])
  const offsets  = useMemo(() => Array.from({ length: COUNT }, (_, i) => i * 2.5), [])

  useFrame(({ clock }) => {
    if (!linesRef.current) return
    const speed = (clock.elapsedTime * 4) % (COUNT * 2.5)
    offsets.forEach((off, i) => {
      const z = ((off - speed) % (COUNT * 2.5)) - 5
      dummy.position.set(0, 0.02, z)
      dummy.scale.set(1, 1, 1)
      dummy.updateMatrix()
      linesRef.current!.setMatrixAt(i, dummy.matrix)
    })
    linesRef.current.instanceMatrix.needsUpdate = true
  })

  return (
    <instancedMesh ref={linesRef} args={[undefined, undefined, COUNT]} material={LINE_MAT}>
      <boxGeometry args={[0.08, 0.01, 1.2]} />
    </instancedMesh>
  )
}

export default function RoadScene() {
  return (
    <Canvas
      dpr={[1, 1.5]}
      performance={{ min: 0.5 }}
      frameloop="always"
      gl={{ antialias: false, powerPreference: 'high-performance', alpha: true }}
      camera={{ position: [0, 1.2, 4], fov: 55, near: 0.1, far: 50 }}
      style={{ background: 'transparent' }}
    >
      <ambientLight intensity={0.3} />
      <directionalLight position={[5, 8, -10]} intensity={0.8} color="#c9a84c" />
      <pointLight position={[0, 3, 5]} intensity={0.4} color="#b52027" distance={12} />

      {/* Route */}
      <mesh
        material={ASPHALT_MAT}
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, 0, 0]}
        receiveShadow={false}
      >
        <planeGeometry args={[3, 40]} />
      </mesh>

      {/* Bordures route */}
      <mesh material={new THREE.MeshStandardMaterial({ color: '#ffffff', roughness: 0.8 })} position={[-1.55, 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[0.04, 40]} />
      </mesh>
      <mesh material={new THREE.MeshStandardMaterial({ color: '#ffffff', roughness: 0.8 })} position={[1.55, 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[0.04, 40]} />
      </mesh>

      {/* Lignes centrales animées */}
      <RoadLines />

      {/* Sol côtés */}
      <mesh material={new THREE.MeshStandardMaterial({ color: '#0d0d0d', roughness: 1 })} rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]}>
        <planeGeometry args={[30, 40]} />
      </mesh>

      {/* Horizon (skybox partiel) */}
      <mesh material={SKY_MAT} position={[0, 2, 0]}>
        <sphereGeometry args={[25, 12, 8]} />
      </mesh>
    </Canvas>
  )
}
