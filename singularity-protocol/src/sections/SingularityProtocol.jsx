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
  { target: 10,  suffix: '+', label: 'Planets'  },
  { target: 50,  suffix: '+', label: 'Missions' },
  { target: 999, suffix: '',  label: 'Outcomes', display: '∞' },
]

/*
  VIDEO_SLIDES — swap src: null with your actual video URL/path.
  e.g.  src: '/videos/exploration.mp4'
        src: 'https://your-cdn.com/combat.mp4'
*/
const VIDEO_SLIDES = [
  { id: 1, label: 'Open World Exploration', tag: 'EXPLORATION', accentColor: '#00FFC8', src: null },
  { id: 2, label: 'Combat System',          tag: 'COMBAT',      accentColor: '#FF3B5C', src: null },
  { id: 3, label: 'Story Moments',          tag: 'NARRATIVE',   accentColor: '#7B61FF', src: null },
  { id: 4, label: 'AI Encounters',          tag: 'ADAPTIVE AI', accentColor: '#FFD84D', src: null },
]

/*
  PARALLAX_BANDS — 3 vivid deep-space colour zones that change as
  the user scrolls through the bright section.
*/
const PARALLAX_BANDS = [
  {
    id: 'aurora',
    gradient: 'linear-gradient(135deg,#0D0826 0%,#1A0A4E 30%,#2D0E6E 55%,#1A2060 80%,#0A1535 100%)',
    orb1: 'radial-gradient(ellipse 60% 50% at 20% 30%,rgba(123,97,255,.55) 0%,transparent 70%)',
    orb2: 'radial-gradient(ellipse 50% 40% at 80% 70%,rgba(0,224,255,.35) 0%,transparent 65%)',
    orb3: 'radial-gradient(ellipse 40% 60% at 60% 10%,rgba(196,24,108,.4) 0%,transparent 60%)',
    lineColors: ['#C4186C','#7B61FF','#00E0FF','#FFD84D'],
    label: 'AURORA SECTOR',
  },
  {
    id: 'nova',
    gradient: 'linear-gradient(135deg,#1A0005 0%,#3D0015 30%,#600030 50%,#3A1060 80%,#0D0826 100%)',
    orb1: 'radial-gradient(ellipse 70% 50% at 15% 60%,rgba(255,59,92,.5) 0%,transparent 65%)',
    orb2: 'radial-gradient(ellipse 50% 45% at 85% 25%,rgba(245,100,66,.4) 0%,transparent 60%)',
    orb3: 'radial-gradient(ellipse 45% 55% at 55% 80%,rgba(123,97,255,.35) 0%,transparent 65%)',
    lineColors: ['#FF3B5C','#FF9D6E','#7B61FF','#F5E642'],
    label: 'NOVA SECTOR',
  },
  {
    id: 'crystal',
    gradient: 'linear-gradient(135deg,#001A1A 0%,#003030 30%,#00504A 55%,#004460 80%,#001525 100%)',
    orb1: 'radial-gradient(ellipse 60% 55% at 25% 40%,rgba(0,255,200,.45) 0%,transparent 65%)',
    orb2: 'radial-gradient(ellipse 50% 40% at 80% 65%,rgba(0,224,255,.4) 0%,transparent 60%)',
    orb3: 'radial-gradient(ellipse 40% 50% at 50% 15%,rgba(245,230,66,.3) 0%,transparent 60%)',
    lineColors: ['#00FFC8','#00E0FF','#F5E642','#7B61FF'],
    label: 'CRYSTAL SECTOR',
  },
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
    <div className="singularity__stat">
      <span
        className={`singularity__stat-number${shouldCount ? ' counting' : ''}`}
        aria-label={`${shown} ${label}`}
      >
        {shown}
      </span>
      <span className="singularity__stat-label" aria-hidden="true">{label}</span>
    </div>
  )
}

/* ─────────────────────────────────────────────────────────────────
   SLIDE INNER — video or stylised placeholder
───────────────────────────────────────────────────────────────── */
function SlideContent({ slide }) {
  return (
    <div className="sp-slide" style={{ '--slide-color': slide.accentColor }}>
      {slide.src ? (
        <video
          src={slide.src}
          autoPlay loop muted playsInline
          className="sp-slide__video"
        />
      ) : (
        <div className="sp-slide__placeholder">
          <div className="sp-slide__scanlines"   aria-hidden="true" />
          <div className="sp-slide__grid"        aria-hidden="true" />
          <div className="sp-slide__vignette"    aria-hidden="true" />
          {['tl','tr','bl','br'].map(c => (
            <span key={c} className={`sp-slide__corner sp-slide__corner--${c}`} aria-hidden="true" />
          ))}
          <div className="sp-slide__body">
            <div className="sp-slide__play-ring" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="currentColor" width="28" height="28">
                <path d="M8 5v14l11-7z" />
              </svg>
            </div>
            <span className="sp-slide__tag">{slide.tag}</span>
            <h3 className="sp-slide__title">{slide.label}</h3>
            <p className="sp-slide__hint">
              Set <code>VIDEO_SLIDES[{slide.id - 1}].src</code> to your video URL
            </p>
          </div>
        </div>
      )}
    </div>
  )
}

/* ─────────────────────────────────────────────────────────────────
   VIDEO SLIDER
───────────────────────────────────────────────────────────────── */
function VideoSlider() {
  const [active, setActive]         = useState(0)
  const [prev,   setPrev]           = useState(null)
  const [dir,    setDir]            = useState(1)
  const [locked, setLocked]         = useState(false)
  const [dragOffset, setDragOffset] = useState(0)
  const dragStartX = useRef(null)
  const dragDelta  = useRef(0)

  const go = useCallback((next, direction) => {
    if (locked || next === active || next < 0 || next >= VIDEO_SLIDES.length) return
    setDir(direction ?? (next > active ? 1 : -1))
    setPrev(active)
    setActive(next)
    setLocked(true)
    setTimeout(() => { setPrev(null); setLocked(false) }, 560)
  }, [active, locked])

  const onPointerDown = e => {
    dragStartX.current = e.clientX
    dragDelta.current  = 0
  }
  const onPointerMove = e => {
    if (dragStartX.current === null) return
    dragDelta.current = e.clientX - dragStartX.current
    setDragOffset(dragDelta.current * 0.25)
  }
  const onPointerUp = () => {
    if (dragStartX.current === null) return
    const d = dragDelta.current
    dragStartX.current = null
    setDragOffset(0)
    if (Math.abs(d) > 55) go(active + (d < 0 ? 1 : -1), d < 0 ? 1 : -1)
  }

  const slide     = VIDEO_SLIDES[active]
  const enterX    = `${dir > 0 ? 100 : -100}%`
  const exitX     = `${dir > 0 ? -100 : 100}%`

  return (
    <div className="sp-slider" aria-label="Game video showcase">

      {/* ── Stage ── */}
      <div
        className="sp-slider__stage"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerLeave={onPointerUp}
        style={{ '--slide-color': slide.accentColor }}
        aria-label={slide.label}
      >
        {/* Exiting slide */}
        {prev !== null && (
          <div
            key={`exit-${prev}`}
            className="sp-slider__track sp-slider__track--exit"
            style={{ '--exit-x': exitX }}
            aria-hidden="true"
          >
            <SlideContent slide={VIDEO_SLIDES[prev]} />
          </div>
        )}

        {/* Entering / active slide */}
        <div
          key={`enter-${active}`}
          className={`sp-slider__track sp-slider__track--enter${!locked ? ' sp-slider__track--settled' : ''}`}
          style={{
            '--enter-x': enterX,
            transform: `translateX(${dragOffset}px)`,
          }}
        >
          <SlideContent slide={slide} />
        </div>

        {/* Arrows */}
        <button
          className="sp-slider__arrow sp-slider__arrow--prev"
          onClick={() => go(active - 1, -1)}
          disabled={active === 0}
          aria-label="Previous video"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="20" height="20">
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </button>
        <button
          className="sp-slider__arrow sp-slider__arrow--next"
          onClick={() => go(active + 1, 1)}
          disabled={active === VIDEO_SLIDES.length - 1}
          aria-label="Next video"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="20" height="20">
            <path d="M9 18l6-6-6-6" />
          </svg>
        </button>

        {/* Counter */}
        <div className="sp-slider__counter" aria-hidden="true">
          <span className="sp-slider__counter-cur">{String(active + 1).padStart(2, '0')}</span>
          <span className="sp-slider__counter-line" />
          <span className="sp-slider__counter-tot">{String(VIDEO_SLIDES.length).padStart(2, '0')}</span>
        </div>

        {/* Colour accent bar */}
        <div className="sp-slider__accent-bar" aria-hidden="true" />
      </div>

      {/* ── Thumbnail rail ── */}
      <div className="sp-slider__rail" role="tablist" aria-label="Video chapters">
        {VIDEO_SLIDES.map((s, i) => (
          <button
            key={s.id}
            role="tab"
            aria-selected={i === active}
            aria-label={s.label}
            className={`sp-slider__thumb${i === active ? ' sp-slider__thumb--active' : ''}`}
            style={{ '--thumb-color': s.accentColor }}
            onClick={() => go(i)}
          >
            <span className="sp-slider__thumb-tag">{s.tag}</span>
            <span className="sp-slider__thumb-label">{s.label}</span>
            {i === active && (
              <span className="sp-slider__thumb-fill" aria-hidden="true" />
            )}
          </button>
        ))}
      </div>
    </div>
  )
}

/* ─────────────────────────────────────────────────────────────────
   BRIGHT PARALLAX SECTION
   Scroll-driven: 3 deep-space colour bands shift as user scrolls.
   FloatingLines re-colour with each band. Orbs float at different speeds.
───────────────────────────────────────────────────────────────── */
function BrightParallax({ cardRefs, cardsVisible }) {
  const ref          = useRef(null)
  const [bandIdx, setBandIdx]   = useState(0)
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const onScroll = () => {
      if (!ref.current) return
      const rect  = ref.current.getBoundingClientRect()
      const total = rect.height + window.innerHeight
      const done  = window.innerHeight - rect.top
      const p     = Math.max(0, Math.min(1, done / total))
      setProgress(p)
      setBandIdx(Math.min(PARALLAX_BANDS.length - 1, Math.floor(p * PARALLAX_BANDS.length)))
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    onScroll()
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const band = PARALLAX_BANDS[bandIdx]
  const p1   = progress * 130
  const p2   = progress * 80
  const p3   = progress * 45

  return (
    <section
      ref={ref}
      className="sp-bright"
      aria-label="Game vision"
      style={{ background: band.gradient, transition: 'background 0.8s ease' }}
    >
      {/* Orb layers at different parallax speeds */}
      <div className="sp-bright__orb sp-bright__orb--1"
        style={{ backgroundImage: band.orb1, transform: `translateY(${-p1}px)` }}
        aria-hidden="true" />
      <div className="sp-bright__orb sp-bright__orb--2"
        style={{ backgroundImage: band.orb2, transform: `translateY(${-p2}px)` }}
        aria-hidden="true" />
      <div className="sp-bright__orb sp-bright__orb--3"
        style={{ backgroundImage: band.orb3, transform: `translateY(${-p3}px)` }}
        aria-hidden="true" />

      {/* FloatingLines with direct prop delivery for zero scroll lag */}
      <div className="sp-bright__lines" aria-hidden="true">
        <FloatingLines
          linesGradient={band.lineColors}
          enabledWaves={['top', 'middle', 'bottom']}
          lineCount={[4, 5, 3]}
          lineDistance={[6, 5, 7]}
          topWavePosition={{ x: 10.0, y: 0.5, rotate: -0.4 }}
          middleWavePosition={{ x: 5.0, y: 0.0, rotate: 0.2 }}
          bottomWavePosition={{ x: 2.0, y: -0.7, rotate: -1.0 }}
          animationSpeed={0.7}
          interactive={true}
          bendRadius={5.0}
          bendStrength={-0.5}
          mouseDamping={0.05}
          parallax={true}
          parallaxStrength={0.1}
          mixBlendMode="screen"
        />
      </div>

      {/* Sector label */}
      <div className="sp-bright__sector" aria-hidden="true">{band.label}</div>

      {/* Band dots */}
      <div className="sp-bright__dots" aria-hidden="true">
        {PARALLAX_BANDS.map((b, i) => (
          <span key={b.id} className={`sp-bright__dot${i === bandIdx ? ' sp-bright__dot--active' : ''}`} />
        ))}
      </div>

      {/* Main content */}
      <div className="sp-bright__content">

        <div className="sp-bright__text">
          <h2 className="sp-bright__headline">
            <span className="sp-bright__hl-solid">Absolute</span>
            <span className="sp-bright__hl-outline">Freedom.</span>
          </h2>
          <p className="sp-bright__sub">
            No invisible walls. No dictated paths.<br />
            The universe bends to your will.
          </p>
          <div className="sp-bright__rule" aria-hidden="true" />
        </div>

        {/* Feature cards — dark glass on vivid bg */}
        <div className="singularity__cards sp-bright__cards" role="list" aria-label="Game features">
          {FEATURE_CARDS.map((card, i) => (
            <article
              key={card.title}
              className={`singularity__modern-card${cardsVisible[i] ? ' visible' : ''}`}
              ref={el => { cardRefs.current[i] = el }}
              role="listitem"
              aria-label={card.title}
              style={{ '--accent-color': card.accent }}
            >
              <div className="singularity__modern-card-accent" />
              <div className="singularity__modern-card-icon">{card.icon}</div>
              <h3 className="singularity__modern-card-title">{card.title}</h3>
              <p className="singularity__modern-card-desc">{card.desc}</p>
            </article>
          ))}
        </div>

      </div>
    </section>
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
      {/* ── DARK INTRO SECTION ── */}
      <section id="game" className="singularity" aria-label="Singularity Protocol — game overview">

        <div className="singularity__lines-bg" aria-hidden="true">
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

        <div className="singularity__overlay" aria-hidden="true" />

        <div className="singularity__header">
          <span className="singularity__label" aria-hidden="true">⚡ The Game</span>
          <h2 className="singularity__headline">Singularity Protocol</h2>
          <p className="singularity__subtext">
            Humanity's last experiment has gone wrong. A rogue intelligence
            is rewriting reality. You are the only one who can stop it.
          </p>
          <div className="singularity__ctas">
            <button
              className="singularity__cta-primary"
              onClick={() => onExploreGameplay ? onExploreGameplay() : setGameplayOpen(true)}
              aria-label="Explore gameplay"
            >
              Explore Gameplay
            </button>
            <a
              href="https://store.steampowered.com"
              target="_blank" rel="noopener noreferrer"
              className="singularity__cta-secondary"
              aria-label="Wishlist on Steam"
            >
              Wishlist Now
            </a>
          </div>
        </div>

        {/* Video Slider */}
        <VideoSlider />

        {/* Stats */}
        <div className="singularity__stats" ref={statsRef} role="list" aria-label="Game statistics">
          {STATS.map(stat => (
            <div key={stat.label} role="listitem">
              <StatItem {...stat} shouldCount={statsVisible} />
            </div>
          ))}
        </div>

        <div className="singularity__energy-line" aria-hidden="true" />
      </section>

      {/* ── BRIGHT PARALLAX SECTION ── */}
      <BrightParallax cardRefs={cardRefs} cardsVisible={cardsVisible} />

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
            <li>10+ missions with branching outcomes</li>
          </ul>
        </div>
      </Modal>
    </>
  )
}