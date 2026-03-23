import { useEffect, useRef, useState } from 'react'
import '../styles/modal.css'

/*
  Modal — shared cinematic overlay
  ─────────────────────────────────
  Props:
    isOpen      boolean          — controls visibility
    onClose     () => void       — called when modal should close
    title       string           — header title
    subtitle    string?          — small text under title
    tags        Tag[]?           — pill badges in header
    children    ReactNode        — body content
    size        'md' | 'lg'     — max-width: 860px | 1100px (default: 'md')

  Tag shape: { label: string, variant: 'neon'|'purple'|'red'|'gold'|'glass' }

  Usage:
    <Modal isOpen={open} onClose={() => setOpen(false)} title="Role Title" tags={[...]}>
      <p className="modal__text">Content here</p>
    </Modal>

  Closing triggers:
    - ESC key
    - Click on overlay backdrop
    - Call onClose() from any child button
*/
export default function Modal({
  isOpen,
  onClose,
  title,
  subtitle,
  tags     = [],
  size     = 'md',
  children,
}) {
  const [exiting, setExiting] = useState(false)
  const boxRef                = useRef(null)
  const prevFocusRef          = useRef(null)

  /* ── Trigger animated close ── */
  function handleClose() {
    setExiting(true)
    setTimeout(() => {
      setExiting(false)
      onClose()
    }, 280)
  }

  /* ── ESC key ── */
  useEffect(() => {
    if (!isOpen) return
    function onKey(e) {
      if (e.key === 'Escape') handleClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [isOpen])

  /* ── Body scroll lock + focus trap ── */
  useEffect(() => {
    if (!isOpen) return

    /* Lock scroll */
    const scrollY = window.scrollY
    document.body.style.overflow  = 'hidden'
    document.body.style.position  = 'fixed'
    document.body.style.top       = `-${scrollY}px`
    document.body.style.width     = '100%'

    /* Save focus and move it into modal */
    prevFocusRef.current = document.activeElement
    setTimeout(() => boxRef.current?.focus(), 50)

    return () => {
      /* Restore scroll */
      document.body.style.overflow = ''
      document.body.style.position = ''
      document.body.style.top      = ''
      document.body.style.width    = ''
      window.scrollTo(0, scrollY)

      /* Restore focus */
      prevFocusRef.current?.focus()
    }
  }, [isOpen])

  /* ── Click outside to close ── */
  function onOverlayClick(e) {
    if (e.target === e.currentTarget) handleClose()
  }

  if (!isOpen) return null

  const maxWidth = size === 'lg' ? '1100px' : '860px'

  return (
    <div
      className={`modal__overlay${exiting ? ' exiting' : ''}`}
      role="dialog"
      aria-modal="true"
      aria-label={title}
      onClick={onOverlayClick}
    >
      <div
        className="modal__box"
        ref={boxRef}
        tabIndex={-1}
        style={{ maxWidth }}
        role="document"
      >
        {/* ── Header ── */}
        <div className="modal__header">
          <div className="modal__header-left">

            {/* Tags */}
            {tags.length > 0 && (
              <div className="modal__tags" aria-label="Tags">
                {tags.map(tag => (
                  <span
                    key={tag.label}
                    className={`modal__tag modal__tag--${tag.variant || 'glass'}`}
                  >
                    {tag.label}
                  </span>
                ))}
              </div>
            )}

            {/* Title */}
            {title && (
              <h2 className="modal__title">{title}</h2>
            )}

            {/* Subtitle */}
            {subtitle && (
              <p className="modal__subtitle">{subtitle}</p>
            )}

          </div>

          {/* Close button */}
          <button
            className="modal__close"
            onClick={handleClose}
            aria-label="Close modal"
          >
            ✕
          </button>
        </div>

        {/* ── Body — children rendered here ── */}
        <div className="modal__body">
          {children}
        </div>

      </div>
    </div>
  )
}