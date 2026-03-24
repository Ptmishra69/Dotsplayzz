import { useModeSystem } from '../hooks/useModeSystem'
import LineWaves from '../components/LineWaves'
import '../styles/social.css'

const PLATFORMS = [
  {
    name:    'Instagram',
    handle:  '@aarya.playz',
    url:     'https://www.instagram.com/aarya.playz',
    color:   '#E1306C',
    icon:    '◈',
    desc:    'Behind the scenes & updates',
  },
  {
    name:    'YouTube',
    handle:  '@DotPlayzStudio',
    url:     'https://www.youtube.com/@DotPlayzStudio',
    color:   '#FF0000',
    icon:    '▶',
    desc:    'Dev logs, gameplay & studio insights',
  },
  {
    name:    'X (Twitter)',
    handle:  '@aarya_playz',
    url:     'https://x.com/aarya_playz',
    color:   '#1DA1F2',
    icon:    '𝕏',
    desc:    'News, thoughts & announcements',
  },
  {
    name:    'Facebook',
    handle:  'Dotsplayzz',
    url:     'https://www.facebook.com/profile.php?id=61587105685970',
    color:   '#1877F2',
    icon:    'f',
    desc:    'Community & updates',
  },
  {
    name:    'Reddit',
    handle:  'u/aarya_playz',
    url:     'https://www.reddit.com/user/aarya_playz/',
    color:   '#FF4500',
    icon:    '⬡',
    desc:    'Dev discussions & community',
  },
]

const STATS = [
  { label: 'Community Members', value: '5K+' },
  { label: 'Players Waiting',   value: '20K+' },
]

export default function Social() {
  const { isCombat } = useModeSystem()

  return (
    <section id="social" className="social section-enter" aria-label="Join the Community">
      <LineWaves
        speed={0.15}
        innerLineCount={25}
        outerLineCount={35}
        warpIntensity={1.5}
        rotation={-45}
        edgeFadeWidth={0.1}
        colorCycleSpeed={0.5}
        brightness={1.2}
        color1={isCombat ? '#FF3366' : '#00E0FF'}
        color2={isCombat ? '#FF8C00' : '#7B61FF'}
        color3="#FFFFFF"
        enableMouseInteraction={true}
        mouseInfluence={2.5}
      />
      
      <div className="social__inner">

        <div className="social__header">
          <span className="social__label" aria-hidden="true">Community</span>
          <h2 className="social__headline">Join the Community</h2>
          <p className="social__subtext">
            Be part of the mission. Get updates, exclusive content,
            and early access opportunities.
          </p>
        </div>

        {/* Stats */}
        <div className="social__stats" role="list">
          {STATS.map(({ label, value }) => (
            <div key={label} className="social__stat" role="listitem">
              <span className="social__stat-number">{value}</span>
              <span className="social__stat-label">{label}</span>
            </div>
          ))}
        </div>

        {/* Platform cards */}
        <div className="social__platforms" role="list" aria-label="Social platforms">
          {PLATFORMS.map(p => (
            <a
              key={p.name}
              href={p.url}
              target="_blank"
              rel="noopener noreferrer"
              className="social__card"
              role="listitem"
              aria-label={`${p.name} — ${p.handle}`}
              style={{ '--platform-color': p.color }}
            >
              <span className="social__card-icon" aria-hidden="true">{p.icon}</span>
              <div className="social__card-info">
                <span className="social__card-name">{p.name}</span>
                <span className="social__card-handle">{p.handle}</span>
                <span className="social__card-desc">{p.desc}</span>
              </div>
              <span className="social__card-arrow" aria-hidden="true">→</span>
            </a>
          ))}
        </div>

        {/* Primary CTAs */}
        <div className="social__ctas">
          <a
            href="https://www.youtube.com/@DotPlayzStudio"
            target="_blank"
            rel="noopener noreferrer"
            className="social__cta-primary"
            aria-label="Watch on YouTube"
          >
            ▶ Watch on YouTube
          </a>
          <a
            href="https://x.com/aarya_playz"
            target="_blank"
            rel="noopener noreferrer"
            className="social__cta-secondary"
            aria-label="Follow on X"
          >
            Follow Updates
          </a>
        </div>

      </div>
    </section>
  )
}