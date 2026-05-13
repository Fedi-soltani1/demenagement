'use client'

import React, { useRef, useCallback, useState } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'

interface CardMeshProps {
  hovered: boolean
}

function CardMesh({ hovered }: CardMeshProps) {
  const meshRef = useRef<THREE.Mesh>(null)

  const targetRotX = useRef(0)
  const targetRotY = useRef(0)

  useFrame(({ mouse, clock }) => {
    if (!meshRef.current) return

    if (hovered) {
      targetRotX.current = -mouse.y * 0.25
      targetRotY.current =  mouse.x * 0.25
    } else {
      targetRotX.current = Math.sin(clock.elapsedTime * 0.6) * 0.05
      targetRotY.current = Math.sin(clock.elapsedTime * 0.4) * 0.08
    }

    meshRef.current.rotation.x += (targetRotX.current - meshRef.current.rotation.x) * 0.08
    meshRef.current.rotation.y += (targetRotY.current - meshRef.current.rotation.y) * 0.08
  })

  return (
    <mesh ref={meshRef}>
      <boxGeometry args={[2.6, 1.6, 0.06]} />
      <meshStandardMaterial
        color={hovered ? '#1e0304' : '#120102'}
        metalness={0.5}
        roughness={0.3}
        emissive={hovered ? '#b52027' : '#300a0a'}
        emissiveIntensity={hovered ? 0.15 : 0.05}
      />
    </mesh>
  )
}

function CardScene({ hovered }: { hovered: boolean }) {
  return (
    <>
      <ambientLight intensity={0.5} />
      <directionalLight position={[3, 4, 3]} intensity={0.8} />
      {hovered && <pointLight position={[0, 0, 2]} intensity={1.2} color="#b52027" distance={4} />}
      <CardMesh hovered={hovered} />
    </>
  )
}

interface ServiceCard3DProps {
  children: React.ReactNode
  className?: string
}

export function ServiceCard3D({ children, className = '' }: ServiceCard3DProps) {
  const [hovered, setHovered] = useState(false)

  return (
    <div
      className={`relative overflow-hidden ${className}`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div className="absolute inset-0 z-0">
        <Canvas
          dpr={[1, 1.5]}
          performance={{ min: 0.5 }}
          frameloop={hovered ? 'always' : 'demand'}
          gl={{ antialias: false, powerPreference: 'high-performance', alpha: true }}
          camera={{ position: [0, 0, 3], fov: 50 }}
          style={{ background: 'transparent' }}
        >
          <CardScene hovered={hovered} />
        </Canvas>
      </div>
      <div className="relative z-10">
        {children}
      </div>
    </div>
  )
}
