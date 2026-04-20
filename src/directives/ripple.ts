import type { Directive } from 'vue'

export const vRipple: Directive<HTMLElement> = {
  mounted(el) {
    const computedPosition = getComputedStyle(el).position
    if (!computedPosition || computedPosition === 'static') {
      el.style.position = 'relative'
    }
    el.style.overflow = 'hidden'

    function onPointerDown(e: PointerEvent) {
      const rect = el.getBoundingClientRect()
      const x = e.clientX - rect.left
      const y = e.clientY - rect.top
      const size = Math.max(rect.width, rect.height) * 2

      const ripple = document.createElement('span')
      ripple.style.cssText = `
        position: absolute;
        left: ${x - size / 2}px;
        top: ${y - size / 2}px;
        width: ${size}px;
        height: ${size}px;
        border-radius: 50%;
        background: currentColor;
        pointer-events: none;
        animation: vc-ripple var(--vc-motion-duration-medium2) var(--vc-motion-easing-standard) forwards;
      `

      el.appendChild(ripple)

      function remove() {
        ripple.style.transition = `opacity var(--vc-motion-duration-short3) ease`
        ripple.style.opacity = '0'
        ripple.addEventListener('transitionend', () => ripple.remove(), { once: true })
        // Fallback removal
        setTimeout(() => ripple.remove(), 400)
        el.removeEventListener('pointerup', remove)
        el.removeEventListener('pointerleave', remove)
      }

      el.addEventListener('pointerup', remove, { once: true })
      el.addEventListener('pointerleave', remove, { once: true })
    }

    el.addEventListener('pointerdown', onPointerDown)
    ;(el as HTMLElement & { _rippleCleanup?: () => void })._rippleCleanup = () => {
      el.removeEventListener('pointerdown', onPointerDown)
    }
  },

  unmounted(el) {
    ;(el as HTMLElement & { _rippleCleanup?: () => void })._rippleCleanup?.()
  },
}
