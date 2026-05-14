'use client'

import React, { useRef, useMemo } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import * as THREE from 'three'

const COUNT_DOTS = 800

// Globe en points instancedMesh — très léger
function GlobeDots() {
  const meshRef = useRef<THREE.InstancedMesh>(null)
  const dummy   = useMemo(() => new THREE.Object3D(), [])

  const positions = useMemo(() => {
    const pts: [number, number, number][] = []
    // Distribution de Fibonacci pour points uniformes sur sphère
    const golden = Math.PI * (3 - Math.sqrt(5))
    for (let i = 0; i < COUNT_DOTS; i++) {
      const y = 1 - (i / (COUNT_DOTS - 1)) * 2
      const r = Math.sqrt(1 - y * y)
      const theta = golden * i
      pts.push([Math.cos(theta) * r * 1.5, y * 1.5, Math.sin(theta) * r * 1.5])
    }
    return pts
  }, [])

  useFrame(({ clock }) => {
    if (!meshRef.current) return
    const t = clock.elapsedTime * 0.08
    positions.forEach(([x, y, z], i) => {
      dummy.position.set(x, y, z)
      dummy.updateMatrix()
      meshRef.current!.setMatrixAt(i, dummy.matrix)
    })
    meshRef.current.instanceMatrix.needsUpdate = true
    meshRef.current.rotation.y = t
  })

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, COUNT_DOTS]}>
      <sphereGeometry args={[0.012, 4, 4]} />
      <meshBasicMaterial color="#b52027" transparent opacity={0.6} />
    </instancedMesh>
  )
}

// Arcs de connexion (routes internationales)
function ConnectionArcs() {
  const lineObjects = useMemo(() => {
    const arcs = [
      { start: [0.4, 0.9, 0.8],  end: [0.3,  1.2,  0.5]  },
      { start: [0.4, 0.9, 0.8],  end: [0.25, 1.15, 0.4]  },
      { start: [0.4, 0.9, 0.8],  end: [0.28, 1.05, 0.55] },
    ]
    return arcs.map(({ start, end }) => {
      const points: THREE.Vector3[] = []
      for (let t = 0; t <= 1; t += 0.05) {
        const mid = new THREE.Vector3(
          (start[0]! + end[0]!) / 2,
          (start[1]! + end[1]!) / 2 + 0.5,
          (start[2]! + end[2]!) / 2,
        )
        const p = new THREE.Vector3(
          start[0]! + (end[0]! - start[0]!) * t,
          start[1]! + (end[1]! - start[1]!) * t,
          start[2]! + (end[2]! - start[2]!) * t,
        )
        p.lerp(mid, Math.sin(t * Math.PI) * 0.4)
        points.push(p.multiplyScalar(1.5))
      }
      const geo = new THREE.BufferGeometry().setFromPoints(points)
      const mat = new THREE.LineBasicMaterial({ color: '#c9a84c', transparent: true, opacity: 0.5 })
      return new THREE.Line(geo, mat)
    })
  }, [])

  return (
    <>
      {lineObjects.map((obj, i) => (
        <primitive key={i} object={obj} />
      ))}
    </>
  )
}

// Points clés (villes)
function CityDots() {
  const cities: [number, number, number][] = useMemo(() => [
    [0.6, 1.35, 1.2],  // Tunis
    [0.45, 1.8, 0.75], // Paris
    [0.38, 1.73, 0.6], // Lyon
    [0.42, 1.58, 0.83], // Marseille
    [0.5, 1.62, 1.05],  // Rome
    [0.7, 1.45, 0.9],   // Madrid
  ], [])

  const meshRef = useRef<THREE.InstancedMesh>(null)
  const dummy   = useMemo(() => new THREE.Object3D(), [])

  useFrame(({ clock }) => {
    if (!meshRef.current) return
    cities.forEach(([x, y, z], i) => {
      const pulse = 1 + Math.sin(clock.elapsedTime * 2 + i) * 0.3
      dummy.position.set(x, y, z)
      dummy.scale.setScalar(pulse)
      dummy.updateMatrix()
      meshRef.current!.setMatrixAt(i, dummy.matrix)
    })
    meshRef.current.instanceMatrix.needsUpdate = true
    meshRef.current.rotation.y = clock.elapsedTime * 0.08
  })

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, cities.length]}>
      <sphereGeometry args={[0.04, 6, 6]} />
      <meshBasicMaterial color="#ffe082" />
    </instancedMesh>
  )
}

export default function GlobeScene() {
  return (
    <Canvas
      dpr={[1, 1.5]}
      performance={{ min: 0.5 }}
      frameloop="always"
      gl={{ antialias: false, powerPreference: 'high-performance', alpha: true }}
      camera={{ position: [0, 0.5, 4.5], fov: 45 }}
      style={{ background: 'transparent' }}
    >
      <ambientLight intensity={0.3} />
      <pointLight position={[3, 3, 3]} intensity={0.8} color="#b52027" />
      <pointLight position={[-3, -1, -2]} intensity={0.4} color="#c9a84c" />

      <GlobeDots />
      <ConnectionArcs />
      <CityDots />
    </Canvas>
  )
}
