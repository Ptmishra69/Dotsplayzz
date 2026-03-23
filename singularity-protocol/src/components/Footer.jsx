import '../styles/footer.css'

const NAV_LINKS = [
  { label: 'Home',      href: '#home'    },
  { label: 'Game',      href: '#game'    },
  { label: 'About',     href: '#about'   },
  { label: 'Community', href: '#social'  },
  { label: 'Careers',   href: '#careers' },
  { label: 'Contact',   href: '#contact' },
]

const COMPANY_LINKS = [
  { label: 'Privacy Policy',   href: '#' },
  { label: 'Terms of Service', href: '#' },
  { label: 'Cookie Policy',    href: '#' },
]

const SOCIALS = [
  { label: 'Discord',     icon: '💬', href: 'https://discord.gg/'     },
  { label: 'Twitter / X', icon: '𝕏',  href: 'https://twitter.com/'   },
  { label: 'YouTube',     icon: '▶',   href: 'https://youtube.com/'   },
  { label: 'Instagram',   icon: '◈',   href: 'https://instagram.com/' },
]

function handleNav(href) {
  const target = document.querySelector(href)
  if (target) target.scrollIntoView({ behavior: 'smooth' })
}

export default function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer className="footer" role="contentinfo" aria-label="Site footer">

      {/* ── Main 3-col grid ── */}
      <div className="footer__main">

        {/* Col 1 — Brand */}
        <div className="footer__brand">
          <a
            href="#home"
            className="footer__logo"
            onClick={(e) => { e.preventDefault(); handleNav('#home') }}
            aria-label="Dotsplayzz — back to top"
          >
            dotsplayzz
          </a>

          <p className="footer__tagline">
            A next-gen sci-fi experience where AI, space, and survival collide.
            The singularity isn't coming — it's already here.
          </p>

          {/* Status pill */}
          <div
            className="footer__status"
            role="status"
            aria-label="Project status: in development"
          >
            <span className="footer__status-dot" aria-hidden="true" />
            <span className="footer__status-text">In Development</span>
          </div>

          {/* Social icons */}
          <div
            className="footer__socials"
            role="list"
            aria-label="Social media links"
          >
            {SOCIALS.map(s => (
              <a
                key={s.label}
                href={s.href}
                target="_blank"
                rel="noopener noreferrer"
                className="footer__social-link"
                role="listitem"
                aria-label={`${s.label} — opens in new tab`}
                title={s.label}
              >
                {s.icon}
              </a>
            ))}
          </div>
        </div>

        {/* Col 2 — Navigation */}
        <nav className="footer__links-col" aria-label="Footer navigation">
          <p className="footer__col-title" aria-hidden="true">Navigate</p>
          {NAV_LINKS.map(({ label, href }) => (
            <button
              key={href}
              className="footer__link"
              onClick={() => handleNav(href)}
              aria-label={`Go to ${label} section`}
            >
              {label}
            </button>
          ))}
        </nav>

        {/* Col 3 — Company */}
        <div className="footer__links-col">
          <p className="footer__col-title" aria-hidden="true">Company</p>
          {COMPANY_LINKS.map(({ label, href }) => (
            <a key={label} href={href} className="footer__link">
              {label}
            </a>
          ))}
          <a
            href="mailto:contact@dotsplayzz.com"
            className="footer__link"
            aria-label="Email contact@dotsplayzz.com"
          >
            contact@dotsplayzz.com
          </a>
        </div>

      </div>

      {/* ── Bottom copyright strip ── */}
      <div className="footer__bottom">
        <p className="footer__copyright">
          © {year} <span>Dotsplayzz</span>. All rights reserved.
        </p>

        <div className="footer__legal" role="list">
          {COMPANY_LINKS.map(({ label, href }) => (
            <a
              key={label}
              href={href}
              className="footer__legal-link"
              role="listitem"
            >
              {label}
            </a>
          ))}
        </div>
      </div>

      {/* ── Made with ── */}
      <p className="footer__made">
        Built with <span>React</span> · <span>Three.js</span> · <span>GSAP</span> · Designed for the singularity
      </p>

    </footer>
  )
}