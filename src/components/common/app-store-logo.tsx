import { motion, useReducedMotion } from "motion/react"

import { cn } from "@/lib/utils"

interface AppStoreLogoProps {
  logoUrl: string
  alt: string
  storeUrl?: string
  className?: string
}

export function AppStoreLogo({ logoUrl, alt, storeUrl, className }: AppStoreLogoProps) {
  const reduceMotion = useReducedMotion()

  const imageClasses = cn(
    "size-11 rounded-[22%] object-cover shadow-[0_8px_24px_rgba(0,0,0,0.12)] dark:shadow-[0_8px_24px_rgba(0,0,0,0.45)] md:size-12",
    className,
  )

  const hoverProps =
    reduceMotion || !storeUrl
      ? {}
      : {
          whileHover: { y: -3, scale: 1.045 },
          transition: { type: "spring" as const, stiffness: 460, damping: 30 },
        }

  if (!storeUrl) {
    return (
      <div className="flex justify-center">
        <img src={logoUrl} alt={alt} className={imageClasses} />
      </div>
    )
  }

  return (
    <motion.a
      href={storeUrl}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`Open ${alt} on the app store`}
      className="inline-flex justify-center rounded-[22%] outline-none focus-visible:ring-2 focus-visible:ring-foreground/40"
      {...hoverProps}
    >
      <img src={logoUrl} alt="" className={imageClasses} />
    </motion.a>
  )
}
