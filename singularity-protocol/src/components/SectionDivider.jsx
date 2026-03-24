/**
 * SectionDivider.jsx — Premium animated divider
 * Creates a visual transition between contrasting sections
 */
import '../styles/section-divider.css'

export default function SectionDivider() {
  return (
    <div className="section-divider" aria-hidden="true">
      {/* Angled gradient transition */}
      <div className="section-divider__angle" />

      {/* Glowing energy line */}
      <div className="section-divider__energy">
        <div className="section-divider__energy-core" />
        <div className="section-divider__energy-pulse" />
      </div>

      {/* Circuit decoration — left */}
      <svg className="section-divider__circuit section-divider__circuit--left" viewBox="0 0 200 40" fill="none">
        <path d="M0 20 H60 L70 10 H120 L130 20 H200" stroke="url(#divGradL)" strokeWidth="1" opacity="0.5" />
        <circle cx="70" cy="10" r="2" fill="#FFD84D" opacity="0.8" />
        <circle cx="130" cy="20" r="2" fill="#00E0FF" opacity="0.8" />
        <circle cx="95" cy="10" r="1.5" fill="#FF9D6E" opacity="0.6">
          <animate attributeName="opacity" values="0.6;1;0.6" dur="2s" repeatCount="indefinite" />
        </circle>
        <defs>
          <linearGradient id="divGradL" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="transparent" />
            <stop offset="30%" stopColor="#00E0FF" />
            <stop offset="70%" stopColor="#FFD84D" />
            <stop offset="100%" stopColor="transparent" />
          </linearGradient>
        </defs>
      </svg>

      {/* Circuit decoration — right */}
      <svg className="section-divider__circuit section-divider__circuit--right" viewBox="0 0 200 40" fill="none">
        <path d="M0 20 H50 L60 30 H140 L150 20 H200" stroke="url(#divGradR)" strokeWidth="1" opacity="0.5" />
        <circle cx="60" cy="30" r="2" fill="#00E0FF" opacity="0.8" />
        <circle cx="150" cy="20" r="2" fill="#FFD84D" opacity="0.8" />
        <circle cx="100" cy="30" r="1.5" fill="#7B61FF" opacity="0.6">
          <animate attributeName="opacity" values="0.6;1;0.6" dur="2.5s" repeatCount="indefinite" />
        </circle>
        <defs>
          <linearGradient id="divGradR" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="transparent" />
            <stop offset="30%" stopColor="#FFD84D" />
            <stop offset="70%" stopColor="#00E0FF" />
            <stop offset="100%" stopColor="transparent" />
          </linearGradient>
        </defs>
      </svg>

      {/* Hex pattern dots */}
      <div className="section-divider__dots">
        {Array.from({ length: 7 }).map((_, i) => (
          <span key={i} className="section-divider__dot" style={{ animationDelay: `${i * 0.15}s` }} />
        ))}
      </div>
    </div>
  )
}
