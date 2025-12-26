import React, { useRef, useMemo, useEffect } from 'react';
import { useFrame, useLoader } from '@react-three/fiber';
import * as THREE from 'three';

function PhotoFrame({ photo, isTreeExploding, treeExplodeStartTime, index, totalPhotos }) {
  const groupRef = useRef();
  const texture = useLoader(THREE.TextureLoader, photo.url);
  
  // Frame Geometry Data (Memoized to share? No, each frame is distinct instance)
  // Actually, we can reuse geometries if we want optimization, but simple primitives are fine.

  useFrame((state) => {
      const time = state.clock.elapsedTime;
      const elapsed = isTreeExploding ? (Date.now() - treeExplodeStartTime) / 1000 : 0;
      
      if (isTreeExploding) {
          // Initialize Target if needed
          if (!photo.targetPos) {
              const displayScale = 2.5;
              const cols = Math.ceil(Math.sqrt(totalPhotos * 1.2));
              const rows = Math.ceil(totalPhotos / cols);
              const spacingX = 2.2; const spacingY = 1.8;
              const offsetX = -(cols - 1) * spacingX / 2;
              const offsetY = (rows - 1) * spacingY / 2;
              
              const col = index % cols;
              const row = Math.floor(index / cols);
              const tX = offsetX + col * spacingX + (Math.random()-0.5)*0.6;
              const tY = offsetY - row * spacingY + 3.5 + (Math.random()-0.5)*0.5;
              const tZ = 3.5 + (Math.random()-0.5)*0.8;
              
              photo.targetPos = new THREE.Vector3(tX, tY, tZ);
              photo.targetScale = displayScale;
              photo.tiltX = (Math.random()-0.5)*0.2; photo.tiltZ = (Math.random()-0.5)*0.25;
          }
          
          if (elapsed < 2) {
              const phase = elapsed / 2;
              groupRef.current.position.lerp(photo.targetPos, 0.08);
              const s = 1 + (photo.targetScale - 1) * phase;
              groupRef.current.scale.setScalar(s);
              
              groupRef.current.rotation.y += (0 - groupRef.current.rotation.y) * 0.1;
              groupRef.current.rotation.x += (photo.tiltX * phase - groupRef.current.rotation.x) * 0.1;
              groupRef.current.rotation.z += (photo.tiltZ * phase - groupRef.current.rotation.z) * 0.1;
          } else if (elapsed < 5) {
              const floatX = Math.sin(time*1.8 + index*0.7)*0.05;
              const floatY = Math.sin(time*2 + index)*0.08;
              groupRef.current.position.x = photo.targetPos.x + floatX;
              groupRef.current.position.y = photo.targetPos.y + floatY;
              
              groupRef.current.rotation.x = photo.tiltX + Math.sin(time*1.2 + index*0.8)*0.04;
              groupRef.current.rotation.z = photo.tiltZ + Math.sin(time*1.5 + index*0.5)*0.05;
              
              const pulse = photo.targetScale * (1 + Math.sin(time*3 + index)*0.03);
              groupRef.current.scale.setScalar(pulse);
          } else if (elapsed < 7) {
              groupRef.current.position.lerp(photo.originalPos, 0.06);
              groupRef.current.scale.lerp(new THREE.Vector3(1,1,1), 0.06);
              // Revert rotation logic requires storing original rotation quaternion? 
              // Simplified: look at center logic is dynamic usually.
              // We'll reset targetPos to null at end.
          } else {
              if (elapsed > 7.0) photo.targetPos = null;
              // Reset to orbit/static logic
              const baseY = photo.originalPos.y;
              groupRef.current.position.copy(photo.originalPos);
              groupRef.current.position.y = baseY + Math.sin(time*2 + index)*0.05;
              
              // Recalculate lookAt tree center logic
              const slopeAngle = Math.atan2(2.2 * 0.88, 5);
              groupRef.current.lookAt(0, baseY, 0);
              groupRef.current.rotateX(slopeAngle * 0.5);
              groupRef.current.rotateZ((Math.random()-0.5)*0.15); // jitter
          }
      } else {
          // Normal Animation
          const baseY = photo.originalPos.y;
          groupRef.current.position.y = baseY + Math.sin(time*2 + index)*0.05;
          // Rotation handled by lookAt initially, maybe slight wiggle?
      }
  });

  // Initial Setup
  useEffect(() => {
      if (groupRef.current) {
          groupRef.current.position.copy(photo.originalPos);
          groupRef.current.lookAt(0, photo.originalPos.y, 0);
          const slopeAngle = Math.atan2(2.2 * 0.88, 5);
          groupRef.current.rotateX(slopeAngle * 0.5);
      }
  }, [photo.originalPos]);

  // Frame Construction
  const { width, height } = photo.size;
  const frameWidth = width + 0.1;
  const frameHeight = height + 0.1;
  const border = 0.04;

  return (
    <group ref={groupRef}>
      {/* Backplate */}
      <mesh position-z={-0.018}>
          <boxGeometry args={[frameWidth+0.02, frameHeight+0.02, 0.025]} />
          <meshStandardMaterial color={0x8B4513} roughness={0.85} metalness={0.05} />
      </mesh>
      {/* Photo */}
      <mesh position-z={0.001}>
          <planeGeometry args={[width, height]} />
          <meshStandardMaterial map={texture} side={THREE.DoubleSide} />
      </mesh>
      {/* Borders (Gold) */}
      <mesh position={[0, frameHeight/2 - border/2, 0.01]}>
          <boxGeometry args={[frameWidth, border, 0.025]} />
          <meshStandardMaterial color={0xd4af37} metalness={0.85} roughness={0.2} />
      </mesh>
      <mesh position={[0, -frameHeight/2 + border/2, 0.01]}>
          <boxGeometry args={[frameWidth, border, 0.025]} />
          <meshStandardMaterial color={0xd4af37} metalness={0.85} roughness={0.2} />
      </mesh>
      <mesh position={[-frameWidth/2 + border/2, 0, 0.01]}>
          <boxGeometry args={[border, frameHeight, 0.025]} />
          <meshStandardMaterial color={0xd4af37} metalness={0.85} roughness={0.2} />
      </mesh>
      <mesh position={[frameWidth/2 - border/2, 0, 0.01]}>
          <boxGeometry args={[border, frameHeight, 0.025]} />
          <meshStandardMaterial color={0xd4af37} metalness={0.85} roughness={0.2} />
      </mesh>
      
      {/* Bow (Red) */}
      <group position={[0, frameHeight/2 + 0.02, 0.025]}>
          <mesh position={[-0.045, 0, 0]} rotation-z={0.4} scale={[1.8, 1, 0.6]}>
              <sphereGeometry args={[0.035, 12, 12]} />
              <meshStandardMaterial color={0xcc0000} roughness={0.6} metalness={0.1} />
          </mesh>
          <mesh position={[0.045, 0, 0]} rotation-z={-0.4} scale={[1.8, 1, 0.6]}>
              <sphereGeometry args={[0.035, 12, 12]} />
              <meshStandardMaterial color={0xcc0000} roughness={0.6} metalness={0.1} />
          </mesh>
          <mesh>
              <sphereGeometry args={[0.02, 12, 12]} />
              <meshStandardMaterial color={0xcc0000} roughness={0.6} metalness={0.1} />
          </mesh>
      </group>
      <pointLight color={0xffd700} intensity={0.3} distance={0.8} position-z={0.1} />
    </group>
  );
}

export default function PhotoGallery({ photos, isTreeExploding, treeExplodeStartTime }) {
  return (
    <group>
      {photos.map((photo, i) => (
        <PhotoFrame 
            key={photo.id} 
            photo={photo} 
            index={i} 
            totalPhotos={photos.length}
            isTreeExploding={isTreeExploding} 
            treeExplodeStartTime={treeExplodeStartTime} 
        />
      ))}
    </group>
  );
}
