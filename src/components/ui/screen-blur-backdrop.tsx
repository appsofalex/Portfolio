import { AnimatePresence, motion, useReducedMotion } from "motion/react"
import { createPortal } from "react-dom"

const BLUR_EASE = [0.32, 0.72, 0, 1] as const

export interface ScreenBlurBackdropProps {
  open: boolean
  /** Accessible label when the backdrop dismisses on click. */
  label?: string
  onDismiss?: () => void
  className?: string
}

/** Full-viewport frosted veil used by the site nav and Get in touch menus. */
export function ScreenBlurBackdrop({
  open,
  label = "Dismiss",
  onDismiss,
  className = "fixed inset-0 z-40 cursor-default bg-background/30 backdrop-blur-[8px]",
}: ScreenBlurBackdropProps) {
  const reduceMotion = useReducedMotion()

  if (typeof document === "undefined") return null

  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.button
          key="screen-blur-backdrop"
          type="button"
          aria-label={label}
          className={className}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={
            reduceMotion
              ? { duration: 0 }
              : { duration: 0.28, ease: BLUR_EASE }
          }
          onClick={onDismiss}
        />
      )}
    </AnimatePresence>,
    document.body,
  )
}
