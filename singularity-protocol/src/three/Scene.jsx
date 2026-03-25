/**
 * Scene.jsx — character positioned to right of text, no overlap
 * Character group at x:0.8 in 3D = roughly 56-70% from left in viewport
 * Text occupies left 44vw — safe gap between them
 */
import { createContext, useContext, useRef, useEffect, useState, Suspense } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import Character from './Character'
import Planet    from './Planet'

export const SceneContext = createContext({ scrollRef: { current: 0 } })
export function useSceneContext() { return useContext(SceneContext) }

function Lighting({ isMobile }) {
  if (isMobile) return (
    <>
      <ambientLight intensity={0.5} />
      <directionalLight position={[3, 5, 3]} intensity={1.0} />
    </>
  )
  return (
    <>
      <ambientLight intensity={0.25} />
      {/* Key: upper-right warm amber matching the sun */}
      <directionalLight position={[6, 8, 4]} intensity={1.5} color="#FFD0A0" castShadow />
      {/* Cyan rim from left */}
      <pointLight position={[-3, 2, 3]}  intensity={1.8} color="#00E0FF" distance={12} decay={2} />
      {/* Purple atmospheric fill */}
      <pointLight position={[2, -2, -3]} intensity={0.7} color="#7B61FF" distance={10} decay={2} />
      {/* Ground bounce */}
      <pointLight position={[0, -1.5, 1]} intensity={0.55} color="#FFFFFF" distance={6} decay={2} />
    </>
  )
}

/* Camera animates from a tight, centred shot on the character to a wide shot */
function CameraRig() {
  const { camera } = useThree()
  const { scrollRef } = useSceneContext()
  
  useFrame(() => {
    camera.rotation.set(0, 0, 0)
    
    // Calculate scroll progress (0 at top, 1 at 100vh)
    const vh = window.innerHeight
    const p = Math.min(1, Math.max(0, scrollRef.current / vh))
    
    // Character is at x=0.8 in 3D space.
    // To center the character when zoomed in, camera.x should be near 0.8.
    // To zoom in, camera.z should be smaller (e.g. 2.5).
    const targetX = 0.8 * (1 - p)      // 0.8 -> 0
    const targetY = 0.2 + 0.1 * (1 - p) // 0.3 -> 0.2
    const targetZ = 3.0 + (p * 3.0)    // 3.0 -> 6.0
    
    // Smooth lerp
    camera.position.x += (targetX - camera.position.x) * 0.08
    camera.position.y += (targetY - camera.position.y) * 0.08
    camera.position.z += (targetZ - camera.position.z) * 0.08
  })
  
  return null
}

function SceneContent({ isMobile, frameVisible }) {
  return (
    <>
      <Lighting isMobile={isMobile} />
      <CameraRig />
      <Suspense fallback={null}>
        <Character isMobile={isMobile} frameVisible={frameVisible} />
        <Planet    isMobile={isMobile} />
      </Suspense>
    </>
  )
}

export default function Scene({ frameVisible = false }) {
  const [isMobile, setIsMobile] = useState(() => window.innerWidth < 768)
  useEffect(() => {
    const mq = window.matchMedia('(max-width: 767px)')
    const h  = e => setIsMobile(e.matches)
    mq.addEventListener('change', h)
    return () => mq.removeEventListener('change', h)
  }, [])

  const pixelRatio = Math.min(window.devicePixelRatio, isMobile ? 0.75 : 1.5)
  const scrollRef  = useRef(0)
  useEffect(() => {
    const onScroll = () => { scrollRef.current = window.scrollY }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <SceneContext.Provider value={{ scrollRef }}>
      <Canvas
        style={{ position: 'absolute', inset: 0, zIndex: 3, pointerEvents: 'auto' }}
        camera={{ position: [0, 0.2, 6], fov: 46, near: 0.1, far: 100 }}
        dpr={pixelRatio}
        shadows={!isMobile}
        gl={{ antialias: !isMobile, powerPreference: 'high-performance', alpha: true }}
      >
        <SceneContent isMobile={isMobile} frameVisible={frameVisible} />
      </Canvas>
    </SceneContext.Provider>
  )
}