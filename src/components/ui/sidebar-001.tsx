import {
  createContext,
  memo,
  useContext,
  useRef,
  useState,
  type MouseEventHandler,
  type ReactNode,
  type RefObject,
} from "react"
import { AnimatePresence, motion, useReducedMotion } from "motion/react"

import { cn } from "@/lib/utils"

interface HoverRect {
  top: number
  height: number
  left: number
}

const EffectsContext = createContext({ enabled: true })

const HoverContext = createContext<{
  hovered: string | null
  hoverRect: HoverRect | null
  containerRef: RefObject<HTMLDivElement | null>
  setHovered: (id: string | null, rect?: HoverRect | null) => void
}>({
  hovered: null,
  hoverRect: null,
  containerRef: { current: null },
  setHovered: () => {},
})

function HoverHighlight() {
  const { hoverRect, hovered } = useContext(HoverContext)
  const { enabled } = useContext(EffectsContext)
  const reduceMotion = useReducedMotion()

  return (
    <AnimatePresence>
      {enabled && hovered && hoverRect && (
        <motion.div
          key="sb001-hover-bg"
          className="pointer-events-none absolute z-0 rounded-md bg-foreground/[0.06]"
          style={{ right: 0 }}
          initial={false}
          animate={{
            top: hoverRect.top + 2,
            height: hoverRect.height - 4,
            left: hoverRect.left,
            opacity: 1,
          }}
          exit={{ opacity: 0 }}
          transition={
            reduceMotion
              ? { duration: 0 }
              : { type: "spring", stiffness: 300, damping: 30 }
          }
        />
      )}
    </AnimatePresence>
  )
}

export interface Sidebar001ItemProps {
  href: string
  label: ReactNode
  isActive: boolean
  className?: string
  onClick?: MouseEventHandler<HTMLAnchorElement>
}

export const Sidebar001Item = memo(function Sidebar001Item({
  href,
  label,
  isActive,
  className,
  onClick,
}: Sidebar001ItemProps) {
  const { hovered, setHovered, containerRef } = useContext(HoverContext)
  const reduceMotion = useReducedMotion()
  const itemRef = useRef<HTMLDivElement>(null)
  const isHovered = hovered === href

  const opacity = isActive
    ? 1
    : hovered !== null
      ? isHovered
        ? 1
        : 0.3
      : 0.55
  const x = isActive ? 8 : isHovered ? 6 : 0
  const spring = reduceMotion
    ? { duration: 0 }
    : { type: "spring" as const, stiffness: 700, damping: 30 }

  return (
    <div className="relative">
      {isActive && (
        <motion.span
          layoutId="sb001-active-bar"
          className="pointer-events-none absolute top-1/2 left-[4px] z-10 h-[1.8px] -translate-y-1/2 rounded-full bg-accent-pro"
          animate={{ width: 23 }}
          transition={
            reduceMotion
              ? { duration: 0 }
              : { type: "spring", stiffness: 800, damping: 40 }
          }
        />
      )}

      <motion.span
        className="pointer-events-none absolute top-1/2 left-0 h-px -translate-y-1/2 bg-foreground/50"
        animate={{ width: isActive ? 0 : isHovered ? 26 : 18 }}
        transition={
          reduceMotion
            ? { duration: 0 }
            : { type: "spring", stiffness: 600, damping: 30 }
        }
      />
      <motion.span className="pointer-events-none absolute top-1/4 left-0 h-px w-[13px] bg-foreground/30" />
      <motion.span className="pointer-events-none absolute top-0 left-0 h-px w-[16px] bg-foreground/30" />
      <motion.span className="pointer-events-none absolute top-3/4 left-0 h-px w-[13px] bg-foreground/30" />

      <motion.div
        ref={itemRef}
        animate={{ opacity, x }}
        transition={spring}
        style={{ transformOrigin: "left center" }}
      >
        <a
          href={href}
          onClick={onClick}
          onMouseEnter={() => {
            const el = itemRef.current
            const container = containerRef.current
            if (el && container) {
              const elRect = el.getBoundingClientRect()
              const containerRect = container.getBoundingClientRect()
              setHovered(href, {
                top: elRect.top - containerRect.top,
                height: elRect.height,
                left: 25,
              })
            } else {
              setHovered(href)
            }
          }}
          onMouseLeave={() => setHovered(null)}
          className={cn(
            "relative ml-2 flex items-center gap-2 py-1.5 pl-4 text-sm select-none",
            className,
          )}
        >
          <span className="relative z-1 truncate">{label}</span>
        </a>
      </motion.div>
    </div>
  )
})

export function Sidebar001Content({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [hovered, setHoveredId] = useState<string | null>(null)
  const [hoverRect, setHoverRect] = useState<HoverRect | null>(null)

  const setHovered = (id: string | null, rect?: HoverRect | null) => {
    setHoveredId(id)
    setHoverRect(rect ?? null)
  }

  return (
    <HoverContext.Provider
      value={{ hovered, hoverRect, containerRef, setHovered }}
    >
      <div className={cn("py-1", className)}>
        <div ref={containerRef} className="relative px-1">
          <HoverHighlight />
          {children}
        </div>
      </div>
    </HoverContext.Provider>
  )
}
