import { useEffect, useRef, useCallback, Suspense, lazy } from 'react';
import HUD from '../components/HUD';
import MagicRings from '../components/MagicRings';
import '../styles/hero.css';

const Scene = lazy(() => import('../three/Scene'));
import { useGlowSystem } from '../hooks/useGlowSystem';
import { useModeSystem } from '../hooks/useModeSystem';
import { useIsMobile } from '../hooks/useIsMobile';

// ── Mouse parallax — very subtle ──
const MOUSE = {
  bg2: 0.012,
  sun: 0.018,
  char: 0.015,
};
const MAX_PX = 14;

export default function Hero({ onWatchTrailer }) {
  const sectionRef = useRef(null);
  const { glowScalar } = useGlowSystem();
  const { isCombat }   = useModeSystem();
  const isMobile       = useIsMobile(768);

  // Layer refs
  const bgRef = useRef(null);
  const sunRef = useRef(null);
  const shipRef = useRef(null);
  const charRef = useRef(null);
  const ringsRef = useRef(null);
  const labelRef = useRef(null);
  const contentRef = useRef(null);
  const scrollHint = useRef(null);
  const mobileScrollHintRef = useRef(null);
  const hudRef = useRef(null);

  // Mouse / raf
  const mouse = useRef({ x: 0, y: 0 });
  const current = useRef({ x: 0, y: 0 });
  const rafId = useRef(null);
  const phase = useRef(0);

  // ── MOUSE HANDLER ──
  const onMouseMove = useCallback((e) => {
    // Disable interaction on mobile when in intro phase
    if (isMobile && phase.current < 0.9) return;
    
    const cx = window.innerWidth / 2;
    const cy = window.innerHeight / 2;
    const dx = (e.clientX - cx) / cx;
    const dy = (e.clientY - cy) / cy;
    const dz = 0.30;
    mouse.current.x = Math.abs(dx) < dz ? 0 : (dx - Math.sign(dx) * dz) / (1 - dz);
    mouse.current.y = Math.abs(dy) < dz ? 0 : (dy - Math.sign(dy) * dz) / (1 - dz);
  }, [isMobile]);

  // ── SCROLL HANDLER ──
  const onScroll = useCallback(() => {
    const vh = window.innerHeight;
    const sy = window.scrollY;

    // Phase 0→1 over first TWO viewport heights (locks screen during intro)
    phase.current = Math.min(1, Math.max(0, sy / (vh * 2)));
    const p = phase.current;

    // ── CHARACTER WRAPPER: Native 3D camera handles character scale! ──

    // ── MAGIC RINGS: fade in & sync DOM position/scale with 3D camera ──
    if (ringsRef.current) {
      ringsRef.current.style.opacity = p.toFixed(3);
      // Removed broken left property interpolation causing the glitch. Now pure CSS.
      const ringScale = isMobile ? 1.5 - (p * 0.5) : 2.0 - p;
      ringsRef.current.style.transform = `translate(-50%, 0) scale(${ringScale.toFixed(3)})`;
    }

    // ── PLAYER LABEL: sync position with Character pan ──
    if (labelRef.current) {
      labelRef.current.style.opacity = p.toFixed(3);
    }

    // ── TEXT: fades in + slides up ──
    if (contentRef.current) {
      contentRef.current.style.opacity = p.toFixed(3);
      contentRef.current.style.transform = `translate3d(0, ${((1 - p) * 50).toFixed(1)}px, 0)`;
    }

    // ── SHIP: starts centre-left, moves to upper-left corner ──
    if (shipRef.current) {
      if (isMobile) {
        // Mobile: Starts huge at the top, scales down and moves away
        const scale = 1.3 - (p * 0.3);
        const sy2 = p * -15; // Move up out of the way
        shipRef.current.style.transform = `translate(0vw, ${sy2.toFixed(2)}vh) scale(${scale.toFixed(2)})`;
      } else {
        // Desktop: Subtle slide
        const sx = p * -15;
        const sy2 = p * -5;
        shipRef.current.style.transform = `translate(${sx.toFixed(2)}vw, ${sy2.toFixed(2)}vh) scale(1)`;
      }
    }

    // ── SCROLL HINT (Desktop): fades out as user scrolls ──
    if (scrollHint.current) {
      scrollHint.current.style.opacity = (1 - p * 2).toFixed(3);
    }
    
    // ── MOBILE SCROLL HINT: falls out aggressively ──
    if (mobileScrollHintRef.current) {
      mobileScrollHintRef.current.style.opacity = (1 - p * 3).toFixed(3);
      mobileScrollHintRef.current.style.transform = `translate(-50%, ${(p * 20).toFixed(1)}px)`;
    }

    // ── HUD: fade in with content ──
    if (hudRef.current) {
      hudRef.current.style.opacity = p.toFixed(3);
    }

    // ── Scroll parallax for deeper sections (after 200vh) ──
    if (sy > vh * 2) {
      const excess = sy - (vh * 2);
      const parallaxY = excess * 0.3;
      if (bgRef.current) bgRef.current.style.transform = `translate3d(0, ${(parallaxY * 0.1).toFixed(1)}px, 0) scale(1.04)`;
      if (sunRef.current) sunRef.current.style.transform = `translate3d(0, ${(parallaxY * 0.25).toFixed(1)}px, 0)`;
    } else {
      if (bgRef.current) bgRef.current.style.transform = '';
      if (sunRef.current) sunRef.current.style.transform = '';
    }
  }, [isMobile]);

  // ── ANIMATION LOOP — subtle mouse nudge ──
  const animate = useCallback(() => {
    const lf = 0.06;
    current.current.x += (mouse.current.x - current.current.x) * lf;
    current.current.y += (mouse.current.y - current.current.y) * lf;
    const cx = current.current.x;

    if (charRef.current) {
      const tx = (-cx * MAX_PX * MOUSE.char).toFixed(2);
      charRef.current.style.marginLeft = `${tx}px`;
    }

    rafId.current = requestAnimationFrame(animate);
  }, []);

  // ── SET GLOBAL FLOATING BACKGROUND DEFAULTS ──
  useEffect(() => {
    if (!sectionRef.current) return;
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) {
        window.dispatchEvent(new CustomEvent('setFloatingBg', {
          detail: { linesGradient: ['#FFD84D','#FFC300','#00E0FF','#7CF7C9','#FFD84D'], animationSpeed: 0.6 }
        }));
      }
    }, { threshold: 0.3 });
    obs.observe(sectionRef.current);
    return () => obs.disconnect();
  }, []);

  // ── INITIAL STATE ──
  useEffect(() => {
    // Hide text/rings on load (Phase 0)
    if (contentRef.current) {
      contentRef.current.style.opacity = '0';
      contentRef.current.style.transform = 'translate3d(0, 50px, 0)';
    }
    if (shipRef.current) {
      shipRef.current.style.transform = 'translate(0vw, 0vh)';
      shipRef.current.style.transition = 'transform 0.15s linear';
    }
    if (charRef.current) {
      // Setup transition for mouse tracking, no scale needed here
      charRef.current.style.transition = 'margin-left 0.1s linear';
    }
    if (ringsRef.current) {
      ringsRef.current.style.opacity = '0';
    }
    if (labelRef.current) {
      labelRef.current.style.opacity = '0';
    }
    if (hudRef.current) {
      hudRef.current.style.opacity = '0';
    }
  }, []);

  // ── EFFECTS ──
  useEffect(() => {
    window.addEventListener('mousemove', onMouseMove, { passive: true });
    window.addEventListener('scroll', onScroll, { passive: true });
    rafId.current = requestAnimationFrame(animate);
    window.addEventListener('resize', onScroll);
    onScroll();

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      cancelAnimationFrame(rafId.current);
    };
  }, [onMouseMove, onScroll, animate]);

  return (
    <div className="hero-wrapper" ref={sectionRef}>
      <section id="home" className="hero" aria-label="Hero — Enter the Singularity">

        {/* L0 — Background */}
        <div className="hero__bg" ref={bgRef} aria-hidden="true">
          <img src="/assets/images/hero-bg.webp" alt="" className="hero__bg-img" />
          <div className="hero__bg-overlay" />
        </div>

        {/* L1 — Sun */}
        <div className="hero__sun-wrap" ref={sunRef} aria-hidden="true">
          <img src="/assets/images/sun-glow.png" alt="" className="hero__sun-img" />
        </div>

        {/* L2 — Spaceship */}
        <div className="hero__ship-wrap" ref={shipRef} aria-hidden="true">
          <img src="/assets/images/spaceship.png" alt="" className="hero__ship-img" />
        </div>

        {/* L3 — Character + MagicRings */}
        <div className="hero__char-wrap" ref={charRef} aria-hidden="true">
          {/* MagicRings — BEHIND the 3D scene, centered on character */}
          <div className="hero__magic-rings" ref={ringsRef} aria-hidden="true">
            <MagicRings
              color={isCombat ? "#FF3366" : "#00E0FF"}
              colorTwo={isCombat ? "#FF8C00" : "#7B61FF"}
              ringCount={5}
              speed={0.8 + (glowScalar * 0.4)}
              attenuation={20}
              lineThickness={2 + glowScalar}
              baseRadius={0.08 + (glowScalar * 0.15)}
              radiusStep={0.06 + (glowScalar * 0.08)}
              scaleRate={0.08}
              opacity={0.3 + glowScalar}
              blur={glowScalar * 4}
              noiseAmount={0.03 + (glowScalar * 0.05)}
              rotation={0}
              ringGap={1.4 + (glowScalar * 1.5)}
              fadeIn={0.7}
              fadeOut={0.5}
              followMouse={false}
              mouseInfluence={0.1}
              hoverScale={1.1}
              parallax={0.03}
              clickBurst={true}
            />
          </div>
          {/* 3D Scene */}
          <Suspense fallback={null}>
            <Scene />
          </Suspense>
          {/* Player label */}
          <div className="hero__player-label" ref={labelRef} aria-hidden="true">
            <span className="hero__player-dot" />
            <span className="hero__player-text">SINGULARITY — UNIT 01</span>
            <span className="hero__player-dot" />
          </div>
        </div>

        {/* L4 — Vignette */}
        <div className="hero__vignette" aria-hidden="true" />

        {/* L5 — HUD (fades in with content) */}
        <div ref={hudRef} style={{ position: 'absolute', inset: 0, zIndex: 5, pointerEvents: 'none' }}>
          <HUD />
        </div>

        {/* L6 — Hero Content */}
        <div className="hero__content" ref={contentRef}>
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

        {/* Scroll hint — visible only during intro (Desktop) */}
        {!isMobile && (
          <div className="hero__scroll-hint" ref={scrollHint} aria-hidden="true">
            <div className="hero__scroll-line" />
            SCROLL
          </div>
        )}

        {/* Mobile Scroll Hint — centered between the legs at Phase 0 */}
        {isMobile && (
          <div className="hero__mobile-scroll-hint" ref={mobileScrollHintRef}>
            <span className="hero__mobile-scroll-text">SCROLL DOWN</span>
            <div className="hero__mobile-scroll-arrows">
              <span>↓</span>
            </div>
          </div>
        )}

      </section>
    </div>
  );
}