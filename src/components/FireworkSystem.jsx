import React, { useRef, useEffect } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import { Firework } from '../utils/Firework';

export default function FireworkSystem({ trigger, isTreeExploding }) {
  const { scene, camera } = useThree();
  const fireworksRef = useRef([]);

  // Trigger effect
  useEffect(() => {
    if (trigger > 0) {
        const startPos = [(Math.random() - 0.5) * 4, -1, (Math.random() - 0.5) * 4];
        fireworksRef.current.push(new Firework(startPos, scene, camera, isTreeExploding));
        // Multi-launch
        setTimeout(() => fireworksRef.current.push(new Firework([(Math.random()-0.5)*4, -1, (Math.random()-0.5)*4], scene, camera, isTreeExploding)), 200);
        setTimeout(() => fireworksRef.current.push(new Firework([(Math.random()-0.5)*4, -1, (Math.random()-0.5)*4], scene, camera, isTreeExploding)), 400);
    }
  }, [trigger, scene, camera]); // trigger changes on click

  useFrame(() => {
    fireworksRef.current = fireworksRef.current.filter(fw => {
        // Update physics state in firework
        // The firework class doesn't have a setter for isTreeExploding, so we pass it to update?
        // My Firework.js update signature is update(isTreeExploding).
        const alive = fw.update(isTreeExploding);
        if (!alive) fw.dispose();
        return alive;
    });
  });

  return null;
}
