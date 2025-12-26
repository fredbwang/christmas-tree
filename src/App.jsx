import React, { useState, useRef, useCallback } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Stars } from '@react-three/drei';
import RealisticTree from './components/RealisticTree';
import FlyingBirds from './components/FlyingBirds';
import FireworkSystem from './components/FireworkSystem';
import PhotoGallery from './components/PhotoGallery';
import Snow from './components/Snow';
import './App.css';

export default function App() {
  const [photos, setPhotos] = useState([]);
  const [isRotating, setIsRotating] = useState(true);
  const [isTreeExploding, setIsTreeExploding] = useState(false);
  const [treeExplodeStartTime, setTreeExplodeStartTime] = useState(0);
  const [fireworkTrigger, setFireworkTrigger] = useState(0);
  const fileInputRef = useRef();

  const handlePhotoUpload = useCallback((e) => {
    const files = Array.from(e.target.files);
    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
            const aspectRatio = img.width / img.height;
            const baseSize = 0.35 + Math.random() * 0.25;
            let width, height;
            if (aspectRatio > 1) { width = baseSize; height = baseSize / aspectRatio; }
            else { height = baseSize; width = baseSize * aspectRatio; }

            const photoIndex = photos.length;
            const t = 0.12 + (photoIndex % 6) * 0.14 + Math.random() * 0.05;
            const y = t * 5 + 0.5;
            const treeRadius = 2.2 * (1 - t * 0.88);
            const angle = (photoIndex * 137.5 * Math.PI / 180) + (Math.random() - 0.5) * 0.3;
            const surfaceRadius = treeRadius - 0.05;
            
            const x = Math.cos(angle) * surfaceRadius;
            const z = Math.sin(angle) * surfaceRadius;

            setPhotos(prev => [...prev, {
                id: Date.now() + Math.random(),
                url: event.target.result,
                size: { width, height },
                originalPos: { x, y, z } // Object for vector conversion later
            }]);
        };
        img.src = event.target.result;
      };
      reader.readAsDataURL(file);
    });
    e.target.value = '';
  }, [photos.length]);

  const toggleExplosion = () => {
      if (isTreeExploding) {
          // Reassemble logic handled by component reacting to state change
          setIsTreeExploding(false);
      } else {
          setIsTreeExploding(true);
          setTreeExplodeStartTime(Date.now());
          // Flash effect via DOM or PostProcessing? Vanilla used a point light.
          // We can handle light in Tree component.
      }
  };

  const triggerFirework = () => {
      setFireworkTrigger(t => t + 1);
  };

  return (
    <div className="app-container">
      <h1 className="title">🎄 Merry Christmas! 🎄</h1>
      {photos.length > 0 && <p className="photo-count">已添加 {photos.length} 张照片装饰</p>}

      <Canvas camera={{ position: [0, 2, 10], fov: 60 }} gl={{ antialias: true }}>
        <color attach="background" args={['#0a1628']} />
        <fog attach="fog" args={['#0a1628', 10, 30]} />
        
        <ambientLight intensity={0.3} />
        <pointLight position={[10, 10, 10]} intensity={0.5} />
        <pointLight position={[-10, 10, -10]} intensity={0.3} color="#ff9999" />
        <spotLight position={[0, 10, 0]} angle={0.5} penumbra={0.5} intensity={0.8} color="#fffacd" />
        
        <Stars radius={50} depth={50} count={2000} factor={4} saturation={0} />
        
        <group rotation-y={isRotating && !isTreeExploding ? Date.now()*0.0005 : 0}> 
           {/* Note: React state update for rotation is slow, better to use ref in components or a wrapper */}
           {/* Actually, RealisticTree has internal rotation logic if passed isRotating */}
        </group>
        {/* We pass isRotating to components or wrap them */}
        <TreeWrapper isRotating={isRotating} isTreeExploding={isTreeExploding}>
            <RealisticTree isTreeExploding={isTreeExploding} treeExplodeStartTime={treeExplodeStartTime} />
            <FlyingBirds isTreeExploding={isTreeExploding} treeExplodeStartTime={treeExplodeStartTime} />
            <PhotoGallery photos={photos} isTreeExploding={isTreeExploding} treeExplodeStartTime={treeExplodeStartTime} />
        </TreeWrapper>

        <FireworkSystem trigger={fireworkTrigger} isTreeExploding={isTreeExploding} />
        <Snow />

        <OrbitControls enablePan={false} minDistance={6} maxDistance={18} minPolarAngle={Math.PI/6} maxPolarAngle={Math.PI/2} target={[0, 2.5, 0]} />
      </Canvas>

      <div className="controls">
        <input ref={fileInputRef} type="file" accept="image/*" multiple onChange={handlePhotoUpload} style={{display:'none'}} />
        <button className="control-btn upload-btn" onClick={() => fileInputRef.current.click()}>📷 上传照片</button>
        <button className="control-btn explode-btn" onClick={triggerFirework}>🎆 烟花特效</button>
        <button className="control-btn tree-explode-btn" onClick={toggleExplosion}>💥 {isTreeExploding ? '重建' : '圣诞树爆炸'}</button>
        <button className={`control-btn rotate-btn ${isRotating ? 'active' : ''}`} onClick={() => setIsRotating(!isRotating)}>
          🔄 {isRotating ? '停止旋转' : '开始旋转'}
        </button>
      </div>
    </div>
  );
}

function TreeWrapper({ isRotating, isTreeExploding, children }) {
    const group = useRef();
    useFrame((state, delta) => {
        if (group.current && isRotating && !isTreeExploding) {
            group.current.rotation.y += delta * 0.2;
        }
    });
    return <group ref={group}>{children}</group>;
}