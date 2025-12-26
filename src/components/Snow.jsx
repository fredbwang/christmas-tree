import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { createSnowflakeTexture } from '../utils/textures';

export default function Snow() {
  const pointsRef = useRef();
  const texture = useMemo(() => createSnowflakeTexture(), []);

  const { positions, sizes, velocities } = useMemo(() => {
      const count = 800;
      const positions = new Float32Array(count * 3);
      const sizes = new Float32Array(count);
      const velocities = [];
      for(let i=0; i<count; i++) {
          positions[i*3] = (Math.random()-0.5)*30;
          positions[i*3+1] = Math.random()*20;
          positions[i*3+2] = (Math.random()-0.5)*30;
          sizes[i] = 0.15 + Math.random()*0.25;
          velocities.push({
              y: 0.3 + Math.random()*0.4,
              x: (Math.random()-0.5)*0.1,
              phase: Math.random()*Math.PI*2,
              wobbleSpeed: 1 + Math.random()*2,
              wobbleAmount: 0.5 + Math.random()
          });
      }
      return { positions, sizes, velocities };
  }, []);

  useFrame((state) => {
      if (!pointsRef.current) return;
      const time = state.clock.elapsedTime;
      const pos = pointsRef.current.geometry.attributes.position.array;
      
      for(let i=0; i<velocities.length; i++) {
          const v = velocities[i];
          const wobble = Math.sin(time * v.wobbleSpeed + v.phase) * v.wobbleAmount;
          pos[i*3] += wobble * 0.01 + v.x * 0.05;
          pos[i*3+2] += Math.cos(time * v.wobbleSpeed * 0.7 + v.phase) * 0.008;
          pos[i*3+1] -= v.y * 0.015;
          
          if(pos[i*3+1] < -2) {
              pos[i*3+1] = 15 + Math.random()*5;
              pos[i*3] = (Math.random()-0.5)*30;
              pos[i*3+2] = (Math.random()-0.5)*30;
          }
      }
      pointsRef.current.geometry.attributes.position.needsUpdate = true;
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
          <bufferAttribute attach="attributes-position" count={velocities.length} array={positions} itemSize={3} />
          <bufferAttribute attach="attributes-size" count={velocities.length} array={sizes} itemSize={1} />
      </bufferGeometry>
      <pointsMaterial 
          size={0.4} 
          map={texture} 
          transparent 
          opacity={0.9} 
          blending={THREE.AdditiveBlending} 
          depthWrite={false} 
          sizeAttenuation 
      />
    </points>
  );
}
