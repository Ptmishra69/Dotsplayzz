import { useEffect, useRef } from 'react';
import {
  Clock, Mesh, OrthographicCamera, PlaneGeometry,
  Scene, ShaderMaterial, Vector2, Vector3, WebGLRenderer
} from 'three';

/* ── Same shaders as FloatingLines ── */
const vertexShader = `
precision highp float;
void main() {
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

const fragmentShader = `
precision highp float;
uniform float iTime;
uniform vec3  iResolution;
uniform float animationSpeed;
uniform bool  enableMiddle;
uniform bool  enableBottom;
uniform int   middleLineCount;
uniform int   bottomLineCount;
uniform float middleLineDistance;
uniform float bottomLineDistance;
uniform vec3  middleWavePosition;
uniform vec3  bottomWavePosition;
uniform vec2  iMouse;
uniform bool  interactive;
uniform float bendRadius;
uniform float bendStrength;
uniform float bendInfluence;
uniform vec3  lineGradient[8];
uniform int   lineGradientCount;

mat2 rotate(float r) {
  return mat2(cos(r), sin(r), -sin(r), cos(r));
}

vec3 getLineColor(float t) {
  if (lineGradientCount <= 0) return vec3(1.0);
  if (lineGradientCount == 1) return lineGradient[0] * 0.5;
  float s    = clamp(t, 0.0, 0.9999) * float(lineGradientCount - 1);
  int   idx  = int(floor(s));
  int   idx2 = min(idx + 1, lineGradientCount - 1);
  return mix(lineGradient[idx], lineGradient[idx2], fract(s)) * 0.5;
}

float wave(vec2 uv, float offset, vec2 screenUv, vec2 mouseUv) {
  float time = iTime * animationSpeed;
  float amp  = sin(offset + time * 0.2) * 0.3;
  float y    = sin(uv.x + offset + time * 0.1) * amp;
  if (interactive) {
    vec2  d   = screenUv - mouseUv;
    float inf = exp(-dot(d, d) * bendRadius);
    y += (mouseUv.y - screenUv.y) * inf * bendStrength * bendInfluence;
  }
  return 0.0175 / max(abs(uv.y - y) + 0.01, 1e-3) + 0.01;
}

void mainImage(out vec4 fragColor, in vec2 fragCoord) {
  vec2 uv      = (2.0 * fragCoord - iResolution.xy) / iResolution.y;
  uv.y        *= -1.0;
  vec3 col     = vec3(0.0);
  vec2 mouseUv = vec2(0.0);
  if (interactive) {
    mouseUv    = (2.0 * iMouse - iResolution.xy) / iResolution.y;
    mouseUv.y *= -1.0;
  }
  if (enableBottom) {
    for (int i = 0; i < bottomLineCount; ++i) {
      float fi  = float(i);
      float ang = bottomWavePosition.z * log(length(uv) + 1.0);
      vec2  ruv = uv * rotate(ang);
      col += getLineColor(fi / max(float(bottomLineCount-1), 1.0)) *
        wave(ruv + vec2(bottomLineDistance*fi + bottomWavePosition.x, bottomWavePosition.y),
          1.5 + 0.2*fi, uv, mouseUv) * 0.2;
    }
  }
  if (enableMiddle) {
    for (int i = 0; i < middleLineCount; ++i) {
      float fi  = float(i);
      float ang = middleWavePosition.z * log(length(uv) + 1.0);
      vec2  ruv = uv * rotate(ang);
      col += getLineColor(fi / max(float(middleLineCount-1), 1.0)) *
        wave(ruv + vec2(middleLineDistance*fi + middleWavePosition.x, middleWavePosition.y),
          2.0 + 0.15*fi, uv, mouseUv);
    }
  }
  fragColor = vec4(col, 1.0);
}

void main() {
  vec4 c = vec4(0.0);
  mainImage(c, gl_FragCoord.xy);
  gl_FragColor = c;
}
`;

const MAX_STOPS = 8;

function hexToVec3(hex) {
  let v = hex.trim().replace('#','');
  const parse = s => parseInt(s, 16);
  if (v.length === 3) return new Vector3(parse(v[0]+v[0])/255, parse(v[1]+v[1])/255, parse(v[2]+v[2])/255);
  return new Vector3(parse(v.slice(0,2))/255, parse(v.slice(2,4))/255, parse(v.slice(4,6))/255);
}

/*
  FixedFloatingLines — renders a WebGL canvas at position:fixed
  behind the entire page. Never moves with scroll.
  Use visibleSectionId to only show opacity when that section
  is in viewport (via CSS — see FixedFloatingLines.css).
*/
export default function FixedFloatingLines({
  linesGradient     = ['#FFD84D','#FFC300','#00E0FF','#7CF7C9','#FFD84D'],
  lineCount         = [5, 4],
  lineDistance      = [4, 6],
  animationSpeed    = 0.6,
  interactive       = true,
  bendRadius        = 4.0,
  bendStrength      = -0.4,
  mouseDamping      = 0.04,
  middleWavePosition = { x: 5.0, y: 0.2, rotate: 0.3 },
  bottomWavePosition = { x: 2.0, y: -0.9, rotate: -0.8 },
}) {
  const canvasRef           = useRef(null);
  const targetMouseRef      = useRef(new Vector2(-1000,-1000));
  const currentMouseRef     = useRef(new Vector2(-1000,-1000));
  const targetInfluenceRef  = useRef(0);
  const currentInfluenceRef = useRef(0);

  useEffect(() => {
    const container = canvasRef.current;
    if (!container) return;

    let active = true;
    let raf    = 0;

    const scene    = new Scene();
    const camera   = new OrthographicCamera(-1,1,1,-1,0,1);
    camera.position.z = 1;

    /* powerPreference low-power + no antialias — fixed canvas doesn't need it */
    const renderer = new WebGLRenderer({
      antialias:       false,
      alpha:           false,
      powerPreference: 'low-power'
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
    renderer.domElement.style.position = 'fixed';
    renderer.domElement.style.inset    = '0';
    renderer.domElement.style.width    = '100%';
    renderer.domElement.style.height   = '100%';
    renderer.domElement.style.zIndex   = '-1';
    renderer.domElement.style.pointerEvents = 'none';
    container.appendChild(renderer.domElement);

    const midCount = lineCount[0] ?? 5;
    const botCount = lineCount[1] ?? 4;
    const midDist  = (lineDistance[0] ?? 4) * 0.01;
    const botDist  = (lineDistance[1] ?? 6) * 0.01;

    const uniforms = {
      iTime:              { value: 0 },
      iResolution:        { value: new Vector3(1,1,1) },
      animationSpeed:     { value: animationSpeed },
      enableMiddle:       { value: true },
      enableBottom:       { value: true },
      middleLineCount:    { value: midCount },
      bottomLineCount:    { value: botCount },
      middleLineDistance: { value: midDist },
      bottomLineDistance: { value: botDist },
      middleWavePosition: { value: new Vector3(middleWavePosition.x, middleWavePosition.y, middleWavePosition.rotate) },
      bottomWavePosition: { value: new Vector3(bottomWavePosition.x, bottomWavePosition.y, bottomWavePosition.rotate) },
      iMouse:             { value: new Vector2(-1000,-1000) },
      interactive:        { value: interactive },
      bendRadius:         { value: bendRadius },
      bendStrength:       { value: bendStrength },
      bendInfluence:      { value: 0 },
      lineGradient:       { value: Array.from({length:MAX_STOPS}, ()=>new Vector3(1,1,1)) },
      lineGradientCount:  { value: 0 }
    };

    if (linesGradient?.length > 0) {
      const stops = linesGradient.slice(0, MAX_STOPS);
      uniforms.lineGradientCount.value = stops.length;
      stops.forEach((hex,i) => {
        const c = hexToVec3(hex);
        uniforms.lineGradient.value[i].set(c.x, c.y, c.z);
      });
    }

    const material = new ShaderMaterial({ uniforms, vertexShader, fragmentShader });
    const geometry = new PlaneGeometry(2,2);
    scene.add(new Mesh(geometry, material));

    const clock = new Clock();

    /* Resize — debounced, uses window size since canvas is fixed */
    let resizeTimer = null;
    const setSize = () => {
      if (!active) return;
      const w = window.innerWidth;
      const h = window.innerHeight;
      renderer.setSize(w, h, false);
      uniforms.iResolution.value.set(
        renderer.domElement.width,
        renderer.domElement.height,
        1
      );
    };
    setSize();

    const onResize = () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => { if (active) setSize(); }, 150);
    };
    window.addEventListener('resize', onResize);

    /* Mouse — attached to window so it works over the fixed canvas */
    const onMouseMove = e => {
      const dpr = renderer.getPixelRatio();
      targetMouseRef.current.set(
        e.clientX * dpr,
        (window.innerHeight - e.clientY) * dpr
      );
      targetInfluenceRef.current = 1.0;
    };
    const onMouseLeave = () => { targetInfluenceRef.current = 0.0; };

    if (interactive) {
      window.addEventListener('mousemove', onMouseMove);
      window.addEventListener('mouseleave', onMouseLeave);
    }

    /* Render loop — always runs, canvas is fixed so no scroll conflict */
    const renderLoop = () => {
      if (!active) return;
      raf = requestAnimationFrame(renderLoop);

      uniforms.iTime.value = clock.getElapsedTime();

      if (interactive) {
        currentMouseRef.current.lerp(targetMouseRef.current, mouseDamping);
        uniforms.iMouse.value.copy(currentMouseRef.current);
        currentInfluenceRef.current +=
          (targetInfluenceRef.current - currentInfluenceRef.current) * mouseDamping;
        uniforms.bendInfluence.value = currentInfluenceRef.current;
      }

      renderer.render(scene, camera);
    };
    renderLoop();

    return () => {
      active = false;
      cancelAnimationFrame(raf);
      clearTimeout(resizeTimer);
      window.removeEventListener('resize', onResize);
      if (interactive) {
        window.removeEventListener('mousemove', onMouseMove);
        window.removeEventListener('mouseleave', onMouseLeave);
      }
      geometry.dispose();
      material.dispose();
      renderer.dispose();
      renderer.forceContextLoss();
      renderer.domElement.parentElement?.removeChild(renderer.domElement);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* This div is just an anchor — the real canvas is position:fixed inside it */
  return <div ref={canvasRef} style={{ display: 'none' }} aria-hidden="true" />;
}