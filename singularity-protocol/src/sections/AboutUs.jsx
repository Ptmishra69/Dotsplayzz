import { useEffect, useRef, useState } from 'react'
import '../styles/about.css'

const TEAM = [
  {
    name: 'Sourav Kumar',
    role: 'Founder',
    photo: 'https://ui-avatars.com/api/?name=Sourav+Kumar&background=0D0914&color=00E0FF&size=128',
    desc: 'Visionary architect behind the Singularity Protocol.',
    instagram: 'https://instagram.com/'
  },
  {
    name: 'Abhisht Jaiswal',
    role: 'Core Member',
    photo: 'https://ui-avatars.com/api/?name=Abhisht+Jaiswal&background=0D0914&color=7B61FF&size=128',
    desc: 'Crafts the dynamic visual landscapes and game systems.',
    instagram: 'https://instagram.com/'
  },
  {
    name: 'Arya Choudhary',
    role: 'Core Member',
    photo: 'https://ui-avatars.com/api/?name=Arya+Choudhary&background=0D0914&color=00E0FF&size=128',
    desc: 'Balances the chaotic combat mechanics and intelligence.',
    instagram: 'https://instagram.com/'
  },
  {
    name: 'Utkarsh',
    role: 'System Architect',
    photo: 'https://ui-avatars.com/api/?name=Utkarsh&background=0D0914&color=7B61FF&size=128',
    desc: 'Deep network integration and backend infrastructure.',
    instagram: 'https://instagram.com/'
  }
]

export default function AboutUs() {
  const teamRefs = useRef([])
  const missionRef     = useRef(null)
  const [visible, setVisible] = useState([false, false, false, false])
  const [activeImage, setActiveImage] = useState(null)

  /* ── Stagger team cards on scroll ── */
  useEffect(() => {
    teamRefs.current.forEach((el, i) => {
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

        {/* ── Team Carousel ── */}
        <div
          className="about__team-carousel"
          role="region"
          aria-label="Our Team Members"
        >
          {TEAM.map((member, i) => (
            <div
              key={member.name}
              className={`about__team-card${visible[i] ? ' visible' : ''}`}
              ref={el => teamRefs.current[i] = el}
            >
              <button 
                className="about__team-photo-wrap" 
                aria-label={`View ${member.name}'s photo full size`}
                onClick={() => setActiveImage(member.photo)}
              >
                <img src={member.photo} alt={member.name} className="about__team-photo" />
              </button>
              <div className="about__team-info">
                <h3 className="about__team-name">
                  {member.name}
                  <a href={member.instagram} target="_blank" rel="noopener noreferrer" className="about__team-social" aria-label={`${member.name} Instagram`}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                    </svg>
                  </a>
                </h3>
                <span className="about__team-role">{member.role}</span>
                <p className="about__team-desc">{member.desc}</p>
              </div>
            </div>
          ))}
        </div>

      </div>

      {/* ── Image Modal ── */}
      {activeImage && (
        <div 
          className="about__image-modal" 
          onClick={() => setActiveImage(null)}
          role="dialog"
          aria-modal="true"
        >
          <div className="about__image-modal-content" onClick={e => e.stopPropagation()}>
            <button 
              className="about__image-modal-close" 
              onClick={() => setActiveImage(null)}
              aria-label="Close image"
            >
              ✕
            </button>
            <img src={activeImage} alt="Full Size Avatar" className="about__image-modal-img" />
          </div>
        </div>
      )}
    </section>
  )
}