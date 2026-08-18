import { motion, useReducedMotion } from "motion/react"
import { Mail, X } from "lucide-react"
import {
  type ComponentType,
  type CSSProperties,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
} from "react"

import { ShimmerChrome } from "@/components/ui/shimmer-button"
import { cn } from "@/lib/utils"

const OPEN_WIDTH = 288
const PILL_RADIUS = 100
const PANEL_RADIUS = 18
const SHELL_EASE = [0.32, 0.72, 0, 1] as const
const SHELL_DURATION = 0.38
const CLOSE_DELAY_MS = 220

const SHIMMER_VARS = {
  "--spread": "90deg",
  "--spark-color": "var(--shimmer-color)",
  "--radius": "100px",
  "--speed": "3s",
  "--cut": "0.05em",
  "--bg": "var(--shimmer-button-bg)",
} as CSSProperties

const LABEL_CLASS =
  "whitespace-nowrap text-center text-sm font-normal leading-none tracking-tight lg:text-base"

type MenuItem = {
  label: string
  icon: ComponentType<{ className?: string }>
  href: string
  external?: boolean
}

function XLogo({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="currentColor"
      aria-hidden
    >
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.743l7.727-8.835L1.254 2.25H8.08l4.253 5.622L18.244 2.25zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  )
}

const ITEMS: MenuItem[] = [
  {
    label: "@alexcrafted_",
    icon: XLogo,
    href: "https://x.com/alexcrafted_",
    external: true,
  },
  {
    label: "Email",
    icon: Mail,
    href: "mailto:alexwalters148@gmail.com",
  },
]

export interface CreateMenuProps {
  items?: MenuItem[]
  onSelect?: (label: string) => void
  onOpenChange?: (open: boolean) => void
  className?: string
}

export function CreateMenu({
  items = ITEMS,
  onSelect,
  onOpenChange,
  className,
}: CreateMenuProps) {
  const [open, setOpen] = useState(false)
  const [pillWidth, setPillWidth] = useState<number | null>(null)
  const reduce = useReducedMotion()
  const menuId = useId()
  const ref = useRef<HTMLDivElement>(null)
  const sizerRef = useRef<HTMLDivElement>(null)
  const closeTimer = useRef<number>(0)

  const shellTransition = reduce
    ? { duration: 0.16, ease: SHELL_EASE }
    : { duration: SHELL_DURATION, ease: SHELL_EASE }

  const openMenu = () => {
    window.clearTimeout(closeTimer.current)
    setOpen(true)
    onOpenChange?.(true)
  }

  const closeMenu = (delay = 0) => {
    window.clearTimeout(closeTimer.current)
    if (delay > 0) {
      closeTimer.current = window.setTimeout(() => {
        setOpen(false)
        onOpenChange?.(false)
      }, delay)
      return
    }
    setOpen(false)
    onOpenChange?.(false)
  }

  const measurePill = () => {
    if (sizerRef.current) {
      setPillWidth(sizerRef.current.offsetWidth)
    }
  }

  useLayoutEffect(() => {
    measurePill()
    window.addEventListener("resize", measurePill)

    let cancelled = false
    document.fonts?.ready.then(() => {
      if (!cancelled) measurePill()
    })

    return () => {
      cancelled = true
      window.removeEventListener("resize", measurePill)
    }
  }, [])

  useEffect(() => {
    return () => window.clearTimeout(closeTimer.current)
  }, [])

  useEffect(() => {
    if (!open) return

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeMenu()
    }

    const onPointer = (e: PointerEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        closeMenu()
      }
    }

    window.addEventListener("keydown", onKey)
    window.addEventListener("pointerdown", onPointer)

    return () => {
      window.removeEventListener("keydown", onKey)
      window.removeEventListener("pointerdown", onPointer)
    }
  }, [open])

  return (
    <div
      ref={ref}
      className={cn("relative inline-flex flex-col items-end", className)}
      onPointerEnter={(e) => {
        if (e.pointerType === "mouse") openMenu()
      }}
      onPointerLeave={(e) => {
        if (e.pointerType === "mouse") closeMenu(CLOSE_DELAY_MS)
      }}
    >
      <div
        ref={sizerRef}
        aria-hidden
        className="pointer-events-none invisible absolute top-0 right-0 inline-flex items-center justify-center whitespace-nowrap border border-black/10 px-6 py-3 dark:border-white/10"
      >
        <span className={LABEL_CLASS}>Get in touch</span>
      </div>

      <motion.div
        id={menuId}
        role={open ? "menu" : undefined}
        aria-label={open ? "Get in touch" : undefined}
        style={SHIMMER_VARS}
        initial={false}
        animate={{
          width: open ? OPEN_WIDTH : pillWidth ?? undefined,
          borderRadius: open ? PANEL_RADIUS : PILL_RADIUS,
        }}
        transition={shellTransition}
        className={cn(
          "group relative shrink-0 overflow-hidden border border-black/10 text-foreground [background:var(--bg)] dark:border-white/10",
          !open && pillWidth === null && "w-fit",
          "transform-gpu motion-reduce:transition-none",
        )}
      >
        <motion.div
          aria-hidden={open}
          animate={{ opacity: open ? 0 : 1 }}
          transition={{
            duration: reduce ? 0.1 : 0.18,
            ease: SHELL_EASE,
            delay: open ? 0 : reduce ? 0 : SHELL_DURATION * 0.35,
          }}
          className="pointer-events-none absolute inset-0"
        >
          <ShimmerChrome borderRadius="100px" />
        </motion.div>

        <div
          className={cn(
            "relative z-10 flex items-center justify-center border-b px-6 py-3 transition-colors motion-reduce:transition-none",
            open
              ? "border-black/10 dark:border-white/10"
              : "border-transparent",
          )}
          style={{
            transitionDuration: reduce ? "0ms" : `${SHELL_DURATION * 1000}ms`,
            transitionTimingFunction: "cubic-bezier(0.32, 0.72, 0, 1)",
          }}
        >
          <span
            className={cn(LABEL_CLASS, open && "text-foreground/55")}
          >
            Get in touch
          </span>

          {!open ? (
            <button
              type="button"
              onClick={openMenu}
              aria-haspopup="menu"
              aria-expanded={open}
              aria-controls={menuId}
              aria-label="Get in touch"
              className="absolute inset-0 cursor-pointer active:translate-y-px motion-reduce:active:translate-y-0"
            />
          ) : (
            <button
              type="button"
              onClick={() => closeMenu()}
              aria-label="Close menu"
              className="absolute top-1/2 right-6 -translate-y-1/2 cursor-pointer text-foreground/55 transition-colors hover:text-foreground"
            >
              <X className="h-5 w-5" />
            </button>
          )}
        </div>

        <div
          className={cn(
            "grid transition-[grid-template-rows] motion-reduce:transition-none",
            reduce ? "duration-150" : "duration-[380ms]",
          )}
          style={{
            gridTemplateRows: open ? "1fr" : "0fr",
            transitionTimingFunction: reduce
              ? undefined
              : "cubic-bezier(0.32, 0.72, 0, 1)",
          }}
        >
          <div className="overflow-hidden">
            <div className="grid grid-cols-2">
              {items.map((item, i) => (
                <a
                  key={item.label}
                  href={item.href}
                  role="menuitem"
                  tabIndex={open ? 0 : -1}
                  target={item.external ? "_blank" : undefined}
                  rel={item.external ? "noopener noreferrer" : undefined}
                  onClick={() => {
                    onSelect?.(item.label)
                    closeMenu()
                  }}
                  className={cn(
                    "flex items-center justify-center px-4 py-8 text-foreground/55 transition-colors hover:text-foreground",
                    i % 2 === 0 &&
                      "border-r border-black/10 dark:border-white/10",
                  )}
                >
                  <span className="flex flex-col items-center gap-3">
                    <item.icon className="h-6 w-6" />
                    <span className="text-sm font-medium">{item.label}</span>
                  </span>
                </a>
              ))}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
