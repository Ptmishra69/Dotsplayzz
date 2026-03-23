/**
 * Character.jsx — no frame, composites into background
 * x: 0.8 → right half of viewport, doesn't touch text (left 44vw)
 * RingPlatform always visible (matches reference image)
 * GroundShadow for grounding
 * 5-light cinematic rig
 */
import { useRef, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import { useGLTF, useAnimations } from '@react-three/drei'
import * as THREE from 'three'
import { useSceneContext } from './Scene'

const DESKTOP_PATH = '/assets/models/base_basic_pbr_draco.glb'
const MOBILE_PATH  = '/assets/models/base_basic_shaded_draco.glb'

useGLTF.preload(DESKTOP_PATH)
useGLTF.preload(MOBILE_PATH)

const FH = 2.85
const HH = FH / 2
const SCROLL_SPEED = 0.40 / 1000

/* ── Interaction ── */
const state = {
  mouseX:0, mouseY:0, isDragging:false,
  lastX:0, lastY:0, rotY:0, rotX:0, velX:0, velY:0,
}
function isInDragZone(cx, cy) {
  return cy / window.innerHeight > 0.58 && cy / window.innerHeight < 0.85
}
if (typeof window !== 'undefined') {
  window.addEventListener('mousemove', e => {
    state.mouseX =  (e.clientX/window.innerWidth)*2-1
    state.mouseY = -(e.clientY/window.innerHeight)*2+1
    if (state.isDragging) {
      const dx=e.clientX-state.lastX, dy=e.clientY-state.lastY
      state.velY=dx*0.004; state.velX=dy*0.003
      state.rotY+=dx*0.004; state.rotX+=dy*0.003
      state.rotX=Math.max(-0.30,Math.min(0.30,state.rotX))
      state.lastX=e.clientX; state.lastY=e.clientY
      document.body.style.cursor='grabbing'
    }
  },{passive:true})
  window.addEventListener('mousedown',e=>{
    if(isInDragZone(e.clientX,e.clientY)){
      state.isDragging=true; state.lastX=e.clientX; state.lastY=e.clientY
      state.velX=state.velY=0; document.body.style.cursor='grabbing'
    }
  })
  window.addEventListener('mouseup',()=>{ state.isDragging=false; document.body.style.cursor='default' })
  window.addEventListener('touchstart',e=>{
    const t=e.touches[0]
    if(isInDragZone(t.clientX,t.clientY)){ state.isDragging=true; state.lastX=t.clientX; state.lastY=t.clientY; state.velX=state.velY=0 }
  },{passive:true})
  window.addEventListener('touchmove',e=>{
    if(!state.isDragging) return
    const t=e.touches[0],dx=t.clientX-state.lastX,dy=t.clientY-state.lastY
    state.velY=dx*0.004; state.velX=dy*0.003
    state.rotY+=dx*0.004; state.rotX+=dy*0.003
    state.rotX=Math.max(-0.30,Math.min(0.30,state.rotX))
    state.lastX=t.clientX; state.lastY=t.clientY
  },{passive:true})
  window.addEventListener('touchend',()=>{ state.isDragging=false },{passive:true})
}

/* ── Ring Platform ── */
function RingPlatform() {
  const ringRef=useRef(), glowRef=useRef(), pulseRef=useRef()
  useFrame(({clock})=>{
    const t=clock.elapsedTime
    if(ringRef.current) ringRef.current.rotation.y=t*0.3
    if(glowRef.current?.material)  glowRef.current.material.opacity =0.35+0.15*Math.sin(t*1.2)
    if(pulseRef.current?.material) pulseRef.current.material.opacity=0.12+0.08*Math.sin(t*0.8)
  })
  return (
    <group position={[0,-HH+0.05,0]}>
      <mesh ref={ringRef} rotation={[-Math.PI/2,0,0]}>
        <torusGeometry args={[0.7,0.04,16,128]}/>
        <meshBasicMaterial color="#FFFFFF" transparent opacity={0.95}/>
      </mesh>
      <mesh rotation={[-Math.PI/2,0,0]}>
        <torusGeometry args={[0.7,0.18,16,64]}/>
        <meshBasicMaterial color="#AAFFFF" transparent opacity={0.15}/>
      </mesh>
      <mesh ref={glowRef} rotation={[-Math.PI/2,0,0]} position={[0,-0.01,0]}>
        <circleGeometry args={[1.2,64]}/>
        <meshBasicMaterial color="#00E0FF" transparent opacity={0.35} side={THREE.DoubleSide}/>
      </mesh>
      <mesh ref={pulseRef} rotation={[-Math.PI/2,0,0]} position={[0,-0.02,0]}>
        <circleGeometry args={[2.2,64]}/>
        <meshBasicMaterial color="#7B61FF" transparent opacity={0.12} side={THREE.DoubleSide}/>
      </mesh>
    </group>
  )
}

/* ── Ground shadow ── */
const SV=`varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}`
const SF=`varying vec2 vUv;uniform vec3 uColor;uniform float uOpacity;uniform float uSoftness;
void main(){vec2 uv=(vUv-0.5)*2.0;float d=length(uv*vec2(1.0,1.6));float a=1.0-smoothstep(0.0,uSoftness,d);gl_FragColor=vec4(uColor,a*uOpacity);}`

function GroundShadow() {
  const uD=useRef({uColor:{value:new THREE.Color('#000008')},uOpacity:{value:0.55},uSoftness:{value:0.95}})
  const uA=useRef({uColor:{value:new THREE.Color('#7a3a00')},uOpacity:{value:0.28},uSoftness:{value:0.70}})
  const uC=useRef({uColor:{value:new THREE.Color('#002a35')},uOpacity:{value:0.22},uSoftness:{value:0.50}})
  const y=-HH+0.02
  return (
    <group position={[0,y,0.01]}>
      <mesh rotation={[-Math.PI/2,0,0]}><planeGeometry args={[2.8,1.2]}/><shaderMaterial vertexShader={SV} fragmentShader={SF} uniforms={uD.current} transparent depthWrite={false} side={THREE.DoubleSide}/></mesh>
      <mesh rotation={[-Math.PI/2,0,0]} position={[0.3,0,0]}><planeGeometry args={[2.2,0.9]}/><shaderMaterial vertexShader={SV} fragmentShader={SF} uniforms={uA.current} transparent depthWrite={false} blending={THREE.AdditiveBlending} side={THREE.DoubleSide}/></mesh>
      <mesh rotation={[-Math.PI/2,0,0]}><planeGeometry args={[1.4,0.6]}/><shaderMaterial vertexShader={SV} fragmentShader={SF} uniforms={uC.current} transparent depthWrite={false} blending={THREE.AdditiveBlending} side={THREE.DoubleSide}/></mesh>
    </group>
  )
}

/* ── Character mesh + 5-light rig ── */
function CharacterMesh({ isMobile }) {
  const meshRef=useRef()
  const path=isMobile?MOBILE_PATH:DESKTOP_PATH
  const {scene,animations}=useGLTF(path)
  const {actions,names}=useAnimations(animations,meshRef)

  useEffect(()=>{
    if(!names.length) return
    const name=names.find(n=>/idle/i.test(n))||names.find(n=>/stand/i.test(n))||names[0]
    if(name&&actions[name]) actions[name].reset().setLoop(THREE.LoopRepeat,Infinity).fadeIn(0.4).play()
    return()=>Object.values(actions).forEach(a=>a?.stop())
  },[actions,names])

  useEffect(()=>{
    if(!scene) return
    const box=new THREE.Box3().setFromObject(scene)
    const size=box.getSize(new THREE.Vector3())
    const center=box.getCenter(new THREE.Vector3())
    const height=size.y||1
    const scale=((FH-0.3)/height)*(isMobile?0.8:1.0)
    scene.scale.setScalar(scale)
    scene.position.x=-center.x*scale
    scene.position.y=-center.y*scale
    scene.position.z=-center.z*scale
    scene.traverse(c=>{ if(c.isMesh) c.castShadow=true })
  },[scene,isMobile])

  useFrame(()=>{
    if(!meshRef.current) return
    if(state.isDragging){
      meshRef.current.rotation.y=state.rotY
      meshRef.current.rotation.x=state.rotX
    } else {
      state.rotY+=state.velY; state.rotX+=state.velX
      state.velY*=0.80; state.velX*=0.80
      const tY=state.rotY*0.9+state.mouseX*0.02
      const tX=state.rotX*0.9+state.mouseY*-0.008
      meshRef.current.rotation.y+=(tY-meshRef.current.rotation.y)*0.05
      meshRef.current.rotation.x+=(tX-meshRef.current.rotation.x)*0.05
    }
  })

  return (
    <group ref={meshRef}>
      <primitive object={scene}/>
      {/* Key — warm amber (sun direction) */}
      <pointLight position={[3.0,3.5,2.0]} intensity={isMobile?1.2:2.2} color="#ffd580" distance={14} decay={1.8}/>
      {/* Fill — purple left */}
      <pointLight position={[-2.5,1.0,2.0]} intensity={isMobile?0.5:1.0} color="#7b61ff" distance={10} decay={2}/>
      {/* Rim — bright cyan behind */}
      <pointLight position={[1.5,0.8,-2.5]} intensity={isMobile?0.6:1.4} color="#00e5ff" distance={8} decay={2}/>
      {/* Ground bounce */}
      <pointLight position={[0,-2.2,0.8]} intensity={isMobile?0:0.6} color="#ff9d4e" distance={6} decay={2}/>
      {/* Kick — top soft white */}
      <pointLight position={[-1.0,3.8,1.5]} intensity={isMobile?0:0.5} color="#ffffff" distance={8} decay={2}/>
    </group>
  )
}

export default function Character({ isMobile, frameVisible = false }) {
  const floatRef  = useRef()
  const entryRef  = useRef(0)
  const { scrollRef } = useSceneContext()

  useFrame(({ clock }) => {
    if (!floatRef.current) return
    if (entryRef.current < 1) {
      entryRef.current = Math.min(1, clock.elapsedTime / 1.5)
      const s = 1.17 + entryRef.current * 0.13
      floatRef.current.scale.setScalar(s)
    }
    const floatY  = Math.sin(clock.elapsedTime * 0.7) * 0.03
    const scrollY = scrollRef.current * SCROLL_SPEED
    floatRef.current.position.y = -0.72 + floatY - scrollY
  })

  return (
    /*
      x: 0.8 — right half of viewport
      This puts character at ~58% from left at fov:46/z:6
      Text max-width is 44vw → safe gap between text edge and character
    */
    <group ref={floatRef} position={[0.8, -0.72, 0]} scale={1.17}>
      <RingPlatform/>
      <GroundShadow/>
      <CharacterMesh isMobile={isMobile}/>
    </group>
  )
}