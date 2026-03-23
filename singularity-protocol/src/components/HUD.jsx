// src/components/HUD.jsx
// Cinematic HUD overlay — purely decorative, aria-hidden
// Renders corner brackets, scanlines, typewriter SYS line

import { useEffect, useRef } from 'react';
import '../styles/hud.css';

const SYS_MSGS = ['NOMINAL', 'SCANNING', 'CALIBRATING', 'NOMINAL'];

export default function HUD() {
  const sysRef = useRef(null);

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    let idx = 0, charIdx = 0, erasing = false, timer = 0, lastTs = 0;
    let raf;

    function tick(ts) {
      const dt = ts - lastTs;
      lastTs = ts;
      timer += dt;

      if (!sysRef.current) { raf = requestAnimationFrame(tick); return; }

      if (erasing) {
        if (timer > 45) {
          timer = 0;
          const s = sysRef.current.textContent;
          if (s.length === 0) {
            erasing = false;
            idx = (idx + 1) % SYS_MSGS.length;
            charIdx = 0;
          } else {
            sysRef.current.textContent = s.slice(0, -1);
          }
        }
      } else {
        if (timer > 75) {
          timer = 0;
          const full = SYS_MSGS[idx];
          if (charIdx >= full.length) {
            timer = -1800;   // pause before erasing
            erasing = true;
          } else {
            sysRef.current.textContent = full.slice(0, ++charIdx);
          }
        }
      }
      raf = requestAnimationFrame(tick);
    }

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <div className="hud" aria-hidden="true">
      {/* Scanlines */}
      <div className="hud__scanlines" />

      {/* Corner brackets */}
      <div className="hud__corner hud__corner--tl" />
      <div className="hud__corner hud__corner--tr" />
      <div className="hud__corner hud__corner--bl" />
      <div className="hud__corner hud__corner--br" />

      {/* Top-left panel */}
      <div className="hud__panel hud__panel--tl">
        <span><span className="hud__dot">▸</span> STATUS: <span className="hud__online">ONLINE</span></span>
        <span><span className="hud__dot">▸</span> SYNC: 98%</span>
        <span><span className="hud__dot">▸</span> SYS: <span ref={sysRef} className="hud__sys" /></span>
      </div>

      {/* Top-right panel */}
      <div className="hud__panel hud__panel--tr">
        <span>SINGULARITY</span>
        <span>PROTOCOL v1.0</span>
        <span className="hud__bar">■■■■■■■□□□</span>
      </div>

      {/* Targeting reticle */}
      <div className="hud__reticle">
        <div className="hud__reticle-dot" />
        <div className="hud__reticle-line hud__reticle-line--h" />
        <div className="hud__reticle-line hud__reticle-line--v" />
      </div>
    </div>
  );
}