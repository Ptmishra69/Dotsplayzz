// src/components/Navbar.jsx
// Fixed top navigation — glass on scroll, section detection, mobile menu

import { useState, useEffect, useCallback } from 'react';
import '../styles/navbar.css';

const NAV_LINKS = [
  { label: 'Home',      href: '#home'    },
  { label: 'Game',      href: '#game'    },
  { label: 'About',     href: '#about'   },
  { label: 'Community', href: '#social'  },
  { label: 'Careers',   href: '#careers' },
  { label: 'Contact',   href: '#contact' },
];

export default function Navbar() {
  const [scrolled,   setScrolled]   = useState(false);
  const [revealed,   setRevealed]   = useState(false);
  const [menuOpen,   setMenuOpen]   = useState(false);
  const [activeLink, setActiveLink] = useState('#home');

  // ── Scroll glass + reveal effect ──
  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 20);
      // Reveal navbar once user has scrolled past 10%
      setRevealed(window.scrollY > window.innerHeight * 0.10);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    // Run once on mount in case user lands mid-page
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // ── Active section detection ──
  useEffect(() => {
    const sectionIds = NAV_LINKS.map(l => l.href.slice(1));
    const observers = [];

    sectionIds.forEach(id => {
      const el = document.getElementById(id);
      if (!el) return;
      const obs = new IntersectionObserver(
        ([entry]) => { if (entry.isIntersecting) setActiveLink(`#${id}`); },
        { threshold: 0.4 }
      );
      obs.observe(el);
      observers.push(obs);
    });

    return () => observers.forEach(o => o.disconnect());
  }, []);

  // ── Mobile scroll lock ──
  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [menuOpen]);

  // ── ESC closes menu ──
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') setMenuOpen(false); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const handleNav = useCallback((e, href) => {
    e.preventDefault();
    setMenuOpen(false);
    setActiveLink(href);
    const target = document.querySelector(href);
    if (target) target.scrollIntoView({ behavior: 'smooth' });
  }, []);

  return (
    <>
      <nav className={`navbar ${scrolled ? 'navbar--scrolled' : ''} ${revealed ? 'navbar--revealed' : ''}`} role="navigation" aria-label="Main navigation">
        {/* Logo */}
        <a
          href="#home"
          className="navbar__logo"
          onClick={(e) => handleNav(e, '#home')}
          aria-label="DotPlayzStudio — go to home"
        >
          DOTSPLAYZZ
        </a>

        {/* Desktop links */}
        <ul className="navbar__links" role="list">
          {NAV_LINKS.map(({ label, href }) => (
            <li key={href}>
              <a
                href={href}
                className={`navbar__link ${activeLink === href ? 'navbar__link--active' : ''}`}
                onClick={(e) => handleNav(e, href)}
                aria-current={activeLink === href ? 'page' : undefined}
              >
                {label}
              </a>
            </li>
          ))}
        </ul>

        {/* CTA */}
        <button
          className="navbar__cta"
          onClick={(e) => handleNav(e, '#game')}
          aria-label="Play Now — go to game section"
        >
          Play Now
        </button>

        {/* Mobile hamburger */}
        <button
          className={`navbar__hamburger ${menuOpen ? 'navbar__hamburger--open' : ''}`}
          onClick={() => setMenuOpen(v => !v)}
          aria-label={menuOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={menuOpen}
          aria-controls="mobile-menu"
        >
          <span /><span /><span />
        </button>
      </nav>

      {/* Mobile overlay menu */}
      <div
        id="mobile-menu"
        className={`mobile-menu ${menuOpen ? 'mobile-menu--open' : ''}`}
        aria-hidden={!menuOpen}
        role="dialog"
        aria-label="Mobile navigation"
      >
        <ul className="mobile-menu__links" role="list">
          {NAV_LINKS.map(({ label, href }) => (
            <li key={href}>
              <a
                href={href}
                className={`mobile-menu__link ${activeLink === href ? 'mobile-menu__link--active' : ''}`}
                onClick={(e) => handleNav(e, href)}
                tabIndex={menuOpen ? 0 : -1}
              >
                {label}
              </a>
            </li>
          ))}
        </ul>
        <button
          className="mobile-menu__cta"
          onClick={(e) => { handleNav(e, '#game'); }}
          tabIndex={menuOpen ? 0 : -1}
        >
          Play Now
        </button>
      </div>
    </>
  );
}