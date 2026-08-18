import { useCallback, useEffect, useRef } from "react"
import { animate } from "motion"

import { RulerCarousel, type CarouselItem } from "@/components/ui/ruler-carousel"

import airbnbLogo from "@/assets/logos/airbnb.svg"
import amazonLogo from "@/assets/logos/amazon.svg"
import duolingoLogo from "@/assets/logos/duolingo.svg"
import figmaLogo from "@/assets/logos/figma.svg"
import googleLogo from "@/assets/logos/google.svg"
import obsidianLogo from "@/assets/logos/obsidian.svg"
import sapLogo from "@/assets/logos/sap.svg"
import snapdragonLogo from "@/assets/logos/snapdragon.svg"
import wisprLogo from "@/assets/logos/wispr.svg"

const BRANDS: CarouselItem[] = [
  { id: 1, title: "Google", href: "https://www.google.com", logo: googleLogo },
  { id: 2, title: "Wispr Flow", href: "https://wisprflow.ai", logo: wisprLogo },
  { id: 3, title: "SAP", href: "https://www.sap.com", logo: sapLogo },
  { id: 4, title: "Airbnb", href: "https://www.airbnb.com", logo: airbnbLogo },
  { id: 5, title: "Amazon", href: "https://www.amazon.com", logo: amazonLogo },
  { id: 6, title: "Figma", href: "https://www.figma.com", logo: figmaLogo },
  { id: 7, title: "Duolingo", href: "https://www.duolingo.com", logo: duolingoLogo },
  { id: 8, title: "Snapdragon", href: "https://www.qualcomm.com/snapdragon", logo: snapdragonLogo },
  { id: 9, title: "Obsidian", href: "https://obsidian.md", logo: obsidianLogo },
]

export function Brands() {
  const sectionRef = useRef<HTMLElement>(null)
  const scrollAnimRef = useRef<{ stop: () => void } | null>(null)

  const scrollBrandsIntoView = useCallback(() => {
    const section = sectionRef.current
    if (!section) return

    const rect = section.getBoundingClientRect()
    const sectionTop = rect.top + window.scrollY
    const sectionHeight = rect.height
    let to = sectionTop + sectionHeight / 2 - window.innerHeight / 2

    const bio = document.getElementById("bio-intro")
    if (bio) {
      const bioBottom = bio.getBoundingClientRect().bottom + window.scrollY
      to = Math.max(to, bioBottom + 20)
    }

    const testimonialsHeading = document.getElementById("testimonials-heading")
    if (testimonialsHeading) {
      const testimonialsTop =
        testimonialsHeading.getBoundingClientRect().top + window.scrollY
      const maxTo = testimonialsTop - window.innerHeight - 12
      to = Math.min(to, maxTo)
    }

    const maxScroll = Math.max(
      0,
      document.documentElement.scrollHeight - window.innerHeight,
    )
    to = Math.min(maxScroll, Math.max(0, to))

    if (Math.abs(to - window.scrollY) < 12) return

    scrollAnimRef.current?.stop()

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      window.scrollTo(0, to)
      return
    }

    scrollAnimRef.current = animate(window.scrollY, to, {
      duration: 1.25,
      ease: [0.16, 1, 0.3, 1],
      onUpdate: (latest) => {
        window.scrollTo(0, latest)
      },
    })
  }, [])

  useEffect(() => {
    return () => scrollAnimRef.current?.stop()
  }, [])

  return (
    <section
      ref={sectionRef}
      aria-labelledby="brands-heading"
      className="relative z-10 w-full overflow-hidden pb-20 pt-8 md:pb-28 md:pt-12"
    >
      <div className="mb-8 text-center md:mb-12">
        <h2
          id="brands-heading"
          className="text-sm font-semibold tracking-[0.2em] text-foreground/50 uppercase"
        >
          Brands
        </h2>
        <p className="mt-3 text-sm font-normal text-foreground/45">
          (some I've worked for, some I'd love to work for... guess which is
          which)
        </p>
      </div>
      <RulerCarousel
        originalItems={BRANDS}
        onInteract={scrollBrandsIntoView}
      />
    </section>
  )
}
