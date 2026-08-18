import { type CSSProperties } from "react"
import { motion, useReducedMotion } from "motion/react"

import { cn } from "@/lib/utils"

export type DeviceType = "iphone" | "android"

interface DeviceToggleProps {
  value: DeviceType
  onChange: (value: DeviceType) => void
  className?: string
}

const OPTIONS: { id: DeviceType; label: string }[] = [
  { id: "iphone", label: "iOS" },
  { id: "android", label: "Android" },
]

export function DeviceToggle({ value, onChange, className }: DeviceToggleProps) {
  const reduceMotion = useReducedMotion()

  return (
    <div
      role="radiogroup"
      aria-label="Phone type"
      style={
        {
          "--radius": "100px",
          "--bg": "var(--shimmer-button-bg)",
        } as CSSProperties
      }
      className={cn(
        "group relative z-0 flex items-center justify-center overflow-hidden whitespace-nowrap border border-black/10 p-1 text-black [background:var(--bg)] [border-radius:var(--radius)] dark:border-white/10 dark:text-white",
        "transform-gpu transition-[transform,color,background-color,border-color] duration-300 ease-in-out motion-reduce:transition-none",
        className,
      )}
    >
      <div className="relative z-10 grid grid-cols-2">
        <motion.span
          aria-hidden
          className="absolute inset-y-0 w-1/2 rounded-full bg-black/[0.06] dark:bg-white/10"
          animate={{ x: value === "iphone" ? "0%" : "100%" }}
          transition={
            reduceMotion
              ? { duration: 0 }
              : { type: "spring", stiffness: 480, damping: 36 }
          }
        />
        {OPTIONS.map((option) => {
          const selected = value === option.id
          return (
            <button
              key={option.id}
              type="button"
              role="radio"
              aria-checked={selected}
              onClick={() => onChange(option.id)}
              className={cn(
                "relative z-10 cursor-pointer rounded-full px-5 py-2 text-center text-sm font-normal leading-none tracking-tight outline-none transition-opacity duration-300 lg:text-base motion-reduce:transition-none",
                "focus-visible:ring-2 focus-visible:ring-foreground/40",
                selected ? "opacity-100" : "opacity-45 hover:opacity-70",
              )}
            >
              {option.label}
            </button>
          )
        })}
      </div>

      <div
        className={cn(
          "pointer-events-none absolute inset-0 size-full",
          "rounded-2xl px-4 py-1.5 text-sm font-normal shadow-[inset_0_-8px_10px_#00000014] dark:shadow-[inset_0_-8px_10px_#ffffff1f]",
          "transform-gpu transition-all duration-300 ease-in-out motion-reduce:transition-none",
          "group-hover:shadow-[inset_0_-6px_10px_#00000024] dark:group-hover:shadow-[inset_0_-6px_10px_#ffffff3f]",
        )}
      />
    </div>
  )
}
