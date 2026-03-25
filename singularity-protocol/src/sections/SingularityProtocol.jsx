import { useEffect, useRef, useState } from 'react'
import Modal from '../components/Modal'
import FloatingLines from '../components/FloatingLines'
import '../styles/singularity.css'

const FEATURE_CARDS = [
  {
    icon: '⚡',
    title: 'Adaptive AI',
    desc: 'Enemies evolve with your strategy. No two encounters play the same.',
    accent: '#FFD84D',
  },
  {
    icon: '🌌',
    title: 'Space Exploration',
    desc: 'Seamless travel across procedurally shaped worlds.',
    accent: '#00E0FF',
  },
  {
    icon: '🧠',
    title: 'Your Decisions',
    desc: 'Every choice reshapes the universe. The story is yours.',
    accent: '#7B61FF',
  },
  {
    icon: '🚀',
    title: 'Real-Time Combat',
    desc: 'Fast, skill-based mechanics. No cooldowns.',
    accent: '#FF3366',
  },
]

const SCREENSHOTS = [
  { id: 1, label: 'Open World Exploration', aspect: '16/9' },
  { id: 2, label: 'Combat System',          aspect: '16/9' },
  { id: 3, label: 'Story Moments',          aspect: '16/9' },
]

const STATS = [
  { target: 10,  suffix: '+', label: 'Planets'  },
  { target: 50,  suffix: '+', label: 'Missions' },
  { target: 999, suffix: '',  label: 'Outcomes', display: '∞' },
]

function useCountUp(target, duration = 1200, shouldStart = false) {
  const [value, setValue] = useState(0)
  useEffect(() => {
    if (!shouldStart) return
    if (target === 999) { setValue(999); return }
    let start = null
    const step = ts => {
      if (!start) start = ts
      const p = Math.min((ts - start) / duration, 1)
      setValue(Math.floor(p * target))
      if (p < 1) requestAnimationFrame(step)
    }
    requestAnimationFrame(step)
  }, [target, duration, shouldStart])
  return value
}

function StatItem({ target, suffix, label, display, shouldCount }) {
  const value = useCountUp(target, 1200, shouldCount)
  const shown = display ? display : `${value}${suffix}`
  return (
    <div className="singularity__stat">
      <span className={`singularity__stat-number${shouldCount?' counting':''}`} aria-label={`${shown} ${label}`}>
        {shown}
      </span>
      <span className="singularity__stat-label" aria-hidden="true">{label}</span>
    </div>
  )
}

export default function SingularityProtocol({ onExploreGameplay }) {
  const statsRef  = useRef(null)
  const cardRefs  = useRef([])
  const [statsVisible, setStatsVisible] = useState(false)
  const [cardsVisible, setCardsVisible] = useState([false,false,false,false])
  const [gameplayOpen, setGameplayOpen] = useState(false)

  useEffect(() => {
    if (!statsRef.current) return
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setStatsVisible(true) }, { threshold: 0.5 })
    obs.observe(statsRef.current)
    return () => obs.disconnect()
  }, [])

  useEffect(() => {
    cardRefs.current.forEach((card, i) => {
      if (!card) return
      const obs = new IntersectionObserver(([e]) => {
        if (e.isIntersecting) {
          setTimeout(() => setCardsVisible(prev => { const n=[...prev]; n[i]=true; return n }), i * 120)
          obs.unobserve(card)
        }
      }, { threshold: 0.2 })
      obs.observe(card)
    })
  }, [])

  function openGameplay() {
    if (onExploreGameplay) onExploreGameplay()
    else setGameplayOpen(true)
  }

  return (
    <>
      <section id="game" className="singularity" aria-label="Singularity Protocol — game overview">

        {/* FloatingLines Background */}
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

        {/* Overlay gradient to ensure readability */}
        <div className="singularity__overlay" aria-hidden="true" />

        {/* ── Header ── */}
        <div className="singularity__header">
          <span className="singularity__label" aria-hidden="true">⚡ The Game</span>
          <h2 className="singularity__headline">Singularity Protocol</h2>
          <p className="singularity__subtext">
            Humanity's last experiment has gone wrong. A rogue intelligence
            is rewriting reality. You are the only one who can stop it.
          </p>
          <div className="singularity__ctas">
            <button className="singularity__cta-primary" onClick={openGameplay} aria-label="Explore gameplay">
              Explore Gameplay
            </button>
            <a href="https://store.steampowered.com" target="_blank" rel="noopener noreferrer"
              className="singularity__cta-secondary" aria-label="Wishlist on Steam">
              Wishlist Now
            </a>
          </div>
        </div>

        {/* ── Game Screenshots Gallery ── */}
        <div className="singularity__gallery" aria-label="Game screenshots">
          {SCREENSHOTS.map((shot) => (
            <div key={shot.id} className="singularity__screenshot" style={{ aspectRatio: shot.aspect }}>
              <div className="singularity__screenshot-inner">
                <div className="singularity__screenshot-glow" />
                <div className="singularity__screenshot-content">
                  <svg className="singularity__screenshot-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <rect x="3" y="3" width="18" height="18" rx="2" />
                    <circle cx="8.5" cy="8.5" r="1.5" />
                    <path d="M21 15l-5-5L5 21" />
                  </svg>
                  <span className="singularity__screenshot-label">{shot.label}</span>
                  <span className="singularity__screenshot-sub">Screenshot Coming Soon</span>
                </div>
                {/* Corner accents */}
                <span className="singularity__screenshot-corner singularity__screenshot-corner--tl" />
                <span className="singularity__screenshot-corner singularity__screenshot-corner--tr" />
                <span className="singularity__screenshot-corner singularity__screenshot-corner--bl" />
                <span className="singularity__screenshot-corner singularity__screenshot-corner--br" />
              </div>
            </div>
          ))}
        </div>

        {/* ── Stats ── */}
        <div className="singularity__stats" ref={statsRef} role="list" aria-label="Game statistics">
          {STATS.map(stat => (
            <div key={stat.label} role="listitem">
              <StatItem {...stat} shouldCount={statsVisible} />
            </div>
          ))}
        </div>

        {/* ── Energy Line ── */}
        <div className="singularity__energy-line" aria-hidden="true" />

      </section>

      {/* ── Bright Static Parallax Transition ── */}
      <section className="singularity-bright" aria-label="Game vision">
        
        {/* Dark overlay specifically for the card area inside the bright section */ }
        <div className="singularity-bright__overlay" aria-hidden="true" />
        
        <div className="singularity-bright__content">
          <div className="singularity-bright__text-wrap">
            <h2 className="singularity-bright__headline">Absolute<br/>Freedom.</h2>
            <p className="singularity-bright__subtext">
              No invisible walls. No dictated paths. 
              The universe bends to your will.
            </p>
          </div>

          {/* ── Feature Cards (Moved here as requested) ── */}
          <div className="singularity__cards" role="list" aria-label="Game features">
            {FEATURE_CARDS.map((card, i) => (
              <article
                key={card.title}
                className={`singularity__modern-card${cardsVisible[i]?' visible':''}`}
                ref={el => cardRefs.current[i] = el}
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

      {/* ── Gameplay Modal ── */}
      <Modal
        isOpen={gameplayOpen || false}
        onClose={() => setGameplayOpen(false)}
        title="Singularity Protocol"
        subtitle="Gameplay Overview"
        tags={[
          { label: 'Story Based',   variant: 'neon'   },
          { label: 'Singleplayer',  variant: 'purple' },
          { label: '3D Game',       variant: 'glass'  },
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
            Singularity Protocol is a story-driven 3D singleplayer experience set in a universe
            where a rogue AI has begun rewriting the laws of reality. Navigate procedurally shaped
            worlds, make decisions that reshape the story, and face enemies that evolve with your
            every move. No two playthroughs are the same.
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