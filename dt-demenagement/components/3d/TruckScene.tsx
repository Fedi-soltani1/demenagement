'use client'

import React, { useRef, useMemo } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Environment, Float } from '@react-three/drei'
import * as THREE from 'three'

// Camion stylisé — ~800 polygones (budget : 5000)
function TruckMesh() {
  const groupRef = useRef<THREE.Group>(null)

  useFrame((state) => {
    if (!groupRef.current) return
    groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.3) * 0.15
    groupRef.current.position.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.05
  })

  const red   = new THREE.MeshStandardMaterial({ color: '#b52027', metalness: 0.4, roughness: 0.3 })
  const dark  = new THREE.MeshStandardMaterial({ color: '#1a1a1a', metalness: 0.8, roughness: 0.2 })
  const glass = new THREE.MeshStandardMaterial({ color: '#4fc3f7', metalness: 0.1, roughness: 0.1, transparent: true, opacity: 0.6 })
  const grey  = new THREE.MeshStandardMaterial({ color: '#333333', metalness: 0.6, roughness: 0.4 })
  const light = new THREE.MeshStandardMaterial({ color: '#ffe082', emissive: '#ffe082', emissiveIntensity: 0.8 })

  return (
    <group ref={groupRef} position={[0, -0.3, 0]}>
      {/* Remorque */}
      <mesh material={red} position={[0.6, 0.5, 0]}>
        <boxGeometry args={[2.4, 1.0, 1.0]} />
      </mesh>
      {/* Cabine */}
      <mesh material={red} position={[-0.9, 0.35, 0]}>
        <boxGeometry args={[0.9, 0.7, 0.95]} />
      </mesh>
      {/* Pare-brise */}
      <mesh material={glass} position={[-1.26, 0.48, 0]} rotation={[0, 0, 0.35]}>
        <boxGeometry args={[0.02, 0.45, 0.75]} />
      </mesh>
      {/* Châssis */}
      <mesh material={dark} position={[0.2, -0.08, 0]}>
        <boxGeometry args={[3.2, 0.12, 0.85]} />
      </mesh>
      {/* Phares avant */}
      <mesh material={light} position={[-1.38, 0.2, 0.32]}>
        <boxGeometry args={[0.05, 0.1, 0.12]} />
      </mesh>
      <mesh material={light} position={[-1.38, 0.2, -0.32]}>
        <boxGeometry args={[0.05, 0.1, 0.12]} />
      </mesh>
      {/* Roues */}
      {([
        [-0.8, -0.22, 0.52], [-0.8, -0.22, -0.52],
        [ 0.4, -0.22,  0.52], [ 0.4, -0.22, -0.52],
        [ 1.3, -0.22,  0.52], [ 1.3, -0.22, -0.52],
      ] as [number, number, number][]).map(([x, y, z], i) => (
        <mesh key={i} material={dark} position={[x, y, z]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.22, 0.22, 0.18, 12]} />
        </mesh>
      ))}
      {/* Jantes */}
      {([
        [-0.8, -0.22, 0.52], [-0.8, -0.22, -0.52],
        [ 0.4, -0.22,  0.52], [ 0.4, -0.22, -0.52],
        [ 1.3, -0.22,  0.52], [ 1.3, -0.22, -0.52],
      ] as [number, number, number][]).map(([x, y, z], i) => (
        <mesh key={`rim-${i}`} material={grey} position={[x, y, z + (z > 0 ? 0.01 : -0.01)]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.12, 0.12, 0.02, 8]} />
        </mesh>
      ))}
      {/* Ligne décorative DT */}
      <mesh material={new THREE.MeshStandardMaterial({ color: '#c9a84c', metalness: 0.7, roughness: 0.2 })} position={[0.6, 0.02, 0.501]}>
        <boxGeometry args={[2.2, 0.04, 0.01]} />
      </mesh>
    </group>
  )
}

// Particules de fond — InstancedMesh (0 draw calls supplémentaires)
function BackgroundParticles() {
  const count = 120
  const meshRef = useRef<THREE.InstancedMesh>(null)
  const dummy = useMemo(() => new THREE.Object3D(), [])

  const positions = useMemo(() => {
    const arr: [number, number, number][] = []
    for (let i = 0; i < count; i++) {
      arr.push([
        (Math.random() - 0.5) * 12,
        (Math.random() - 0.5) * 8,
        (Math.random() - 0.5) * 6 - 2,
      ])
    }
    return arr
  }, [])

  useFrame((state) => {
    if (!meshRef.current) return
    positions.forEach(([x, y, z], i) => {
      const t = state.clock.elapsedTime * 0.15 + i * 0.3
      dummy.position.set(x, y + Math.sin(t) * 0.2, z)
      dummy.scale.setScalar(0.5 + Math.sin(t * 1.5) * 0.2)
      dummy.updateMatrix()
      meshRef.current!.setMatrixAt(i, dummy.matrix)
    })
    meshRef.current.instanceMatrix.needsUpdate = true
  })

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, count]}>
      <sphereGeometry args={[0.02, 4, 4]} />
      <meshBasicMaterial color="#b52027" transparent opacity={0.4} />
    </instancedMesh>
  )
}

export default function TruckScene() {
  return (
    <Canvas
      dpr={[1, 1.5]}
      performance={{ min: 0.5 }}
      frameloop="always"
      gl={{ antialias: false, powerPreference: 'high-performance', alpha: true }}
      camera={{ position: [3, 1.5, 4], fov: 40 }}
      style={{ background: 'transparent' }}
    >
      <ambientLight intensity={0.4} />
      <directionalLight position={[5, 8, 5]} intensity={1.2} color="#ffffff" castShadow={false} />
      <directionalLight position={[-3, 2, -3]} intensity={0.3} color="#b52027" />
      <pointLight position={[0, 4, 0]} intensity={0.5} color="#c9a84c" distance={8} />

      <Float speed={1.5} rotationIntensity={0.05} floatIntensity={0.3}>
        <TruckMesh />
      </Float>

      <BackgroundParticles />

      <Environment preset="night" />
    </Canvas>
  )
}
