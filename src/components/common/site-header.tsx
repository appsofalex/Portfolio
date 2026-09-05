import { motion, useReducedMotion } from "motion/react"
import { useEffect, useRef, useState } from "react"

import { SiteNavMenu } from "@/components/common/site-nav-menu"
import { CreateMenu } from "@/components/ui/be-ui-create-menu"
import { MenuToggle } from "@/components/ui/menu-toggle"
import { ThemeToggle } from "@/components/ui/theme-toggle"
import { subscribeProgrammaticScrollLock } from "@/lib/programmatic-scroll"
import { cn } from "@/lib/utils"

const HEADER_EASE = [0.32, 0.72, 0, 1] as const
const SCROLL_DELTA = 4
const TOP_REVEAL_OFFSET = 24
const HIDE_DURATION = 0.3
const SHOW_DURATION = 0.32
/** Ignore delta-based hides until scroll restoration / layout settle. */
const LOAD_SETTLE_MS = 700

function readScrollY() {
  return (
    window.scrollY ||
    document.documentElement.scrollTop ||
    document.body.scrollTop ||
    0
  )
}

function isAtPageTop(scrollY = readScrollY()) {
  return scrollY <= TOP_REVEAL_OFFSET
}

export function SiteHeader() {
  const reduceMotion = useReducedMotion()
  const [visible, setVisible] = useState(() =>
    typeof window === "undefined" ? true : isAtPageTop(),
  )
  const [navOpen, setNavOpen] = useState(false)
  const [contactOpen, setContactOpen] = useState(false)
  /** Skip slide animation until initial scroll position is trusted. */
  const [motionReady, setMotionReady] = useState(false)
  const lastScrollY = useRef(
    typeof window === "undefined" ? 0 : readScrollY(),
  )
  const overlayOpenRef = useRef(false)
  const programmaticLockRef = useRef(false)
  const scrollArmedRef = useRef(false)

  useEffect(() => {
    overlayOpenRef.current = navOpen || contactOpen
  }, [navOpen, contactOpen])

  useEffect(() => {
    return subscribeProgrammaticScrollLock((locked) => {
      programmaticLockRef.current = locked
      if (locked) {
        setVisible(false)
        return
      }

      lastScrollY.current = readScrollY()
      if (overlayOpenRef.current || isAtPageTop()) {
        setVisible(true)
      }
    })
  }, [])

  useEffect(() => {
    let ticking = false
    let settleTimer = 0

    const applyPositionOnly = () => {
      const currentY = readScrollY()
      lastScrollY.current = currentY

      if (programmaticLockRef.current) {
        setVisible(false)
        return
      }

      setVisible(overlayOpenRef.current || isAtPageTop(currentY))
    }

    const armScrollHandling = () => {
      if (scrollArmedRef.current) return
      scrollArmedRef.current = true
      applyPositionOnly()
      setMotionReady(true)
    }

    const syncFromScroll = () => {
      const currentY = readScrollY()
      const delta = currentY - lastScrollY.current

      if (programmaticLockRef.current) {
        setVisible(false)
      } else if (overlayOpenRef.current || isAtPageTop(currentY)) {
        setVisible(true)
      } else if (!scrollArmedRef.current) {
        // During settle: position only — never hide via delta noise.
        setVisible(false)
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
        syncFromScroll()
        ticking = false
      })
    }

    applyPositionOnly()
    settleTimer = window.setTimeout(armScrollHandling, LOAD_SETTLE_MS)

    window.addEventListener("scroll", onScroll, { passive: true })
    window.addEventListener("pageshow", applyPositionOnly)
    window.addEventListener("load", applyPositionOnly)

    return () => {
      window.clearTimeout(settleTimer)
      window.removeEventListener("scroll", onScroll)
      window.removeEventListener("pageshow", applyPositionOnly)
      window.removeEventListener("load", applyPositionOnly)
    }
  }, [])

  const allowMotion = motionReady && !reduceMotion

  return (
    <motion.header
      initial={false}
      animate={{ y: visible ? 0 : "-100%" }}
      transition={
        allowMotion
          ? {
              duration: visible ? SHOW_DURATION : HIDE_DURATION,
              ease: HEADER_EASE,
            }
          : { duration: 0 }
      }
      className="pointer-events-none fixed inset-x-0 top-0 z-50"
    >
      <div
        className={cn(
          "site-frame relative flex items-start justify-between pt-5 sm:pt-8",
          (visible || navOpen) && "pointer-events-auto",
        )}
      >
        <div className="relative">
          <div className="relative z-50">
            <MenuToggle
              open={navOpen}
              onOpenChange={setNavOpen}
              strokeWidth={2.5}
              className="mt-1 size-6 text-foreground"
            />
          </div>
          <SiteNavMenu open={navOpen} onOpenChange={setNavOpen} />
        </div>
        <div className="absolute left-1/2 -translate-x-1/2">
          <ThemeToggle />
        </div>
        <CreateMenu onOpenChange={setContactOpen} />
      </div>
    </motion.header>
  )
}
