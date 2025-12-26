import React, { useRef, useMemo, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

function ParticleTree({ isTreeExploded }) {
  const pointsRef = useRef()
  const count = 12000 // 1.5x denser (assuming 8000 was baseline)
  
  const { positions, colors, targetPositions, phases } = useMemo(() => {
    const positions = new Float32Array(count * 3)
    const colors = new Float32Array(count * 3)
    const targetPositions = new Float32Array(count * 3)
    const phases = new Float32Array(count)
    
    const green = new THREE.Color('#2e8b57')
    const darkGreen = new THREE.Color('#1a4d2e')
    const snowy = new THREE.Color('#f0f8ff')

    for (let i = 0; i < count; i++) {
      // 1. Generate Tree Shape (Cone)
      // "Even vertical distribution" -> Random height uniform
      const h = Math.random() * 7.5 // Height 7.5
      const relativeH = h / 7.5
      
      // Radius decreases as height increases
      const maxR = 3.5
      const r = (1 - relativeH) * maxR * Math.sqrt(Math.random()) // sqrt for even area distribution inside cone volume
      const angle = Math.random() * Math.PI * 2
      
      const x = Math.cos(angle) * r
      const y = h - 1.0 // Offset y to center roughly
      const z = Math.sin(angle) * r
      
      positions[i * 3] = x
      positions[i * 3 + 1] = y
      positions[i * 3 + 2] = z
      
      // 2. Colors
      // Mix of greens and some snow tips
      const isSnow = Math.random() > 0.85
      const color = isSnow ? snowy : (Math.random() > 0.5 ? green : darkGreen)
      
      colors[i * 3] = color.r
      colors[i * 3 + 1] = color.g
      colors[i * 3 + 2] = color.b

      // 3. Explosion Targets
      // Explode outward from center
      const dir = new THREE.Vector3(x, y, z).normalize()
      const explodeDist = 5 + Math.random() * 15
      
      targetPositions[i * 3] = x + dir.x * explodeDist
      targetPositions[i * 3 + 1] = y + dir.y * explodeDist + (Math.random() - 0.5) * 5
      targetPositions[i * 3 + 2] = z + dir.z * explodeDist

      // 4. Animation Phase (for drift)
      phases[i] = Math.random() * Math.PI * 2
    }
    
    return { positions, colors, targetPositions, phases }
  }, [])

  // Store current animated positions separately to avoid mutating initial state if needed,
  // but for points we usually mutate the buffer attribute directly.
  // We need a pristine "original" buffer to lerp back to.
  const originalPositions = useMemo(() => positions.slice(), [positions])

  useFrame((state, delta) => {
    if (!pointsRef.current) return

    const geometry = pointsRef.current.geometry
    const posAttribute = geometry.attributes.position
    
    // Time-based interpolation factor
    // We want a smooth transition. 
    // If exploded, we move to target. If not, we move to original.
    // However, keeping state of "current lerp value" is hard in pure loop without ref.
    // We'll just lerp the positions directly towards the desired state.
    
    const speed = isTreeExploded ? 2.0 : 1.5
    
    for (let i = 0; i < count; i++) {
      const ix = i * 3
      const iy = i * 3 + 1
      const iz = i * 3 + 2
      
      let tx, ty, tz
      
      if (isTreeExploded) {
        // Target: Exploded position + Floating Drift
        // "Fix phase 2 drift by using base positions for floating"
        // The base exploded position is targetPositions[i]
        
        const floatX = Math.sin(state.clock.elapsedTime * 0.5 + phases[i]) * 0.5
        const floatY = Math.cos(state.clock.elapsedTime * 0.3 + phases[i]) * 0.5
        const floatZ = Math.sin(state.clock.elapsedTime * 0.4 + phases[i] + 1) * 0.5
        
        tx = targetPositions[ix] + floatX
        ty = targetPositions[iy] + floatY
        tz = targetPositions[iz] + floatZ
      } else {
        // Target: Original Tree Position
        tx = originalPositions[ix]
        ty = originalPositions[iy]
        tz = originalPositions[iz]
      }
      
      // Lerp current to target
      // "Fix particle convergence with proper time-based interpolation"
      // Using exponential decay lerp for smooth convergence: a += (b - a) * (1 - exp(-lambda * dt))
      const t = 1 - Math.exp(-speed * delta)
      
      posAttribute.array[ix] += (tx - posAttribute.array[ix]) * t
      posAttribute.array[iy] += (ty - posAttribute.array[iy]) * t
      posAttribute.array[iz] += (tz - posAttribute.array[iz]) * t
    }
    
    posAttribute.needsUpdate = true
  })

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={count}
          array={positions} // Initial state
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-color"
          count={count}
          array={colors}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.06}
        vertexColors
        transparent
        opacity={0.9}
        sizeAttenuation={true}
        depthWrite={false}
      />
    </points>
  )
}

function TreeStar({ isTreeExploded }) {
  const groupRef = useRef()
  // "Add to explosion animation"
  const originalPos = new THREE.Vector3(0, 6.6, 0)
  const targetPos = useMemo(() => new THREE.Vector3(
    (Math.random() - 0.5) * 10,
    10 + Math.random() * 5,
    (Math.random() - 0.5) * 10
  ), [])

  useFrame((state, delta) => {
    if (groupRef.current) {
        // Spin
        groupRef.current.rotation.y += 0.02
        
        // Explosion Lerp
        const target = isTreeExploded ? targetPos : originalPos
        groupRef.current.position.lerp(target, delta * 2)
        
        // Floating when exploded
        if (isTreeExploded) {
             groupRef.current.position.y += Math.sin(state.clock.elapsedTime) * 0.01
        }
    }
  })

  return (
    <group ref={groupRef} position={[0, 6.6, 0]}>
      <mesh>
        <octahedronGeometry args={[0.4, 0]} />
        <meshStandardMaterial
          color="#ffd700"
          emissive="#ffd700"
          emissiveIntensity={1}
          metalness={0.8}
          roughness={0.2}
        />
      </mesh>
      <pointLight color="#ffd700" intensity={2} distance={5} />
    </group>
  )
}

function Ornaments({ isTreeExploded }) {
  const meshRef = useRef()
  const count = 40
  
  const { data, originalMatrices } = useMemo(() => {
    const data = []
    const originalMatrices = []
    const colors = [new THREE.Color('#ff0000'), new THREE.Color('#ffd700'), new THREE.Color('#0000ff')]
    
    for(let i=0; i<count; i++) {
        const h = Math.random() * 6
        const r = (1 - h/7) * 3 * (0.8 + Math.random()*0.2)
        const angle = Math.random() * Math.PI * 2
        
        const pos = new THREE.Vector3(
            Math.cos(angle) * r,
            h - 0.5,
            Math.sin(angle) * r
        )
        
        // Explosion target
        const dir = pos.clone().normalize()
        const target = pos.clone().add(dir.multiplyScalar(5 + Math.random() * 10))
        
        data.push({
            pos,
            target,
            color: colors[Math.floor(Math.random() * colors.length)],
            phase: Math.random() * Math.PI * 2
        })
        
        const mat = new THREE.Matrix4().setPosition(pos)
        originalMatrices.push(mat)
    }
    return { data, originalMatrices }
  }, [])
  
  useFrame((state, delta) => {
      if(!meshRef.current) return
      
      const speed = isTreeExploded ? 2.0 : 1.5
      
      for(let i=0; i<count; i++) {
          const item = data[i]
          
          // Current position calculation
          const matrix = new THREE.Matrix4()
          meshRef.current.getMatrixAt(i, matrix)
          const currentPos = new THREE.Vector3()
          matrix.decompose(currentPos, new THREE.Quaternion(), new THREE.Vector3())
          
          let targetPos
          if(isTreeExploded) {
              const floatY = Math.sin(state.clock.elapsedTime + item.phase) * 0.5
              targetPos = new THREE.Vector3(item.target.x, item.target.y + floatY, item.target.z)
          } else {
              targetPos = item.pos
          }
          
          currentPos.lerp(targetPos, 1 - Math.exp(-speed * delta))
          
          matrix.setPosition(currentPos)
          meshRef.current.setMatrixAt(i, matrix)
      }
      meshRef.current.instanceMatrix.needsUpdate = true
  })

  return (
    <instancedMesh ref={meshRef} args={[null, null, count]} castShadow>
      <sphereGeometry args={[0.12, 16, 16]} />
      <meshStandardMaterial color="white" roughness={0.1} metalness={0.9} />
    </instancedMesh>
  )
}

function Lights({ isTreeExploded }) {
    // Similar to ornaments but smaller and emissive
    const meshRef = useRef()
    const count = 60
    
    const { data } = useMemo(() => {
        const data = []
        for(let i=0; i<count; i++) {
             // Spiral distribution
             const t = i / count
             const h = t * 6.5
             const r = (1 - t) * 3.2
             const angle = t * Math.PI * 10 
             
             const pos = new THREE.Vector3(
                 Math.cos(angle) * r,
                 h - 0.8,
                 Math.sin(angle) * r
             )
             
             const dir = pos.clone().normalize()
             const target = pos.clone().add(dir.multiplyScalar(8 + Math.random() * 8))
             
             data.push({ pos, target, phase: Math.random() * 10 })
        }
        return { data }
    }, [])
    
    useFrame((state, delta) => {
        if(!meshRef.current) return
        const speed = isTreeExploded ? 2.0 : 1.5
        
        for(let i=0; i<count; i++) {
             const item = data[i]
             const matrix = new THREE.Matrix4()
             meshRef.current.getMatrixAt(i, matrix)
             const currentPos = new THREE.Vector3()
             matrix.decompose(currentPos, new THREE.Quaternion(), new THREE.Vector3())
             
             let targetPos
             if(isTreeExploded) {
                 const float = Math.sin(state.clock.elapsedTime + item.phase) * 0.2
                 targetPos = new THREE.Vector3(item.target.x, item.target.y + float, item.target.z)
             } else {
                 targetPos = item.pos
             }
             
             currentPos.lerp(targetPos, 1 - Math.exp(-speed * delta))
             matrix.setPosition(currentPos)
             
             // Scale for blink effect
             if(!isTreeExploded) {
                 const scale = 1 + Math.sin(state.clock.elapsedTime * 3 + item.phase) * 0.3
                 matrix.scale(new THREE.Vector3(scale, scale, scale))
             } else {
                 matrix.scale(new THREE.Vector3(1,1,1))
             }

             meshRef.current.setMatrixAt(i, matrix)
        }
        meshRef.current.instanceMatrix.needsUpdate = true
    })

    return (
        <instancedMesh ref={meshRef} args={[null, null, count]}>
             <sphereGeometry args={[0.04, 8, 8]} />
             <meshStandardMaterial color="#ffffaa" emissive="#ffaa00" emissiveIntensity={2} toneMapped={false} />
        </instancedMesh>
    )
}


function ChristmasTree({ isRotating, isTreeExploded }) {
  const groupRef = useRef()

  useFrame((state, delta) => {
    if (groupRef.current && isRotating && !isTreeExploded) {
      groupRef.current.rotation.y += delta * 0.2
    }
  })

  return (
    <group ref={groupRef}>
      <ParticleTree isTreeExploded={isTreeExploded} />
      <TreeStar isTreeExploded={isTreeExploded} />
      <Ornaments isTreeExploded={isTreeExploded} />
      <Lights isTreeExploded={isTreeExploded} />
    </group>
  )
}

export default ChristmasTree