import React, { useRef, useMemo, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

function ParticleExplosion({ position }) {
  const pointsRef = useRef()
  const [startTime] = useState(() => Date.now())

  const { positions, velocities, colors } = useMemo(() => {
    const count = 150
    const positions = new Float32Array(count * 3)
    const velocities = []
    const colors = new Float32Array(count * 3)

    const colorPalette = [
      new THREE.Color('#ff0000'),
      new THREE.Color('#ffd700'),
      new THREE.Color('#00ff00'),
      new THREE.Color('#ff69b4'),
      new THREE.Color('#00ffff'),
      new THREE.Color('#ff8c00'),
      new THREE.Color('#9932cc'),
    ]

    for (let i = 0; i < count; i++) {
      positions[i * 3] = position[0]
      positions[i * 3 + 1] = position[1]
      positions[i * 3 + 2] = position[2]

      const theta = Math.random() * Math.PI * 2
      const phi = Math.random() * Math.PI
      const speed = 2 + Math.random() * 3

      velocities.push({
        x: Math.sin(phi) * Math.cos(theta) * speed,
        y: Math.sin(phi) * Math.sin(theta) * speed,
        z: Math.cos(phi) * speed
      })

      const color = colorPalette[Math.floor(Math.random() * colorPalette.length)]
      colors[i * 3] = color.r
      colors[i * 3 + 1] = color.g
      colors[i * 3 + 2] = color.b
    }

    return { positions, velocities, colors }
  }, [position])

  useFrame(() => {
    if (!pointsRef.current) return

    const elapsed = (Date.now() - startTime) / 1000
    const posArray = pointsRef.current.geometry.attributes.position.array

    for (let i = 0; i < velocities.length; i++) {
      const vel = velocities[i]

      posArray[i * 3] = position[0] + vel.x * elapsed
      posArray[i * 3 + 1] = position[1] + vel.y * elapsed - 0.5 * 9.8 * elapsed * elapsed * 0.1
      posArray[i * 3 + 2] = position[2] + vel.z * elapsed
    }

    pointsRef.current.geometry.attributes.position.needsUpdate = true

    const opacity = Math.max(0, 1 - elapsed / 2)
    pointsRef.current.material.opacity = opacity
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
        <bufferAttribute
          attach="attributes-color"
          count={colors.length / 3}
          array={colors}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.15}
        vertexColors
        transparent
        opacity={1}
        sizeAttenuation
        blending={THREE.AdditiveBlending}
      />
    </points>
  )
}

export default ParticleExplosion
