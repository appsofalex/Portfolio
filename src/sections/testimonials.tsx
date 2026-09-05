import {
  UniqueTestimonials,
  type UniqueTestimonial,
} from "@/components/ui/unique-testimonial"
import richardAdamsAvatar from "@/assets/testimonials/richard-adams.jpg"
import heleneLeRouxAvatar from "@/assets/testimonials/helene-le-roux.jpg"

const TESTIMONIALS: UniqueTestimonial[] = [
  {
    id: 1,
    quote: "This changed everything for me.",
    author: "Sarah Chen",
    role: "Designer at Figma",
    avatar:
      "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=200&auto=format&fit=crop",
  },
  {
    id: 2,
    quote:
      "Alex has a unique design instinct, with a clear vision for turning ideas into something people immediately understand and want.",
    author: "Richard Adams",
    role: "CEO at Trinity Cups",
    avatar: richardAdamsAvatar,
  },
  {
    id: 3,
    quote:
      "He doesn’t just have great ideas. Alex designs them, builds them and makes them happen. Trippin’ wouldn’t be what it is without him.",
    author: "Helene le Roux",
    role: "Founder & CEO at Trippin'",
    avatar: heleneLeRouxAvatar,
  },
]

export function Testimonials() {
  return (
    <section
      id="testimonials"
      aria-labelledby="testimonials-heading"
      className="relative z-10 w-full pb-24 pt-8 md:pb-32 md:pt-12"
    >
      <h2
        id="testimonials-heading"
        className="mb-8 text-center text-sm font-semibold tracking-[0.2em] text-foreground/50 uppercase md:mb-12"
      >
        Testimonials
      </h2>
      <UniqueTestimonials testimonials={TESTIMONIALS} />
    </section>
  )
}
