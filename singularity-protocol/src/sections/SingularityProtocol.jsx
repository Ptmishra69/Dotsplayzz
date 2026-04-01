import { useEffect, useRef, useState, useCallback } from 'react'
import Modal from '../components/Modal'
import FloatingLines from '../components/FloatingLines'
import '../styles/singularity.css'

/* ─────────────────────────────────────────────────────────────────
   DATA
───────────────────────────────────────────────────────────────── */
const FEATURE_CARDS = [
  { icon: '⚡', title: 'Adaptive AI',       desc: 'Enemies evolve with your strategy. No two encounters play the same.', accent: '#FFD84D' },
  { icon: '🌌', title: 'Space Exploration', desc: 'Seamless travel across procedurally shaped worlds.',                  accent: '#00E0FF' },
  { icon: '🧠', title: 'Your Decisions',    desc: 'Every choice reshapes the universe. The story is yours.',             accent: '#7B61FF' },
  { icon: '🚀', title: 'Real-Time Combat',  desc: 'Fast, skill-based mechanics. No cooldowns.',                          accent: '#FF3366' },
]

const STATS = [
  { target: 2,   suffix: '+', label: 'Planets'  },
  { target: 50,  suffix: '+', label: 'Words' },
  { target: 999, suffix: '',  label: 'Outcomes', display: '∞' },
]

const VIDEO_SLIDES = [
  { id: 1, label: 'Open World Exploration', accentColor: '#00FFC8', src: null },
  { id: 2, label: 'Combat System',          accentColor: '#FF3B5C', src: null },
  { id: 3, label: 'Story Moments',          accentColor: '#7B61FF', src: null },
  { id: 4, label: 'AI Encounters',          accentColor: '#FFD84D', src: null },
]

/* ─────────────────────────────────────────────────────────────────
   COUNT-UP HOOK
───────────────────────────────────────────────────────────────── */
function useCountUp(target, duration = 1400, shouldStart = false) {
  const [value, setValue] = useState(0)
  useEffect(() => {
    if (!shouldStart) return
    if (target === 999) { setValue(999); return }
    let start = null
    const step = ts => {
      if (!start) start = ts
      const p    = Math.min((ts - start) / duration, 1)
      const ease = 1 - Math.pow(1 - p, 3)
      setValue(Math.floor(ease * target))
      if (p < 1) requestAnimationFrame(step)
    }
    requestAnimationFrame(step)
  }, [target, duration, shouldStart])
  return value
}

function StatItem({ target, suffix, label, display, shouldCount }) {
  const v    = useCountUp(target, 1400, shouldCount)
  const shown = display ? display : `${v}${suffix}`
  return (
    <div className="sp-stat">
      <span
        className={`sp-stat__number${shouldCount ? ' counting' : ''}`}
        aria-label={`${shown} ${label}`}
      >
        {shown}
      </span>
      <span className="sp-stat__label" aria-hidden="true">{label}</span>
    </div>
  )
}

/* ─────────────────────────────────────────────────────────────────
   COMPACT VIDEO SLIDESHOW
───────────────────────────────────────────────────────────────── */
function VideoSlideshow() {
  const [active, setActive] = useState(0)
  const timerRef = useRef(null)

  const goTo = useCallback((idx) => {
    setActive(idx)
  }, [])

  const next = useCallback(() => {
    setActive(prev => (prev + 1) % VIDEO_SLIDES.length)
  }, [])

  const prev = useCallback(() => {
    setActive(prev => (prev - 1 + VIDEO_SLIDES.length) % VIDEO_SLIDES.length)
  }, [])

  // Auto-advance every 5 seconds
  useEffect(() => {
    timerRef.current = setInterval(next, 5000)
    return () => clearInterval(timerRef.current)
  }, [next])

  const slide = VIDEO_SLIDES[active]

  return (
    <div className="sp-vshow" style={{ '--vshow-accent': slide.accentColor }}>
      {/* Video viewport */}
      <div className="sp-vshow__viewport">
        {slide.src ? (
          <video
            key={slide.id}
            src={slide.src}
            autoPlay loop muted playsInline
            className="sp-vshow__video"
          />
        ) : (
          <div className="sp-vshow__placeholder">
            <div className="sp-vshow__scanlines" aria-hidden="true" />
            <div className="sp-vshow__grid" aria-hidden="true" />
            {['tl','tr','bl','br'].map(c => (
              <span key={c} className={`sp-vshow__corner sp-vshow__corner--${c}`} aria-hidden="true" />
            ))}
            <div className="sp-vshow__body">
              <div className="sp-vshow__play-ring" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="currentColor" width="24" height="24">
                  <path d="M8 5v14l11-7z" />
                </svg>
              </div>
              <h3 className="sp-vshow__title">{slide.label}</h3>
            </div>
          </div>
        )}

        {/* Arrows */}
        <button className="sp-vshow__arrow sp-vshow__arrow--prev" onClick={prev} aria-label="Previous">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="18" height="18">
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </button>
        <button className="sp-vshow__arrow sp-vshow__arrow--next" onClick={next} aria-label="Next">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="18" height="18">
            <path d="M9 18l6-6-6-6" />
          </svg>
        </button>
      </div>

      {/* Dots */}
      <div className="sp-vshow__dots">
        {VIDEO_SLIDES.map((s, i) => (
          <button
            key={s.id}
            className={`sp-vshow__dot${i === active ? ' sp-vshow__dot--active' : ''}`}
            style={{ '--dot-color': s.accentColor }}
            onClick={() => goTo(i)}
            aria-label={s.label}
          />
        ))}
      </div>
    </div>
  )
}

/* ─────────────────────────────────────────────────────────────────
   ROOT EXPORT
───────────────────────────────────────────────────────────────── */
export default function SingularityProtocol({ onExploreGameplay }) {
  const statsRef = useRef(null)
  const cardRefs = useRef([])
  const [statsVisible, setStatsVisible] = useState(false)
  const [cardsVisible, setCardsVisible] = useState([false, false, false, false])
  const [gameplayOpen, setGameplayOpen] = useState(false)

  useEffect(() => {
    if (!statsRef.current) return
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) setStatsVisible(true) },
      { threshold: 0.4 }
    )
    obs.observe(statsRef.current)
    return () => obs.disconnect()
  }, [])

  useEffect(() => {
    cardRefs.current.forEach((card, i) => {
      if (!card) return
      const obs = new IntersectionObserver(([e]) => {
        if (e.isIntersecting) {
          setTimeout(() => setCardsVisible(prev => {
            const n = [...prev]; n[i] = true; return n
          }), i * 130)
          obs.unobserve(card)
        }
      }, { threshold: 0.15 })
      obs.observe(card)
    })
  }, [])

  return (
    <>
      <section id="game" className="sp-unified" aria-label="Singularity Protocol — game overview">

        {/* ── Background Layers ── */}
        <div className="sp-unified__bg-image" aria-hidden="true" />
        <div className="sp-unified__lines" aria-hidden="true">
          <FloatingLines
            linesGradient={['#FFD84D', '#FF9D6E', '#7B61FF', '#00E0FF']}
            enabledWaves={['top', 'middle', 'bottom']}
            lineCount={[4, 5, 3]}
            lineDistance={[6, 5, 7]}
            topWavePosition={{ x: 10.0, y: 0.5, rotate: -0.4 }}
            middleWavePosition={{ x: 5.0, y: 0.0, rotate: 0.2 }}
            bottomWavePosition={{ x: 2.0, y: -0.7, rotate: -1.0 }}
            animationSpeed={0.8}
            interactive={true}
            bendRadius={5.0}
            bendStrength={-0.5}
            mouseDamping={0.05}
            parallax={true}
            parallaxStrength={0.15}
            mixBlendMode="screen"
          />
        </div>
        <div className="sp-unified__overlay" aria-hidden="true" />

        {/* ═══════════════════════════════════════════
            ZONE 1 — HERO SPLIT
        ═══════════════════════════════════════════ */}
        <div className="sp-hero">
          {/* Left — Title + Info */}
          <div className="sp-hero__text">
            <span className="sp-hero__label" aria-hidden="true">⚡ The Game</span>
            <h2 className="sp-hero__headline">Singularity<br />Protocol</h2>
            <p className="sp-hero__sub">
              Humanity's last experiment has gone wrong. A rogue intelligence
              is rewriting reality. You are the only one who can stop it.
            </p>
            <div className="sp-hero__ctas">
              <button
                className="sp-hero__cta-primary"
                onClick={() => onExploreGameplay ? onExploreGameplay() : setGameplayOpen(true)}
                aria-label="Explore gameplay"
              >
                Explore Gameplay
              </button>
              <a
                href="https://store.steampowered.com"
                target="_blank" rel="noopener noreferrer"
                className="sp-hero__cta-secondary"
                aria-label="Wishlist on Steam"
              >
                Wishlist Now
              </a>
            </div>
          </div>

          {/* Right — Video Slideshow */}
          <div className="sp-hero__video">
            <VideoSlideshow />
          </div>
        </div>

        {/* ═══════════════════════════════════════════
            ZONE 2 — STATS STRIP
        ═══════════════════════════════════════════ */}
        <div className="sp-stats" ref={statsRef} role="list" aria-label="Game statistics">
          {STATS.map(stat => (
            <div key={stat.label} role="listitem">
              <StatItem {...stat} shouldCount={statsVisible} />
            </div>
          ))}
        </div>

        {/* ═══════════════════════════════════════════
            ZONE 3 — FREEDOM ZONE
            Fixed parallax bg image behind this area
        ═══════════════════════════════════════════ */}
        <div className="sp-freedom">
          <div className="sp-freedom__fixed-bg" aria-hidden="true" />

          {/* Left — Feature cards 2×2 */}
          <div className="sp-freedom__cards" role="list" aria-label="Game features">
            {FEATURE_CARDS.map((card, i) => (
              <article
                key={card.title}
                className={`sp-freedom__card${cardsVisible[i] ? ' visible' : ''}`}
                ref={el => { cardRefs.current[i] = el }}
                role="listitem"
                aria-label={card.title}
                style={{ '--accent-color': card.accent }}
              >
                <div className="sp-freedom__card-accent" />
                <div className="sp-freedom__card-icon">{card.icon}</div>
                <h3 className="sp-freedom__card-title">{card.title}</h3>
                <p className="sp-freedom__card-desc">{card.desc}</p>
              </article>
            ))}
          </div>

          {/* Right — Absolute Freedom text */}
          <div className="sp-freedom__text">
            <h2 className="sp-freedom__headline">
              <span className="sp-freedom__hl-solid">Absolute</span>
              <span className="sp-freedom__hl-outline">Freedom.</span>
            </h2>
            <p className="sp-freedom__sub">
              No invisible walls. No dictated paths.<br />
              The universe bends to your will.
            </p>
          </div>
        </div>

      </section>

      {/* ── MODAL ── */}
      <Modal
        isOpen={gameplayOpen}
        onClose={() => setGameplayOpen(false)}
        title="Singularity Protocol"
        subtitle="Gameplay Overview"
        tags={[
          { label: 'Story Based',  variant: 'neon'   },
          { label: 'Singleplayer', variant: 'purple' },
          { label: '3D Game',      variant: 'glass'  },
        ]}
        size="lg"
      >
        <div className="modal__media" aria-label="Gameplay trailer">
          <div className="modal__media-placeholder">
            <span className="modal__media-placeholder-icon" aria-hidden="true">▶</span>
            <span className="modal__media-placeholder-text">Trailer Coming Soon</span>
          </div>
        </div>
        <div>
          <p className="modal__section-label">About the Game</p>
          <p className="modal__text">
            Singularity Protocol is a story-driven 3D singleplayer experience where a rogue AI
            rewrites the laws of reality. Navigate procedurally shaped worlds, make decisions
            that reshape the story, and face enemies that evolve with your every move.
          </p>
        </div>
        <div>
          <p className="modal__section-label">Key Features</p>
          <ul className="modal__list">
            <li>Adaptive AI enemies that evolve with your strategy</li>
            <li>Decision-based narrative — every choice has consequences</li>
            <li>Real-time combat with no cooldowns</li>
            <li>Seamless exploration across 2+ procedurally shaped planets</li>
          </ul>
        </div>
      </Modal>
    </>
  )
}