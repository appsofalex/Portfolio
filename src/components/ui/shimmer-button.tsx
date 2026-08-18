import React, { type CSSProperties } from "react"

import { cn } from "@/lib/utils"

export interface ShimmerChromeProps {
  borderRadius?: string
  shimmer?: boolean
  className?: string
}

export function ShimmerChrome({
  borderRadius = "100px",
  shimmer = true,
  className,
}: ShimmerChromeProps) {
  return (
    <>
      {shimmer ? (
        <div
          className={cn(
            "pointer-events-none absolute inset-0 -z-30 overflow-visible blur-[2px] [container-type:size]",
            className,
          )}
          style={{ borderRadius }}
          aria-hidden
        >
          <div className="absolute inset-0 h-[100cqh] animate-shimmer-slide [aspect-ratio:1] [border-radius:0] [mask:none] motion-reduce:animate-none">
            <div className="animate-spin-around absolute -inset-full w-auto rotate-0 [background:conic-gradient(from_calc(270deg-(var(--spread)*0.5)),transparent_0,var(--spark-color)_var(--spread),transparent_var(--spread))] [translate:0_0] motion-reduce:animate-none" />
          </div>
        </div>
      ) : null}

      <div
        className={cn(
          "pointer-events-none absolute inset-0 size-full",
          "shadow-[inset_0_-8px_10px_#00000014] dark:shadow-[inset_0_-8px_10px_#ffffff1f]",
          "transform-gpu transition-all duration-300 ease-in-out motion-reduce:transition-none",
          "group-hover:shadow-[inset_0_-6px_10px_#00000024] dark:group-hover:shadow-[inset_0_-6px_10px_#ffffff3f]",
          "group-active:shadow-[inset_0_-10px_10px_#0000002e] dark:group-active:shadow-[inset_0_-10px_10px_#ffffff3f]",
        )}
        style={{ borderRadius }}
        aria-hidden
      />

      {shimmer ? (
        <div
          className="pointer-events-none absolute -z-20 [background:var(--bg)] [inset:var(--cut)]"
          style={{ borderRadius }}
          aria-hidden
        />
      ) : null}
    </>
  )
}

export interface ShimmerButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  shimmerColor?: string
  shimmerSize?: string
  borderRadius?: string
  shimmerDuration?: string
  background?: string
  className?: string
  children?: React.ReactNode
  /** Perimeter spark. Keep on primary CTAs; turn off for quieter controls. */
  shimmer?: boolean
}

const ShimmerButton = React.forwardRef<HTMLButtonElement, ShimmerButtonProps>(
  (
    {
      shimmerColor,
      shimmerSize = "0.05em",
      shimmerDuration = "3s",
      borderRadius = "100px",
      background,
      className,
      children,
      shimmer = true,
      ...props
    },
    ref,
  ) => {
    return (
      <button
        style={
          {
            "--spread": "90deg",
            "--spark-color": shimmerColor ?? "var(--shimmer-color)",
            "--radius": borderRadius,
            "--speed": shimmerDuration,
            "--cut": shimmerSize,
            "--bg": background ?? "var(--shimmer-button-bg)",
          } as CSSProperties
        }
        className={cn(
          "group relative z-0 flex cursor-pointer items-center justify-center overflow-hidden whitespace-nowrap border border-black/10 px-6 py-3 text-black [background:var(--bg)] [border-radius:var(--radius)] dark:border-white/10 dark:text-white",
          "transform-gpu transition-[transform,color,background-color,border-color] duration-300 ease-in-out active:translate-y-px motion-reduce:transition-none",
          className,
        )}
        ref={ref}
        {...props}
      >
        <ShimmerChrome borderRadius={borderRadius} shimmer={shimmer} />
        {children}
      </button>
    )
  },
)

ShimmerButton.displayName = "ShimmerButton"

export { ShimmerButton }
