import { useCallback, useEffect, useRef, useState } from "react"
import { Moon, Mountain, Sun, Trees, Waves } from "lucide-react"
import { motion, useReducedMotion } from "motion/react"

import { InteractiveProductCard } from "@/components/ui/card-7"
import { cn } from "@/lib/utils"

const PIECES = [
  {
    title: "High Country",
    description: "Still morning light",
    price: "01",
    logo: <Mountain className="h-4 w-4 text-white" aria-hidden />,
  },
  {
    title: "Old Growth",
    description: "Through the mist",
    price: "02",
    logo: <Trees className="h-4 w-4 text-white" aria-hidden />,
  },
  {
    title: "Windward",
    description: "Salt and quiet",
    price: "03",
    logo: <Waves className="h-4 w-4 text-white" aria-hidden />,
  },
  {
    title: "Night Ridge",
    description: "After the weather",
    price: "04",
    logo: <Moon className="h-4 w-4 text-white" aria-hidden />,
  },
  {
    title: "Last Light",
    description: "Held for a moment",
    price: "05",
    logo: <Sun className="h-4 w-4 text-white" aria-hidden />,
  },
] as const

const ARROW_CLASSES =
  "relative flex items-center justify-center rounded-full border-[1.5px] border-black/10 dark:border-white/10 bg-black/5 dark:bg-white/5 backdrop-blur-[16px] text-black/40 dark:text-white/55 cursor-pointer shrink-0 outline-none shadow-[0_4px_20px_rgba(0,0,0,0.1)] dark:shadow-[0_4px_20px_rgba(0,0,0,0.4)] hover:border-black/25 dark:hover:border-white/25 hover:text-black/70 dark:hover:text-white/80 active:opacity-70 transition-colors duration-300 motion-reduce:transition-none focus-visible:ring-2 focus-visible:ring-foreground/40"

interface FanCard {
  imgUrl: string
  alt?: string
  title?: string
}

interface ProductCarouselProps {
  cards: FanCard[]
}

function wrap(index: number, length: number) {
  return ((index % length) + length) % length
}

function shortestOffset(index: number, center: number, length: number) {
  let offset = index - center
  const half = Math.floor(length / 2)
  if (offset > half) offset -= length
  if (offset < -half) offset += length
  return offset
}

function useCarouselMetrics() {
  const [metrics, setMetrics] = useState({
    focusWidth: 340,
    focusHeight: 453,
    idleWidth: 208,
    idleHeight: 277,
    step: 330,
  })

  useEffect(() => {
    const update = () => {
      const viewport = window.innerWidth
      const focusWidth = Math.min(340, Math.round(viewport * 0.72))
      const idleWidth = viewport >= 1024 ? 208 : viewport >= 640 ? 176 : 148
      const gap = viewport >= 640 ? 56 : 28
      setMetrics({
        focusWidth,
        focusHeight: Math.round((focusWidth * 12) / 9),
        idleWidth,
        idleHeight: Math.round((idleWidth * 12) / 9),
        step: (focusWidth + idleWidth) / 2 + gap,
      })
    }

    update()
    window.addEventListener("resize", update)
    return () => window.removeEventListener("resize", update)
  }, [])

  return metrics
}

export function ProductCarousel({ cards }: ProductCarouselProps) {
  const pieces = cards.slice(0, PIECES.length).map((card, index) => ({
    ...PIECES[index],
    title: card.title ?? PIECES[index].title,
    imageUrl: card.imgUrl,
  }))
  const count = pieces.length
  const startIndex = count > 0 ? Math.floor(count / 2) : 0

  const offsetsRef = useRef<Map<number, number>>(new Map())
  const reduceMotion = useReducedMotion()
  const { focusWidth, focusHeight, idleWidth, idleHeight, step } = useCarouselMetrics()
  const [centerIndex, setCenterIndex] = useState(startIndex)

  const stepBy = useCallback(
    (direction: -1 | 1) => {
      if (!count) return
      setCenterIndex((current) => wrap(current + direction, count))
    },
    [count],
  )

  const focusIndex = useCallback(
    (index: number) => {
      if (!count || index === centerIndex) return
      setCenterIndex(wrap(index, count))
    },
    [centerIndex, count],
  )

  useEffect(() => {
    for (let index = 0; index < count; index++) {
      offsetsRef.current.set(index, shortestOffset(index, centerIndex, count))
    }
  }, [centerIndex, count])

  if (!count) return null

  return (
    <section
      aria-labelledby="product-carousel-heading"
      className="relative z-10 w-full pb-20 pt-8 md:pb-28 md:pt-12"
    >
      <h2
        id="product-carousel-heading"
        className="mb-8 text-center text-sm font-semibold tracking-[0.2em] text-foreground/50 uppercase md:mb-12"
      >
        Selected pieces
      </h2>

      <div className="relative w-full">
        <div
          tabIndex={0}
          role="listbox"
          aria-label="Selected pieces"
          aria-activedescendant={`product-card-${centerIndex}`}
          onKeyDown={(event) => {
            if (event.key === "ArrowLeft") {
              event.preventDefault()
              stepBy(-1)
            }
            if (event.key === "ArrowRight") {
              event.preventDefault()
              stepBy(1)
            }
          }}
          className="relative mx-auto flex w-full items-center justify-center overflow-hidden outline-none focus-visible:ring-2 focus-visible:ring-foreground/40"
          style={{ height: focusHeight * 1.12 }}
        >
          {pieces.map((piece, index) => {
            const offset = shortestOffset(index, centerIndex, count)
            const previous = offsetsRef.current.get(index) ?? offset
            const wrapped = Math.abs(offset - previous) > 1
            const isFocus = offset === 0
            const width = isFocus ? focusWidth : idleWidth
            const height = isFocus ? focusHeight : idleHeight

            return (
              <motion.div
                key={piece.title}
                id={`product-card-${index}`}
                role="option"
                aria-selected={isFocus}
                aria-label={piece.title}
                onClick={() => focusIndex(index)}
                className={cn("absolute top-1/2 left-1/2", isFocus ? "cursor-default" : "cursor-pointer")}
                style={{
                  width,
                  height,
                  zIndex: 10 - Math.abs(offset),
                  transformStyle: isFocus ? "preserve-3d" : undefined,
                }}
                initial={false}
                animate={{
                  x: `calc(-50% + ${offset * step}px)`,
                  y: "-50%",
                  opacity: isFocus ? 1 : 0.78,
                }}
                transition={
                  reduceMotion || wrapped
                    ? { duration: 0 }
                    : { type: "spring", stiffness: 280, damping: 32 }
                }
              >
                {isFocus ? (
                  <InteractiveProductCard
                    title={piece.title}
                    description={piece.description}
                    price={piece.price}
                    imageUrl={piece.imageUrl}
                    logo={piece.logo}
                    className="max-w-none"
                  />
                ) : (
                  <img
                    src={piece.imageUrl}
                    alt={piece.title}
                    draggable={false}
                    className="h-full w-full rounded-2xl object-cover"
                  />
                )}
              </motion.div>
            )
          })}
        </div>

        <div className="mt-6 flex items-center justify-center gap-4">
          <button
            type="button"
            className={cn(ARROW_CLASSES, "h-10 w-10 md:h-12 md:w-12")}
            onClick={() => stepBy(-1)}
            aria-label="Previous piece"
          >
            <Chevron direction="left" />
          </button>
          <button
            type="button"
            className={cn(ARROW_CLASSES, "h-10 w-10 md:h-12 md:w-12")}
            onClick={() => stepBy(1)}
            aria-label="Next piece"
          >
            <Chevron direction="right" />
          </button>
        </div>
      </div>
    </section>
  )
}

function Chevron({ direction }: { direction: "left" | "right" }) {
  return (
    <svg
      className="relative z-[2] h-4 w-4 md:h-5 md:w-5"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <polyline points={direction === "left" ? "15 18 9 12 15 6" : "9 18 15 12 9 6"} />
    </svg>
  )
}
