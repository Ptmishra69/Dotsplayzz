/**
 * useModeSystem.js — Mode switching (exploration / combat)
 *
 * Applies class to document.body:
 *   .mode-exploration (default)
 *   .mode-combat
 *
 * CSS variables are overridden per mode in mode.css
 * Components can import useModeSystem to read / toggle current mode.
 */

import { useState, useEffect, useCallback } from 'react'

const MODES = ['exploration', 'combat']

/* Module-level state so all hooks share it */
let currentMode    = 'exploration'
const listeners    = new Set()

function notifyAll() {
  listeners.forEach(fn => fn(currentMode))
}

export function setMode(mode) {
  if (!MODES.includes(mode)) return
  currentMode = mode
  /* Apply body classes */
  MODES.forEach(m => document.body.classList.remove(`mode-${m}`))
  document.body.classList.add(`mode-${mode}`)
  notifyAll()
}

export function toggleMode() {
  const next = currentMode === 'exploration' ? 'combat' : 'exploration'
  setMode(next)
  return next
}

export function getMode() { return currentMode }

/* React hook */
export function useModeSystem() {
  const [mode, setModeState] = useState(currentMode)

  useEffect(() => {
    /* Ensure body class is set on mount */
    setMode(currentMode)

    const handler = m => setModeState(m)
    listeners.add(handler)
    return () => listeners.delete(handler)
  }, [])

  const toggle = useCallback(() => toggleMode(), [])
  const set    = useCallback(m => setMode(m), [])

  return { mode, toggle, set, isExploration: mode === 'exploration', isCombat: mode === 'combat' }
}

export default useModeSystem