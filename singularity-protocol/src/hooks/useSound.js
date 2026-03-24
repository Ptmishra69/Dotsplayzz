/**
 * useSound.js — Centralized sound system
 *
 * Rules:
 *  - Default state: MUTED (browser policy + UX best practice)
 *  - Ambient starts only after first user click (browser policy)
 *  - No spam: hover has 120ms cooldown
 *  - Stereo panning based on cursor X position (premium feel)
 *  - Slight pitch variation on hover (±5%) so it never feels robotic
 *  - All sounds respect window.__soundEnabled flag
 *
 * Sound files needed in public/assets/sounds/:
 *   hover.mp3   → https://assets.mixkit.co/active_storage/sfx/2571/2571-preview.mp3
 *   click.mp3   → https://assets.mixkit.co/active_storage/sfx/2568/2568-preview.mp3
 *   ambient.mp3 → Space Ambience / Drone Drone Track
 *   glitch.mp3  → https://assets.mixkit.co/active_storage/sfx/2103/2103-preview.mp3
 *   charge.mp3  → https://assets.mixkit.co/active_storage/sfx/2003/2003-preview.mp3
 */

/* ── Global sound enabled flag ── */
if (typeof window !== 'undefined') {
  window.__soundEnabled = false
}

/* ── Audio context for stereo panning + pitch ── */
let audioCtx = null
function getAudioCtx() {
  if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)()
  return audioCtx
}

/* ── Sound registry ── */
const SOUNDS = {
  hover:   { src: '/assets/sounds/hover.mp3',   volume: 0.28, pitch: true  },
  click:   { src: '/assets/sounds/click.mp3',   volume: 0.40, pitch: false },
  ambient: { src: 'https://assets.mixkit.co/active_storage/sfx/2572/2572-preview.mp3', volume: 0.25, pitch: false },
  glitch:  { src: '/assets/sounds/glitch.mp3',  volume: 0.45, pitch: false },
  charge:  { src: '/assets/sounds/charge.mp3',  volume: 0.35, pitch: false },
}

const audioCache = {}
let hoverCooldown = false
let ambientStarted = false
let cursorX = 0.5  /* 0–1, used for stereo pan */

/* Track cursor X for stereo panning */
if (typeof window !== 'undefined') {
  window.addEventListener('mousemove', e => {
    cursorX = e.clientX / window.innerWidth
  }, { passive: true })
}

function getAudio(key) {
  if (!audioCache[key]) {
    const cfg = SOUNDS[key]
    if (!cfg) return null
    const audio = new Audio(cfg.src)
    audio.volume  = cfg.volume
    audio.preload = 'auto'
    if (key === 'ambient') audio.loop = true
    audioCache[key] = audio
  }
  return audioCache[key]
}

/* ── Play with stereo pan + optional pitch variation ── */
function playSound(key) {
  if (!window.__soundEnabled) return
  const cfg   = SOUNDS[key]
  const audio = getAudio(key)
  if (!audio || !cfg) return

  try {
    /* Clone for polyphonic playback (multiple hovers) */
    const clone = audio.cloneNode()
    clone.volume = cfg.volume

    /* Pitch variation ±5% for hover — feels organic */
    if (cfg.pitch) {
      clone.playbackRate = 0.95 + Math.random() * 0.10
    }

    /* Stereo pan via Web Audio API */
    const ctx    = getAudioCtx()
    const source = ctx.createMediaElementSource(clone)
    const panner = ctx.createStereoPanner()
    panner.pan.value = (cursorX - 0.5) * 1.2  /* -0.6 to +0.6 */
    source.connect(panner)
    panner.connect(ctx.destination)

    clone.currentTime = 0
    clone.play().catch(() => {})
  } catch {
    /* Fallback: direct play without panning */
    const fallback = getAudio(key)
    if (fallback) {
      fallback.currentTime = 0
      fallback.play().catch(() => {})
    }
  }
}

/* ── Public API ── */
export const SoundSystem = {

  enable() {
    window.__soundEnabled = true
    if (!ambientStarted) {
      ambientStarted = true
      const ambient = getAudio('ambient')
      if (ambient) ambient.play().catch(() => {})
    }
  },

  disable() {
    window.__soundEnabled = false
    const ambient = getAudio('ambient')
    if (ambient) { ambient.pause(); ambient.currentTime = 0 }
    ambientStarted = false
  },

  toggle() {
    if (window.__soundEnabled) this.disable()
    else this.enable()
    return window.__soundEnabled
  },

  isEnabled() { return window.__soundEnabled },

  hover() {
    if (hoverCooldown) return
    playSound('hover')
    hoverCooldown = true
    setTimeout(() => { hoverCooldown = false }, 120)
  },

  click()  { playSound('click')  },
  glitch() { playSound('glitch') },
  charge() { playSound('charge') },

  /* Start ambient after first user gesture (browser policy) */
  initAmbientOnFirstInteraction() {
    const handler = () => {
      if (window.__soundEnabled && !ambientStarted) {
        ambientStarted = true
        const ambient = getAudio('ambient')
        if (ambient) ambient.play().catch(() => {})
      }
      document.removeEventListener('click', handler)
    }
    document.addEventListener('click', handler, { once: true })
  },

  /* Attach hover + click sounds to all interactive elements */
  bindGlobal() {
    const attach = () => {
      document.querySelectorAll('button, a, [role="button"]').forEach(el => {
        if (el.dataset.soundBound) return
        el.dataset.soundBound = 'true'
        el.addEventListener('mouseenter', () => SoundSystem.hover(), { passive: true })
        el.addEventListener('click',      () => SoundSystem.click())
      })
    }
    attach()
    /* Re-run when DOM changes (modals, dynamic content) */
    const obs = new MutationObserver(attach)
    obs.observe(document.body, { childList: true, subtree: true })
  },
}

export default SoundSystem