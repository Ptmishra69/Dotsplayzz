import { useState, lazy, Suspense, useEffect } from 'react'
import Navbar              from './components/Navbar'
import Loader              from './components/Loader'
import Footer              from './components/Footer'
import CustomCursor        from './components/CustomCursor'
import ControlPanel        from './components/ControlPanel'
import Hero                from './sections/Hero'
import FixedFloatingLines  from './components/FixedFloatingLines'
import SectionDivider      from './components/SectionDivider'
import SoundSystem         from './hooks/useSound'

/* ── Lazy-load below-the-fold sections ── */
const SingularityProtocol = lazy(() => import('./sections/SingularityProtocol'))
const AboutUs             = lazy(() => import('./sections/AboutUs'))
const Social              = lazy(() => import('./sections/Social'))
const Contact             = lazy(() => import('./sections/Contact'))
const Careers             = lazy(() => import('./sections/Careers'))

export default function App() {
  const [loaded, setLoaded] = useState(false)

  /* ── Lock scroll while loading ── */
  useEffect(() => {
    if (!loaded) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
      // Ensure we start at top after load
      window.scrollTo(0, 0)
    }
    return () => { document.body.style.overflow = '' }
  }, [loaded])

  /* Scroll reveal — uses MutationObserver to catch lazy-loaded sections */
  useEffect(() => {
    if (!loaded) return

    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const observed = new Set()

    const io = new IntersectionObserver(
      entries => entries.forEach(e => {
        if (e.isIntersecting) {
          const delay = e.target.dataset.revealDelay || 0
          setTimeout(() => e.target.classList.add('visible'), delay)
          io.unobserve(e.target)
          observed.delete(e.target)
        }
      }),
      { threshold: 0.08, rootMargin: '0px 0px -40px 0px' }
    )

    function processElements() {
      const els = document.querySelectorAll('.section-enter:not(.visible)')
      els.forEach(el => {
        if (observed.has(el)) return
        if (prefersReduced) {
          el.classList.add('visible')
        } else {
          observed.add(el)
          io.observe(el)
        }
      })
    }

    // Process elements already in DOM
    processElements()

    // Watch for new elements added by lazy-loading
    const mo = new MutationObserver(() => processElements())
    mo.observe(document.getElementById('main-content') || document.body, {
      childList: true,
      subtree: true
    })

    return () => {
      io.disconnect()
      mo.disconnect()
    }
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
        {/* Mount below-fold sections only after loader completes */}
        {loaded && (
          <Suspense fallback={null}>
            <SingularityProtocol />
            <AboutUs />
            <Social />
            <Careers />
            <Contact />
          </Suspense>
        )}
      </main>

      <Footer />
    </>
  )
}