/**
 * useGlowSystem.js — Global synchronized glow state
 */
import { useState, useEffect, useCallback } from 'react'

let currentGlow = 60
const listeners = new Set()

function notifyAll() {
  listeners.forEach(fn => fn(currentGlow))
}

export function setGlobalGlow(val) {
  currentGlow = val
  document.documentElement.style.setProperty('--glow-intensity', val / 100)
  notifyAll()
}

export function useGlowSystem() {
  const [glow, setGlowState] = useState(currentGlow)

  useEffect(() => {
    const handler = g => setGlowState(g)
    listeners.add(handler)
    return () => listeners.delete(handler)
  }, [])

  const set = useCallback(val => setGlobalGlow(val), [])
  return { glow, glowScalar: glow / 100, setGlow: set }
}
