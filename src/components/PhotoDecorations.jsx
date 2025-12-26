import React, { useRef, useMemo } from 'react'
import { useFrame, useLoader } from '@react-three/fiber'
import * as THREE from 'three'

function PhotoOrnament({ url, position, rotation, isRotating }) {
  const meshRef = useRef()
  const frameRef = useRef()

  const texture = useMemo(() => {
    const tex = new THREE.TextureLoader().load(url)
    tex.colorSpace = THREE.SRGBColorSpace
    return tex
  }, [url])

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = isRotating
        ? state.clock.elapsedTime * 0.3 + rotation
        : rotation

      const hover = Math.sin(state.clock.elapsedTime * 2 + rotation) * 0.05
      meshRef.current.position.y = position[1] + hover
    }
  })

  return (
    <group ref={meshRef} position={position}>
      <mesh ref={frameRef}>
        <boxGeometry args={[0.55, 0.55, 0.05]} />
        <meshStandardMaterial
          color="#ffd700"
          metalness={0.8}
          roughness={0.2}
        />
      </mesh>

      <mesh position={[0, 0, 0.03]}>
        <planeGeometry args={[0.45, 0.45]} />
        <meshStandardMaterial
          map={texture}
          side={THREE.DoubleSide}
        />
      </mesh>

      <mesh position={[0, 0.35, 0]}>
        <torusGeometry args={[0.05, 0.015, 8, 16]} />
        <meshStandardMaterial color="#ffd700" metalness={0.9} roughness={0.1} />
      </mesh>

      <pointLight
        position={[0, 0, 0.2]}
        color="#fffacd"
        intensity={0.3}
        distance={1}
      />
    </group>
  )
}

function PhotoDecorations({ photos, isRotating }) {
  if (!photos || photos.length === 0) return null

  return (
    <group>
      {photos.map((photo) => (
        <PhotoOrnament
          key={photo.id}
          url={photo.url}
          position={photo.position}
          rotation={photo.rotation}
          isRotating={isRotating}
        />
      ))}
    </group>
  )
}

export default PhotoDecorations
