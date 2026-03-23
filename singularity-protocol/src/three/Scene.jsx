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

/* Camera stays perfectly flat — no rotation, no tilt */
function CameraRig() {
  const { camera } = useThree()
  useFrame(() => { camera.rotation.set(0, 0, 0) })
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

  const pixelRatio = Math.min(window.devicePixelRatio, isMobile ? 1 : 2)
  const scrollRef  = useRef(0)
  useEffect(() => {
    const onScroll = () => { scrollRef.current = window.scrollY }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <SceneContext.Provider value={{ scrollRef }}>
      <Canvas
        style={{ position: 'absolute', inset: 0, zIndex: 3, pointerEvents: 'none' }}
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