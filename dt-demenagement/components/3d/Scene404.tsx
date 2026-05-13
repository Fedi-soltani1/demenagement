'use client'

import React, { useRef, useMemo } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Float } from '@react-three/drei'
import * as THREE from 'three'

const COUNT_DEBRIS = 18

function LostBox({ pos, rot, scale, speed }: {
  pos: [number, number, number]
  rot: [number, number, number]
  scale: number
  speed: number
}) {
  const meshRef = useRef<THREE.Mesh>(null)
  useFrame(({ clock }) => {
    if (!meshRef.current) return
    const t = clock.elapsedTime * speed
    meshRef.current.rotation.x = rot[0] + t * 0.7
    meshRef.current.rotation.y = rot[1] + t * 0.5
    meshRef.current.rotation.z = rot[2] + t * 0.3
  })
  return (
    <mesh ref={meshRef} position={pos}>
      <boxGeometry args={[scale, scale, scale]} />
      <meshStandardMaterial color="#b52027" metalness={0.3} roughness={0.6} />
    </mesh>
  )
}

function DebrisParticles() {
  const meshRef = useRef<THREE.InstancedMesh>(null)
  const dummy   = useMemo(() => new THREE.Object3D(), [])

  const data = useMemo(() => Array.from({ length: COUNT_DEBRIS }, () => ({
    pos: [(Math.random() - 0.5) * 8, (Math.random() - 0.5) * 5, (Math.random() - 0.5) * 3] as [number,number,number],
    speed: 0.2 + Math.random() * 0.5,
    phase: Math.random() * Math.PI * 2,
  })), [])

  useFrame(({ clock }) => {
    if (!meshRef.current) return
    data.forEach(({ pos, speed, phase }, i) => {
      const t = clock.elapsedTime * speed + phase
      dummy.position.set(pos[0] + Math.sin(t) * 0.3, pos[1] + Math.cos(t * 0.7) * 0.4, pos[2])
      dummy.rotation.set(t, t * 0.8, t * 0.6)
      dummy.updateMatrix()
      meshRef.current!.setMatrixAt(i, dummy.matrix)
    })
    meshRef.current.instanceMatrix.needsUpdate = true
  })

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, COUNT_DEBRIS]}>
      <boxGeometry args={[0.08, 0.08, 0.08]} />
      <meshBasicMaterial color="#c9a84c" transparent opacity={0.5} />
    </instancedMesh>
  )
}

// Grand "?" stylisé
function QuestionMark() {
  const groupRef = useRef<THREE.Group>(null)
  const mat = useMemo(() => new THREE.MeshStandardMaterial({ color: '#b52027', metalness: 0.3, roughness: 0.4 }), [])

  useFrame(({ clock }) => {
    if (!groupRef.current) return
    groupRef.current.rotation.y = Math.sin(clock.elapsedTime * 0.4) * 0.3
    groupRef.current.position.y = Math.sin(clock.elapsedTime * 0.6) * 0.1
  })

  return (
    <group ref={groupRef}>
      {/* Arc supérieur du ? */}
      <mesh material={mat} position={[0.15, 0.7, 0]}>
        <torusGeometry args={[0.35, 0.1, 6, 12, Math.PI * 1.4]} />
      </mesh>
      {/* Tige */}
      <mesh material={mat} position={[0, 0.1, 0]}>
        <boxGeometry args={[0.1, 0.55, 0.1]} />
      </mesh>
      {/* Point bas */}
      <mesh material={mat} position={[0, -0.45, 0]}>
        <sphereGeometry args={[0.1, 6, 6]} />
      </mesh>
    </group>
  )
}

export default function Scene404() {
  const boxes = useMemo(() => [
    { pos: [-2.5,  0.2, 0] as [number,number,number], rot: [0.2, 0.5, 0.1] as [number,number,number], scale: 0.65, speed: 0.3 },
    { pos: [ 2.3, -0.3, 0] as [number,number,number], rot: [0.8, 0.2, 0.4] as [number,number,number], scale: 0.5,  speed: 0.25 },
    { pos: [ 0,    1.5, 0] as [number,number,number], rot: [0.1, 0.9, 0.2] as [number,number,number], scale: 0.4,  speed: 0.4  },
    { pos: [-1.5, -1.2, 0] as [number,number,number], rot: [0.6, 0.3, 0.7] as [number,number,number], scale: 0.55, speed: 0.35 },
    { pos: [ 1.8,  1.0, 0] as [number,number,number], rot: [0.4, 0.7, 0.3] as [number,number,number], scale: 0.38, speed: 0.45 },
  ], [])

  return (
    <Canvas
      dpr={[1, 1.5]}
      performance={{ min: 0.5 }}
      frameloop="always"
      gl={{ antialias: false, powerPreference: 'high-performance', alpha: true }}
      camera={{ position: [0, 0, 6], fov: 50 }}
      style={{ background: 'transparent' }}
    >
      <ambientLight intensity={0.4} />
      <directionalLight position={[5, 8, 5]} intensity={1.0} />
      <directionalLight position={[-4, 2, -3]} intensity={0.4} color="#b52027" />
      <pointLight position={[0, 0, 4]} intensity={0.6} color="#c9a84c" distance={8} />

      <Float speed={1.5} floatIntensity={0.3} rotationIntensity={0.1}>
        <QuestionMark />
      </Float>

      {boxes.map((b, i) => (
        <Float key={i} speed={b.speed * 3} floatIntensity={0.2}>
          <LostBox {...b} />
        </Float>
      ))}

      <DebrisParticles />
    </Canvas>
  )
}
