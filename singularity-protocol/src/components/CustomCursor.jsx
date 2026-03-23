// src/components/CustomCursor.jsx
// Dot + ring + click-pulse cursor. Hidden on touch devices.

import { useEffect, useRef } from 'react';
import '../styles/cursor.css';

const HOVER_SELECTORS = 'button, a, [role="button"], input, textarea, select, label, .feature-card, .role-card, .platform-card, .discipline-card';

export default function CustomCursor() {
  const dotRef   = useRef(null);
  const ringRef  = useRef(null);
  const pulseRef = useRef(null);

  // Hide on touch devices
  if (typeof window !== 'undefined' && window.matchMedia('(pointer: coarse)').matches) {
    return null;
  }

  useEffect(() => {
    const dot   = dotRef.current;
    const ring  = ringRef.current;
    const pulse = pulseRef.current;
    if (!dot || !ring || !pulse) return;

    let mx = 0, my = 0, rx = 0, ry = 0;
    let raf;

    const onMove = (e) => {
      mx = e.clientX;
      my = e.clientY;
      dot.style.left = mx + 'px';
      dot.style.top  = my + 'px';

      // Hover detection
      const target = e.target.closest(HOVER_SELECTORS);
      ring.classList.toggle('cursor__ring--hover', !!target);
      dot.classList.toggle('cursor__dot--hover',   !!target);
    };

    const onClick = () => {
      pulse.classList.remove('cursor__pulse--active');
      void pulse.offsetWidth; // reflow trick to restart animation
      pulse.classList.add('cursor__pulse--active');
    };

    const onMouseDown = (e) => {
      if (e.buttons === 1) {
        dot.classList.add('cursor__dot--drag');
        ring.classList.add('cursor__ring--drag');
      }
    };
    const onMouseUp = () => {
      dot.classList.remove('cursor__dot--drag');
      ring.classList.remove('cursor__ring--drag');
    };

    const onLeave  = () => { dot.classList.add('cursor--hidden'); ring.classList.add('cursor--hidden'); };
    const onEnter  = () => { dot.classList.remove('cursor--hidden'); ring.classList.remove('cursor--hidden'); };

    function animRing() {
      rx += (mx - rx) * 0.12;
      ry += (my - ry) * 0.12;
      ring.style.left  = rx + 'px';
      ring.style.top   = ry + 'px';
      pulse.style.left = rx + 'px';
      pulse.style.top  = ry + 'px';
      raf = requestAnimationFrame(animRing);
    }
    raf = requestAnimationFrame(animRing);

    document.addEventListener('mousemove',  onMove,     { passive: true });
    document.addEventListener('click',      onClick);
    document.addEventListener('mousedown',  onMouseDown);
    document.addEventListener('mouseup',    onMouseUp);
    document.addEventListener('mouseleave', onLeave);
    document.addEventListener('mouseenter', onEnter);

    return () => {
      cancelAnimationFrame(raf);
      document.removeEventListener('mousemove',  onMove);
      document.removeEventListener('click',      onClick);
      document.removeEventListener('mousedown',  onMouseDown);
      document.removeEventListener('mouseup',    onMouseUp);
      document.removeEventListener('mouseleave', onLeave);
      document.removeEventListener('mouseenter', onEnter);
    };
  }, []);

  return (
    <>
      <div ref={dotRef}   id="cursor-dot"   className="cursor__dot"   aria-hidden="true" />
      <div ref={ringRef}  id="cursor-ring"  className="cursor__ring"  aria-hidden="true" />
      <div ref={pulseRef} id="cursor-pulse" className="cursor__pulse" aria-hidden="true" />
    </>
  );
}