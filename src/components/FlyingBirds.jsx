import React, { useRef, useMemo, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { createSparkleTexture } from '../utils/textures';

export default function FlyingBirds({ isTreeExploding, treeExplodeStartTime }) {
  const groupRef = useRef();
  const birdsRef = useRef([]); // Stores bird objects
  const particlesRef = useRef(); // Trails

  // Initialize Birds
  useEffect(() => {
    if (!groupRef.current) return;
    
    // Clear previous
    while(groupRef.current.children.length > 0){ 
        groupRef.current.remove(groupRef.current.children[0]); 
    }
    birdsRef.current = [];

    const birdCount = 15;
    const goldMat = new THREE.MeshStandardMaterial({ color: 0xffd700, metalness: 0.8, roughness: 0.2, emissive: 0xffd700, emissiveIntensity: 0.8, side: THREE.DoubleSide });
    const darkGoldMat = new THREE.MeshStandardMaterial({ color: 0xdaa520, metalness: 0.7, roughness: 0.25, emissive: 0xdaa520, emissiveIntensity: 0.6, side: THREE.DoubleSide });

    for (let i = 0; i < birdCount; i++) {
        const birdGroup = new THREE.Group();
        
        // Body
        const body = new THREE.Mesh(new THREE.SphereGeometry(0.06, 16, 12).scale(0.9, 0.8, 2.5), goldMat);
        birdGroup.add(body);
        
        // Head
        const head = new THREE.Mesh(new THREE.SphereGeometry(0.04, 12, 10), goldMat);
        head.position.set(0, 0.025, -0.14);
        birdGroup.add(head);
        
        // Beak
        const beak = new THREE.Mesh(new THREE.ConeGeometry(0.012, 0.06, 8), darkGoldMat);
        beak.rotation.x = Math.PI / 2;
        beak.position.set(0, 0.025, -0.2);
        birdGroup.add(beak);
        
        // Tail
        const tail = new THREE.Mesh(new THREE.ConeGeometry(0.03, 0.15, 4).scale(0.3, 1, 1), goldMat);
        tail.rotation.x = -Math.PI / 2;
        tail.position.set(0, 0.01, 0.18);
        birdGroup.add(tail);
        
        // Wings
        const wingShape = new THREE.Shape();
        wingShape.moveTo(0, 0);
        wingShape.quadraticCurveTo(0.08, 0.03, 0.18, 0.08);
        wingShape.quadraticCurveTo(0.15, 0.02, 0.16, -0.04);
        wingShape.quadraticCurveTo(0.1, -0.06, 0, -0.05);
        wingShape.closePath();
        const wingGeo = new THREE.ExtrudeGeometry(wingShape, { depth: 0.008, bevelEnabled: true, bevelThickness: 0.002, bevelSize: 0.002, bevelSegments: 2 });
        
        const leftWing = new THREE.Mesh(wingGeo, goldMat);
        leftWing.position.set(0.025, 0.03, 0.02); leftWing.rotation.z = -Math.PI/2; leftWing.rotation.y = 0.2;
        leftWing.userData = { isWing: true, side: 'left' };
        birdGroup.add(leftWing);
        
        const rightWing = new THREE.Mesh(wingGeo, goldMat);
        rightWing.position.set(-0.025, 0.03, 0.02); rightWing.rotation.z = Math.PI/2; rightWing.rotation.y = -0.2;
        rightWing.userData = { isWing: true, side: 'right' };
        birdGroup.add(rightWing);
        
        // Light
        const birdLight = new THREE.PointLight(0xffd700, 2, 3);
        birdGroup.add(birdLight);
        
        // Logic Data
        const angle = (i / birdCount) * Math.PI * 2 + Math.random() * 0.5;
        const radius = 1.5 + Math.random() * 1.2;
        const height = 2.0 + Math.random() * 3.0;
        
        birdGroup.position.set(Math.cos(angle)*radius, height, Math.sin(angle)*radius);
        birdGroup.userData = {
            orbitAngle: angle, orbitRadius: radius, orbitSpeed: 0.08 + Math.random() * 0.06,
            verticalSpeed: 0.3 + Math.random() * 0.2, verticalPhase: Math.random() * Math.PI * 2, verticalAmount: 0.3 + Math.random() * 0.25,
            baseHeight: height, wingPhase: Math.random() * Math.PI * 2, wingSpeed: 5 + Math.random() * 2, bankAngle: 0
        };
        
        birdGroup.scale.setScalar(0.7);
        groupRef.current.add(birdGroup);
        birdsRef.current.push(birdGroup);
    }
    
    // Trails
    const particleCount = 200;
    const pPos = new Float32Array(particleCount*3);
    const pCol = new Float32Array(particleCount*3);
    const pSize = new Float32Array(particleCount);
    for(let i=0; i<particleCount; i++) {
        pPos[i*3]=0; pPos[i*3+1]=5; pPos[i*3+2]=0;
        const b = 0.7 + Math.random()*0.3;
        pCol[i*3]=1; pCol[i*3+1]=0.8*b; pCol[i*3+2]=0.2*b;
        pSize[i] = 0.03 + Math.random()*0.05;
    }
    const pGeo = new THREE.BufferGeometry();
    pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
    pGeo.setAttribute('color', new THREE.BufferAttribute(pCol, 3));
    pGeo.setAttribute('size', new THREE.BufferAttribute(pSize, 1));
    const pMat = new THREE.PointsMaterial({ size: 0.08, map: createSparkleTexture(), vertexColors: true, transparent: true, opacity: 0.8, blending: THREE.AdditiveBlending, depthWrite: false });
    const trails = new THREE.Points(pGeo, pMat);
    trails.userData.particleData = [];
    for(let i=0; i<particleCount; i++) {
        trails.userData.particleData.push({
            birdIndex: i % birdsRef.current.length, age: Math.random()*2, maxAge: 1.5 + Math.random(),
            velocity: [(Math.random()-0.5)*0.02, -0.01 - Math.random()*0.02, (Math.random()-0.5)*0.02],
            baseSize: pSize[i]
        });
    }
    particlesRef.current = trails;
    groupRef.current.add(trails);

  }, []);

  useFrame((state) => {
      const time = state.clock.elapsedTime;
      const elapsed = isTreeExploding ? (Date.now() - treeExplodeStartTime) / 1000 : 0;

      // Update Birds
      birdsRef.current.forEach((bird, i) => {
          const data = bird.userData;
          
          if (isTreeExploding) {
              if (elapsed < 2) {
                  if (!data.explosionVel) {
                      const angle = Math.atan2(bird.position.z, bird.position.x);
                      const speed = 8 + Math.random() * 5;
                      data.explosionVel = { x: Math.cos(angle)*speed, y: 3 + Math.random()*4, z: Math.sin(angle)*speed };
                      data.originalPos = bird.position.clone();
                  }
                  bird.position.x += data.explosionVel.x * 0.016;
                  bird.position.y += data.explosionVel.y * 0.016;
                  bird.position.z += data.explosionVel.z * 0.016;
                  data.explosionVel.x *= 0.98; data.explosionVel.y -= 0.05; data.explosionVel.z *= 0.98;
                  bird.lookAt(bird.position.x + data.explosionVel.x, bird.position.y + data.explosionVel.y*0.5, bird.position.z + data.explosionVel.z);
              } else if (elapsed < 5) {
                  data.orbitAngle += 0.02;
                  const radius = 8 + i * 0.5;
                  bird.position.x = Math.cos(data.orbitAngle)*radius;
                  bird.position.z = Math.sin(data.orbitAngle)*radius;
                  bird.position.y = 6 + Math.sin(time*2 + i)*0.5;
                  const nextA = data.orbitAngle + 0.2;
                  bird.lookAt(Math.cos(nextA)*radius, bird.position.y, Math.sin(nextA)*radius);
              } else if (elapsed < 7) {
                  if (data.originalPos) {
                      bird.position.lerp(data.originalPos, 0.03);
                      bird.lookAt(data.originalPos);
                  }
                  if (elapsed > 6.9) data.explosionVel = null;
              }
          } else {
              // Normal Flight
              const prevAngle = data.orbitAngle;
              const speedVar = 1 + Math.sin(time*0.5 + i)*0.1;
              data.orbitAngle += data.orbitSpeed * 0.016 * speedVar;
              const rVar = data.orbitRadius + Math.sin(time*0.3 + i*2)*0.2;
              const x = Math.cos(data.orbitAngle)*rVar;
              const z = Math.sin(data.orbitAngle)*rVar;
              const y = data.baseHeight + Math.sin(time*data.verticalSpeed + data.verticalPhase)*data.verticalAmount;
              bird.position.set(x, y, z);
              
              const nextAngle = data.orbitAngle + 0.1;
              bird.lookAt(Math.cos(nextAngle)*rVar, y, Math.sin(nextAngle)*rVar);
              
              const turnRate = (data.orbitAngle - prevAngle) * 60;
              const targetBank = -turnRate * 12;
              data.bankAngle += (targetBank - data.bankAngle)*0.1;
              bird.rotation.z += data.bankAngle;
              bird.rotation.x += Math.cos(time*data.verticalSpeed + data.verticalPhase)*0.08;
          }
          
          // Wings
          bird.children.forEach(child => {
              if (child.userData.isWing) {
                  const flap = Math.sin(time*data.wingSpeed + data.wingPhase)*0.8 + Math.sin(time*data.wingSpeed*2 + data.wingPhase)*0.15;
                  if (child.userData.side === 'left') child.rotation.z = -Math.PI/2 + flap;
                  else child.rotation.z = Math.PI/2 - flap;
              }
          });
      });

      // Update Trails
      if (particlesRef.current) {
          const positions = particlesRef.current.geometry.attributes.position.array;
          const sizes = particlesRef.current.geometry.attributes.size.array;
          const pData = particlesRef.current.userData.particleData;
          
          for(let i=0; i<pData.length; i++) {
              const d = pData[i];
              d.age += 0.016;
              if (d.age >= d.maxAge) {
                  d.age = 0;
                  const bird = birdsRef.current[d.birdIndex];
                  if (bird) {
                      positions[i*3] = bird.position.x + (Math.random()-0.5)*0.1;
                      positions[i*3+1] = bird.position.y + (Math.random()-0.5)*0.1;
                      positions[i*3+2] = bird.position.z + (Math.random()-0.5)*0.1;
                      const speedMult = isTreeExploding ? 2 : 1;
                      d.velocity = [(Math.random()-0.5)*0.03*speedMult, -0.01 - Math.random()*0.02, (Math.random()-0.5)*0.02*speedMult];
                      d.maxAge = isTreeExploding ? 0.8 : 1.5;
                  }
              }
              positions[i*3] += d.velocity[0]; positions[i*3+1] += d.velocity[1]; positions[i*3+2] += d.velocity[2];
              const ratio = 1 - d.age/d.maxAge;
              sizes[i] = d.baseSize * ratio * (isTreeExploding ? 1.5 : 1);
          }
          particlesRef.current.geometry.attributes.position.needsUpdate = true;
          particlesRef.current.geometry.attributes.size.needsUpdate = true;
      }
  });

  return <group ref={groupRef} />;
}
