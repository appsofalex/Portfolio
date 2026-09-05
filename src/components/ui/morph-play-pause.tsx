import { motion, useReducedMotion } from "motion/react"

import { cn } from "@/lib/utils"

type MorphPlayPauseProps = {
  playing: boolean
  className?: string
}

const SPRING = { type: "spring" as const, stiffness: 520, damping: 36, mass: 0.7 }

/**
 * Rounded ▶ — height matches pause bars (15.2). Shifted so the triangle
 * centroid sits on the same 12×12 center as the pause icon.
 */
const PLAY_PATH =
  "M8.05 4.4c0-1.02 1.1-1.66 1.98-1.16l10.55 6.16c.92.54.92 1.92 0 2.46L10.03 18.02c-.88.5-1.98-.14-1.98-1.16V4.4Z"

/**
 * Solid play triangle ↔ pause bars, both centered on the same 24×24 origin.
 */
export function MorphPlayPause({ playing, className }: MorphPlayPauseProps) {
  const reduceMotion = useReducedMotion()
  const transition = reduceMotion ? { duration: 0 } : SPRING

  return (
    <svg
      viewBox="0 0 24 24"
      className={cn("overflow-visible text-white", className)}
      aria-hidden
    >
      <motion.g
        initial={false}
        animate={
          playing
            ? { opacity: 0, scale: 0.55, rotate: 48 }
            : { opacity: 1, scale: 1, rotate: 0 }
        }
        transition={transition}
        style={{ transformOrigin: "12px 12px", transformBox: "view-box" }}
      >
        {/* Pause is geometric-centered; play needs a left/down nudge to match */}
        <g transform="translate(-1.7 0.7)">
          <path fill="currentColor" d={PLAY_PATH} />
        </g>
      </motion.g>

      <motion.g
        initial={false}
        animate={
          playing
            ? { opacity: 1, scale: 1, rotate: 0 }
            : { opacity: 0, scale: 0.55, rotate: -48 }
        }
        transition={transition}
        style={{ transformOrigin: "12px 12px", transformBox: "view-box" }}
      >
        {/* ~1px left + 1px up at rendered size */}
        <g transform="translate(-0.85 -0.85)">
          <rect
            fill="currentColor"
            x="6.6"
            y="4.4"
            width="3.9"
            height="15.2"
            rx="1.95"
          />
          <rect
            fill="currentColor"
            x="13.5"
            y="4.4"
            width="3.9"
            height="15.2"
            rx="1.95"
          />
        </g>
      </motion.g>
    </svg>
  )
}
