import * as React from "react"
import { useReducedMotion } from "motion/react"

import { cn } from "@/lib/utils"

interface InteractiveProductCardProps extends React.HTMLAttributes<HTMLDivElement> {
  imageUrl: string
  logoUrl?: string
  logo?: React.ReactNode
  title: string
  description: string
  price: string
}

export function InteractiveProductCard({
  className,
  imageUrl,
  logoUrl,
  logo,
  title,
  description,
  price,
  ...props
}: InteractiveProductCardProps) {
  const cardRef = React.useRef<HTMLDivElement>(null)
  const reduceMotion = useReducedMotion()
  const [style, setStyle] = React.useState<React.CSSProperties>({})

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (reduceMotion || !cardRef.current) return

    const { left, top, width, height } = cardRef.current.getBoundingClientRect()
    const x = e.clientX - left
    const y = e.clientY - top

    const rotateX = ((y - height / 2) / (height / 2)) * -8
    const rotateY = ((x - width / 2) / (width / 2)) * 8

    setStyle({
      transform: `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.05, 1.05, 1.05)`,
      transition: "transform 0.1s ease-out",
    })
  }

  const handleMouseLeave = () => {
    if (reduceMotion) return

    setStyle({
      transform: "perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)",
      transition: "transform 0.4s ease-in-out",
    })
  }

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={style}
      className={cn(
        "group relative w-full max-w-[340px] aspect-[9/12] rounded-3xl bg-card shadow-lg transform-3d",
        className,
      )}
      {...props}
    >
      <img
        src={imageUrl}
        alt={title}
        draggable={false}
        className="absolute inset-0 h-full w-full rounded-3xl object-cover transition-transform duration-300 group-hover:scale-110 motion-reduce:transition-none motion-reduce:group-hover:scale-100"
        style={{ transform: "translateZ(-20px) scale(1.1)" }}
      />
      <div className="absolute inset-0 rounded-3xl bg-gradient-to-t from-black/60 via-black/20 to-transparent" />

      <div
        className="absolute inset-0 flex flex-col p-5"
        style={{ transform: "translateZ(40px)" }}
      >
        <div className="flex items-start justify-between rounded-xl border border-white/10 bg-white/5 p-4 backdrop-blur-md">
          <div className="flex flex-col text-left">
            <h3 className="text-xl font-bold text-white">{title}</h3>
            <p className="text-xs text-white/70">{description}</p>
          </div>
          {logo ?? (
            logoUrl ? (
              <img src={logoUrl} alt="" className="h-4 w-auto" />
            ) : null
          )}
        </div>

        <div className="absolute top-[108px] left-5">
          <div className="rounded-full bg-black/40 px-4 py-1.5 text-sm font-semibold text-white backdrop-blur-sm">
            {price}
          </div>
        </div>

        <div className="mt-auto flex w-full justify-center gap-2 pb-2">
          {Array.from({ length: 4 }).map((_, index) => (
            <div
              key={index}
              className={cn(
                "h-1.5 w-1.5 rounded-full",
                index === 0 ? "bg-white" : "bg-white/30",
              )}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
