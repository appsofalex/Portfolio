import { useCallback, useEffect, useRef } from "react"
import { useReducedMotion } from "motion/react"

import { ProjectShowcase } from "@/components/ui/project-showcase"
import { scrollElementIntoCenter } from "@/lib/programmatic-scroll"

export function Skills() {
  const sectionRef = useRef<HTMLElement>(null)
  const scrollAnimRef = useRef<{ stop: () => void } | null>(null)
  const reduceMotion = useReducedMotion()

  const scrollSkillsIntoView = useCallback(() => {
    const section = sectionRef.current
    if (!section) return

    scrollElementIntoCenter(section, {
      reduceMotion: !!reduceMotion,
      animRef: scrollAnimRef,
    })
  }, [reduceMotion])

  useEffect(() => {
    return () => scrollAnimRef.current?.stop()
  }, [])

  return (
    <section
      id="my-skills"
      ref={sectionRef}
      aria-labelledby="skills-heading"
      className="relative z-10 w-full pb-20 pt-8 md:pb-28 md:pt-12"
    >
      <h2
        id="skills-heading"
        className="mb-8 text-center text-sm font-semibold tracking-[0.2em] text-foreground/50 uppercase md:mb-12"
      >
        What I do
      </h2>

      <ProjectShowcase onInteract={scrollSkillsIntoView} />
    </section>
  )
}
