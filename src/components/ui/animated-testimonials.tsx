import { useEffect, useRef, useState } from "react"
import { ArrowLeft, ArrowRight } from "lucide-react"
import { AnimatePresence, motion, useReducedMotion } from "motion/react"

import { cn } from "@/lib/utils"

export type Testimonial = {
  quote: string
  name: string
  designation: string
  src: string
}

interface AnimatedTestimonialsProps {
  testimonials: Testimonial[]
  autoplay?: boolean
  className?: string
}

const ARROW_CLASSES =
  "relative flex items-center justify-center rounded-full border-[1.5px] border-black/10 dark:border-white/10 bg-black/5 dark:bg-white/5 backdrop-blur-[16px] text-black/40 dark:text-white/55 cursor-pointer shrink-0 outline-none shadow-[0_4px_20px_rgba(0,0,0,0.1)] dark:shadow-[0_4px_20px_rgba(0,0,0,0.4)] hover:border-black/25 dark:hover:border-white/25 hover:text-black/70 dark:hover:text-white/80 active:opacity-70 transition-colors duration-300 motion-reduce:transition-none focus-visible:ring-2 focus-visible:ring-foreground/40"

function randomRotateY() {
  return Math.floor(Math.random() * 21) - 10
}

export function AnimatedTestimonials({
  testimonials,
  autoplay = false,
  className,
}: AnimatedTestimonialsProps) {
  const reduceMotion = useReducedMotion()
  const [active, setActive] = useState(0)
  const rotations = useRef(testimonials.map(() => randomRotateY()))

  const count = testimonials.length
  const current = testimonials[active]

  const handleNext = () => {
    if (!count) return
    setActive((prev) => (prev + 1) % count)
  }

  const handlePrev = () => {
    if (!count) return
    setActive((prev) => (prev - 1 + count) % count)
  }

  useEffect(() => {
    if (!autoplay || reduceMotion || count < 2) return

    const interval = setInterval(() => {
      setActive((prev) => (prev + 1) % count)
    }, 5000)

    return () => clearInterval(interval)
  }, [autoplay, count, reduceMotion])

  if (!current) return null

  return (
    <div className={cn("mx-auto w-full max-w-sm md:max-w-4xl", className)}>
      <div className="relative grid grid-cols-1 gap-12 md:grid-cols-2 md:gap-20">
        <div>
          <div className="relative h-80 w-full">
            <AnimatePresence>
              {testimonials.map((testimonial, index) => {
                const isActive = index === active

                return (
                  <motion.div
                    key={testimonial.src}
                    initial={{
                      opacity: 0,
                      scale: 0.9,
                      z: -100,
                      rotate: rotations.current[index],
                    }}
                    animate={{
                      opacity: isActive ? 1 : 0.7,
                      scale: isActive ? 1 : 0.95,
                      z: isActive ? 0 : -100,
                      rotate: isActive ? 0 : rotations.current[index],
                      zIndex: isActive ? 40 : count + 2 - index,
                      y: isActive && !reduceMotion ? [0, -80, 0] : 0,
                    }}
                    exit={{
                      opacity: 0,
                      scale: 0.9,
                      z: 100,
                      rotate: rotations.current[index],
                    }}
                    transition={
                      reduceMotion
                        ? { duration: 0 }
                        : { duration: 0.4, ease: "easeInOut" }
                    }
                    className="absolute inset-0 origin-bottom"
                  >
                    <img
                      src={testimonial.src}
                      alt={testimonial.name}
                      width={500}
                      height={500}
                      draggable={false}
                      className="h-full w-full rounded-2xl object-cover object-center"
                    />
                  </motion.div>
                )
              })}
            </AnimatePresence>
          </div>
        </div>

        <div className="flex flex-col justify-between py-4">
          <motion.div
            key={current.name}
            initial={reduceMotion ? false : { y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={
              reduceMotion
                ? { duration: 0 }
                : { duration: 0.2, ease: "easeInOut" }
            }
          >
            <h3 className="text-2xl font-semibold tracking-tight text-foreground">
              {current.name}
            </h3>
            <p className="mt-1 text-sm font-normal text-foreground/50">
              {current.designation}
            </p>
            <p className="mt-8 text-lg font-normal leading-relaxed text-foreground/70">
              {reduceMotion
                ? current.quote
                : current.quote.split(" ").map((word, index) => (
                    <motion.span
                      key={`${current.name}-${index}`}
                      initial={{
                        filter: "blur(10px)",
                        opacity: 0,
                        y: 5,
                      }}
                      animate={{
                        filter: "blur(0px)",
                        opacity: 1,
                        y: 0,
                      }}
                      transition={{
                        duration: 0.2,
                        ease: "easeInOut",
                        delay: 0.02 * index,
                      }}
                      className="inline-block"
                    >
                      {word}&nbsp;
                    </motion.span>
                  ))}
            </p>
          </motion.div>

          {count > 1 && (
            <div className="flex gap-4 pt-12 md:pt-0">
              <button
                type="button"
                onClick={handlePrev}
                className={cn(ARROW_CLASSES, "group/button h-10 w-10")}
                aria-label="Previous testimonial"
              >
                <ArrowLeft className="h-4 w-4 transition-transform duration-300 group-hover/button:rotate-12 motion-reduce:transition-none" />
              </button>
              <button
                type="button"
                onClick={handleNext}
                className={cn(ARROW_CLASSES, "group/button h-10 w-10")}
                aria-label="Next testimonial"
              >
                <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover/button:-rotate-12 motion-reduce:transition-none" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
