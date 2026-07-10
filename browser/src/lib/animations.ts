export function initScrollReveal(): void {
  if (typeof window === 'undefined') return
  const els = document.querySelectorAll('.scroll-reveal')
  if (!els.length) return
  const ro = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('scroll-revealed')
        ro.unobserve(e.target)
      }
    })
  }, { threshold: 0.1 })
  els.forEach(el => ro.observe(el))
}

export function initCountUp(containerId: string): void {
  if (typeof window === 'undefined') return
  const container = document.getElementById(containerId)
  if (!container) return
  const els = container.querySelectorAll('[data-count]')
  const observer = new IntersectionObserver(([entry]) => {
    if (!entry.isIntersecting) return
    observer.disconnect()
    els.forEach(el => {
      const target = parseInt(el.getAttribute('data-count') || '0')
      if (!target) return
      const dur = 1400
      const start = performance.now()
      function tick(now: number) {
        const p = Math.min((now - start) / dur, 1)
        const e = 1 - Math.pow(1 - p, 3)
        el.textContent = Math.round(target * e).toLocaleString()
        if (p < 1) requestAnimationFrame(tick)
      }
      requestAnimationFrame(tick)
    })
  }, { threshold: 0.3 })
  observer.observe(container)
}
