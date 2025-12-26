import * as THREE from 'three';

export function createSnowflakeTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 64;
  canvas.height = 64;
  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, 64, 64);
  const cx = 32, cy = 32;
  ctx.strokeStyle = 'white';
  ctx.lineWidth = 2;
  ctx.lineCap = 'round';
  for (let i = 0; i < 6; i++) {
    const angle = (i * Math.PI) / 3;
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(angle);
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(0, -24);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(0, -8);
    ctx.lineTo(-6, -14);
    ctx.moveTo(0, -8);
    ctx.lineTo(6, -14);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(0, -16);
    ctx.lineTo(-5, -21);
    ctx.moveTo(0, -16);
    ctx.lineTo(5, -21);
    ctx.stroke();
    ctx.restore();
  }
  ctx.fillStyle = 'white';
  ctx.beginPath();
  ctx.arc(cx, cy, 3, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowColor = 'white';
  ctx.shadowBlur = 10;
  ctx.beginPath();
  ctx.arc(cx, cy, 2, 0, Math.PI * 2);
  ctx.fill();
  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;
  return texture;
}

export function createSparkleTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 128;
  canvas.height = 128;
  const ctx = canvas.getContext('2d');
  const cx = 64, cy = 64;
  const gradient = ctx.createRadialGradient(cx, cy, 0, cx, cy, 64);
  gradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
  gradient.addColorStop(0.1, 'rgba(255, 255, 200, 0.8)');
  gradient.addColorStop(0.3, 'rgba(255, 200, 100, 0.4)');
  gradient.addColorStop(0.6, 'rgba(255, 100, 50, 0.1)');
  gradient.addColorStop(1, 'rgba(255, 50, 0, 0)');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 128, 128);
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
  ctx.lineWidth = 2;
  for (let i = 0; i < 4; i++) {
    const angle = (i * Math.PI) / 2;
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(angle);
    ctx.beginPath();
    ctx.moveTo(0, -8);
    ctx.lineTo(0, -50);
    ctx.stroke();
    ctx.restore();
  }
  ctx.strokeStyle = 'rgba(255, 255, 200, 0.5)';
  ctx.lineWidth = 1;
  for (let i = 0; i < 8; i++) {
    const angle = (i * Math.PI) / 4 + Math.PI / 8;
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(angle);
    ctx.beginPath();
    ctx.moveTo(0, -5);
    ctx.lineTo(0, -25);
    ctx.stroke();
    ctx.restore();
  }
  const centerGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, 15);
  centerGrad.addColorStop(0, 'rgba(255, 255, 255, 1)');
  centerGrad.addColorStop(0.5, 'rgba(255, 255, 200, 0.8)');
  centerGrad.addColorStop(1, 'rgba(255, 200, 100, 0)');
  ctx.fillStyle = centerGrad;
  ctx.beginPath();
  ctx.arc(cx, cy, 15, 0, Math.PI * 2);
  ctx.fill();
  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;
  return texture;
}

export function createPineNeedleTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 128;
  canvas.height = 128;
  const ctx = canvas.getContext('2d');
  const cx = 64, cy = 64;
  ctx.clearRect(0, 0, 128, 128);
  const layers = 3;
  for (let layer = 0; layer < layers; layer++) {
    const layerOpacity = 0.6 + layer * 0.15;
    const layerOffset = (layer - 1) * 2;
    const bundleCount = 5 + layer * 2;
    for (let b = 0; b < bundleCount; b++) {
      const bundleAngle = (b / bundleCount) * Math.PI * 2 + layer * 0.3;
      const bundleDist = 8 + layer * 6 + Math.random() * 4;
      const bx = cx + Math.cos(bundleAngle) * bundleDist + layerOffset;
      const by = cy + Math.sin(bundleAngle) * bundleDist + layerOffset;
      const needleCount = 5 + Math.floor(Math.random() * 4);
      for (let i = 0; i < needleCount; i++) {
        const needleAngle = bundleAngle + (Math.random() - 0.5) * 0.8;
        const needleLength = 18 + Math.random() * 14;
        const curve = (Math.random() - 0.5) * 0.15;
        const hue = 0.28 + Math.random() * 0.06;
        const saturation = 0.5 + Math.random() * 0.3;
        const baseLightness = 0.18 + Math.random() * 0.12;
        const endX = bx + Math.cos(needleAngle + curve) * needleLength;
        const endY = by + Math.sin(needleAngle + curve) * needleLength;
        const gradient = ctx.createLinearGradient(bx, by, endX, endY);
        gradient.addColorStop(0, `hsla(${hue * 360}, ${saturation * 100}%, ${baseLightness * 100}%, ${layerOpacity})`);
        gradient.addColorStop(0.3, `hsla(${hue * 360}, ${(saturation - 0.1) * 100}%, ${(baseLightness + 0.08) * 100}%, ${layerOpacity * 0.9})`);
        gradient.addColorStop(0.7, `hsla(${hue * 360}, ${(saturation - 0.15) * 100}%, ${(baseLightness + 0.18) * 100}%, ${layerOpacity * 0.7})`);
        gradient.addColorStop(1, `hsla(${(hue + 0.02) * 360}, ${(saturation - 0.2) * 100}%, ${(baseLightness + 0.28) * 100}%, ${layerOpacity * 0.3})`);
        ctx.strokeStyle = gradient;
        ctx.lineWidth = 1.8 - layer * 0.2;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(bx, by);
        const midX = (bx + endX) / 2 + Math.cos(needleAngle + Math.PI / 2) * curve * needleLength * 0.3;
        const midY = (by + endY) / 2 + Math.sin(needleAngle + Math.PI / 2) * curve * needleLength * 0.3;
        ctx.quadraticCurveTo(midX, midY, endX, endY);
        ctx.stroke();
      }
    }
  }
  const centerGradient = ctx.createRadialGradient(cx, cy, 0, cx, cy, 12);
  centerGradient.addColorStop(0, 'rgba(25, 50, 25, 0.9)');
  centerGradient.addColorStop(0.5, 'rgba(35, 65, 35, 0.6)');
  centerGradient.addColorStop(1, 'rgba(45, 80, 45, 0)');
  ctx.fillStyle = centerGradient;
  ctx.beginPath();
  ctx.arc(cx, cy, 12, 0, Math.PI * 2);
  ctx.fill();
  for (let i = 0; i < 8; i++) {
    const angle = Math.random() * Math.PI * 2;
    const dist = 15 + Math.random() * 25;
    const length = 12 + Math.random() * 10;
    const startX = cx + Math.cos(angle) * dist;
    const startY = cy + Math.sin(angle) * dist;
    const endX = startX + Math.cos(angle) * length;
    const endY = startY + Math.sin(angle) * length;
    const highlightGrad = ctx.createLinearGradient(startX, startY, endX, endY);
    highlightGrad.addColorStop(0, 'rgba(80, 140, 80, 0.5)');
    highlightGrad.addColorStop(0.5, 'rgba(100, 170, 100, 0.4)');
    highlightGrad.addColorStop(1, 'rgba(130, 200, 130, 0.1)');
    ctx.strokeStyle = highlightGrad;
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.moveTo(startX, startY);
    ctx.lineTo(endX, endY);
    ctx.stroke();
  }
  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;
  return texture;
}

export function createPineConeTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 64;
  canvas.height = 64;
  const ctx = canvas.getContext('2d');
  const cx = 32, cy = 32;
  ctx.clearRect(0, 0, 64, 64);
  ctx.save();
  ctx.translate(cx, cy);
  const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, 24);
  gradient.addColorStop(0, 'rgba(139, 90, 43, 1)');
  gradient.addColorStop(0.6, 'rgba(101, 67, 33, 1)');
  gradient.addColorStop(1, 'rgba(70, 45, 20, 0.8)');
  ctx.fillStyle = gradient;
  ctx.beginPath();
  ctx.ellipse(0, 0, 18, 24, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = 'rgba(60, 40, 20, 0.6)';
  ctx.lineWidth = 1;
  for (let row = -3; row <= 3; row++) {
    for (let col = -2; col <= 2; col++) {
      const offsetX = (row % 2) * 4;
      const x = col * 8 + offsetX;
      const y = row * 6;
      if (x * x / 324 + y * y / 576 < 0.8) {
        ctx.beginPath();
        ctx.arc(x, y, 4, 0, Math.PI, true);
        ctx.stroke();
      }
    }
  }
  ctx.restore();
  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;
  return texture;
}

export function createBellTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 128;
  canvas.height = 128;
  const ctx = canvas.getContext('2d');
  const cx = 64, cy = 68;
  ctx.clearRect(0, 0, 128, 128);
  const gradient = ctx.createLinearGradient(cx - 40, 0, cx + 40, 0);
  gradient.addColorStop(0, 'rgba(120, 90, 40, 1)');
  gradient.addColorStop(0.2, 'rgba(218, 175, 75, 1)');
  gradient.addColorStop(0.35, 'rgba(255, 225, 120, 1)');
  gradient.addColorStop(0.5, 'rgba(245, 200, 80, 1)');
  gradient.addColorStop(0.65, 'rgba(255, 230, 140, 1)');
  gradient.addColorStop(0.8, 'rgba(200, 160, 60, 1)');
  gradient.addColorStop(1, 'rgba(100, 75, 30, 1)');
  ctx.fillStyle = gradient;
  ctx.beginPath();
  ctx.moveTo(cx, 16);
  ctx.quadraticCurveTo(cx + 8, 24, cx + 12, 32);
  ctx.quadraticCurveTo(cx + 36, 56, cx + 40, 88);
  ctx.quadraticCurveTo(cx + 40, 104, cx, 104);
  ctx.quadraticCurveTo(cx - 40, 104, cx - 40, 88);
  ctx.quadraticCurveTo(cx - 36, 56, cx - 12, 32);
  ctx.quadraticCurveTo(cx - 8, 24, cx, 16);
  ctx.fill();
  ctx.strokeStyle = 'rgba(255, 245, 200, 0.8)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(cx - 8, 20);
  ctx.quadraticCurveTo(cx - 30, 50, cx - 35, 85);
  ctx.stroke();
  const highlightGrad = ctx.createLinearGradient(cx - 20, cy - 30, cx + 5, cy + 10);
  highlightGrad.addColorStop(0, 'rgba(255, 255, 240, 0.9)');
  highlightGrad.addColorStop(0.5, 'rgba(255, 255, 220, 0.4)');
  highlightGrad.addColorStop(1, 'rgba(255, 255, 200, 0)');
  ctx.fillStyle = highlightGrad;
  ctx.beginPath();
  ctx.ellipse(cx - 12, cy - 16, 12, 24, -0.2, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = 'rgba(255, 255, 230, 0.3)';
  ctx.beginPath();
  ctx.ellipse(cx + 15, cy + 5, 6, 15, 0.3, 0, Math.PI * 2);
  ctx.fill();
  const rimGrad = ctx.createLinearGradient(cx - 40, 98, cx + 40, 98);
  rimGrad.addColorStop(0, 'rgba(140, 100, 40, 1)');
  rimGrad.addColorStop(0.3, 'rgba(255, 220, 120, 1)');
  rimGrad.addColorStop(0.5, 'rgba(180, 140, 50, 1)');
  rimGrad.addColorStop(0.7, 'rgba(255, 215, 100, 1)');
  rimGrad.addColorStop(1, 'rgba(120, 85, 35, 1)');
  ctx.fillStyle = rimGrad;
  ctx.beginPath();
  ctx.ellipse(cx, 102, 38, 6, 0, 0, Math.PI);
  ctx.fill();
  const clapperGrad = ctx.createRadialGradient(cx - 3, 106, 0, cx, 110, 10);
  clapperGrad.addColorStop(0, 'rgba(255, 240, 180, 1)');
  clapperGrad.addColorStop(0.4, 'rgba(200, 160, 60, 1)');
  clapperGrad.addColorStop(1, 'rgba(100, 70, 25, 1)');
  ctx.fillStyle = clapperGrad;
  ctx.beginPath();
  ctx.arc(cx, 110, 8, 0, Math.PI * 2);
  ctx.fill();
  const ringGrad = ctx.createLinearGradient(cx - 10, 4, cx + 10, 4);
  ringGrad.addColorStop(0, 'rgba(160, 120, 50, 1)');
  ringGrad.addColorStop(0.5, 'rgba(255, 225, 130, 1)');
  ringGrad.addColorStop(1, 'rgba(140, 100, 40, 1)');
  ctx.strokeStyle = ringGrad;
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.arc(cx, 12, 8, Math.PI, 0);
  ctx.stroke();
  ctx.strokeStyle = 'rgba(255, 255, 220, 0.6)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(cx, 12, 7, Math.PI * 1.2, Math.PI * 1.8);
  ctx.stroke();
  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;
  return texture;
}

export function createOrnamentTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 64;
  canvas.height = 64;
  const ctx = canvas.getContext('2d');
  const cx = 32, cy = 34;
  ctx.clearRect(0, 0, 64, 64);
  const colors = [
    { main: 'rgba(220, 20, 60, 1)', light: 'rgba(255, 100, 100, 0.6)' },
    { main: 'rgba(255, 215, 0, 1)', light: 'rgba(255, 250, 150, 0.6)' },
    { main: 'rgba(65, 105, 225, 1)', light: 'rgba(135, 175, 255, 0.6)' },
    { main: 'rgba(148, 0, 211, 1)', light: 'rgba(200, 100, 255, 0.6)' },
  ];
  const color = colors[Math.floor(Math.random() * colors.length)];
  const gradient = ctx.createRadialGradient(cx - 8, cy - 8, 0, cx, cy, 24);
  gradient.addColorStop(0, color.light);
  gradient.addColorStop(0.3, color.main);
  gradient.addColorStop(1, 'rgba(0, 0, 0, 0.3)');
  ctx.fillStyle = gradient;
  ctx.beginPath();
  ctx.arc(cx, cy, 22, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
  ctx.beginPath();
  ctx.ellipse(cx - 8, cy - 10, 6, 4, -0.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = 'rgba(218, 165, 32, 1)';
  ctx.beginPath();
  ctx.rect(cx - 6, 8, 12, 6);
  ctx.fill();
  ctx.strokeStyle = 'rgba(218, 165, 32, 1)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(cx, 6, 4, Math.PI, 0);
  ctx.stroke();
  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;
  return texture;
}

export function createCandyCaneTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 128;
  canvas.height = 128;
  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, 128, 128);
  ctx.save();
  ctx.translate(64, 64);
  ctx.rotate(-0.2);
  const drawCane = (offsetX, color) => {
    ctx.strokeStyle = color;
    ctx.lineWidth = 16;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(offsetX, 45);
    ctx.lineTo(offsetX, -15);
    ctx.quadraticCurveTo(offsetX, -40, offsetX - 25, -40);
    ctx.stroke();
  };
  drawCane(0, '#ffffff');
  ctx.strokeStyle = '#dc143c';
  ctx.lineWidth = 16;
  ctx.lineCap = 'round';
  ctx.setLineDash([12, 12]);
  ctx.beginPath();
  ctx.moveTo(0, 45);
  ctx.lineTo(0, -15);
  ctx.quadraticCurveTo(0, -40, -25, -40);
  ctx.stroke();
  ctx.setLineDash([]);
  const shineGrad = ctx.createLinearGradient(-10, 0, 10, 0);
  shineGrad.addColorStop(0, 'rgba(255,255,255,0)');
  shineGrad.addColorStop(0.3, 'rgba(255,255,255,0.4)');
  shineGrad.addColorStop(0.5, 'rgba(255,255,255,0.6)');
  shineGrad.addColorStop(0.7, 'rgba(255,255,255,0.4)');
  shineGrad.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.strokeStyle = shineGrad;
  ctx.lineWidth = 6;
  ctx.setLineDash([]);
  ctx.beginPath();
  ctx.moveTo(-3, 45);
  ctx.lineTo(-3, -15);
  ctx.quadraticCurveTo(-3, -37, -25, -37);
  ctx.stroke();
  ctx.restore();
  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;
  return texture;
}

export function createRibbonTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 128;
  canvas.height = 128;
  const ctx = canvas.getContext('2d');
  const cx = 64, cy = 64;
  ctx.clearRect(0, 0, 128, 128);
  const colors = [
    { main: '#dc143c', light: '#ff6b6b', dark: '#8b0000' },
    { main: '#ffd700', light: '#ffec8b', dark: '#b8860b' },
    { main: '#4169e1', light: '#87ceeb', dark: '#191970' },
    { main: '#9932cc', light: '#da70d6', dark: '#4b0082' },
  ];
  const c = colors[Math.floor(Math.random() * colors.length)];
  const leftGrad = ctx.createRadialGradient(cx - 30, cy, 5, cx - 30, cy, 35);
  leftGrad.addColorStop(0, c.light);
  leftGrad.addColorStop(0.5, c.main);
  leftGrad.addColorStop(1, c.dark);
  ctx.fillStyle = leftGrad;
  ctx.beginPath();
  ctx.ellipse(cx - 28, cy, 28, 20, -0.3, 0, Math.PI * 2);
  ctx.fill();
  const rightGrad = ctx.createRadialGradient(cx + 30, cy, 5, cx + 30, cy, 35);
  rightGrad.addColorStop(0, c.light);
  rightGrad.addColorStop(0.5, c.main);
  rightGrad.addColorStop(1, c.dark);
  ctx.fillStyle = rightGrad;
  ctx.beginPath();
  ctx.ellipse(cx + 28, cy, 28, 20, 0.3, 0, Math.PI * 2);
  ctx.fill();
  const centerGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, 15);
  centerGrad.addColorStop(0, c.light);
  centerGrad.addColorStop(0.6, c.main);
  centerGrad.addColorStop(1, c.dark);
  ctx.fillStyle = centerGrad;
  ctx.beginPath();
  ctx.ellipse(cx, cy, 12, 10, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = c.main;
  ctx.beginPath();
  ctx.moveTo(cx - 8, cy + 8);
  ctx.quadraticCurveTo(cx - 15, cy + 35, cx - 20, cy + 50);
  ctx.lineTo(cx - 12, cy + 48);
  ctx.quadraticCurveTo(cx - 5, cy + 30, cx, cy + 10);
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(cx + 8, cy + 8);
  ctx.quadraticCurveTo(cx + 15, cy + 35, cx + 20, cy + 50);
  ctx.lineTo(cx + 12, cy + 48);
  ctx.quadraticCurveTo(cx + 5, cy + 30, cx, cy + 10);
  ctx.fill();
  ctx.fillStyle = 'rgba(255,255,255,0.4)';
  ctx.beginPath();
  ctx.ellipse(cx - 32, cy - 8, 10, 6, -0.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(cx + 32, cy - 8, 10, 6, 0.5, 0, Math.PI * 2);
  ctx.fill();
  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;
  return texture;
}

export function createIcicleTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 64;
  canvas.height = 128;
  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, 64, 128);
  const icicleGrad = ctx.createLinearGradient(20, 0, 44, 0);
  icicleGrad.addColorStop(0, 'rgba(200, 230, 255, 0.3)');
  icicleGrad.addColorStop(0.2, 'rgba(220, 240, 255, 0.7)');
  icicleGrad.addColorStop(0.4, 'rgba(255, 255, 255, 0.9)');
  icicleGrad.addColorStop(0.6, 'rgba(200, 230, 255, 0.6)');
  icicleGrad.addColorStop(0.8, 'rgba(180, 220, 255, 0.4)');
  icicleGrad.addColorStop(1, 'rgba(150, 200, 255, 0.2)');
  ctx.fillStyle = icicleGrad;
  ctx.beginPath();
  ctx.moveTo(32, 8);
  ctx.lineTo(44, 15);
  ctx.quadraticCurveTo(46, 40, 42, 70);
  ctx.quadraticCurveTo(38, 100, 32, 120);
  ctx.quadraticCurveTo(26, 100, 22, 70);
  ctx.quadraticCurveTo(18, 40, 20, 15);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(24, 18);
  ctx.quadraticCurveTo(22, 50, 26, 90);
  ctx.stroke();
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
  ctx.lineWidth = 1;
  for (let i = 0; i < 4; i++) {
    ctx.beginPath();
    ctx.moveTo(28 + i * 3, 20 + i * 10);
    ctx.lineTo(30 + i * 2, 50 + i * 15);
    ctx.stroke();
  }
  ctx.fillStyle = 'rgba(192, 192, 192, 0.9)';
  ctx.beginPath();
  ctx.arc(32, 8, 4, 0, Math.PI * 2);
  ctx.fill();
  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;
  return texture;
}

export function createSnowflakeOrnamentTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 128;
  canvas.height = 128;
  const ctx = canvas.getContext('2d');
  const cx = 64, cy = 64;
  ctx.clearRect(0, 0, 128, 128);
  const glowGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, 55);
  glowGrad.addColorStop(0, 'rgba(200, 230, 255, 0.3)');
  glowGrad.addColorStop(0.5, 'rgba(180, 220, 255, 0.15)');
  glowGrad.addColorStop(1, 'rgba(150, 200, 255, 0)');
  ctx.fillStyle = glowGrad;
  ctx.beginPath();
  ctx.arc(cx, cy, 55, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.95)';
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  for (let i = 0; i < 6; i++) {
    const angle = (i * Math.PI) / 3;
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(angle);
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(0, -42);
    ctx.stroke();
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(0, -42);
    ctx.lineTo(-8, -50);
    ctx.moveTo(0, -42);
    ctx.lineTo(8, -50);
    ctx.stroke();
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(0, -15);
    ctx.lineTo(-12, -25);
    ctx.moveTo(0, -15);
    ctx.lineTo(12, -25);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(0, -28);
    ctx.lineTo(-8, -36);
    ctx.moveTo(0, -28);
    ctx.lineTo(8, -36);
    ctx.stroke();
    ctx.fillStyle = 'rgba(200, 230, 255, 0.9)';
    ctx.beginPath();
    ctx.arc(-12, -25, 3, 0, Math.PI * 2);
    ctx.arc(12, -25, 3, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
  const centerGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, 10);
  centerGrad.addColorStop(0, 'rgba(255, 255, 255, 1)');
  centerGrad.addColorStop(0.5, 'rgba(200, 230, 255, 0.9)');
  centerGrad.addColorStop(1, 'rgba(180, 220, 255, 0.7)');
  ctx.fillStyle = centerGrad;
  ctx.beginPath();
  ctx.arc(cx, cy, 8, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
  for (let i = 0; i < 6; i++) {
    const angle = (i * Math.PI) / 3 + Math.PI / 6;
    const x = cx + Math.cos(angle) * 20;
    const y = cy + Math.sin(angle) * 20;
    ctx.beginPath();
    ctx.arc(x, y, 2, 0, Math.PI * 2);
    ctx.fill();
  }
  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;
  return texture;
}
