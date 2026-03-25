import { useEffect, useRef, useState } from 'react'
import { useProgress } from '@react-three/drei'
import '../styles/loader.css'

/* ─── Status messages that cycle via typewriter ─── */
const STATUS_MESSAGES = [
  'INITIALIZING SYSTEMS...',
  'LOADING ASSETS...',
  'ENTERING SINGULARITY PROTOCOL...',
]

/* ─── Particle config ─── */
const PARTICLE_COUNT = 50
const MIN_DISPLAY_MS = 1500  // minimum time for logo entrance animation

export default function Loader({ onComplete }) {
  const { progress }                          = useProgress()   // live % from R3F
  const [displayProgress, setDisplayProgress] = useState(0)
  const [statusText, setStatusText]           = useState('')
  const [exiting, setExiting]                 = useState(false)

  const canvasRef       = useRef(null)
  const particlesRef    = useRef([])
  const animFrameRef    = useRef(null)
  const typewriterRef   = useRef(null)
  const completedRef    = useRef(false)
  const mountTimeRef    = useRef(Date.now())

  /* ── Smooth animated progress counter ── */
  useEffect(() => {
    let raf
    const animate = () => {
      setDisplayProgress(prev => {
        const target = Math.round(progress)
        if (prev >= target) return prev
        // Smoothly interpolate towards real progress
        const next = prev + Math.max(1, Math.ceil((target - prev) * 0.15))
        return Math.min(next, target)
      })
      raf = requestAnimationFrame(animate)
    }
    raf = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(raf)
  }, [progress])

  /* ── Trigger exit when truly ready ── */
  useEffect(() => {
    if (displayProgress >= 100) {
      // Wait for minimum display time so logo animation completes
      const elapsed = Date.now() - mountTimeRef.current
      const remaining = Math.max(0, MIN_DISPLAY_MS - elapsed)
      const timer = setTimeout(() => triggerExit(), remaining)
      return () => clearTimeout(timer)
    }
  }, [displayProgress])

  function triggerExit() {
    if (completedRef.current) return
    completedRef.current = true

    setDisplayProgress(100)
    // Small pause at 100% so user sees it, then cinematic fade
    setTimeout(() => {
      setExiting(true)
      setTimeout(() => {
        if (onComplete) onComplete()
      }, 800)   // matches CSS exit transition
    }, 300)
  }

  /* ── Typewriter effect ── */
  useEffect(() => {
    let charIndex   = 0
    let msgIndex    = 0
    let currentText = ''
    let isDeleting  = false
    let pauseTimer  = null

    function type() {
      const msg = STATUS_MESSAGES[msgIndex]

      if (!isDeleting) {
        currentText = msg.slice(0, charIndex + 1)
        charIndex++
        if (charIndex === msg.length) {
          isDeleting = true
          pauseTimer = setTimeout(type, 1200)
          setStatusText(currentText)
          return
        }
      } else {
        currentText = msg.slice(0, charIndex - 1)
        charIndex--
        if (charIndex === 0) {
          isDeleting = false
          msgIndex   = (msgIndex + 1) % STATUS_MESSAGES.length
        }
      }

      setStatusText(currentText)
      typewriterRef.current = setTimeout(type, isDeleting ? 20 : 40)
    }

    /* Start typewriter after logo entrance delay */
    const startDelay = setTimeout(() => {
      type()
    }, 1500)

    return () => {
      clearTimeout(startDelay)
      clearTimeout(typewriterRef.current)
      clearTimeout(pauseTimer)
    }
  }, [])

  /* ── Particle field (canvas) ── */
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx    = canvas.getContext('2d')
    let width    = canvas.width  = window.innerWidth
    let height   = canvas.height = window.innerHeight

    /* Respects prefers-reduced-motion */
    const prefersReduced = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches

    if (prefersReduced) return

    /* Init particles */
    particlesRef.current = Array.from({ length: PARTICLE_COUNT }, () => ({
      x:       Math.random() * width,
      y:       Math.random() * height,
      size:    Math.random() * 2 + 1,          /* 1–3px */
      speedY:  Math.random() * 0.4 + 0.1,      /* drift upward */
      speedX:  (Math.random() - 0.5) * 0.2,
      opacity: Math.random() * 0.15 + 0.08,    /* 8–23% */
      color:   Math.random() > 0.5 ? '#00E0FF' : '#7B61FF',
    }))

    function draw() {
      ctx.clearRect(0, 0, width, height)

      particlesRef.current.forEach(p => {
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
        ctx.fillStyle = p.color
        ctx.globalAlpha = p.opacity
        ctx.fill()

        /* Move */
        p.y -= p.speedY
        p.x += p.speedX

        /* Wrap around */
        if (p.y < -p.size)    p.y = height + p.size
        if (p.x < -p.size)    p.x = width  + p.size
        if (p.x > width + p.size) p.x = -p.size
      })

      ctx.globalAlpha = 1
      animFrameRef.current = requestAnimationFrame(draw)
    }

    draw()

    /* Resize handler */
    function onResize() {
      width  = canvas.width  = window.innerWidth
      height = canvas.height = window.innerHeight
    }
    window.addEventListener('resize', onResize)

    return () => {
      cancelAnimationFrame(animFrameRef.current)
      window.removeEventListener('resize', onResize)
    }
  }, [])

  return (
    <div
      className={`loader${exiting ? ' exiting' : ''}`}
      role="status"
      aria-label="Loading Singularity Protocol"
      aria-live="polite"
    >
      {/* Particle field */}
      <canvas
        ref={canvasRef}
        className="loader__particles"
        aria-hidden="true"
      />

      {/* Main content */}
      <div className="loader__content">

        {/* Logo */}
        <h1 className="loader__logo" aria-label="Singularity Protocol">
          singularity protocol
        </h1>

        {/* Subtitle */}
        <p className="loader__subtitle" aria-hidden="true">
          Singularity Protocol
        </p>

        {/* Divider */}
        <div className="loader__divider" aria-hidden="true" />

        {/* Progress bar */}
        <div className="loader__progress-wrap">
          <span className="loader__percent" aria-hidden="true">
            {displayProgress}%
          </span>
          <div
            className="loader__bar-track"
            role="progressbar"
            aria-valuenow={displayProgress}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label="Loading progress"
          >
            <div
              className="loader__bar-fill"
              style={{ width: `${displayProgress}%` }}
            />
          </div>
        </div>

        {/* Typewriter status */}
        <p className="loader__status" aria-live="off" aria-hidden="true">
          {statusText}
          <span style={{ opacity: 0.6 }}>|</span>
        </p>

      </div>
    </div>
  )
}