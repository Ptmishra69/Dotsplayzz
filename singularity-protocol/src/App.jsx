import { useState, lazy, Suspense, useEffect } from 'react'
import Navbar              from './components/Navbar'
import Loader              from './components/Loader'
import Footer              from './components/Footer'
import CustomCursor        from './components/CustomCursor'
import ControlPanel        from './components/ControlPanel'
import Hero                from './sections/Hero'
import SingularityProtocol from './sections/SingularityProtocol'
import AboutUs             from './sections/AboutUs'
import Social              from './sections/Social'
import Contact             from './sections/Contact'
import Careers             from './sections/Careers'
import FixedFloatingLines  from './components/FixedFloatingLines'
import SectionDivider      from './components/SectionDivider'
import SoundSystem         from './hooks/useSound'

export default function App() {
  const [loaded, setLoaded] = useState(false)

  /* Scroll reveal */
  useEffect(() => {
    const els = document.querySelectorAll('.section-enter')
    if (!els.length) return
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (prefersReduced) { els.forEach(el => el.classList.add('visible')); return }
    const observer = new IntersectionObserver(
      entries => entries.forEach(e => {
        if (e.isIntersecting) {
          const delay = e.target.dataset.revealDelay || 0
          setTimeout(() => e.target.classList.add('visible'), delay)
          observer.unobserve(e.target)
        }
      }),
      { threshold: 0.08, rootMargin: '0px 0px -40px 0px' }
    )
    els.forEach(el => observer.observe(el))
    return () => observer.disconnect()
  }, [loaded])

  /* Bind global sounds + init ambient listener */
  useEffect(() => {
    SoundSystem.initAmbientOnFirstInteraction()
    SoundSystem.bindGlobal()
  }, [])

  /* Set default mode class on body */
  useEffect(() => {
    document.body.classList.add('mode-exploration')
  }, [])

  return (
    <>
      {/* Custom cursor */}
      <CustomCursor />

      {/* Fixed WebGL canvas — game section bg */}
      <FixedFloatingLines />

      {/* Control panel — bottom right, persistent */}
      <ControlPanel />

      <a href="#main-content" className="skip-link sr-only">Skip to main content</a>

      {!loaded && <Loader onComplete={() => setLoaded(true)} />}

      <Navbar />

      <main id="main-content">
        <Hero />
        <SectionDivider />
        <SingularityProtocol />
        <AboutUs />
        <Social />
        <Careers />
        <Contact />
        
      </main>

      <Footer />
    </>
  )
}