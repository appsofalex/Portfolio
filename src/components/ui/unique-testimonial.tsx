import { useEffect, useRef, useState } from "react"
import { useReducedMotion } from "motion/react"

import { scrollElementIntoCenter } from "@/lib/programmatic-scroll"
import { cn } from "@/lib/utils"

export type UniqueTestimonial = {
  id: number
  quote: string
  author: string
  role: string
  avatar: string
}

interface TestimonialsProps {
  testimonials: UniqueTestimonial[]
  className?: string
  /** Element to vertically centre in the viewport on selection. */
  scrollTargetId?: string
}

function centerAfterLayout(
  scrollTargetId: string | undefined,
  reduceMotion: boolean,
  scrollAnimRef: { current: { stop: () => void } | null },
) {
  if (!scrollTargetId) return

  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      const target = document.getElementById(scrollTargetId)
      if (!target) return
      scrollElementIntoCenter(target, {
        reduceMotion,
        animRef: scrollAnimRef,
      })
    })
  })
}

export function UniqueTestimonials({
  testimonials,
  className,
  scrollTargetId = "testimonials",
}: TestimonialsProps) {
  const reduceMotion = useReducedMotion()
  const scrollAnimRef = useRef<{ stop: () => void } | null>(null)
  const [activeIndex, setActiveIndex] = useState(0)
  const [isAnimating, setIsAnimating] = useState(false)
  const [displayedQuote, setDisplayedQuote] = useState(
    testimonials[0]?.quote ?? "",
  )
  const [displayedRole, setDisplayedRole] = useState(
    testimonials[0]?.role ?? "",
  )
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)

  useEffect(() => {
    return () => scrollAnimRef.current?.stop()
  }, [])

  const handleSelect = (index: number) => {
    if (!testimonials[index] || isAnimating) return

    const reduce = !!reduceMotion

    if (index === activeIndex) {
      centerAfterLayout(scrollTargetId, reduce, scrollAnimRef)
      return
    }

    if (reduce) {
      setDisplayedQuote(testimonials[index].quote)
      setDisplayedRole(testimonials[index].role)
      setActiveIndex(index)
      centerAfterLayout(scrollTargetId, true, scrollAnimRef)
      return
    }

    setIsAnimating(true)

    setTimeout(() => {
      setDisplayedQuote(testimonials[index].quote)
      setDisplayedRole(testimonials[index].role)
      setActiveIndex(index)
      centerAfterLayout(scrollTargetId, false, scrollAnimRef)
      setTimeout(() => setIsAnimating(false), 400)
    }, 200)
  }

  if (!testimonials.length) return null

  return (
    <div className={cn("flex flex-col items-center gap-10", className)}>
      <div className="relative px-2 sm:px-8">
        <span
          aria-hidden
          className="pointer-events-none absolute -top-6 -left-2 select-none font-serif text-7xl text-foreground/[0.06]"
        >
          "
        </span>

        <p
          className={cn(
            "max-w-lg text-center text-2xl font-normal leading-relaxed text-foreground md:text-3xl",
            !reduceMotion &&
              "transition-all duration-[400ms] ease-out motion-reduce:transition-none",
            isAnimating
              ? "scale-[0.98] opacity-0 blur-sm"
              : "scale-100 opacity-100 blur-0",
          )}
        >
          {displayedQuote}
        </p>

        <span
          aria-hidden
          className="pointer-events-none absolute -right-2 -bottom-8 select-none font-serif text-7xl text-foreground/[0.06]"
        >
          "
        </span>
      </div>

      <div className="mt-2 flex flex-col items-center gap-6">
        <p
          className={cn(
            "text-xs tracking-[0.2em] text-foreground/50 uppercase",
            !reduceMotion &&
              "transition-all duration-500 ease-out motion-reduce:transition-none",
            isAnimating ? "translate-y-2 opacity-0" : "translate-y-0 opacity-100",
          )}
        >
          {displayedRole}
        </p>

        <div
          className="flex items-center justify-center gap-2"
          role="tablist"
          aria-label="Testimonials"
        >
          {testimonials.map((testimonial, index) => {
            const isActive = activeIndex === index
            const isHovered = hoveredIndex === index && !isActive
            const showName = isActive || isHovered

            return (
              <button
                key={testimonial.id}
                type="button"
                role="tab"
                aria-selected={isActive}
                aria-label={`${testimonial.author}, ${testimonial.role}`}
                onClick={() => handleSelect(index)}
                onMouseEnter={() => setHoveredIndex(index)}
                onMouseLeave={() => setHoveredIndex(null)}
                className={cn(
                  "relative flex cursor-pointer items-center gap-0 rounded-full outline-none",
                  "focus-visible:ring-2 focus-visible:ring-foreground/40",
                  "transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] motion-reduce:transition-none",
                  isActive
                    ? "bg-foreground"
                    : "bg-transparent hover:bg-foreground/5",
                  showName ? "py-2 pr-4 pl-2" : "p-0.5",
                )}
              >
                <div className="relative shrink-0">
                  <img
                    src={testimonial.avatar}
                    alt=""
                    width={32}
                    height={32}
                    draggable={false}
                    className={cn(
                      "h-8 w-8 rounded-full object-cover",
                      "transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] motion-reduce:transition-none",
                      isActive ? "ring-2 ring-background/30" : "ring-0",
                      !isActive &&
                        "hover:scale-105 motion-reduce:hover:scale-100",
                    )}
                  />
                </div>

                <div
                  className={cn(
                    "grid transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] motion-reduce:transition-none",
                    showName
                      ? "ml-2 grid-cols-[1fr] opacity-100"
                      : "ml-0 grid-cols-[0fr] opacity-0",
                  )}
                >
                  <div className="overflow-hidden">
                    <span
                      className={cn(
                        "block text-sm font-medium whitespace-nowrap",
                        "transition-colors duration-300 motion-reduce:transition-none",
                        isActive ? "text-background" : "text-foreground",
                      )}
                    >
                      {testimonial.author}
                    </span>
                  </div>
                </div>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
