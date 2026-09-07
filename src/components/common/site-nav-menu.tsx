import { AnimatePresence, motion, useReducedMotion } from "motion/react"
import { useEffect, useState } from "react"

import {
  Sidebar001Content,
  Sidebar001Item,
} from "@/components/ui/sidebar-001"
import { ScreenBlurBackdrop } from "@/components/ui/screen-blur-backdrop"
import { scrollElementIntoCenter } from "@/lib/programmatic-scroll"
import { cn } from "@/lib/utils"

const NAV_ITEMS = [
  { id: "my-work", label: "Things I've made" },
  { id: "my-skills", label: "What I do" },
  { id: "brands", label: "Good Company" },
  { id: "testimonials", label: "People I've built with" },
] as const

type NavItemId = (typeof NAV_ITEMS)[number]["id"]

function resolveActiveSection(): NavItemId {
  const mid = window.innerHeight * 0.35
  let current: NavItemId = NAV_ITEMS[0].id

  for (const item of NAV_ITEMS) {
    const el = document.getElementById(item.id)
    if (!el) continue
    const top = el.getBoundingClientRect().top
    if (top <= mid) current = item.id
  }

  return current
}

export interface SiteNavMenuProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  className?: string
}

export function SiteNavMenu({
  open,
  onOpenChange,
  className,
}: SiteNavMenuProps) {
  const reduceMotion = useReducedMotion()
  const [active, setActive] = useState<NavItemId>("my-work")

  useEffect(() => {
    if (!open) return
    setActive(resolveActiveSection())

    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onOpenChange(false)
    }

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = "hidden"

    window.addEventListener("keydown", onKey)
    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener("keydown", onKey)
    }
  }, [open, onOpenChange])

  const goTo = (id: NavItemId) => {
    const target = document.getElementById(id)
    setActive(id)
    onOpenChange(false)

    if (!target) return
    // Let the panel/blur exit before scrolling so the lock owns the header.
    requestAnimationFrame(() => {
      scrollElementIntoCenter(target, { reduceMotion: !!reduceMotion })
    })
  }

  return (
    <>
      <ScreenBlurBackdrop
        open={open}
        label="Close navigation menu"
        onDismiss={() => onOpenChange(false)}
      />

      <AnimatePresence>
        {open && (
          <motion.nav
            key="site-nav-panel"
            aria-label="Site sections"
            initial={
              reduceMotion ? false : { opacity: 0, y: -8, filter: "blur(4px)" }
            }
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            exit={
              reduceMotion
                ? { opacity: 0 }
                : { opacity: 0, y: -6, filter: "blur(4px)" }
            }
            transition={
              reduceMotion
                ? { duration: 0 }
                : { duration: 0.32, ease: [0.32, 0.72, 0, 1] }
            }
            className={cn(
              "absolute top-full left-0 z-50 mt-3 min-w-[11.5rem] origin-top-left",
              className,
            )}
            onClick={(event) => event.stopPropagation()}
          >
            <Sidebar001Content>
              {NAV_ITEMS.map((item) => (
                <Sidebar001Item
                  key={item.id}
                  href={`#${item.id}`}
                  label={item.label}
                  isActive={active === item.id}
                  onClick={(event) => {
                    event.preventDefault()
                    goTo(item.id)
                  }}
                />
              ))}
            </Sidebar001Content>
          </motion.nav>
        )}
      </AnimatePresence>
    </>
  )
}
