import { motion, useReducedMotion } from "motion/react"
import { useEffect, useRef, useState } from "react"

import { CreateMenu } from "@/components/ui/be-ui-create-menu"
import { ThemeToggle } from "@/components/ui/theme-toggle"
import { cn } from "@/lib/utils"

const HEADER_EASE = [0.32, 0.72, 0, 1] as const
const SCROLL_DELTA = 6
const TOP_REVEAL_OFFSET = 48

export function SiteHeader() {
  const reduceMotion = useReducedMotion()
  const [visible, setVisible] = useState(true)
  const [menuOpen, setMenuOpen] = useState(false)
  const lastScrollY = useRef(0)
  const menuOpenRef = useRef(false)

  useEffect(() => {
    menuOpenRef.current = menuOpen
  }, [menuOpen])

  useEffect(() => {
    let ticking = false

    const updateVisibility = () => {
      const currentY = window.scrollY
      const delta = currentY - lastScrollY.current

      if (menuOpenRef.current || currentY <= TOP_REVEAL_OFFSET) {
        setVisible(true)
      } else if (delta > SCROLL_DELTA) {
        setVisible(false)
      } else if (delta < -SCROLL_DELTA) {
        setVisible(true)
      }

      lastScrollY.current = currentY
    }

    const onScroll = () => {
      if (ticking) return

      ticking = true
      requestAnimationFrame(() => {
        updateVisibility()
        ticking = false
      })
    }

    lastScrollY.current = window.scrollY
    window.addEventListener("scroll", onScroll, { passive: true })

    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  return (
    <motion.header
      initial={false}
      animate={{ y: visible ? 0 : "-100%" }}
      transition={
        reduceMotion
          ? { duration: 0 }
          : { duration: 0.38, ease: HEADER_EASE }
      }
      className="pointer-events-none fixed inset-x-0 top-0 z-50"
    >
      <div
        className={cn(
          "site-frame flex items-start justify-between pt-5 sm:pt-8",
          visible && "pointer-events-auto",
        )}
      >
        <ThemeToggle />
        <CreateMenu onOpenChange={setMenuOpen} />
      </div>
    </motion.header>
  )
}
