/**
 * Planet.jsx — bottom-right corner, only top-left quadrant visible
 * Matches reference image 1 (planet bottom-right)
 */
import { useRef, useMemo } from 'react'
import { useFrame, useLoader } from '@react-three/fiber'
import { TextureLoader } from 'three'
import * as THREE from 'three'

const AtmVert=`varying vec3 vNormal;varying vec3 vPosition;void main(){vNormal=normalize(normalMatrix*normal);vPosition=(modelViewMatrix*vec4(position,1.0)).xyz;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}`
const AtmFrag=`varying vec3 vNormal;varying vec3 vPosition;uniform vec3 uColor;uniform float uIntensity;uniform float uPower;uniform float uTime;void main(){vec3 v=normalize(-vPosition);float rim=1.0-max(dot(v,vNormal),0.0);float mask=pow(rim,uPower);float pulse=0.85+0.15*sin(uTime*0.8);gl_FragColor=vec4(uColor*uIntensity,mask*pulse);}`

const SurfVert=`varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}`
const SurfFrag=`varying vec2 vUv;uniform float uTime;
float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
float noise(vec2 p){vec2 i=floor(p);vec2 f=fract(p);float a=hash(i),b=hash(i+vec2(1,0)),c=hash(i+vec2(0,1)),d=hash(i+vec2(1,1));vec2 u=f*f*(3.0-2.0*f);return mix(mix(a,b,u.x),mix(c,d,u.x),u.y);}
void main(){float n=noise(vUv*8.0+uTime*0.04);float n2=noise(vUv*16.0-uTime*0.025);float vein=smoothstep(0.55,0.61,n)*smoothstep(0.55,0.61,n2);vec3 base=mix(vec3(0.07,0.03,0.22),vec3(0.13,0.05,0.32),n);vec3 col=mix(base,vec3(0.0,0.85,1.0),vein*0.55);gl_FragColor=vec4(col,1.0);}`

function Atmosphere({ radius, color, intensity, power, outer }) {
  const uniforms=useMemo(()=>({uColor:{value:new THREE.Color(color)},uIntensity:{value:intensity},uPower:{value:power},uTime:{value:0}}),[color,intensity,power])
  useFrame(({clock})=>{ uniforms.uTime.value=clock.elapsedTime })
  return (
    <mesh scale={outer?1.18:1.08}>
      <sphereGeometry args={[radius,48,48]}/>
      <shaderMaterial vertexShader={AtmVert} fragmentShader={AtmFrag} uniforms={uniforms} transparent depthWrite={false} side={THREE.BackSide} blending={THREE.AdditiveBlending}/>
    </mesh>
  )
}

export default function Planet({ isMobile }) {
  const groupRef=useRef(), planetRef=useRef(), cloudsRef=useRef()
  const surfUni=useMemo(()=>({uTime:{value:0}}),[])
  let texture=null
  try{ texture=useLoader(TextureLoader,'/assets/textures/planet.webp') }catch{ texture=null }

  const radius=1.6, segments=isMobile?32:64
  useFrame(({clock})=>{
    const t=clock.elapsedTime
    if(planetRef.current){ planetRef.current.rotation.y+=0.0012; planetRef.current.rotation.x+=0.0003 }
    if(cloudsRef.current) cloudsRef.current.rotation.y+=0.0018
    if(groupRef.current) groupRef.current.position.y=-3.2+Math.sin(t*0.5)*0.08
    surfUni.uTime.value=t
  })

  return (
    <group ref={groupRef} position={[4.6,-3.2,-0.8]} scale={isMobile?0.75:1.0}>
      <mesh ref={planetRef}>
        <sphereGeometry args={[radius,segments,segments]}/>
        {texture
          ? <meshStandardMaterial map={texture} emissive="#00E0FF" emissiveIntensity={0.06} roughness={0.75} metalness={0.15}/>
          : <shaderMaterial vertexShader={SurfVert} fragmentShader={SurfFrag} uniforms={surfUni}/>
        }
      </mesh>
      {!isMobile&&<mesh ref={cloudsRef} scale={1.03}><sphereGeometry args={[radius,48,48]}/><meshStandardMaterial color="#7B61FF" transparent opacity={0.07} roughness={1} metalness={0}/></mesh>}
      <Atmosphere radius={radius} color="#00E0FF" intensity={1.0} power={3.5} outer={false}/>
      {!isMobile&&<Atmosphere radius={radius} color="#7B61FF" intensity={0.6} power={2.0} outer={true}/>}
      <mesh rotation={[Math.PI/2+0.25,0,0.15]}><torusGeometry args={[radius*1.4,0.018,16,128]}/><meshBasicMaterial color="#00E0FF" transparent opacity={0.5}/></mesh>
      {!isMobile&&<mesh rotation={[Math.PI/2-0.5,0.3,0]}><torusGeometry args={[radius*1.65,0.01,16,128]}/><meshBasicMaterial color="#7B61FF" transparent opacity={0.22}/></mesh>}
      <pointLight position={[0,0,radius+0.5]} intensity={isMobile?0:1.0} color="#00E0FF" distance={10} decay={2}/>
    </group>
  )
}