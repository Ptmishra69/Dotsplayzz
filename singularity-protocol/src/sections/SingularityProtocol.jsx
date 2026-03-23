import { useEffect, useRef, useState } from 'react'
import Modal from '../components/Modal'
import '../styles/singularity.css'

const FEATURE_CARDS = [
  { icon: '⚡', title: 'Adaptive AI',       desc: 'Enemies evolve with your strategy. No two encounters play the same.' },
  { icon: '🌌', title: 'Space Exploration', desc: 'Seamless travel across procedurally shaped worlds.'                  },
  { icon: '🧠', title: 'Your Decisions',    desc: 'Every choice reshapes the universe. The story is yours.'             },
  { icon: '🚀', title: 'Real-Time Combat',  desc: 'Fast, skill-based mechanics. No cooldowns.'                          },
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

  /* onExploreGameplay prop OR internal state — both work */
  function openGameplay() {
    if (onExploreGameplay) onExploreGameplay()
    else setGameplayOpen(true)
  }

  return (
    <>
      <section id="game" className="singularity" aria-label="Singularity Protocol — game overview">

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

        <div className="singularity__stats" ref={statsRef} role="list" aria-label="Game statistics">
          {STATS.map(stat => (
            <div key={stat.label} role="listitem">
              <StatItem {...stat} shouldCount={statsVisible} />
            </div>
          ))}
        </div>

        <div className="singularity__energy-line" aria-hidden="true" />

        <div className="singularity__cards" role="list" aria-label="Game features">
          {FEATURE_CARDS.map((card, i) => (
            <article
              key={card.title}
              className={`singularity__card${cardsVisible[i]?' visible':''}`}
              ref={el => cardRefs.current[i] = el}
              role="listitem"
              aria-label={card.title}
            >
              <div className="singularity__card-icon" aria-hidden="true">{card.icon}</div>
              <h3 className="singularity__card-title">{card.title}</h3>
              <p className="singularity__card-desc">{card.desc}</p>
            </article>
          ))}
        </div>

      </section>

      {/* ── Gameplay Modal — shared Modal component ── */}
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
        {/* 16:9 video placeholder — replace src with real trailer URL */}
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