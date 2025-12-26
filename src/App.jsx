import React, { useState, useRef, useCallback } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, Stars } from '@react-three/drei'
import ChristmasTree from './components/ChristmasTree'
import PhotoDecorations from './components/PhotoDecorations'
import ParticleExplosion from './components/ParticleExplosion'
import SnowEffect from './components/SnowEffect'

function App() {
  const [photos, setPhotos] = useState([])
  const [isRotating, setIsRotating] = useState(true)
  const [explosions, setExplosions] = useState([])
  const fileInputRef = useRef()

  const handlePhotoUpload = useCallback((e) => {
    const files = Array.from(e.target.files)
    files.forEach(file => {
      const reader = new FileReader()
      reader.onload = (event) => {
        setPhotos(prev => [...prev, {
          id: Date.now() + Math.random(),
          url: event.target.result,
          position: [
            (Math.random() - 0.5) * 2,
            Math.random() * 3 + 0.5,
            (Math.random() - 0.5) * 2
          ],
          rotation: Math.random() * Math.PI * 2
        }])
      }
      reader.readAsDataURL(file)
    })
    e.target.value = ''
  }, [])

  const triggerExplosion = useCallback(() => {
    const newExplosion = {
      id: Date.now(),
      position: [
        (Math.random() - 0.5) * 3,
        Math.random() * 3 + 1,
        (Math.random() - 0.5) * 3
      ]
    }
    setExplosions(prev => [...prev, newExplosion])
    setTimeout(() => {
      setExplosions(prev => prev.filter(e => e.id !== newExplosion.id))
    }, 2000)
  }, [])

  return (
    <div className="app-container">
      <h1 className="title">🎄 Merry Christmas! 🎄</h1>
      {photos.length > 0 && (
        <p className="photo-count">已添加 {photos.length} 张照片装饰</p>
      )}

      <Canvas
        camera={{ position: [0, 3, 8], fov: 60 }}
        gl={{ antialias: true }}
      >
        <color attach="background" args={['#0a1628']} />
        <fog attach="fog" args={['#0a1628', 10, 30]} />

        <ambientLight intensity={0.3} />
        <pointLight position={[10, 10, 10]} intensity={0.5} />
        <pointLight position={[-10, 10, -10]} intensity={0.3} color="#ff9999" />
        <spotLight
          position={[0, 10, 0]}
          angle={0.5}
          penumbra={0.5}
          intensity={0.8}
          color="#fffacd"
        />

        <Stars radius={50} depth={50} count={2000} factor={4} saturation={0} />

        <ChristmasTree isRotating={isRotating} />
        <PhotoDecorations photos={photos} isRotating={isRotating} />

        {explosions.map(exp => (
          <ParticleExplosion key={exp.id} position={exp.position} />
        ))}

        <SnowEffect />

        <OrbitControls
          enablePan={false}
          minDistance={5}
          maxDistance={15}
          minPolarAngle={Math.PI / 6}
          maxPolarAngle={Math.PI / 2}
        />
      </Canvas>

      <div className="controls">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={handlePhotoUpload}
          className="hidden-input"
        />
        <button
          className="control-btn upload-btn"
          onClick={() => fileInputRef.current.click()}
        >
          📷 上传照片
        </button>
        <button
          className="control-btn explode-btn"
          onClick={triggerExplosion}
        >
          🎆 烟花特效
        </button>
        <button
          className={`control-btn rotate-btn ${isRotating ? 'active' : ''}`}
          onClick={() => setIsRotating(!isRotating)}
        >
          🔄 {isRotating ? '停止旋转' : '开始旋转'}
        </button>
      </div>
    </div>
  )
}

export default App
