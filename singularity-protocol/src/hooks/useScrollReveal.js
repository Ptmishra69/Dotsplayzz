// src/hooks/useScrollReveal.js
// Attaches an IntersectionObserver to a ref.
// Adds .visible to matching elements when they enter the viewport.

import { useEffect, useRef } from 'react';

/**
 * @param {object}  options
 * @param {number}  options.threshold  – 0–1, how much visible before trigger (default 0.1)
 * @param {string}  options.selector   – CSS selector for child targets (null = root element)
 * @param {number}  options.stagger    – ms delay added per child index (default 0)
 * @param {boolean} options.once       – unobserve after first trigger (default true)
 */
export function useScrollReveal({
  threshold = 0.1,
  selector  = null,
  stagger   = 0,
  once      = true,
} = {}) {
  const ref = useRef(null);

  useEffect(() => {
    const root = ref.current;
    if (!root) return;

    // Respect reduced-motion: instantly reveal everything
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      const targets = selector
        ? Array.from(root.querySelectorAll(selector))
        : [root];
      targets.forEach(el => el.classList.add('visible'));
      return;
    }

    const targets = selector
      ? Array.from(root.querySelectorAll(selector))
      : [root];

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;

          if (selector) {
            // Stagger children
            targets.forEach((el, i) => {
              setTimeout(
                () => el.classList.add('visible'),
                i * stagger
              );
            });
          } else {
            entry.target.classList.add('visible');
          }

          if (once) observer.unobserve(entry.target);
        });
      },
      { threshold }
    );

    // Observe root (or root for child stagger)
    observer.observe(root);

    return () => observer.disconnect();
  }, [threshold, selector, stagger, once]);

  return ref;
}

export default useScrollReveal;