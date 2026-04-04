/**
 * Character.jsx — no frame, composites into background
 * x: 0.8 → right half of viewport, doesn't touch text (left 44vw)
 * RingPlatform always visible (matches reference image)
 * GroundShadow for grounding
 * 5-light cinematic rig
 */
import { useRef, useEffect, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import { useGLTF, useAnimations } from '@react-three/drei'
import * as THREE from 'three'
import { useSceneContext } from './Scene'

const DESKTOP_PATH = '/assets/models/base_basic_pbr_draco.glb'
const MOBILE_PATH = '/assets/models/base_basic_shaded_draco.glb'

useGLTF.preload(DESKTOP_PATH)
useGLTF.preload(MOBILE_PATH)

const FH = 2.85
const HH = FH / 2
const SCROLL_SPEED = 0.40 / 1000

/* ── Interaction ── */
const state = {
  mouseX: 0, mouseY: 0, isDragging: false,
  lastX: 0, lastY: 0, rotY: 0, rotX: 0, velX: 0, velY: 0,
}
function isInDragZone(cx, cy) {
  const nx = cx / window.innerWidth;
  const ny = cy / window.innerHeight;
  // Only allow drag in the character's area: right half + centre-bottom band
  return nx > 0.35 && ny > 0.25 && ny < 0.85;
}
if (typeof window !== 'undefined') {
  window.addEventListener('mousemove', e => {
    state.mouseX = (e.clientX / window.innerWidth) * 2 - 1
    state.mouseY = -(e.clientY / window.innerHeight) * 2 + 1
    if (state.isDragging) {
      const dx = e.clientX - state.lastX, dy = e.clientY - state.lastY
      state.velY = dx * 0.004; state.velX = dy * 0.003
      state.rotY += dx * 0.004; state.rotX += dy * 0.003
      state.rotX = Math.max(-0.30, Math.min(0.30, state.rotX))
      state.lastX = e.clientX; state.lastY = e.clientY
      document.body.style.cursor = 'grabbing'
    }
  }, { passive: true })
  window.addEventListener('mousedown', e => {
    if (isInDragZone(e.clientX, e.clientY)) {
      state.isDragging = true; state.lastX = e.clientX; state.lastY = e.clientY
      state.velX = state.velY = 0; document.body.style.cursor = 'grabbing'
    }
  })
  window.addEventListener('mouseup', () => { state.isDragging = false; document.body.style.cursor = 'default' })
  window.addEventListener('touchstart', e => {
    const t = e.touches[0]
    if (isInDragZone(t.clientX, t.clientY)) { state.isDragging = true; state.lastX = t.clientX; state.lastY = t.clientY; state.velX = state.velY = 0 }
  }, { passive: true })
  window.addEventListener('touchmove', e => {
    if (!state.isDragging) return
    const t = e.touches[0], dx = t.clientX - state.lastX, dy = t.clientY - state.lastY
    state.velY = dx * 0.004; state.velX = dy * 0.003
    state.rotY += dx * 0.004; state.rotX += dy * 0.003
    state.rotX = Math.max(-0.30, Math.min(0.30, state.rotX))
    state.lastX = t.clientX; state.lastY = t.clientY
  }, { passive: true })
  window.addEventListener('touchend', () => { state.isDragging = false }, { passive: true })
}

/* ══ Ring Platform — animated emissive pulse ══ */
function RingPlatform({ isMobile }) {
  const ringRef = useRef(), glowRef = useRef(), pulseRef = useRef()
  const ringMatRef = useRef(), glowMatRef = useRef()

  useFrame(({ clock }) => {
    const t = clock.elapsedTime
    if (ringRef.current) ringRef.current.rotation.y = t * 0.3
    if (glowRef.current?.material) glowRef.current.material.opacity = 0.45 + 0.2 * Math.sin(t * 1.2)
    if (pulseRef.current?.material) pulseRef.current.material.opacity = 0.18 + 0.1 * Math.sin(t * 0.8)

    // Animated emissive pulsing on ring
    if (ringMatRef.current) {
      ringMatRef.current.emissiveIntensity = 1.5 + Math.sin(t * 2.0) * 0.8
    }
    if (glowMatRef.current) {
      glowMatRef.current.emissiveIntensity = 0.8 + Math.sin(t * 1.5) * 0.5
    }
  })

  return (
    <group position={[0, -HH + 0.05, 0]}>
      {/* Main ring — pulsing cyan emissive, feeds bloom hard */}
      <mesh ref={ringRef} rotation={[-Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.7, 0.04, 16, 128]} />
        <meshStandardMaterial ref={ringMatRef} color="#FFFFFF" emissive="#00E0FF" emissiveIntensity={1.5} transparent opacity={0.95} />
      </mesh>
      {/* Soft outer ring glow */}
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.7, 0.18, 16, 64]} />
        <meshBasicMaterial color="#AAFFFF" transparent opacity={0.22} />
      </mesh>
      {/* Inner glow disc — strong cyan for bloom pickup */}
      <mesh ref={glowRef} rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]}>
        <circleGeometry args={[1.2, 64]} />
        <meshStandardMaterial ref={glowMatRef} color="#00E0FF" emissive="#00E0FF" emissiveIntensity={0.8} transparent opacity={0.45} side={THREE.DoubleSide} />
      </mesh>
      {/* Outer atmospheric pulse */}
      <mesh ref={pulseRef} rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.02, 0]}>
        <circleGeometry args={[2.2, 64]} />
        <meshBasicMaterial color="#7B61FF" transparent opacity={0.18} side={THREE.DoubleSide} />
      </mesh>
    </group>
  )
}

/* ══ Sun Aura — large emissive sphere behind the character creating a solar corona ══ */
function SunAura({ isMobile }) {
  const auraRef = useRef()
  const matRef = useRef()
  const coreRef = useRef()
  const coreMatRef = useRef()

  // Divine color palette: cycle between cyan, gold, and purple
  const colorA = useMemo(() => new THREE.Color('#00E0FF'), [])
  const colorB = useMemo(() => new THREE.Color('#FFD060'), [])
  const colorC = useMemo(() => new THREE.Color('#9B6DFF'), [])
  const tempColor = useMemo(() => new THREE.Color(), [])

  useFrame(({ clock }) => {
    const t = clock.elapsedTime

    // Slow breathing scale
    if (auraRef.current) {
      const s = 1.0 + Math.sin(t * 0.5) * 0.08
      auraRef.current.scale.setScalar(s)
    }

    // Animate emissive color cycling: cyan → gold → purple → cyan
    const cycle = (t * 0.15) % 1           // full cycle every ~6.7s
    if (cycle < 0.33) {
      tempColor.lerpColors(colorA, colorB, cycle / 0.33)
    } else if (cycle < 0.66) {
      tempColor.lerpColors(colorB, colorC, (cycle - 0.33) / 0.33)
    } else {
      tempColor.lerpColors(colorC, colorA, (cycle - 0.66) / 0.34)
    }

    // Apply to outer aura
    if (matRef.current) {
      matRef.current.emissive.copy(tempColor)
      matRef.current.emissiveIntensity = 1.8 + Math.sin(t * 1.5) * 0.6
      matRef.current.opacity = 0.12 + Math.sin(t * 0.8) * 0.04
    }

    // Inner bright core — hotter, more stable
    if (coreMatRef.current) {
      coreMatRef.current.emissive.copy(tempColor)
      coreMatRef.current.emissiveIntensity = 2.5 + Math.sin(t * 2.0) * 1.0
      coreMatRef.current.opacity = 0.18 + Math.sin(t * 1.2) * 0.06
    }
  })

  const auraSize = isMobile ? 1.6 : 2.2
  const coreSize = isMobile ? 0.6 : 0.9

  return (
    <group position={[0, 0.2, -0.8]}>
      {/* Outer aura sphere — large, soft, feeds bloom for the solar corona */}
      <mesh ref={auraRef}>
        <sphereGeometry args={[auraSize, 32, 32]} />
        <meshStandardMaterial
          ref={matRef}
          color="#000000"
          emissive="#00E0FF"
          emissiveIntensity={1.8}
          transparent
          opacity={0.12}
          side={THREE.BackSide}
          depthWrite={false}
        />
      </mesh>
      {/* Inner core — hotter, brighter, smaller */}
      <mesh ref={coreRef}>
        <sphereGeometry args={[coreSize, 24, 24]} />
        <meshStandardMaterial
          ref={coreMatRef}
          color="#000000"
          emissive="#FFD060"
          emissiveIntensity={2.5}
          transparent
          opacity={0.18}
          side={THREE.BackSide}
          depthWrite={false}
        />
      </mesh>
    </group>
  )
}

/* ══ Divine Particles — tiny emissive points orbiting the character ══ */
const PARTICLE_COUNT = 50

function DivineParticles({ isMobile }) {
  const pointsRef = useRef()

  // Generate random orbits for each particle
  const particleData = useMemo(() => {
    const data = []
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      data.push({
        radius: 0.8 + Math.random() * 1.5,         // orbit radius
        height: (Math.random() - 0.5) * 3.0,        // vertical spread
        speed: 0.3 + Math.random() * 0.7,            // orbit speed
        phase: Math.random() * Math.PI * 2,          // starting angle
        vertSpeed: (Math.random() - 0.5) * 0.3,      // vertical drift
        size: 0.015 + Math.random() * 0.025,          // particle size
      })
    }
    return data
  }, [])

  // Pre-allocate geometry buffers
  const [positions, colors] = useMemo(() => {
    const pos = new Float32Array(PARTICLE_COUNT * 3)
    const col = new Float32Array(PARTICLE_COUNT * 3)
    // Initialize colors: mix of cyan, purple, gold
    const palette = [
      new THREE.Color('#00E0FF'),
      new THREE.Color('#7B61FF'),
      new THREE.Color('#FFD060'),
      new THREE.Color('#FFFFFF'),
    ]
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const c = palette[Math.floor(Math.random() * palette.length)]
      col[i * 3] = c.r
      col[i * 3 + 1] = c.g
      col[i * 3 + 2] = c.b
    }
    return [pos, col]
  }, [])

  useFrame(({ clock }) => {
    if (!pointsRef.current) return
    const t = clock.elapsedTime
    const geo = pointsRef.current.geometry
    const posAttr = geo.attributes.position

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const p = particleData[i]
      const angle = p.phase + t * p.speed
      posAttr.array[i * 3] = Math.cos(angle) * p.radius
      posAttr.array[i * 3 + 1] = p.height + Math.sin(t * p.vertSpeed + p.phase) * 0.5
      posAttr.array[i * 3 + 2] = Math.sin(angle) * p.radius
    }
    posAttr.needsUpdate = true
  })

  if (isMobile) return null   // Skip particles on mobile for performance

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" array={positions} count={PARTICLE_COUNT} itemSize={3} />
        <bufferAttribute attach="attributes-color" array={colors} count={PARTICLE_COUNT} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial
        size={0.04}
        vertexColors
        transparent
        opacity={0.8}
        sizeAttenuation
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  )
}

/* ── Ground shadow ── */
const SV = `varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}`
const SF = `varying vec2 vUv;uniform vec3 uColor;uniform float uOpacity;uniform float uSoftness;
void main(){vec2 uv=(vUv-0.5)*2.0;float d=length(uv*vec2(1.0,1.6));float a=1.0-smoothstep(0.0,uSoftness,d);gl_FragColor=vec4(uColor,a*uOpacity);}`

function GroundShadow() {
  const uD = useRef({ uColor: { value: new THREE.Color('#000008') }, uOpacity: { value: 0.55 }, uSoftness: { value: 0.95 } })
  const uA = useRef({ uColor: { value: new THREE.Color('#7a3a00') }, uOpacity: { value: 0.28 }, uSoftness: { value: 0.70 } })
  const uC = useRef({ uColor: { value: new THREE.Color('#002a35') }, uOpacity: { value: 0.22 }, uSoftness: { value: 0.50 } })
  const y = -HH + 0.02
  return (
    <group position={[0, y, 0.01]}>
      <mesh rotation={[-Math.PI / 2, 0, 0]}><planeGeometry args={[2.8, 1.2]} /><shaderMaterial vertexShader={SV} fragmentShader={SF} uniforms={uD.current} transparent depthWrite={false} side={THREE.DoubleSide} /></mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0.3, 0, 0]}><planeGeometry args={[2.2, 0.9]} /><shaderMaterial vertexShader={SV} fragmentShader={SF} uniforms={uA.current} transparent depthWrite={false} blending={THREE.AdditiveBlending} side={THREE.DoubleSide} /></mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]}><planeGeometry args={[1.4, 0.6]} /><shaderMaterial vertexShader={SV} fragmentShader={SF} uniforms={uC.current} transparent depthWrite={false} blending={THREE.AdditiveBlending} side={THREE.DoubleSide} /></mesh>
    </group>
  )
}

/* ── Character mesh + 5-light rig ── */
function CharacterMesh({ isMobile }) {
  const meshRef = useRef()
  const path = isMobile ? MOBILE_PATH : DESKTOP_PATH
  const { scene, animations } = useGLTF(path)
  const { actions, names } = useAnimations(animations, meshRef)

  useEffect(() => {
    if (!names.length) return
    const name = names.find(n => /idle/i.test(n)) || names.find(n => /stand/i.test(n)) || names[0]
    if (name && actions[name]) actions[name].reset().setLoop(THREE.LoopRepeat, Infinity).fadeIn(0.4).play()
    return () => Object.values(actions).forEach(a => a?.stop())
  }, [actions, names])

  useEffect(() => {
    if (!scene) return
    const box = new THREE.Box3().setFromObject(scene)
    const size = box.getSize(new THREE.Vector3())
    const center = box.getCenter(new THREE.Vector3())
    const height = size.y || 1
    const scale = ((FH - 0.3) / height) * (isMobile ? 0.8 : 1.0)
    scene.scale.setScalar(scale)
    scene.position.x = -center.x * scale
    scene.position.y = -center.y * scale
    scene.position.z = -center.z * scale
    scene.traverse(c => {
      if (c.isMesh) {
        c.castShadow = true
        // Add emissive glow for bloom post-processing aura
        if (c.material && !c.material.isShaderMaterial) {
          c.material = c.material.clone()   // don't mutate shared materials
          c.material.emissive = new THREE.Color(0x00ccff)
          c.material.emissiveIntensity = isMobile ? 0.2 : 0.4
          // Store ref so useFrame can animate it
          if (!c.userData._emissiveReady) {
            c.userData._emissiveReady = true
          }
        }
      }
    })
  }, [scene, isMobile])

  // Collect emissive material refs for animation
  const materialsRef = useRef([])
  useEffect(() => {
    if (!scene) return
    const mats = []
    scene.traverse(c => {
      if (c.isMesh && c.material && c.material.emissive) mats.push(c.material)
    })
    materialsRef.current = mats
  }, [scene, isMobile])

  // Divine color palette for character glow
  const colorCyan = useMemo(() => new THREE.Color('#00E0FF'), [])
  const colorGold = useMemo(() => new THREE.Color('#FFD060'), [])
  const colorPurple = useMemo(() => new THREE.Color('#9B6DFF'), [])
  const tempColor = useMemo(() => new THREE.Color(), [])

  useFrame(({ clock }) => {
    if (!meshRef.current) return
    const t = clock.elapsedTime

    // ── Animate emissive intensity: breathing heartbeat ──
    const breathe = Math.sin(t * 1.5) * 0.5 + 1.0  // oscillates 0.5 to 1.5
    const baseIntensity = isMobile ? 0.2 : 0.4

    // ── Animate emissive color: divine cycle ──
    const cycle = (t * 0.12) % 1
    if (cycle < 0.33) {
      tempColor.lerpColors(colorCyan, colorGold, cycle / 0.33)
    } else if (cycle < 0.66) {
      tempColor.lerpColors(colorGold, colorPurple, (cycle - 0.33) / 0.33)
    } else {
      tempColor.lerpColors(colorPurple, colorCyan, (cycle - 0.66) / 0.34)
    }

    // Apply to all character materials
    materialsRef.current.forEach(mat => {
      mat.emissive.copy(tempColor)
      mat.emissiveIntensity = baseIntensity * breathe
    })

    // Disable 3D rotation dragging during Mobile Phase 0
    let interactionDisabled = false;
    if (isMobile) {
      const vh = window.innerHeight;
      const p = Math.min(1, Math.max(0, window.scrollY / (vh * 2)));
      if (p < 0.9) interactionDisabled = true;
    }

    if (state.isDragging && !interactionDisabled) {
      meshRef.current.rotation.y = state.rotY
      meshRef.current.rotation.x = state.rotX
    } else {
      // If disabled safely flush the state without applying it
      if (interactionDisabled) {
        state.isDragging = false;
        state.rotY = 0;
        state.rotX = 0;
        state.velY = 0;
        state.velX = 0;
      }

      // Apply remaining velocity with friction
      state.rotY += state.velY; state.rotX += state.velX
      state.velY *= 0.80; state.velX *= 0.80

      // ── Elastic spring-back: smoothly decay rotation towards origin ──
      state.rotY += (0 - state.rotY) * 0.03
      state.rotX += (0 - state.rotX) * 0.03

      if (!interactionDisabled) {
        const tY = state.rotY + state.mouseX * 0.02
        const tX = state.rotX + state.mouseY * -0.008
        meshRef.current.rotation.y += (tY - meshRef.current.rotation.y) * 0.05
        meshRef.current.rotation.x += (tX - meshRef.current.rotation.x) * 0.05
      } else {
        // Enforce neutral stance
        meshRef.current.rotation.y += (0 - meshRef.current.rotation.y) * 0.1
        meshRef.current.rotation.x += (0 - meshRef.current.rotation.x) * 0.1
      }
    }
  })

  return (
    <group ref={meshRef}>
      <primitive object={scene} />
      {/* Key — warm amber (sun direction) */}
      <pointLight position={[3.0, 3.5, 2.0]} intensity={isMobile ? 1.2 : 2.2} color="#ffd580" distance={14} decay={1.8} />
      {/* Fill — purple left */}
      <pointLight position={[-2.5, 1.0, 2.0]} intensity={isMobile ? 0.5 : 1.0} color="#7b61ff" distance={10} decay={2} />
      {/* Rim — bright cyan behind */}
      <pointLight position={[1.5, 0.8, -2.5]} intensity={isMobile ? 0.6 : 1.4} color="#00e5ff" distance={8} decay={2} />
      {/* Ground bounce */}
      <pointLight position={[0, -2.2, 0.8]} intensity={isMobile ? 0 : 0.6} color="#ff9d4e" distance={6} decay={2} />
      {/* Kick — top soft white */}
      <pointLight position={[-1.0, 3.8, 1.5]} intensity={isMobile ? 0 : 0.5} color="#ffffff" distance={8} decay={2} />
    </group>
  )
}

export default function Character({ isMobile, frameVisible = false }) {
  const floatRef = useRef()
  const entryRef = useRef(0)
  const { scrollRef } = useSceneContext()

  useFrame(({ clock }) => {
    if (!floatRef.current) return

    let isAnimating = entryRef.current < 1;

    if (isAnimating) {
      entryRef.current = Math.min(1, clock.elapsedTime / 1.5)
      const s = 1.17 + entryRef.current * 0.13
      floatRef.current.scale.setScalar(s)
      isAnimating = entryRef.current < 1;
    }

    const floatY = Math.sin(clock.elapsedTime * 0.7) * 0.03

    // User requested character shouldn't move on mobile until it reaches original place
    const scrollY = (isMobile && isAnimating) ? 0 : (scrollRef.current * SCROLL_SPEED)

    floatRef.current.position.y = -0.72 + floatY - scrollY
  })

  return (
    /*
      x: 0.8 — right half of viewport
      This puts character at ~58% from left at fov:46/z:6
      Text max-width is 44vw → safe gap between text edge and character
    */
    <group ref={floatRef} position={[0.8, -0.72, 0]} scale={1.17}>
      <SunAura isMobile={isMobile} />
      <DivineParticles isMobile={isMobile} />
      <RingPlatform isMobile={isMobile} />
      <GroundShadow />
      <CharacterMesh isMobile={isMobile} />
    </group>
  )
}