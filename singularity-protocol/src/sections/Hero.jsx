// src/sections/Hero.jsx
// Landing hero section — 6-layer parallax stack
// Mouse parallax + GSAP entry timeline + star canvas

import { useEffect, useRef, useCallback } from 'react';
import HUD from '../components/HUD';
import '../styles/hero.css';

// ─────────────────────────────────────────────
// Parallax speed multipliers per layer
// Higher = moves more (feels closer to viewer)
// ─────────────────────────────────────────────
const PARALLAX = {
  bg:       { x: 0.015, y: 0.01  },  // deepest — nearly frozen
  stars:    { x: 0.025, y: 0.02  },  // slight drift
  grid:     { x: 0.05,  y: 0.04  },  // subtle tilt
  planet:   { x: 0.08,  y: 0.06  },  // noticeable — far object
  sun:      { x: 0.12,  y: 0.09  },  // medium
  ship:     { x: 0.18,  y: 0.13  },  // reactive
  char:     { x: 0.24,  y: 0.19  },  // strongest — foreground
  content:  { x: 0.09,  y: 0.07  },  // slight float, stays readable
};

const MAX_SHIFT = 60; // max pixel shift at full cursor edge

// SYS HUD typewriter messages
const SYS_MSGS = ['NOMINAL', 'SCANNING', 'CALIBRATING', 'NOMINAL', 'ALERT: 0x4F2A'];

// ─────────────────────────────────────────────
export default function Hero({ onWatchTrailer }) {
  // Layer refs
  const bgRef      = useRef(null);
  const starsRef   = useRef(null);
  const gridRef    = useRef(null);
  const planetRef  = useRef(null);
  const sunRef     = useRef(null);
  const shipRef    = useRef(null);
  const charRef    = useRef(null);
  const contentRef = useRef(null);

  // Canvas ref
  const canvasRef = useRef(null);

  // Mouse tracking
  const mouse    = useRef({ x: 0, y: 0 });
  const current  = useRef({ x: 0, y: 0 });
  const rafRef   = useRef(null);

  // ── STAR CANVAS ──────────────────────────────
  const starsData = useRef([]);

  const initStars = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;

    starsData.current = Array.from({ length: 300 }, () => ({
      x:     Math.random() * canvas.width,
      y:     Math.random() * canvas.height,
      r:     Math.random() * 1.4 + 0.2,
      base:  Math.random() * 0.65 + 0.1,
      speed: Math.random() * 0.003 + 0.001,
      phase: Math.random() * Math.PI * 2,
      hue:   Math.random() < 0.15 ? 'purple' : Math.random() < 0.1 ? 'amber' : 'white',
    }));
  }, []);

  const drawStars = useCallback((t) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    starsData.current.forEach(s => {
      const o = s.base * (0.6 + 0.4 * Math.sin(t * s.speed * 1000 + s.phase));
      let color;
      if (s.hue === 'purple')      color = `rgba(123,97,255,${o})`;
      else if (s.hue === 'amber')  color = `rgba(255,157,110,${o})`;
      else                         color = `rgba(234,244,255,${o})`;

      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fillStyle = color;
      ctx.fill();
    });
  }, []);

  // ── PARALLAX LOOP ─────────────────────────────
  const animate = useCallback((ts) => {
    const lerpFactor = 0.055;
    current.current.x += (mouse.current.x - current.current.x) * lerpFactor;
    current.current.y += (mouse.current.y - current.current.y) * lerpFactor;

    const cx = current.current.x;
    const cy = current.current.y;

    const move = (ref, cfg) => {
      if (!ref.current) return;
      const tx = -cx * MAX_SHIFT * cfg.x * 10;
      const ty = -cy * MAX_SHIFT * cfg.y * 10;
      ref.current.style.transform = `translate3d(${tx.toFixed(2)}px,${ty.toFixed(2)}px,0)`;
    };

    move(bgRef,      PARALLAX.bg);
    move(starsRef,   PARALLAX.stars);
    move(gridRef,    PARALLAX.grid);
    move(planetRef,  PARALLAX.planet);
    move(sunRef,     PARALLAX.sun);
    move(shipRef,    PARALLAX.ship);
    move(charRef,    PARALLAX.char);
    move(contentRef, PARALLAX.content);

    drawStars(ts / 1000);

    rafRef.current = requestAnimationFrame(animate);
  }, [drawStars]);

  // ── MOUSE HANDLER ────────────────────────────
  const onMouseMove = useCallback((e) => {
    const cx = window.innerWidth  / 2;
    const cy = window.innerHeight / 2;
    mouse.current.x = (e.clientX - cx) / cx;  // -1 to 1
    mouse.current.y = (e.clientY - cy) / cy;
  }, []);

  // ── GSAP ENTRY TIMELINE ──────────────────────
  const runEntryAnimation = useCallback(() => {
    // Guard: skip if prefers-reduced-motion
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      // Instantly show everything
      [bgRef, starsRef, gridRef, sunRef, shipRef].forEach(r => {
        if (r.current) r.current.style.opacity = '1';
      });
      return;
    }

    // GSAP is loaded by the project — import at top in real build:
    // import gsap from 'gsap';
    // import { ScrollTrigger } from 'gsap/ScrollTrigger';
    // gsap.registerPlugin(ScrollTrigger);

    if (typeof window.gsap === 'undefined') return;
    const gsap = window.gsap;

    const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

    tl
      .to(bgRef.current,      { opacity: 1,    duration: 1.2 }, 0)
      .to(starsRef.current,   { opacity: 1,    duration: 1.0 }, 0.1)
      .to(gridRef.current,    { opacity: 1,    duration: 0.8 }, 0.3)
      .to(sunRef.current,     { opacity: 1, scale: 1, duration: 0.9, transformOrigin: 'center' }, 0.4)
      .fromTo(shipRef.current,
        { opacity: 0, x: -80 },
        { opacity: 0.75, x: 0, duration: 1.1 }, 0.3)
      .to('.hero__badge',     { opacity: 1, y: 0, duration: 0.7 }, 0.6)
      .to('.hero__eyebrow',   { opacity: 1, y: 0, duration: 0.6 }, 0.75)
      .to('.hero__h1-line1',  { opacity: 1, y: 0, duration: 0.7 }, 0.85)
      .to('.hero__h1-line2',  { opacity: 1, y: 0, duration: 0.7 }, 0.95)
      .to('.hero__desc',      { opacity: 1, y: 0, duration: 0.6 }, 1.1)
      .to('.hero__ctas',      { opacity: 1, y: 0, duration: 0.6 }, 1.25)
      .to('.hero__stats',     { opacity: 1, y: 0, duration: 0.6 }, 1.35)
      .to('.hero__scroll-hint', { opacity: 1, duration: 0.8 }, 1.7);
  }, []);

  // ── EFFECTS ──────────────────────────────────
  useEffect(() => {
    initStars();
    rafRef.current = requestAnimationFrame(animate);
    window.addEventListener('mousemove', onMouseMove, { passive: true });

    const onResize = () => initStars();
    window.addEventListener('resize', onResize);

    // Small delay lets DOM paint before GSAP runs
    const gsapTimer = setTimeout(runEntryAnimation, 100);

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('resize', onResize);
      clearTimeout(gsapTimer);
    };
  }, [initStars, animate, onMouseMove, runEntryAnimation]);

  // ── RENDER ───────────────────────────────────
  return (
    <section id="home" className="hero" aria-label="Hero — Enter the Singularity">

      {/* L0 — Deep space background */}
      <div className="hero__bg" ref={bgRef} aria-hidden="true" />

      {/* L1 — Animated star field */}
      <div className="hero__layer" ref={starsRef} style={{ position:'absolute', inset:0, zIndex:1 }} aria-hidden="true">
        <canvas ref={canvasRef} className="hero__star-canvas" />
      </div>

      {/* L1 — Perspective grid */}
      <div className="hero__grid" ref={gridRef} aria-hidden="true" />

      {/* L2 — Decorative planet (bottom-right) */}
      <div
        ref={planetRef}
        aria-hidden="true"
        style={{ position:'absolute', inset:0, zIndex:2, willChange:'transform' }}
      >
        <Planet />
      </div>

      {/* L2 — Sun glow (top-right) */}
      <div className="hero__sun" ref={sunRef} aria-hidden="true" />

      {/* L2 — Spaceship PNG / SVG (top-left) */}
      <div
        ref={shipRef}
        aria-hidden="true"
        style={{ position:'absolute', inset:0, zIndex:2, willChange:'transform' }}
      >
        <SpaceshipOverlay />
      </div>

      {/* L3 — R3F Canvas (Character + Planet 3D scene) */}
      {/* <Scene /> renders here in full build — transparent overlay */}
      {/* <Suspense fallback={null}><Scene /></Suspense> */}

      {/* L3 — Fallback SVG character (until R3F scene loads) */}
      <div
        ref={charRef}
        aria-hidden="true"
        style={{ position:'absolute', inset:0, zIndex:3, willChange:'transform' }}
      >
        <CharacterPlaceholder />
      </div>

      {/* L4 — Cinematic vignette */}
      <div className="hero__vignette" aria-hidden="true" />

      {/* L4 — Scan sweep */}
      <div className="hero__scan-sweep" aria-hidden="true" />

      {/* L5 — HUD overlay (no parallax — stays fixed relative to viewport) */}
      <HUD />

      {/* L5 — Hero content */}
      <div className="hero__content" ref={contentRef}>
        <div className="hero__badge" role="status">
          <span className="hero__badge-dot" aria-hidden="true" />
          Coming Soon
        </div>

        <p className="hero__eyebrow">DotPlayzStudio Presents</p>

        <h1 className="hero__h1">
          <span className="hero__h1-line1">ENTER THE</span>
          <span className="hero__h1-line2">SINGULARITY</span>
        </h1>

        <p className="hero__desc">
          A next-gen sci-fi experience where AI, space, and survival collide.
          Step into a universe shaped entirely by your decisions.
        </p>

        <div className="hero__ctas">
          <button
            className="hero__btn-play"
            onClick={() => document.getElementById('game')?.scrollIntoView({ behavior: 'smooth' })}
          >
            Play Now
          </button>
          <button className="hero__btn-trailer" onClick={onWatchTrailer}>
            <span className="hero__play-icon" aria-hidden="true" />
            Watch Trailer
          </button>
        </div>

        <div className="hero__stats" aria-label="Game statistics">
          <div className="hero__stat">
            <div className="hero__stat-num" aria-label="2 or more planets">2+</div>
            <div className="hero__stat-label">Planets</div>
          </div>
          <div className="hero__stat">
            <div className="hero__stat-num" aria-label="10 or more missions">10+</div>
            <div className="hero__stat-label">Missions</div>
          </div>
          <div className="hero__stat">
            <div className="hero__stat-num" aria-label="Infinite outcomes">∞</div>
            <div className="hero__stat-label">Outcomes</div>
          </div>
        </div>
      </div>

      {/* Scroll hint */}
      <div className="hero__scroll-hint" aria-hidden="true">
        <div className="hero__scroll-line" />
        SCROLL
      </div>

    </section>
  );
}

// ─────────────────────────────────────────────
// Sub-components (inline until split into /three/)
// ─────────────────────────────────────────────

function Planet() {
  return (
    <div style={{
      position: 'absolute',
      bottom: '-6%',
      right: '4%',
      width: '280px',
      height: '280px',
      pointerEvents: 'none',
    }}>
      {/* Sphere */}
      <div style={{
        width: '100%', height: '100%', borderRadius: '50%',
        background: 'radial-gradient(circle at 32% 32%, #1e0d42 0%, #0c0520 55%, #040210 100%)',
        boxShadow: 'inset -18px -18px 50px rgba(123,97,255,0.45), inset 8px 8px 30px rgba(0,224,255,0.08), 0 0 60px rgba(123,97,255,0.25)',
        overflow: 'hidden', position: 'relative',
        animation: 'planetFloat 6s ease-in-out infinite',
      }}>
        <div style={{
          position: 'absolute', inset: 0, borderRadius: '50%',
          background: 'repeating-conic-gradient(rgba(80,40,160,0.15) 0deg, transparent 6deg, rgba(40,20,100,0.1) 12deg)',
          mixBlendMode: 'overlay',
        }} />
      </div>
      {/* Rings */}
      {[
        { size: 340, border: '2px solid rgba(0,224,255,0.4)', shadow: '0 0 16px rgba(0,224,255,0.2)' },
        { size: 390, border: '1px solid rgba(123,97,255,0.2)', shadow: 'none' },
      ].map((r, i) => (
        <div key={i} style={{
          position: 'absolute', top: '50%', left: '50%',
          transform: `translate(-50%,-50%) perspective(300px) rotateX(78deg)`,
          width: r.size, height: r.size, borderRadius: '50%',
          border: r.border, boxShadow: r.shadow,
          pointerEvents: 'none',
        }} />
      ))}
    </div>
  );
}

function SpaceshipOverlay() {
  return (
    <div style={{
      position: 'absolute', top: '6%', left: '-20px',
      width: '320px',
      filter: 'drop-shadow(0 0 18px rgba(0,224,255,0.4))',
      animation: 'shipFloat 5s ease-in-out infinite',
      pointerEvents: 'none',
    }}>
      {/* In production: <img src="/assets/images/spaceship.png" alt="" /> */}
      {/* SVG placeholder matching the design */}
      <svg viewBox="0 0 420 180" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="sg1" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#2A3A5C"/>
            <stop offset="100%" stopColor="#141E35"/>
          </linearGradient>
        </defs>
        <path d="M400 82 L290 38 L200 48 L55 76 L15 90 L55 96 L200 105 L290 118 Z"
          fill="url(#sg1)" stroke="rgba(0,224,255,0.28)" strokeWidth="0.8"/>
        <ellipse cx="318" cy="80" rx="42" ry="24"
          fill="#152038" stroke="rgba(0,224,255,0.45)" strokeWidth="0.8"/>
        <ellipse cx="318" cy="78" rx="28" ry="14"
          fill="rgba(0,200,255,0.06)" stroke="rgba(0,224,255,0.75)" strokeWidth="0.6"/>
        <path d="M115 96 L75 132 L165 102 Z"
          fill="rgba(25,38,65,0.92)" stroke="rgba(0,224,255,0.18)" strokeWidth="0.6"/>
        <path d="M115 76 L75 38 L165 70 Z"
          fill="rgba(25,38,65,0.92)" stroke="rgba(0,224,255,0.18)" strokeWidth="0.6"/>
        <ellipse cx="22" cy="89" rx="16" ry="9" fill="rgba(0,224,255,0.28)"/>
        <ellipse cx="22" cy="89" rx="9"  ry="5" fill="rgba(0,224,255,0.65)"/>
        <ellipse cx="8"  cy="89" rx="5"  ry="3" fill="rgba(0,224,255,0.9)"/>
      </svg>
    </div>
  );
}

function CharacterPlaceholder() {
  // Replace with <Suspense><Character /></Suspense> once R3F scene is wired
  return (
    <div style={{
      position: 'absolute',
      top: '50%', right: '17%',
      transform: 'translateY(-52%)',
      width: '300px', height: '480px',
      filter: 'drop-shadow(0 0 40px rgba(0,224,255,0.25)) drop-shadow(0 0 80px rgba(123,97,255,0.15))',
      animation: 'charFloat 4s ease-in-out infinite',
      pointerEvents: 'none',
    }}>
      <svg viewBox="0 0 200 400" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width:'100%', height:'100%' }}>
        <defs>
          <linearGradient id="ag" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#3A3A4E"/>
            <stop offset="50%" stopColor="#28283A"/>
            <stop offset="100%" stopColor="#18182A"/>
          </linearGradient>
          <linearGradient id="vg" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="rgba(0,224,255,0.85)"/>
            <stop offset="100%" stopColor="rgba(123,97,255,0.7)"/>
          </linearGradient>
          <linearGradient id="eg" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%"   stopColor="rgba(0,224,255,0)"/>
            <stop offset="50%"  stopColor="rgba(0,224,255,0.8)"/>
            <stop offset="100%" stopColor="rgba(0,224,255,0)"/>
          </linearGradient>
        </defs>
        {/* Legs */}
        <rect x="70" y="258" width="26" height="92" rx="5" fill="url(#ag)" stroke="rgba(0,224,255,0.18)" strokeWidth="0.6"/>
        <rect x="104" y="258" width="26" height="92" rx="5" fill="url(#ag)" stroke="rgba(0,224,255,0.18)" strokeWidth="0.6"/>
        <rect x="70"  y="282" width="26" height="14" rx="3" fill="#24243a" stroke="rgba(0,224,255,0.35)" strokeWidth="0.5"/>
        <rect x="104" y="282" width="26" height="14" rx="3" fill="#24243a" stroke="rgba(0,224,255,0.35)" strokeWidth="0.5"/>
        <rect x="66"  y="338" width="34" height="18" rx="4" fill="#1c1c2e" stroke="rgba(0,224,255,0.2)" strokeWidth="0.5"/>
        <rect x="100" y="338" width="34" height="18" rx="4" fill="#1c1c2e" stroke="rgba(0,224,255,0.2)" strokeWidth="0.5"/>
        {/* Torso */}
        <path d="M 60 158 L 55 258 L 145 258 L 140 158 Z" fill="url(#ag)" stroke="rgba(0,224,255,0.22)" strokeWidth="0.6"/>
        <path d="M 70 168 L 68 238 L 132 238 L 130 168 Z" fill="#22223a" stroke="rgba(0,224,255,0.28)" strokeWidth="0.5"/>
        <rect x="82" y="192" width="36" height="3" rx="1.5" fill="url(#eg)" opacity="0.9"/>
        <rect x="82" y="200" width="24" height="2" rx="1"   fill="url(#eg)" opacity="0.55"/>
        {/* Shoulders + Arms */}
        <ellipse cx="50"  cy="168" rx="18" ry="14" fill="url(#ag)" stroke="rgba(0,224,255,0.2)" strokeWidth="0.6"/>
        <ellipse cx="150" cy="168" rx="18" ry="14" fill="url(#ag)" stroke="rgba(0,224,255,0.2)" strokeWidth="0.6"/>
        <rect x="28"  y="175" width="20" height="66" rx="6" fill="url(#ag)" stroke="rgba(0,224,255,0.18)" strokeWidth="0.6"/>
        <rect x="152" y="175" width="20" height="66" rx="6" fill="url(#ag)" stroke="rgba(0,224,255,0.18)" strokeWidth="0.6"/>
        <rect x="28"  y="208" width="20" height="12" rx="3" fill="#1e1e2e" stroke="rgba(0,224,255,0.3)" strokeWidth="0.4"/>
        <rect x="152" y="208" width="20" height="12" rx="3" fill="#1e1e2e" stroke="rgba(0,224,255,0.3)" strokeWidth="0.4"/>
        <rect x="26"  y="235" width="24" height="20" rx="5" fill="#1e1e30" stroke="rgba(0,224,255,0.2)" strokeWidth="0.5"/>
        <rect x="150" y="235" width="24" height="20" rx="5" fill="#1e1e30" stroke="rgba(0,224,255,0.2)" strokeWidth="0.5"/>
        {/* Belt */}
        <rect x="60" y="246" width="80" height="10" rx="2" fill="#1a1a28" stroke="rgba(0,224,255,0.35)" strokeWidth="0.5"/>
        <rect x="94" y="245" width="12" height="12" rx="2" fill="#00E0FF" opacity="0.22"/>
        {/* Neck */}
        <rect x="88" y="136" width="24" height="24" rx="4" fill="url(#ag)" stroke="rgba(0,224,255,0.15)" strokeWidth="0.5"/>
        {/* Helmet */}
        <ellipse cx="100" cy="108" rx="38" ry="44" fill="url(#ag)" stroke="rgba(0,224,255,0.25)" strokeWidth="0.8"/>
        {/* Visor */}
        <path d="M 74 94 Q 100 80 126 94 L 122 116 Q 100 126 78 116 Z" fill="url(#vg)" opacity="0.9"/>
        <path d="M 82 96 Q 92 88 104 93 L 102 100 Q 91 94 82 100 Z" fill="rgba(255,255,255,0.22)"/>
        {/* Helmet fin */}
        <path d="M 96 64 L 100 48 L 104 64" fill="rgba(0,224,255,0.14)" stroke="rgba(0,224,255,0.35)" strokeWidth="0.5"/>
      </svg>

      {/* Ring platform */}
      <div style={{
        position: 'absolute', bottom: '-10px', left: '50%',
        transform: 'translateX(-50%) perspective(300px) rotateX(80deg)',
        width: '180px', height: '180px', borderRadius: '50%',
        border: '2px solid rgba(0,224,255,0.55)',
        boxShadow: '0 0 25px rgba(0,224,255,0.3)',
        animation: 'ringRot 5s linear infinite',
      }} />
    </div>
  );
}