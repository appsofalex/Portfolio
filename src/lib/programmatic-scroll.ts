import { animate } from "motion"

type ScrollAnim = { stop: () => void }

type LockListener = (locked: boolean) => void

const listeners = new Set<LockListener>()
let lockSession = 0
let locked = false

function notify(next: boolean) {
  if (locked === next) return
  locked = next
  listeners.forEach((listener) => listener(locked))
}

/** Subscribe to programmatic auto-scroll lock (for the site header). */
export function subscribeProgrammaticScrollLock(listener: LockListener) {
  listeners.add(listener)
  listener(locked)
  return () => {
    listeners.delete(listener)
  }
}

export function isProgrammaticScrollLocked() {
  return locked
}

/**
 * Locks the header into its minimised state for one auto-scroll session.
 * Starting a new session supersedes the previous unlock callback.
 */
export function beginProgrammaticScrollSession() {
  lockSession += 1
  const session = lockSession
  notify(true)

  return () => {
    if (session !== lockSession) return
    notify(false)
  }
}

type ScrollWindowOptions = {
  duration?: number
  ease?: readonly [number, number, number, number]
  reduceMotion?: boolean
  animRef?: { current: ScrollAnim | null }
  /** Skip scroll when already within this many pixels of the target. */
  threshold?: number
}

/**
 * Smoothly scrolls the window and keeps the site header minimised for the
 * duration — including when the target is above the current scroll position.
 */
export function scrollWindowTo(
  to: number,
  {
    duration = 1.25,
    ease = [0.16, 1, 0.3, 1],
    reduceMotion,
    animRef,
    threshold = 12,
  }: ScrollWindowOptions = {},
): boolean {
  const maxScroll = Math.max(
    0,
    document.documentElement.scrollHeight - window.innerHeight,
  )
  const target = Math.min(maxScroll, Math.max(0, to))

  if (Math.abs(target - window.scrollY) < threshold) return false

  animRef?.current?.stop()

  const endSession = beginProgrammaticScrollSession()
  let settled = false

  const settle = () => {
    if (settled) return
    settled = true
    if (animRef) animRef.current = null
    endSession()
  }

  const preferReduced =
    reduceMotion ??
    window.matchMedia("(prefers-reduced-motion: reduce)").matches

  if (preferReduced) {
    window.scrollTo(0, target)
    requestAnimationFrame(() => {
      requestAnimationFrame(settle)
    })
    return true
  }

  const controls = animate(window.scrollY, target, {
    duration,
    ease: [...ease],
    onUpdate: (latest) => {
      window.scrollTo(0, latest)
    },
    onComplete: settle,
  })

  if (animRef) {
    animRef.current = {
      stop: () => {
        controls.stop()
        settle()
      },
    }
  }

  return true
}

/** Vertically centre an element in the viewport via programmatic scroll. */
export function scrollElementIntoCenter(
  el: HTMLElement,
  options: ScrollWindowOptions = {},
): boolean {
  const rect = el.getBoundingClientRect()
  const elCenter = rect.top + window.scrollY + rect.height / 2
  const to = elCenter - window.innerHeight / 2
  return scrollWindowTo(to, options)
}
