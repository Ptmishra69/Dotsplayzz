import { useEffect, useRef, useState } from 'react'
import '../styles/about.css'

const DISCIPLINES = [
  {
    icon:  '🎮',
    title: 'Game Development',
    desc:  'Crafting immersive mechanics and worlds that pull you in and never let go.',
  },
  {
    icon:  '🤖',
    title: 'AI Systems',
    desc:  'Building adaptive intelligence that evolves, reacts, and surprises.',
  },
  {
    icon:  '🌐',
    title: 'Interactive Design',
    desc:  'Designing experiences where every pixel and interaction has purpose.',
  },
]

export default function AboutUs() {
  const disciplineRefs = useRef([])
  const missionRef     = useRef(null)
  const [visible, setVisible] = useState([false, false, false])

  /* ── Stagger discipline cards on scroll ── */
  useEffect(() => {
    disciplineRefs.current.forEach((el, i) => {
      if (!el) return
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            setTimeout(() => {
              setVisible(prev => {
                const next = [...prev]
                next[i] = true
                return next
              })
            }, i * 150)
            observer.unobserve(el)
          }
        },
        { threshold: 0.2 }
      )
      observer.observe(el)
    })
  }, [])

  function scrollToSocial() {
    const el = document.querySelector('#social')
    if (el) el.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <section
      id="about"
      className="about"
      aria-label="About Us — who we are"
    >
      <div className="about__inner">

        {/* ── Header ── */}
        <div className="about__header">
          <span className="about__label" aria-hidden="true">
            The Team
          </span>

          <h2 className="about__headline">Who We Are</h2>

          <p className="about__subtext">
            We are a team of creators, engineers, and storytellers building
            immersive digital worlds. Our mission is to push the boundaries
            of interactive experiences.
          </p>

          <button
            className="about__cta"
            onClick={scrollToSocial}
            aria-label="Join Our Journey — go to community section"
          >
            Join Our Journey
            <span className="about__cta-arrow" aria-hidden="true">→</span>
          </button>
        </div>

        {/* ── Mission Statement ── */}
        <div
          className="about__mission"
          ref={missionRef}
          role="blockquote"
          aria-label="Our mission statement"
        >
          <p className="about__mission-quote">
            We don't build games. We build&nbsp;
            <strong>universes</strong>.
            Worlds where your choices matter, your strategy evolves, and the
            story is never the same twice. The&nbsp;
            <strong>singularity</strong>
            &nbsp;isn't coming — it's already here.
          </p>
        </div>

        {/* ── Discipline Cards ── */}
        <div
          className="about__disciplines"
          role="list"
          aria-label="Our disciplines"
        >
          {DISCIPLINES.map((d, i) => (
            <div
              key={d.title}
              className={`about__discipline${visible[i] ? ' visible' : ''}`}
              ref={el => disciplineRefs.current[i] = el}
              role="listitem"
            >
              <div
                className="about__discipline-icon"
                aria-hidden="true"
              >
                {d.icon}
              </div>
              <h3 className="about__discipline-title">{d.title}</h3>
              <p className="about__discipline-desc">{d.desc}</p>
            </div>
          ))}
        </div>

      </div>
    </section>
  )
}