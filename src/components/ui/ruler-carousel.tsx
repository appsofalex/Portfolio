import { useCallback, useEffect, useRef, useState } from "react"
import { FastForward, Pause, Play, Rewind } from "lucide-react"
import { AnimatePresence, motion, useReducedMotion } from "motion/react"

import { cn } from "@/lib/utils"

import "./ruler-carousel.css"

export interface CarouselItem {
  id: number
  title: string
  href: string
  logo: string
}

type InfiniteItem = Omit<CarouselItem, "id"> & {
  id: string
  originalIndex: number
}

const TOTAL_LINES = 101
const CENTER_INDEX = (TOTAL_LINES - 1) / 2
const AUTOPLAY_INTERVAL = 3000

const createInfiniteItems = (originalItems: CarouselItem[]): InfiniteItem[] => {
  const items: InfiniteItem[] = []
  for (let copy = 0; copy < 3; copy += 1) {
    originalItems.forEach((item, index) => {
      items.push({
        ...item,
        id: `${copy}-${item.id}`,
        originalIndex: index,
      })
    })
  }
  return items
}

function lineLift(
  lineRatio: number,
  pointerRatio: number | null,
  disabled: boolean,
) {
  if (disabled || pointerRatio === null) return 0
  const distance = lineRatio - pointerRatio
  const sigma = 0.09
  const amplitude = 7
  return -amplitude * Math.exp(-(distance * distance) / (2 * sigma * sigma))
}

function RulerLines({
  top = true,
  pointerRatio,
  reduceMotion,
}: {
  top?: boolean
  pointerRatio: number | null
  reduceMotion: boolean
}) {
  const lines = []

  for (let i = 0; i < TOTAL_LINES; i += 1) {
    const isFifth = i % 5 === 0
    const isCenter = i === CENTER_INDEX
    const lineRatio = i / (TOTAL_LINES - 1)
    const lift = lineLift(lineRatio, pointerRatio, reduceMotion)

    lines.push(
      <motion.div
        key={i}
        className={cn(
          "absolute w-px will-change-transform",
          top ? "top-0" : "bottom-0",
          isCenter
            ? "h-8 bg-foreground"
            : isFifth
              ? "h-4 bg-foreground/70"
              : "h-3 bg-foreground/30",
        )}
        style={{ left: `${lineRatio * 100}%`, x: "-50%" }}
        animate={{ y: lift }}
        transition={
          reduceMotion
            ? { duration: 0 }
            : { type: "spring", stiffness: 420, damping: 28, mass: 0.35 }
        }
      />,
    )
  }

  return <div className="relative h-8 w-full">{lines}</div>
}

export function RulerCarousel({
  originalItems,
  onInteract,
}: {
  originalItems: CarouselItem[]
  onInteract?: () => void
}) {
  const itemsPerSet = originalItems.length
  const infiniteItems = createInfiniteItems(originalItems)
  const restIndex = Math.floor((infiniteItems.length - 1) / 2)

  const reduceMotion = useReducedMotion()
  const containerRef = useRef<HTMLDivElement>(null)
  const trackRef = useRef<HTMLDivElement>(null)
  const [activeIndex, setActiveIndex] = useState(restIndex)
  const [isResetting, setIsResetting] = useState(false)
  const [trackX, setTrackX] = useState(0)
  const [pointerRatio, setPointerRatio] = useState<number | null>(null)
  const [isPaused, setIsPaused] = useState(false)
  const [isCounterHovered, setIsCounterHovered] = useState(false)

  const updateTrackPosition = useCallback(() => {
    const container = containerRef.current
    const track = trackRef.current
    if (!container || !track) return

    const activeChild = track.children[activeIndex] as HTMLElement | undefined
    if (!activeChild) return

    const containerWidth = container.clientWidth
    const activeCenter = activeChild.offsetLeft + activeChild.offsetWidth / 2
    setTrackX(containerWidth / 2 - activeCenter)
  }, [activeIndex])

  useEffect(() => {
    updateTrackPosition()
    window.addEventListener("resize", updateTrackPosition)
    return () => window.removeEventListener("resize", updateTrackPosition)
  }, [updateTrackPosition, itemsPerSet])

  useEffect(() => {
    if (isResetting) return
    const frame = window.requestAnimationFrame(updateTrackPosition)
    return () => window.cancelAnimationFrame(frame)
  }, [isResetting, updateTrackPosition])

  const handlePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (reduceMotion) return
    const rect = event.currentTarget.getBoundingClientRect()
    if (rect.width <= 0) return
    setPointerRatio((event.clientX - rect.left) / rect.width)
  }

  const handlePointerLeave = () => {
    setPointerRatio(null)
  }

  const handleItemActivate = (newIndex: number) => {
    if (isResetting) return

    onInteract?.()

    const targetOriginalIndex = newIndex % itemsPerSet
    const possibleIndices = [
      targetOriginalIndex,
      targetOriginalIndex + itemsPerSet,
      targetOriginalIndex + itemsPerSet * 2,
    ]

    let closestIndex = possibleIndices[0]
    let smallestDistance = Math.abs(possibleIndices[0] - activeIndex)

    for (const index of possibleIndices) {
      const distance = Math.abs(index - activeIndex)
      if (distance < smallestDistance) {
        smallestDistance = distance
        closestIndex = index
      }
    }

    setActiveIndex(closestIndex)
  }

  const handlePrevious = () => {
    if (isResetting) return
    onInteract?.()
    setActiveIndex((prev) => prev - 1)
  }

  const handleNext = () => {
    if (isResetting) return
    onInteract?.()
    setActiveIndex((prev) => prev + 1)
  }

  const handleRulerClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if ((event.target as HTMLElement).closest('a[role="option"]')) return
    onInteract?.()
  }

  useEffect(() => {
    if (isResetting || itemsPerSet === 0) return

    if (activeIndex < itemsPerSet) {
      setIsResetting(true)
      const timeout = window.setTimeout(() => {
        setActiveIndex(activeIndex + itemsPerSet)
        setIsResetting(false)
      }, 0)
      return () => window.clearTimeout(timeout)
    }

    if (activeIndex >= itemsPerSet * 2) {
      setIsResetting(true)
      const timeout = window.setTimeout(() => {
        setActiveIndex(activeIndex - itemsPerSet)
        setIsResetting(false)
      }, 0)
      return () => window.clearTimeout(timeout)
    }
  }, [activeIndex, itemsPerSet, isResetting])

  useEffect(() => {
    if (reduceMotion || itemsPerSet < 2 || isPaused) return

    const interval = window.setInterval(() => {
      setActiveIndex((prev) => prev + 1)
    }, AUTOPLAY_INTERVAL)

    return () => window.clearInterval(interval)
  }, [reduceMotion, itemsPerSet, isPaused])

  if (!itemsPerSet) return null

  const instant = Boolean(reduceMotion) || isResetting
  const currentPage = (activeIndex % itemsPerSet) + 1
  const currentItem = originalItems[activeIndex % itemsPerSet]
  const showAutoplayControl = isCounterHovered && !reduceMotion
  const controlTransition = reduceMotion
    ? { duration: 0 }
    : { duration: 0.22, ease: "easeOut" as const }

  return (
    <div className="flex w-full flex-col items-center">
      <div
        className="ruler-carousel-fade relative w-full overflow-hidden"
        onPointerMove={handlePointerMove}
        onPointerLeave={handlePointerLeave}
        onClick={handleRulerClick}
      >
        <RulerLines
          top
          pointerRatio={pointerRatio}
          reduceMotion={Boolean(reduceMotion)}
        />
        <div
          ref={containerRef}
          tabIndex={0}
          role="listbox"
          aria-label="Brands"
          aria-activedescendant={`brand-item-${activeIndex}`}
          onKeyDown={(event) => {
            if (isResetting) return
            if (event.key === "ArrowLeft") {
              event.preventDefault()
              handlePrevious()
            }
            if (event.key === "ArrowRight") {
              event.preventDefault()
              handleNext()
            }
          }}
          className="relative h-28 w-full overflow-hidden outline-none focus-visible:ring-2 focus-visible:ring-foreground/40 md:h-36"
        >
          <motion.div
            ref={trackRef}
            className="absolute top-1/2 left-0 flex -translate-y-1/2 items-center gap-12 md:gap-20"
            animate={{ x: trackX }}
            transition={
              instant
                ? { duration: 0 }
                : {
                    type: "spring",
                    stiffness: 260,
                    damping: 20,
                    mass: 1,
                  }
            }
          >
            {infiniteItems.map((item, index) => {
              const isActive = index === activeIndex

              return (
                <motion.a
                  key={item.id}
                  id={`brand-item-${index}`}
                  href={item.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  role="option"
                  aria-selected={isActive}
                  aria-label={`${item.title} (opens in a new tab)`}
                  onClick={() => handleItemActivate(index)}
                  className={cn(
                    "group relative flex h-20 w-44 shrink-0 cursor-pointer items-center justify-center whitespace-nowrap md:h-24 md:w-64",
                    isActive
                      ? "text-foreground"
                      : "text-foreground/35 hover:text-foreground/70",
                  )}
                  animate={{
                    scale: isActive ? 1 : 0.75,
                    opacity: isActive ? 1 : 0.4,
                  }}
                  transition={
                    instant
                      ? { duration: 0 }
                      : {
                          type: "spring",
                          stiffness: 400,
                          damping: 25,
                        }
                  }
                >
                  <img
                    src={item.logo}
                    alt=""
                    aria-hidden
                    className="pointer-events-none absolute h-10 w-10 object-contain opacity-0 transition-opacity duration-200 group-hover:opacity-100 group-focus-visible:opacity-100 motion-reduce:transition-none dark:invert md:h-12 md:w-12"
                  />
                  <span className="text-2xl font-semibold tracking-tight transition-opacity duration-200 group-hover:opacity-0 group-focus-visible:opacity-0 motion-reduce:transition-none md:text-5xl">
                    {item.title}
                  </span>
                </motion.a>
              )
            })}
          </motion.div>
        </div>
        <RulerLines
          top={false}
          pointerRatio={pointerRatio}
          reduceMotion={Boolean(reduceMotion)}
        />
      </div>

      <div className="mt-8 flex items-center justify-center gap-4 md:mt-10">
        <button
          type="button"
          onClick={handlePrevious}
          disabled={isResetting}
          className="flex cursor-pointer items-center justify-center text-foreground/80 outline-none focus-visible:ring-2 focus-visible:ring-foreground/40 disabled:opacity-40"
          aria-label="Previous brand"
        >
          <Rewind className="h-5 w-5" />
        </button>

        <div
          className="relative flex h-5 w-12 items-center justify-center"
          aria-live="polite"
          onMouseEnter={() => setIsCounterHovered(true)}
          onMouseLeave={() => setIsCounterHovered(false)}
          onFocus={() => setIsCounterHovered(true)}
          onBlur={(event) => {
            if (!event.currentTarget.contains(event.relatedTarget as Node)) {
              setIsCounterHovered(false)
            }
          }}
        >
          <AnimatePresence mode="wait" initial={false}>
            {showAutoplayControl ? (
              <motion.button
                key={isPaused ? "play" : "pause"}
                type="button"
                initial={{ opacity: 0, scale: 0.82 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.82 }}
                transition={controlTransition}
                onClick={() => {
                  onInteract?.()
                  setIsPaused((paused) => !paused)
                }}
                className="absolute inset-0 flex cursor-pointer items-center justify-center text-foreground/80 outline-none focus-visible:ring-2 focus-visible:ring-foreground/40"
                aria-label={isPaused ? "Play brand autoplay" : "Pause brand autoplay"}
              >
                {isPaused ? (
                  <Play className="h-4 w-4 fill-current" />
                ) : (
                  <Pause className="h-4 w-4 fill-current" />
                )}
              </motion.button>
            ) : (
              <motion.div
                key="counter"
                initial={{ opacity: 0, scale: 0.82 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.82 }}
                transition={controlTransition}
                className="absolute inset-0 flex items-center justify-center gap-1.5"
              >
                <span className="text-sm font-medium text-foreground/50">
                  {currentPage}
                </span>
                <span className="text-sm text-foreground/35">/</span>
                <span className="sr-only">{currentItem?.title},</span>
                <span className="text-sm font-medium text-foreground/50">
                  {itemsPerSet}
                </span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <button
          type="button"
          onClick={handleNext}
          disabled={isResetting}
          className="flex cursor-pointer items-center justify-center text-foreground/80 outline-none focus-visible:ring-2 focus-visible:ring-foreground/40 disabled:opacity-40"
          aria-label="Next brand"
        >
          <FastForward className="h-5 w-5" />
        </button>
      </div>
    </div>
  )
}
