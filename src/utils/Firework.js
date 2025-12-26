import * as THREE from 'three';
import { createSparkleTexture } from './textures';

const sparkleTexture = createSparkleTexture();

export class Firework {
  constructor(startPos, scene, camera, isTreeExploding, treeRadiusFunc) {
    this.startPos = startPos;
    this.phase = 'launch'; 
    this.startTime = Date.now();
    this.particles = [];
    this.launchTrailParticles = [];
    this.rings = [];
    this.sparks = [];
    this.glowLight = null;
    this.scene = scene;
    this.camera = camera;
    this.isTreeExploding = isTreeExploding; // Ref or value? Needs to be current. 
    // We will pass current state in update().

    // Themes
    const themes = [
      { name: 'Strontium Red', colors: [0xff3333, 0xffcccc, 0xaa0000] },
      { name: 'Barium Green', colors: [0x33ff33, 0xccffcc, 0x00aa00] },
      { name: 'Copper Blue', colors: [0x3388ff, 0xccccff, 0x0022aa] },
      { name: 'Sodium Gold', colors: [0xffcc33, 0xffeeaa, 0xcc8800] },
      { name: 'Potassium Violet', colors: [0xcc33ff, 0xeeccee, 0x8800aa] },
      { name: 'Magnesium White', colors: [0xffffff, 0xeeeeee, 0xcccccc] },
      { name: 'Calcium Orange', colors: [0xff8833, 0xffccaa, 0xaa4400] },
    ];
    const theme = themes[Math.floor(Math.random() * themes.length)];
    this.colors = theme.colors;
    this.targetY = 6 + Math.random() * 3;

    this.createRocket();
  }

  createRocket() {
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array([0,0,0]), 3));
    const material = new THREE.PointsMaterial({
        color: 0xffffff,
        size: 0.3,
        transparent: true,
        blending: THREE.AdditiveBlending,
        map: sparkleTexture,
        depthWrite: false
    });
    this.rocket = new THREE.Points(geometry, material);
    this.rocket.position.set(...this.startPos);
    
    const trailGeo = new THREE.BufferGeometry();
    const trailPos = new Float32Array(60 * 3);
    const trailCol = new Float32Array(60 * 3);
    const trailSize = new Float32Array(60);
    
    trailGeo.setAttribute('position', new THREE.BufferAttribute(trailPos, 3));
    trailGeo.setAttribute('color', new THREE.BufferAttribute(trailCol, 3));
    trailGeo.setAttribute('size', new THREE.BufferAttribute(trailSize, 1));
    
    this.launchTrail = new THREE.Points(trailGeo, new THREE.PointsMaterial({
        size: 0.15,
        vertexColors: true,
        transparent: true,
        opacity: 0.8,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        map: sparkleTexture
    }));
    
    this.scene.add(this.rocket);
    this.scene.add(this.launchTrail);
  }

  createExplosion(pos) {
    this.createBurst(pos, 400, 6.0, this.colors[0], 'main');
    this.createBurst(pos, 50, 2.0, 0xffffff, 'core');
    setTimeout(() => { this.createBurst(pos, 100, 4.0, this.colors[1], 'dust'); }, 50);
    this.createRing(pos, this.colors[1]);

    this.glowLight = new THREE.PointLight(this.colors[0], 8, 20);
    this.glowLight.position.set(...pos);
    this.scene.add(this.glowLight);
  }

  createBurst(pos, count, speedBase, colorHex, type) {
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const sizes = new Float32Array(count);
    const velocities = [];
    const baseColor = new THREE.Color(colorHex);

    for (let i = 0; i < count; i++) {
      positions[i * 3] = pos[0];
      positions[i * 3 + 1] = pos[1];
      positions[i * 3 + 2] = pos[2];

      const offset = 2 / count;
      const increment = Math.PI * (3 - Math.sqrt(5));
      let y = ((i * offset) - 1) + (offset / 2);
      let r = Math.sqrt(1 - Math.pow(y, 2));
      let phi = ((i + 1) % count) * increment;
      let x = Math.cos(phi) * r;
      let z = Math.sin(phi) * r;

      x += (Math.random() - 0.5) * 0.1;
      y += (Math.random() - 0.5) * 0.1;
      z += (Math.random() - 0.5) * 0.1;

      const speed = speedBase * (0.8 + Math.random() * 0.4);
      
      velocities.push({
        x: x * speed,
        y: y * speed,
        z: z * speed,
        drag: 0.92 + Math.random() * 0.04,
        gravity: 0.03 + Math.random() * 0.02,
        life: 1.0,
        decay: 0.005 + Math.random() * 0.01,
        isAttached: false
      });

      colors[i * 3] = 1.0;
      colors[i * 3 + 1] = 1.0;
      colors[i * 3 + 2] = 1.0;
      sizes[i] = (type === 'core' ? 0.4 : 0.25) * (0.8 + Math.random() * 0.4);
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

    const material = new THREE.PointsMaterial({
      size: 1.0,
      vertexColors: true,
      transparent: true,
      opacity: 1,
      map: sparkleTexture,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      sizeAttenuation: true
    });

    const burst = new THREE.Points(geometry, material);
    burst.userData = { velocities, origin: [...pos], startTime: Date.now(), type, targetColor: baseColor };
    this.particles.push(burst);
    this.scene.add(burst);
  }

  createRing(pos, colorHex) {
      const geometry = new THREE.RingGeometry(0.1, 0.2, 64);
      const material = new THREE.MeshBasicMaterial({
          color: colorHex,
          transparent: true,
          opacity: 0.8,
          side: THREE.DoubleSide,
          blending: THREE.AdditiveBlending
      });
      const ring = new THREE.Mesh(geometry, material);
      ring.position.set(...pos);
      ring.lookAt(this.camera.position);
      ring.userData = { scale: 1, opacity: 0.8 };
      this.rings.push(ring);
      this.scene.add(ring);
  }

  update(isTreeExploding) {
    const now = Date.now();
    const dt = 0.016;
    const elapsed = (now - this.startTime) / 1000;

    if (this.phase === 'launch') {
      const launchSpeed = 12;
      const currentY = this.startPos[1] + launchSpeed * elapsed - 4.9 * elapsed * elapsed;
      this.rocket.position.set(this.startPos[0], currentY, this.startPos[2]);
      
      const positions = this.launchTrail.geometry.attributes.position.array;
      const colors = this.launchTrail.geometry.attributes.color.array;
      const sizes = this.launchTrail.geometry.attributes.size.array;
      
      this.launchTrailParticles.unshift({
          x: this.startPos[0] + (Math.random()-0.5)*0.1,
          y: currentY,
          z: this.startPos[2] + (Math.random()-0.5)*0.1,
          life: 1.0
      });
      if (this.launchTrailParticles.length > 60) this.launchTrailParticles.pop();
      
      for(let i=0; i<60; i++) {
          if (this.launchTrailParticles[i]) {
              const p = this.launchTrailParticles[i];
              positions[i*3] = p.x;
              positions[i*3+1] = p.y;
              positions[i*3+2] = p.z;
              const life = p.life;
              colors[i*3] = 1.0;
              colors[i*3+1] = life * 0.8;
              colors[i*3+2] = life * 0.2;
              sizes[i] = life * 0.2;
              p.life -= 0.05;
          } else {
              sizes[i] = 0;
          }
      }
      this.launchTrail.geometry.attributes.position.needsUpdate = true;
      this.launchTrail.geometry.attributes.color.needsUpdate = true;
      this.launchTrail.geometry.attributes.size.needsUpdate = true;

      if (currentY >= this.targetY || elapsed > 1.5) {
        this.phase = 'explode';
        this.scene.remove(this.rocket);
        this.scene.remove(this.launchTrail);
        this.createExplosion([this.startPos[0], currentY, this.startPos[2]]);
      }
    }

    let anyAlive = false;

    this.particles.forEach(burst => {
      const positions = burst.geometry.attributes.position.array;
      const colors = burst.geometry.attributes.color.array;
      const sizes = burst.geometry.attributes.size.array;
      const vel = burst.userData.velocities;
      const type = burst.userData.type;
      const targetColor = burst.userData.targetColor;
      const burstTime = (now - burst.userData.startTime) / 1000;

      for (let i = 0; i < vel.length; i++) {
        const v = vel[i];
        if (v.life <= 0) { sizes[i] = 0; continue; }
        anyAlive = true;

        if (isTreeExploding) {
           const x = positions[i * 3];
           const y = positions[i * 3 + 1];
           const z = positions[i * 3 + 2];
           const dist = Math.sqrt(x*x + z*z) || 1;
           positions[i * 3] += (x/dist) * 0.05; 
           positions[i * 3 + 1] += (Math.random() - 0.5) * 0.02;
           positions[i * 3 + 2] += (z/dist) * 0.05;
           v.life -= 0.02;
           v.isAttached = false;
        } 
        else {
            if (!v.isAttached) {
                v.x *= v.drag; v.y *= v.drag; v.z *= v.drag;
                v.y -= v.gravity;
            }

            if (burstTime > 0.5 && burstTime < 10.0) {
                const currentY = positions[i * 3 + 1];
                const currentX = positions[i * 3];
                const currentZ = positions[i * 3 + 2];
                
                if (currentY > 0 && currentY < 7) {
                    const treeRadiusAtY = Math.max(0.2, 2.5 * (1 - (currentY / 7)));
                    const distToCenter = Math.sqrt(currentX*currentX + currentZ*currentZ);
                    const targetRadius = treeRadiusAtY + 0.1; 
                    
                    if (distToCenter > 0.1) {
                        const attraction = 0.15; 
                        if (!v.isAttached) {
                            const dirX = -currentX / distToCenter;
                            const dirZ = -currentZ / distToCenter;
                            if (distToCenter > targetRadius) {
                                v.x += dirX * attraction;
                                v.z += dirZ * attraction;
                            }
                        }
                        if (Math.abs(distToCenter - targetRadius) < 0.8) {
                            v.isAttached = true;
                            v.decay = 0; 
                            v.life = Math.max(v.life, 0.6);
                            v.x = 0; v.y = 0; v.z = 0;
                            const angle = Math.atan2(currentZ, currentX);
                            positions[i * 3] = Math.cos(angle) * targetRadius;
                            positions[i * 3 + 2] = Math.sin(angle) * targetRadius;
                        }
                    }
                }
            }

            positions[i * 3] += v.x * dt * 10;
            positions[i * 3 + 1] += v.y * dt * 10;
            positions[i * 3 + 2] += v.z * dt * 10;
            
            if (positions[i * 3 + 1] < -2) { v.y *= -0.5; positions[i * 3 + 1] = -2; }
        }

        if (!v.isAttached) v.life -= v.decay;
        
        let r, g, b;
        if (v.life > 0.8) {
            const t = (v.life - 0.8) / 0.2;
            r = 1.0; g = 1.0 * t + targetColor.g * (1-t); b = 1.0 * t + targetColor.b * (1-t);
        } else {
            let t = v.life / 0.8;
            let twinkle = 0.8 + 0.2 * Math.sin(now * 0.02 + i);
            if (v.isAttached) { t = 1.0; twinkle = 0.7 + 0.4 * Math.sin(now * 0.003 + i * 0.1); }
            r = targetColor.r * t * twinkle; g = targetColor.g * t * twinkle; b = targetColor.b * t * twinkle;
        }
        colors[i*3] = r; colors[i*3+1] = g; colors[i*3+2] = b;
        sizes[i] = (type === 'core' ? 0.6 : 0.3) * (v.isAttached ? 0.5 : v.life);
      }
      
      burst.geometry.attributes.position.needsUpdate = true;
      burst.geometry.attributes.color.needsUpdate = true;
      burst.geometry.attributes.size.needsUpdate = true;
    });

    this.rings.forEach(ring => {
        ring.userData.scale += 0.5;
        ring.scale.setScalar(ring.userData.scale);
        ring.userData.opacity *= 0.92;
        ring.material.opacity = ring.userData.opacity;
        if (ring.userData.opacity > 0.01) anyAlive = true;
        else this.scene.remove(ring);
    });
    this.rings = this.rings.filter(r => r.parent);

    if (this.glowLight) {
        this.glowLight.intensity *= 0.92;
        if (this.glowLight.intensity < 0.1) {
            this.scene.remove(this.glowLight);
            this.glowLight = null;
        }
    }

    return anyAlive || this.phase === 'launch';
  }

  dispose() {
    if (this.rocket) { this.scene.remove(this.rocket); this.rocket.geometry.dispose(); }
    if (this.launchTrail) { this.scene.remove(this.launchTrail); this.launchTrail.geometry.dispose(); }
    this.particles.forEach(p => { this.scene.remove(p); p.geometry.dispose(); });
    this.rings.forEach(r => { this.scene.remove(r); r.geometry.dispose(); });
    if (this.glowLight) this.scene.remove(this.glowLight);
  }
}
