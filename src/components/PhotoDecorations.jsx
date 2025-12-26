import React, { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

function PhotoOrnament({ url, position, rotation, isRotating, isTreeExploded }) {
  const meshRef = useRef()
  const frameRef = useRef()

  const texture = useMemo(() => {
    const tex = new THREE.TextureLoader().load(url)
    tex.colorSpace = THREE.SRGBColorSpace
    return tex
  }, [url])

  // "Explode outward" logic
  const { originalPos, targetPos, outwardRotation, phase } = useMemo(() => {
    const posVec = new THREE.Vector3(...position)
    
    // Calculate outward rotation
    // Vector from center (at same height) to position
    const center = new THREE.Vector3(0, posVec.y, 0)
    const direction = new THREE.Vector3().subVectors(posVec, center).normalize()
    
    // Calculate target for explosion
    const target = posVec.clone().add(direction.multiplyScalar(8 + Math.random() * 8))
    
    // Calculate rotation to face OUTWARD
    // Objects usually face +Z. We want +Z of the object to point along 'direction'.
    // lookAt makes +Z point to target.
    // So if we put a dummy object at posVec and tell it to look at (posVec + direction), it faces out.
    const dummy = new THREE.Object3D()
    dummy.position.copy(posVec)
    dummy.lookAt(posVec.clone().add(direction))
    
    return {
      originalPos: posVec,
      targetPos: target,
      outwardRotation: dummy.rotation.y,
      phase: Math.random() * Math.PI * 2
    }
  }, [position])


  useFrame((state, delta) => {
    if (!meshRef.current) return

    // 1. Rotation Logic
    if (isTreeExploded) {
       // Stop rotating when exploded, maybe slowly drift rotation?
       meshRef.current.rotation.y = outwardRotation + Math.sin(state.clock.elapsedTime * 0.5 + phase) * 0.1
    } else {
       // "Photos now face outward from tree" - implies fixed orientation relative to tree center
       // "Photos only visible when facing the viewer" handled by FrontSide
       // Do we still want them to spin around the tree?
       // App.jsx passes `isRotating` which spins the whole <ChristmasTree /> group usually?
       // Wait, `PhotoDecorations` is OUTSIDE <ChristmasTree /> in App.jsx.
       // So `PhotoOrnament` handles its own rotation around the center?
       
       // Previous code:
       // meshRef.current.rotation.y = isRotating ? state.clock.elapsedTime * 0.3 + rotation : rotation
       // This rotated the PHOTO itself (spinning like a coin), NOT orbiting the tree.
       // If the tree rotates, photos should probably orbit with it if attached.
       // But here they are independent.
       
       // "Photos now face outward from tree"
       // I will force them to face outward.
       // And they should probably orbit the tree center if `isRotating` is true?
       // The previous code didn't orbit, it just spun the frame in place.
       
       // Let's make them Orbit properly to match the tree rotation.
       if (isRotating) {
         // To orbit, we need to update position X/Z
         const speed = 0.2 // match tree speed roughly
         const angle = state.clock.elapsedTime * speed + (rotation || 0) // usage of 'rotation' prop as initial angle offset
         const r = Math.sqrt(originalPos.x**2 + originalPos.z**2)
         
         const x = Math.cos(angle) * r
         const z = Math.sin(angle) * r
         
         // Update originalPos reference for lerping
         // This is tricky because originalPos is constant in useMemo.
         // Let's just calculate "current orbit pos"
         
         const orbitPos = new THREE.Vector3(x, originalPos.y, z)
         
         // Face outward from new pos
         const dir = orbitPos.clone().sub(new THREE.Vector3(0, originalPos.y, 0)).normalize()
         const dummy = new THREE.Object3D(); dummy.position.copy(orbitPos); dummy.lookAt(orbitPos.clone().add(dir));
         
         if (!isTreeExploded) {
             meshRef.current.position.copy(orbitPos)
             meshRef.current.rotation.y = dummy.rotation.y
             
             // Add hover
             meshRef.current.position.y += Math.sin(state.clock.elapsedTime * 2 + phase) * 0.05
         }
       } else {
         // Static
         if (!isTreeExploded) {
            meshRef.current.position.copy(originalPos)
            meshRef.current.rotation.y = outwardRotation
         }
       }
    }

    // 2. Explosion Lerp
    if (isTreeExploded) {
        const floatY = Math.sin(state.clock.elapsedTime + phase) * 0.5
        const floatPos = new THREE.Vector3(targetPos.x, targetPos.y + floatY, targetPos.z)
        
        // Lerp
        const speed = 2.0
        meshRef.current.position.lerp(floatPos, delta * speed)
    } else if (!isRotating) { // If rotating, position is handled above
        meshRef.current.position.lerp(originalPos, delta * 1.5)
        meshRef.current.rotation.y = outwardRotation // Restore rotation
    }
  })

  return (
    <group ref={meshRef} position={position}>
      {/* Frame / Backplate */}
      <mesh ref={frameRef}>
        <boxGeometry args={[0.6, 0.6, 0.1]} /> {/* Thicker backplate */}
        <meshStandardMaterial
          color="#ffd700"
          metalness={0.8}
          roughness={0.2}
        />
      </mesh>

      {/* Photo Plane */}
      <mesh position={[0, 0, 0.06]}> {/* Slightly in front of 0.1/2 = 0.05 */}
        <planeGeometry args={[0.5, 0.5]} />
        <meshStandardMaterial
          map={texture}
          side={THREE.FrontSide} /* "Use FrontSide rendering" */
        />
      </mesh>

      {/* Loop for hanging */}
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

function PhotoDecorations({ photos, isRotating, isTreeExploded }) {
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
          isTreeExploded={isTreeExploded}
        />
      ))}
    </group>
  )
}

export default PhotoDecorations