import React, { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

function TreeLayer({ radius, height, y, color }) {
  return (
    <mesh position={[0, y, 0]} castShadow>
      <coneGeometry args={[radius, height, 32]} />
      <meshStandardMaterial
        color={color}
        roughness={0.8}
        metalness={0.1}
      />
    </mesh>
  )
}

function TreeTrunk() {
  return (
    <mesh position={[0, -0.5, 0]}>
      <cylinderGeometry args={[0.3, 0.4, 1, 16]} />
      <meshStandardMaterial color="#4a3728" roughness={0.9} />
    </mesh>
  )
}

function TreeStar() {
  const starRef = useRef()

  useFrame((state) => {
    if (starRef.current) {
      starRef.current.rotation.y += 0.02
      starRef.current.scale.setScalar(1 + Math.sin(state.clock.elapsedTime * 2) * 0.1)
    }
  })

  return (
    <group ref={starRef} position={[0, 5.5, 0]}>
      <mesh>
        <octahedronGeometry args={[0.3, 0]} />
        <meshStandardMaterial
          color="#ffd700"
          emissive="#ffd700"
          emissiveIntensity={0.8}
          metalness={0.8}
          roughness={0.2}
        />
      </mesh>
      <pointLight color="#ffd700" intensity={2} distance={3} />
    </group>
  )
}

function Ornaments() {
  const ornaments = useMemo(() => {
    const items = []
    const colors = ['#ff0000', '#ffd700', '#00ff00', '#0099ff', '#ff69b4', '#9932cc']

    for (let i = 0; i < 30; i++) {
      const layer = Math.floor(i / 10)
      const angle = (i % 10) * (Math.PI * 2 / 10) + layer * 0.3
      const radius = 1.2 - layer * 0.3
      const y = 1 + layer * 1.5

      items.push({
        position: [
          Math.cos(angle) * radius,
          y + Math.random() * 0.5,
          Math.sin(angle) * radius
        ],
        color: colors[Math.floor(Math.random() * colors.length)],
        scale: 0.08 + Math.random() * 0.06
      })
    }
    return items
  }, [])

  return (
    <>
      {ornaments.map((orn, i) => (
        <mesh key={i} position={orn.position}>
          <sphereGeometry args={[orn.scale, 16, 16]} />
          <meshStandardMaterial
            color={orn.color}
            metalness={0.9}
            roughness={0.1}
            emissive={orn.color}
            emissiveIntensity={0.3}
          />
        </mesh>
      ))}
    </>
  )
}

function Lights() {
  const lightsRef = useRef()

  const lights = useMemo(() => {
    const items = []
    for (let i = 0; i < 40; i++) {
      const t = i / 40
      const spirals = 4
      const angle = t * Math.PI * 2 * spirals
      const radius = 1.5 - t * 1.2
      const y = t * 4 + 0.5

      items.push({
        position: [
          Math.cos(angle) * radius,
          y,
          Math.sin(angle) * radius
        ],
        phase: Math.random() * Math.PI * 2
      })
    }
    return items
  }, [])

  useFrame((state) => {
    if (lightsRef.current) {
      lightsRef.current.children.forEach((light, i) => {
        const intensity = 0.5 + Math.sin(state.clock.elapsedTime * 3 + lights[i].phase) * 0.5
        light.material.emissiveIntensity = intensity
      })
    }
  })

  return (
    <group ref={lightsRef}>
      {lights.map((light, i) => (
        <mesh key={i} position={light.position}>
          <sphereGeometry args={[0.03, 8, 8]} />
          <meshStandardMaterial
            color="#ffffcc"
            emissive="#ffff00"
            emissiveIntensity={0.5}
          />
        </mesh>
      ))}
    </group>
  )
}

function ChristmasTree({ isRotating }) {
  const groupRef = useRef()

  useFrame((state, delta) => {
    if (groupRef.current && isRotating) {
      groupRef.current.rotation.y += delta * 0.3
    }
  })

  return (
    <group ref={groupRef}>
      <TreeTrunk />

      <TreeLayer radius={2} height={2} y={1} color="#1a5c1a" />
      <TreeLayer radius={1.6} height={1.8} y={2.2} color="#228b22" />
      <TreeLayer radius={1.2} height={1.6} y={3.2} color="#2e8b2e" />
      <TreeLayer radius={0.8} height={1.4} y={4.1} color="#32cd32" />
      <TreeLayer radius={0.4} height={1} y={4.8} color="#3cb371" />

      <TreeStar />
      <Ornaments />
      <Lights />
    </group>
  )
}

export default ChristmasTree
