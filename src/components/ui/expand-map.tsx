import type React from "react"
import { useEffect, useId, useRef, useState } from "react"
import {
  AnimatePresence,
  motion,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
} from "motion/react"

import { cn } from "@/lib/utils"

type LocationMapSize = {
  width: number
  height: number
}

interface LocationMapProps {
  location?: string
  coordinates?: string
  className?: string
  collapsedSize?: LocationMapSize
  expandedSize?: LocationMapSize
  /** Collapse the map when this becomes false (e.g. parent menu closes). */
  active?: boolean
  tabIndex?: number
  showHint?: boolean
  /** When active, expand automatically after this many ms. */
  autoExpandDelayMs?: number
}

const DEFAULT_COLLAPSED = { width: 240, height: 140 }
const DEFAULT_EXPANDED = { width: 360, height: 280 }

export function LocationMap({
  location = "London, UK",
  coordinates = "51.5074° N, 0.1278° W",
  className,
  collapsedSize = DEFAULT_COLLAPSED,
  expandedSize = DEFAULT_EXPANDED,
  active = true,
  tabIndex = 0,
  showHint = true,
  autoExpandDelayMs,
}: LocationMapProps) {
  const reduceMotion = useReducedMotion()
  const gridPatternId = useId()
  const [isHovered, setIsHovered] = useState(false)
  const [isExpanded, setIsExpanded] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const skipAutoExpandRef = useRef(false)

  const mouseX = useMotionValue(0)
  const mouseY = useMotionValue(0)

  useEffect(() => {
    if (!active) {
      skipAutoExpandRef.current = false
      setIsExpanded(false)
      setIsHovered(false)
      mouseX.set(0)
      mouseY.set(0)
      return
    }

    if (autoExpandDelayMs == null) return

    const delay = reduceMotion ? 0 : autoExpandDelayMs
    const id = window.setTimeout(() => {
      if (!skipAutoExpandRef.current) setIsExpanded(true)
    }, delay)

    return () => window.clearTimeout(id)
  }, [active, autoExpandDelayMs, reduceMotion, mouseX, mouseY])

  const rotateX = useTransform(mouseY, [-50, 50], [8, -8])
  const rotateY = useTransform(mouseX, [-50, 50], [-8, 8])

  const springRotateX = useSpring(rotateX, { stiffness: 300, damping: 30 })
  const springRotateY = useSpring(rotateY, { stiffness: 300, damping: 30 })

  const handleMouseMove = (e: React.MouseEvent) => {
    if (reduceMotion || !containerRef.current) return
    const rect = containerRef.current.getBoundingClientRect()
    const centerX = rect.left + rect.width / 2
    const centerY = rect.top + rect.height / 2
    mouseX.set(e.clientX - centerX)
    mouseY.set(e.clientY - centerY)
  }

  const handleMouseLeave = () => {
    mouseX.set(0)
    mouseY.set(0)
    setIsHovered(false)
  }

  const toggleExpanded = () => {
    skipAutoExpandRef.current = true
    setIsExpanded((prev) => !prev)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault()
      toggleExpanded()
    }
  }

  return (
    <motion.div
      ref={containerRef}
      role="button"
      tabIndex={tabIndex}
      aria-expanded={isExpanded}
      aria-label={
        isExpanded
          ? `Collapse map for ${location}`
          : `Expand map for ${location}`
      }
      className={cn(
        "relative cursor-pointer select-none outline-none focus-visible:ring-2 focus-visible:ring-foreground/40",
        className,
      )}
      style={{ perspective: 1000 }}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleMouseLeave}
      onClick={toggleExpanded}
      onKeyDown={handleKeyDown}
    >
      <motion.div
        className="relative overflow-hidden rounded-xl border border-black/10 bg-background dark:border-white/10"
        style={
          reduceMotion
            ? undefined
            : {
                rotateX: springRotateX,
                rotateY: springRotateY,
                transformStyle: "preserve-3d",
              }
        }
        animate={{
          width: isExpanded ? expandedSize.width : collapsedSize.width,
          height: isExpanded ? expandedSize.height : collapsedSize.height,
        }}
        transition={
          reduceMotion
            ? { duration: 0 }
            : { type: "spring", stiffness: 400, damping: 35 }
        }
      >
        <div className="absolute inset-0 bg-gradient-to-br from-foreground/[0.03] via-transparent to-foreground/[0.06]" />

        <AnimatePresence>
          {isExpanded && (
            <motion.div
              className="pointer-events-none absolute inset-0"
              initial={reduceMotion ? false : { opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={reduceMotion ? undefined : { opacity: 0 }}
              transition={
                reduceMotion
                  ? { duration: 0 }
                  : { duration: 0.4, delay: 0.1 }
              }
            >
              <div className="absolute inset-0 bg-foreground/[0.04] dark:bg-foreground/[0.06]" />

              <svg
                className="absolute inset-0 h-full w-full"
                preserveAspectRatio="none"
              >
                <motion.line
                  x1="0%"
                  y1="35%"
                  x2="100%"
                  y2="35%"
                  className="stroke-foreground/25"
                  strokeWidth="4"
                  initial={reduceMotion ? false : { pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={
                    reduceMotion
                      ? { duration: 0 }
                      : { duration: 0.8, delay: 0.2 }
                  }
                />
                <motion.line
                  x1="0%"
                  y1="65%"
                  x2="100%"
                  y2="65%"
                  className="stroke-foreground/25"
                  strokeWidth="4"
                  initial={reduceMotion ? false : { pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={
                    reduceMotion
                      ? { duration: 0 }
                      : { duration: 0.8, delay: 0.3 }
                  }
                />
                <motion.line
                  x1="30%"
                  y1="0%"
                  x2="30%"
                  y2="100%"
                  className="stroke-foreground/20"
                  strokeWidth="3"
                  initial={reduceMotion ? false : { pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={
                    reduceMotion
                      ? { duration: 0 }
                      : { duration: 0.6, delay: 0.4 }
                  }
                />
                <motion.line
                  x1="70%"
                  y1="0%"
                  x2="70%"
                  y2="100%"
                  className="stroke-foreground/20"
                  strokeWidth="3"
                  initial={reduceMotion ? false : { pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={
                    reduceMotion
                      ? { duration: 0 }
                      : { duration: 0.6, delay: 0.5 }
                  }
                />
                {[20, 50, 80].map((y, i) => (
                  <motion.line
                    key={`h-${i}`}
                    x1="0%"
                    y1={`${y}%`}
                    x2="100%"
                    y2={`${y}%`}
                    className="stroke-foreground/10"
                    strokeWidth="1.5"
                    initial={reduceMotion ? false : { pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={
                      reduceMotion
                        ? { duration: 0 }
                        : { duration: 0.5, delay: 0.6 + i * 0.1 }
                    }
                  />
                ))}
                {[15, 45, 55, 85].map((x, i) => (
                  <motion.line
                    key={`v-${i}`}
                    x1={`${x}%`}
                    y1="0%"
                    x2={`${x}%`}
                    y2="100%"
                    className="stroke-foreground/10"
                    strokeWidth="1.5"
                    initial={reduceMotion ? false : { pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={
                      reduceMotion
                        ? { duration: 0 }
                        : { duration: 0.5, delay: 0.7 + i * 0.1 }
                    }
                  />
                ))}
              </svg>

              {(
                [
                  "top-[40%] left-[10%] w-[15%] h-[20%] bg-foreground/30 border-foreground/20",
                  "top-[15%] left-[35%] w-[12%] h-[15%] bg-foreground/25 border-foreground/15",
                  "top-[70%] left-[75%] w-[18%] h-[18%] bg-foreground/28 border-foreground/18",
                  "top-[20%] right-[10%] w-[10%] h-[25%] bg-foreground/22 border-foreground/15",
                  "top-[55%] left-[5%] w-[8%] h-[12%] bg-foreground/20 border-foreground/12",
                  "top-[8%] left-[75%] w-[14%] h-[10%] bg-foreground/22 border-foreground/15",
                ] as const
              ).map((buildingClass, i) => (
                <motion.div
                  key={buildingClass}
                  className={cn(
                    "absolute rounded-sm border",
                    buildingClass,
                  )}
                  initial={
                    reduceMotion ? false : { opacity: 0, scale: 0.8 }
                  }
                  animate={{ opacity: 1, scale: 1 }}
                  transition={
                    reduceMotion
                      ? { duration: 0 }
                      : { duration: 0.4, delay: 0.5 + i * 0.05 }
                  }
                />
              ))}

              <motion.div
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
                initial={reduceMotion ? false : { scale: 0, y: -20 }}
                animate={{ scale: 1, y: 0 }}
                transition={
                  reduceMotion
                    ? { duration: 0 }
                    : {
                        type: "spring",
                        stiffness: 400,
                        damping: 20,
                        delay: 0.3,
                      }
                }
              >
                <svg
                  width="32"
                  height="32"
                  viewBox="0 0 24 24"
                  fill="none"
                  aria-hidden
                >
                  <path
                    d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"
                    className="fill-foreground"
                  />
                  <circle
                    cx="12"
                    cy="9"
                    r="2.5"
                    className="fill-background"
                  />
                </svg>
              </motion.div>

              <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent opacity-60" />
            </motion.div>
          )}
        </AnimatePresence>

        <motion.div
          className="absolute inset-0"
          animate={{ opacity: isExpanded ? 0 : 0.04 }}
          transition={{ duration: reduceMotion ? 0 : 0.3 }}
        >
          <svg width="100%" height="100%" className="absolute inset-0">
            <defs>
              <pattern
                id={gridPatternId}
                width="20"
                height="20"
                patternUnits="userSpaceOnUse"
              >
                <path
                  d="M 20 0 L 0 0 0 20"
                  fill="none"
                  className="stroke-foreground"
                  strokeWidth="0.5"
                />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill={`url(#${gridPatternId})`} />
          </svg>
        </motion.div>

        <div className="relative z-10 flex h-full flex-col justify-between p-5">
          <div className="flex items-start justify-between">
            <motion.div
              animate={{ opacity: isExpanded ? 0 : 1 }}
              transition={{ duration: reduceMotion ? 0 : 0.3 }}
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-foreground/70"
                aria-hidden
              >
                <polygon points="3 6 9 3 15 6 21 3 21 18 15 21 9 18 3 21" />
                <line x1="9" x2="9" y1="3" y2="18" />
                <line x1="15" x2="15" y1="6" y2="21" />
              </svg>
            </motion.div>

            <motion.div
              className="flex items-center gap-1.5 rounded-full bg-foreground/5 px-2 py-1 backdrop-blur-sm"
              animate={
                reduceMotion
                  ? undefined
                  : {
                      scale: isHovered ? 1.05 : 1,
                    }
              }
              transition={{ duration: 0.2 }}
            >
              <div className="h-1.5 w-1.5 rounded-full bg-red-500" />
              <span className="text-[10px] font-medium tracking-wide text-foreground/50 uppercase">
                Live
              </span>
            </motion.div>
          </div>

          <div className="space-y-1">
            <motion.h3
              className="text-sm font-semibold tracking-tight text-foreground"
              animate={
                reduceMotion
                  ? undefined
                  : { x: isHovered ? 4 : 0 }
              }
              transition={{ type: "spring", stiffness: 400, damping: 25 }}
            >
              {location}
            </motion.h3>

            <AnimatePresence>
              {isExpanded && (
                <motion.p
                  className="font-mono text-xs text-foreground/50"
                  initial={
                    reduceMotion ? false : { opacity: 0, y: -10, height: 0 }
                  }
                  animate={{ opacity: 1, y: 0, height: "auto" }}
                  exit={
                    reduceMotion
                      ? undefined
                      : { opacity: 0, y: -10, height: 0 }
                  }
                  transition={{ duration: reduceMotion ? 0 : 0.25 }}
                >
                  {coordinates}
                </motion.p>
              )}
            </AnimatePresence>

            <motion.div
              className="h-px bg-gradient-to-r from-foreground/40 via-foreground/20 to-transparent"
              initial={false}
              animate={{
                scaleX: isHovered || isExpanded ? 1 : 0.3,
              }}
              style={{ originX: 0 }}
              transition={{
                duration: reduceMotion ? 0 : 0.4,
                ease: "easeOut",
              }}
            />
          </div>
        </div>
      </motion.div>

      <AnimatePresence>
        {isExpanded && (
          <motion.p
            className="mt-3 text-center text-sm font-medium tracking-tight text-foreground/70"
            initial={reduceMotion ? false : { opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduceMotion ? undefined : { opacity: 0, y: -6 }}
            transition={{ duration: reduceMotion ? 0 : 0.25 }}
          >
            Let&apos;s get a coffee ☕️
          </motion.p>
        )}
      </AnimatePresence>

      <motion.p
        className="absolute -bottom-6 left-1/2 whitespace-nowrap text-[10px] text-foreground/40"
        style={{ x: "-50%" }}
        initial={false}
        animate={{
          opacity: showHint && isHovered && !isExpanded ? 1 : 0,
          y: isHovered ? 0 : 4,
        }}
        transition={{ duration: reduceMotion ? 0 : 0.2 }}
        aria-hidden
      >
        Click to expand
      </motion.p>
    </motion.div>
  )
}
