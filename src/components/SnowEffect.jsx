import React, { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

function SnowEffect() {
  const pointsRef = useRef()

  const { positions, velocities } = useMemo(() => {
    const count = 1000
    const positions = new Float32Array(count * 3)
    const velocities = []

    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 30
      positions[i * 3 + 1] = Math.random() * 20
      positions[i * 3 + 2] = (Math.random() - 0.5) * 30

      velocities.push({
        y: 0.5 + Math.random() * 0.5,
        x: (Math.random() - 0.5) * 0.1,
        phase: Math.random() * Math.PI * 2
      })
    }

    return { positions, velocities }
  }, [])

  useFrame((state) => {
    if (!pointsRef.current) return

    const posArray = pointsRef.current.geometry.attributes.position.array
    const time = state.clock.elapsedTime

    for (let i = 0; i < velocities.length; i++) {
      const vel = velocities[i]

      posArray[i * 3] += Math.sin(time + vel.phase) * 0.01 + vel.x * 0.1
      posArray[i * 3 + 1] -= vel.y * 0.02

      if (posArray[i * 3 + 1] < -2) {
        posArray[i * 3 + 1] = 15 + Math.random() * 5
        posArray[i * 3] = (Math.random() - 0.5) * 30
        posArray[i * 3 + 2] = (Math.random() - 0.5) * 30
      }
    }

    pointsRef.current.geometry.attributes.position.needsUpdate = true
  })

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={positions.length / 3}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.08}
        color="#ffffff"
        transparent
        opacity={0.8}
        sizeAttenuation
        blending={THREE.AdditiveBlending}
      />
    </points>
  )
}

export default SnowEffect
