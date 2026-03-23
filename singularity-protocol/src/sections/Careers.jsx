import { useState, useEffect, useRef } from 'react'
import Modal from '../components/Modal'
import '../styles/careers.css'

const CULTURE = [
  { icon: '🚀', title: 'Move Fast',             desc: 'We ship, iterate, and learn. No red tape.'                  },
  { icon: '🌌', title: 'Build the Impossible',  desc: 'Ambitious goals are the baseline, not the stretch target.'  },
  { icon: '🤝', title: 'Collaborative Default', desc: 'Every voice shapes the product. No hierarchy of ideas.'     },
  { icon: '📊', title: 'Results Over Hours',    desc: 'We measure output, not time at desk. Work from anywhere.'   },
]

const ROLES = [
  {
    id: 1, title: 'Senior 3D Artist', department: 'Art', type: 'Full-time', remote: true,
    desc: 'Create high-fidelity characters, environments, and assets that define the visual identity.',
    responsibilities: [
      'Create AAA-quality 3D assets — characters, props, environments',
      'Collaborate with technical artists on optimization and LOD pipelines',
      'Define and uphold visual style guides across the art team',
      'Work directly with the art director on hero assets',
    ],
    requirements: [
      '5+ years in game art or film VFX, AAA title shipped',
      'Expert in Blender, Maya, or equivalent 3D DCC tools',
      'Strong understanding of PBR workflows and real-time constraints',
      'Portfolio demonstrating sci-fi or high-concept character work',
    ],
  },
  {
    id: 2, title: 'Frontend Engineer', department: 'Engineering', type: 'Full-time', remote: true,
    desc: 'Build the web experiences that introduce players to the Singularity Protocol universe.',
    responsibilities: [
      'Build and maintain the marketing site and player portal in React',
      'Implement Three.js / R3F 3D scenes with GSAP animations',
      'Own performance optimization — Lighthouse 90+, LCP under 2s',
      'Collaborate with designers to push the visual boundary of web',
    ],
    requirements: [
      '3+ years with React and modern JS/TS ecosystem',
      'Experience with Three.js, WebGL, or R3F is a strong plus',
      'Obsessive about performance, accessibility, and craft',
      'Comfortable owning features end-to-end with minimal guidance',
    ],
  },
  {
    id: 3, title: 'Game Designer', department: 'Design', type: 'Full-time', remote: true,
    desc: 'Design the systems, mechanics, and decision trees that make every playthrough unique.',
    responsibilities: [
      'Design core gameplay loops, progression systems, and AI encounter logic',
      'Write detailed GDDs and collaborate with engineering on implementation',
      'Balance difficulty and reward curves through data and playtesting',
      'Champion the player perspective in every design decision',
    ],
    requirements: [
      '4+ years in game design, shipped title preferred',
      'Deep understanding of decision-based narrative systems',
      'Experience with Unreal Engine 5 blueprint systems',
      'Strong written communication for GDD creation',
    ],
  },
  {
    id: 4, title: 'Marketing Lead', department: 'Marketing', type: 'Full-time', remote: true,
    desc: 'Own the strategy that grows the Singularity Protocol community from thousands to millions.',
    responsibilities: [
      'Build and execute go-to-market strategy for Early Access launch',
      'Manage social channels, content calendar, and community growth',
      'Identify and close influencer and media partnerships',
      'Own analytics and reporting across all acquisition channels',
    ],
    requirements: [
      '4+ years in gaming or entertainment marketing',
      'Track record growing engaged communities from scratch',
      'Comfortable with data — attribution, CAC, retention metrics',
      'Passion for sci-fi gaming and the Singularity Protocol aesthetic',
    ],
  },
]

const DEPT_VARIANT = { Engineering: 'neon', Art: 'purple', Design: 'red', Marketing: 'gold' }

function ApplicationForm({ role }) {
  const [form,   setForm]   = useState({ name: '', email: '', portfolio: '', note: '' })
  const [status, setStatus] = useState('idle')

  const onChange = e => setForm(p => ({ ...p, [e.target.name]: e.target.value }))

  async function onSubmit() {
    if (!form.name || !form.email) return
    setStatus('sending')
    await new Promise(r => setTimeout(r, 1500))  /* replace with real endpoint */
    setStatus('success')
  }

  const isSending = status === 'sending'
  const isSuccess = status === 'success'

  return (
    <div className="modal__form">
      <p className="modal__form-title">Apply Now</p>
      <div className="modal__row">
        <div className="modal__field">
          <label htmlFor={`name-${role.id}`} className="modal__field-label">Full Name <span className="modal__field-required">*</span></label>
          <input id={`name-${role.id}`} name="name" type="text" className="modal__input" placeholder="Your name" value={form.name} onChange={onChange} disabled={isSending||isSuccess} autoComplete="name" />
        </div>
        <div className="modal__field">
          <label htmlFor={`email-${role.id}`} className="modal__field-label">Email <span className="modal__field-required">*</span></label>
          <input id={`email-${role.id}`} name="email" type="email" className="modal__input" placeholder="your@email.com" value={form.email} onChange={onChange} disabled={isSending||isSuccess} autoComplete="email" />
        </div>
      </div>
      <div className="modal__field">
        <label htmlFor={`portfolio-${role.id}`} className="modal__field-label">LinkedIn / Portfolio URL</label>
        <input id={`portfolio-${role.id}`} name="portfolio" type="url" className="modal__input" placeholder="https://yourportfolio.com" value={form.portfolio} onChange={onChange} disabled={isSending||isSuccess} />
      </div>
      <div className="modal__field">
        <label htmlFor={`note-${role.id}`} className="modal__field-label">Cover Note <span style={{opacity:0.4}}>(optional)</span></label>
        <textarea id={`note-${role.id}`} name="note" className="modal__textarea" placeholder="Tell us why you're the one..." value={form.note} onChange={onChange} disabled={isSending||isSuccess} />
      </div>
      <button
        type="button"
        className={`modal__submit${isSuccess ? ' modal__submit--success' : ''}`}
        onClick={onSubmit}
        disabled={isSending||isSuccess||!form.name||!form.email}
      >
        {isSending && <span className="modal__spinner" aria-hidden="true" />}
        {isSending ? 'Sending...' : isSuccess ? '✓ Application Sent' : 'Send Application'}
      </button>
    </div>
  )
}

export default function Careers() {
  const [selectedRole, setSelectedRole] = useState(null)
  const cultureRefs = useRef([])
  const roleRefs    = useRef([])
  const [cultureVis, setCultureVis] = useState(CULTURE.map(() => false))
  const [rolesVis,   setRolesVis]   = useState(ROLES.map(() => false))

  useEffect(() => {
    cultureRefs.current.forEach((el, i) => {
      if (!el) return
      const obs = new IntersectionObserver(([e]) => {
        if (e.isIntersecting) { setTimeout(() => setCultureVis(p=>{const n=[...p];n[i]=true;return n}), i*100); obs.unobserve(el) }
      }, { threshold: 0.2 })
      obs.observe(el)
    })
  }, [])

  useEffect(() => {
    roleRefs.current.forEach((el, i) => {
      if (!el) return
      const obs = new IntersectionObserver(([e]) => {
        if (e.isIntersecting) { setTimeout(() => setRolesVis(p=>{const n=[...p];n[i]=true;return n}), i*120); obs.unobserve(el) }
      }, { threshold: 0.15 })
      obs.observe(el)
    })
  }, [])

  const selectedTags = selectedRole ? [
    { label: selectedRole.department, variant: DEPT_VARIANT[selectedRole.department] },
    { label: selectedRole.type,       variant: 'glass' },
    { label: 'Remote',                variant: 'glass' },
  ] : []

  return (
    <>
      <section id="careers" className="careers" aria-label="Careers">
        <div className="careers__inner">

          <div className="careers__header">
            <span className="careers__label" aria-hidden="true">Careers</span>
            <h2 className="careers__headline">Build the Future With Us</h2>
            <p className="careers__subtext">
              We're looking for bold thinkers, skilled builders, and creative problem-solvers
              ready to shape the next generation of interactive experiences.
            </p>
            <button className="careers__scroll-cta" onClick={() => document.getElementById('careers-roles')?.scrollIntoView({behavior:'smooth'})}>
              See Open Roles ↓
            </button>
          </div>

          <div className="careers__culture">
            <p className="careers__culture-title" aria-hidden="true">How we work</p>
            <div className="careers__culture-grid" role="list">
              {CULTURE.map((c, i) => (
                <div key={c.title} className={`careers__culture-card${cultureVis[i]?' visible':''}`} ref={el=>cultureRefs.current[i]=el} role="listitem">
                  <span className="careers__culture-icon" aria-hidden="true">{c.icon}</span>
                  <h3 className="careers__culture-name">{c.title}</h3>
                  <p className="careers__culture-desc">{c.desc}</p>
                </div>
              ))}
            </div>
          </div>

          <div id="careers-roles" className="careers__roles">
            <p className="careers__roles-title" aria-hidden="true">Open positions</p>
            <div className="careers__roles-grid" role="list">
              {ROLES.map((role, i) => (
                <article key={role.id} className={`careers__role-card${rolesVis[i]?' visible':''}`} ref={el=>roleRefs.current[i]=el} role="listitem">
                  <h3 className="careers__role-title">{role.title}</h3>
                  <div className="careers__role-tags">
                    <span className={`careers__tag careers__tag--${DEPT_VARIANT[role.department]}`}>{role.department}</span>
                    <span className="careers__tag careers__tag--type">{role.type}</span>
                    {role.remote && <span className="careers__tag careers__tag--type">Remote</span>}
                  </div>
                  <p className="careers__role-desc">{role.desc}</p>
                  <button className="careers__apply-btn" onClick={() => setSelectedRole(role)} aria-label={`Apply for ${role.title}`}>
                    Apply Now
                  </button>
                </article>
              ))}
            </div>
          </div>

        </div>
      </section>

      <Modal
        isOpen={!!selectedRole}
        onClose={() => setSelectedRole(null)}
        title={selectedRole?.title}
        tags={selectedTags}
      >
        {selectedRole && (
          <>
            <div>
              <p className="modal__section-label">Responsibilities</p>
              <ul className="modal__list">{selectedRole.responsibilities.map((r,i)=><li key={i}>{r}</li>)}</ul>
            </div>
            <div className="modal__divider" />
            <div>
              <p className="modal__section-label">Requirements</p>
              <ul className="modal__list">{selectedRole.requirements.map((r,i)=><li key={i}>{r}</li>)}</ul>
            </div>
            <div className="modal__divider" />
            <ApplicationForm role={selectedRole} />
          </>
        )}
      </Modal>
    </>
  )
}