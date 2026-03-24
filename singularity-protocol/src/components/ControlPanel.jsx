/**
 * ControlPanel.jsx — Bottom-right persistent panel
 *
 * Controls:
 *   - Sound ON/OFF toggle (default: OFF)
 *   - Mode toggle: Exploration / Combat
 *   - Glow intensity slider (0–100)
 *   - Collapse / expand button
 *
 * Wires into:
 *   SoundSystem from useSound.js
 *   useModeSystem from useModeSystem.js
 *   CSS variable --glow-intensity via inline style on body
 */

import { useState, useCallback } from 'react'
import { SoundSystem } from '../hooks/useSound'
import { useModeSystem } from '../hooks/useModeSystem'
import { useGlowSystem } from '../hooks/useGlowSystem'
import './control-panel.css'

export default function ControlPanel() {
  const [open,      setOpen]      = useState(false)
  const [sound,     setSound]     = useState(false)
  const { glow, setGlow }         = useGlowSystem()
  const { mode, toggle: toggleMode } = useModeSystem()

  /* ── Sound toggle ── */
  const handleSound = useCallback(() => {
    const next = SoundSystem.toggle()
    setSound(next)
    /* Play click feedback only if enabling */
    if (next) setTimeout(() => SoundSystem.click(), 80)
  }, [])

  /* ── Mode toggle with flash animation ── */
  const handleMode = useCallback(() => {
    SoundSystem.click()
    document.body.classList.add('mode-switching')
    setTimeout(() => document.body.classList.remove('mode-switching'), 500)
    toggleMode()
  }, [toggleMode])

  /* ── Glow slider ── */
  const handleGlow = useCallback(e => {
    const val = Number(e.target.value)
    setGlow(val)
    SoundSystem.hover()
  }, [])

  /* ── Toggle panel ── */
  const handleToggle = useCallback(() => {
    setOpen(p => !p)
    SoundSystem.click()
  }, [])

  const isCombat = mode === 'combat'

  return (
    <div className={`cp ${open ? 'cp--open' : ''} ${isCombat ? 'cp--combat' : ''}`}
         role="region" aria-label="Control Panel">

      {/* ── Toggle button ── */}
      <button
        className="cp__toggle"
        onClick={handleToggle}
        aria-label={open ? 'Close control panel' : 'Open control panel'}
        aria-expanded={open}
      >
        <span className="cp__toggle-icon" aria-hidden="true">
          {open ? '✕' : '⚙'}
        </span>
        {!open && <span className="cp__toggle-label">SYS</span>}
      </button>

      {/* ── Panel body ── */}
      {open && (
        <div className="cp__body">

          <p className="cp__title">SYSTEM PANEL</p>

          {/* Sound */}
          <div className="cp__row">
            <span className="cp__label">SOUND</span>
            <button
              className={`cp__toggle-btn ${sound ? 'cp__toggle-btn--on' : ''}`}
              onClick={handleSound}
              aria-label={sound ? 'Disable sound' : 'Enable sound'}
              aria-pressed={sound}
            >
              <span className="cp__toggle-btn-dot" />
              <span className="cp__toggle-btn-text">{sound ? 'ON' : 'OFF'}</span>
            </button>
          </div>

          {/* Mode */}
          <div className="cp__row">
            <span className="cp__label">MODE</span>
            <button
              className={`cp__mode-btn ${isCombat ? 'cp__mode-btn--combat' : ''}`}
              onClick={handleMode}
              aria-label={`Switch to ${isCombat ? 'exploration' : 'combat'} mode`}
            >
              {isCombat ? '⚔ COMBAT' : '🌌 EXPLORE'}
            </button>
          </div>

          {/* Glow intensity */}
          <div className="cp__row cp__row--col">
            <div className="cp__row-header">
              <span className="cp__label">GLOW</span>
              <span className="cp__value">{glow}%</span>
            </div>
            <div className="cp__slider-wrap">
              <input
                type="range"
                min="0"
                max="100"
                value={glow}
                onChange={handleGlow}
                className="cp__slider"
                aria-label="Glow intensity"
              />
              <div
                className="cp__slider-fill"
                style={{ width: `${glow}%` }}
              />
            </div>
          </div>

          <div className="cp__divider" />
          <p className="cp__footer">SINGULARITY PROTOCOL v1.0</p>

        </div>
      )}

    </div>
  )
}