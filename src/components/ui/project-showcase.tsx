import { useEffect, useRef, useState, type MouseEvent } from "react"
import { createPortal } from "react-dom"
import { ArrowUpRight, X } from "lucide-react"
import { AnimatePresence, motion, useReducedMotion } from "motion/react"

import { ScreenBlurBackdrop } from "@/components/ui/screen-blur-backdrop"
import { MorphPlayPause } from "@/components/ui/morph-play-pause"
import { cn } from "@/lib/utils"
import engineeringImage from "@/assets/skills/engineering-preview.jpg"
import engineeringImageFull from "@/assets/skills/engineering.jpg"
import mobileAppsImage from "@/assets/skills/mobile-apps-preview.jpg"
import mobileAppsImageFull from "@/assets/skills/mobile-apps.jpg"
import motionInteractionImage from "@/assets/skills/motion-interaction-preview-poster.jpg"
import motionInteractionImageFull from "@/assets/skills/motion-interaction-poster.jpg"
import motionInteractionVideo from "@/assets/skills/motion-interaction-preview.mp4"
import motionInteractionVideoFull from "@/assets/skills/motion-interaction.mp4"
import productDesignImage from "@/assets/skills/product-design-preview.jpg"
import productDesignImageFull from "@/assets/skills/product-design.jpg"

export interface ShowcaseItem {
  title: string
  description: string
  year: string
  link: string
  /** Lightweight hover preview (poster / still). */
  image: string
  /** Full-resolution source for the expanded lightbox. Defaults to `image`. */
  imageFull?: string
  /** Optional muted loop for hover. Falls back to `image` when reduced-motion. */
  video?: string
  /** Optional muted loop for expanded view. Defaults to `video`. */
  videoFull?: string
}

type HotspotRect = {
  top: string
  left: string
  width: string
  height: string
}

/** Easter-egg music for the Product design expanded lightbox only. */
const PRODUCT_DESIGN_MUSIC = {
  title: "Product design",
  previewUrl:
    "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview211/v4/65/b3/8c/65b38cc9-fc6e-6bb7-18d3-ca7364c5aa9e/mzaf_7554840203423208840.plus.aac.p.m4a",
  // Hit targets over the play slots on each liquid-glass player
  // (square in image space: width% × 1.6 ≈ height% for 16:10).
  spots: [
    { top: "26.9%", left: "47.25%", width: "5.5%", height: "8.8%" },
    { top: "66.9%", left: "47.25%", width: "5.5%", height: "8.8%" },
  ] satisfies HotspotRect[],
} as const

const DEFAULT_SKILLS: ShowcaseItem[] = [
  {
    title: "Product design",
    description: "Interface systems, visual language, and product narrative.",
    year: "UI",
    link: "#my-skills",
    image: productDesignImage,
    imageFull: productDesignImageFull,
  },
  {
    title: "Engineering",
    description: "Production frontends with deliberate component architecture.",
    year: "FULL STACK",
    link: "#my-skills",
    image: engineeringImage,
    imageFull: engineeringImageFull,
  },
  {
    title: "Distribution",
    description: "Shipping iOS and Android experiences end to end.",
    year: "APP & WEB",
    link: "#my-skills",
    image: mobileAppsImage,
    imageFull: mobileAppsImageFull,
  },
  {
    title: "Motion & interaction",
    description: "Micro-animation and tactile feedback that earns its place.",
    year: "UX",
    link: "#my-skills",
    image: motionInteractionImage,
    imageFull: motionInteractionImageFull,
    video: motionInteractionVideo,
    videoFull: motionInteractionVideoFull,
  },
]

const EXPAND_EASE = [0.32, 0.72, 0, 1] as const

export type ProjectShowcaseProps = {
  items?: ShowcaseItem[]
  className?: string
  /** Called when a skill row is activated (click / Enter / Space). */
  onInteract?: () => void
}

export function ProjectShowcase({
  items = DEFAULT_SKILLS,
  className,
  onInteract,
}: ProjectShowcaseProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null)
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const [smoothPosition, setSmoothPosition] = useState({ x: 0, y: 0 })
  const [isVisible, setIsVisible] = useState(false)
  const [isPreviewPlaying, setIsPreviewPlaying] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const animationRef = useRef<number | null>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const hoverVideoRefs = useRef<Map<number, HTMLVideoElement>>(new Map())
  const expandedVideoRef = useRef<HTMLVideoElement | null>(null)
  const reduceMotion = useReducedMotion()
  const expanded = expandedIndex !== null ? items[expandedIndex] : null
  const showProductMusic = expanded?.title === PRODUCT_DESIGN_MUSIC.title
  const expandedVideo =
    !reduceMotion && expanded
      ? (expanded.videoFull ?? expanded.video)
      : undefined

  useEffect(() => {
    if (reduceMotion) {
      setSmoothPosition(mousePosition)
      return
    }

    const lerp = (start: number, end: number, factor: number) =>
      start + (end - start) * factor

    const animate = () => {
      setSmoothPosition((prev) => ({
        x: lerp(prev.x, mousePosition.x, 0.15),
        y: lerp(prev.y, mousePosition.y, 0.15),
      }))
      animationRef.current = requestAnimationFrame(animate)
    }

    animationRef.current = requestAnimationFrame(animate)

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [mousePosition, reduceMotion])

  useEffect(() => {
    if (expandedIndex === null) return

    const onKey = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return
      const audio = audioRef.current
      if (audio) {
        audio.pause()
        audio.currentTime = 0
      }
      setIsPreviewPlaying(false)
      setExpandedIndex(null)
    }

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = "hidden"
    window.addEventListener("keydown", onKey)

    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener("keydown", onKey)
    }
  }, [expandedIndex])

  // Stop preview when leaving the Product design lightbox.
  useEffect(() => {
    if (showProductMusic) return
    const audio = audioRef.current
    if (!audio) return
    audio.pause()
    audio.currentTime = 0
    setIsPreviewPlaying(false)
  }, [showProductMusic])

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    const onPlay = () => setIsPreviewPlaying(true)
    const onPause = () => setIsPreviewPlaying(false)
    const onEnded = () => {
      setIsPreviewPlaying(false)
      audio.currentTime = 0
    }

    audio.addEventListener("play", onPlay)
    audio.addEventListener("pause", onPause)
    audio.addEventListener("ended", onEnded)
    return () => {
      audio.removeEventListener("play", onPlay)
      audio.removeEventListener("pause", onPause)
      audio.removeEventListener("ended", onEnded)
    }
  }, [showProductMusic])

  // Prefetch full-res while hovering so expand stays snappy.
  useEffect(() => {
    if (hoveredIndex === null) return
    const item = items[hoveredIndex]
    const fullVideo = item?.videoFull ?? item?.video
    if (fullVideo && !reduceMotion) {
      const preload = document.createElement("video")
      preload.preload = "auto"
      preload.muted = true
      preload.playsInline = true
      preload.src = fullVideo
      return
    }
    const full = item?.imageFull ?? item?.image
    if (!full) return
    const preload = new Image()
    preload.decoding = "async"
    preload.src = full
  }, [hoveredIndex, items, reduceMotion])

  // Play / pause hover preview videos with the cursor.
  useEffect(() => {
    hoverVideoRefs.current.forEach((video, index) => {
      if (reduceMotion || hoveredIndex !== index || expandedIndex !== null) {
        video.pause()
        return
      }
      void video.play().catch(() => {
        // Autoplay policies — fail silently; poster still shows.
      })
    })
  }, [hoveredIndex, expandedIndex, reduceMotion])

  // Autoplay expanded video when the lightbox opens.
  useEffect(() => {
    const video = expandedVideoRef.current
    if (!video || !expandedVideo) return
    video.currentTime = 0
    void video.play().catch(() => {})
    return () => {
      video.pause()
    }
  }, [expandedVideo, expandedIndex])

  const handleMouseMove = (e: MouseEvent) => {
    if (!containerRef.current || expandedIndex !== null) return
    const rect = containerRef.current.getBoundingClientRect()
    setMousePosition({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    })
  }

  const handleMouseEnter = (index: number) => {
    if (expandedIndex !== null) return
    setHoveredIndex(index)
    setIsVisible(true)
  }

  const handleMouseLeave = () => {
    setHoveredIndex(null)
    setIsVisible(false)
  }

  const openExpanded = (index: number) => {
    onInteract?.()
    setIsVisible(false)
    setHoveredIndex(null)
    setExpandedIndex(index)
  }

  const closeExpanded = () => {
    const audio = audioRef.current
    if (audio) {
      audio.pause()
      audio.currentTime = 0
    }
    setIsPreviewPlaying(false)
    setExpandedIndex(null)
  }

  const togglePreview = async () => {
    const audio = audioRef.current
    if (!audio) return
    try {
      if (audio.paused) {
        await audio.play()
      } else {
        audio.pause()
      }
    } catch {
      // Autoplay policies / network — fail silently for the Easter egg.
    }
  }

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      className={cn("relative w-full", className)}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute z-50 overflow-hidden rounded-xl"
        style={{
          left: 0,
          top: 0,
          transform: `translate3d(${smoothPosition.x + 20}px, ${smoothPosition.y - 100}px, 0)`,
          opacity: isVisible && expandedIndex === null ? 1 : 0,
          scale: isVisible && expandedIndex === null ? 1 : 0.8,
          transition: reduceMotion
            ? "opacity 0.15s ease"
            : "opacity 0.3s cubic-bezier(0.4, 0, 0.2, 1), scale 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
        }}
      >
        <div className="relative h-[180px] w-[280px] overflow-hidden rounded-xl bg-foreground/5">
          {items.map((item, index) => {
            const showVideo = Boolean(item.video) && !reduceMotion
            const mediaClassName =
              "absolute inset-0 h-full w-full object-cover transition-all duration-500 ease-out motion-reduce:transition-none"
            const mediaStyle = {
              opacity: hoveredIndex === index ? 1 : 0,
              scale: hoveredIndex === index ? 1 : 1.1,
              filter: hoveredIndex === index ? "none" : "blur(10px)",
            }

            return showVideo ? (
              <video
                key={item.title}
                ref={(node) => {
                  if (node) hoverVideoRefs.current.set(index, node)
                  else hoverVideoRefs.current.delete(index)
                }}
                src={item.video}
                poster={item.image}
                muted
                loop
                playsInline
                preload="metadata"
                aria-hidden
                className={mediaClassName}
                style={mediaStyle}
              />
            ) : (
              <img
                key={item.title}
                src={item.image}
                alt=""
                className={mediaClassName}
                style={mediaStyle}
              />
            )
          })}
          <div className="absolute inset-0 bg-gradient-to-t from-background/20 to-transparent" />
        </div>
      </div>

      <div className="space-y-0">
        {items.map((item, index) => (
          <button
            key={item.title}
            type="button"
            className="group block w-full cursor-pointer text-left"
            onMouseEnter={() => handleMouseEnter(index)}
            onMouseLeave={handleMouseLeave}
            onFocus={() => handleMouseEnter(index)}
            onBlur={handleMouseLeave}
            onClick={() => openExpanded(index)}
            aria-expanded={expandedIndex === index}
          >
            <div className="relative border-t border-foreground/10 py-5 transition-all duration-300 ease-out motion-reduce:transition-none">
              <div
                className={cn(
                  "absolute inset-0 -mx-2 rounded-lg bg-foreground/[0.04] px-2 transition-all duration-300 ease-out motion-reduce:transition-none sm:-mx-3 sm:px-3",
                  hoveredIndex === index
                    ? "scale-100 opacity-100"
                    : "scale-95 opacity-0",
                )}
              />

              <div className="relative flex items-start justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <div className="inline-flex items-center gap-2">
                    <h3 className="text-lg font-semibold tracking-tight text-foreground">
                      <span className="relative">
                        {item.title}
                        <span
                          className={cn(
                            "absolute bottom-0 left-0 h-px bg-foreground transition-all duration-300 ease-out motion-reduce:transition-none",
                            hoveredIndex === index ? "w-full" : "w-0",
                          )}
                        />
                      </span>
                    </h3>

                    <ArrowUpRight
                      className={cn(
                        "h-4 w-4 text-foreground/45 transition-all duration-300 ease-out motion-reduce:transition-none",
                        hoveredIndex === index
                          ? "translate-x-0 translate-y-0 opacity-100"
                          : "-translate-x-2 translate-y-2 opacity-0",
                      )}
                      aria-hidden
                    />
                  </div>

                  <p
                    className={cn(
                      "mt-1 text-sm leading-relaxed transition-all duration-300 ease-out motion-reduce:transition-none",
                      hoveredIndex === index
                        ? "text-foreground/70"
                        : "text-foreground/50",
                    )}
                  >
                    {item.description}
                  </p>
                </div>

                <span
                  className={cn(
                    "font-mono text-xs text-foreground/45 tabular-nums transition-all duration-300 ease-out motion-reduce:transition-none",
                    hoveredIndex === index && "text-foreground/60",
                  )}
                >
                  {item.year}
                </span>
              </div>
            </div>
          </button>
        ))}

        <div className="border-t border-foreground/10" />
      </div>

      {typeof document !== "undefined" &&
        createPortal(
          <>
            <ScreenBlurBackdrop
              open={expandedIndex !== null}
              label="Close skill preview"
              onDismiss={closeExpanded}
              className="fixed inset-0 z-[60] cursor-default bg-background/30 backdrop-blur-[8px]"
            />

            <AnimatePresence>
              {expanded && (
                <motion.div
                  key={expanded.title}
                  role="dialog"
                  aria-modal="true"
                  aria-label={expanded.title}
                  className="pointer-events-none fixed inset-0 z-[70] flex items-center justify-center p-6 sm:p-10"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={
                    reduceMotion
                      ? { duration: 0 }
                      : { duration: 0.28, ease: EXPAND_EASE }
                  }
                >
                  <motion.div
                    className="pointer-events-auto relative w-full max-w-[min(46.8rem,96vw)]"
                    initial={
                      reduceMotion ? false : { opacity: 0, scale: 0.92, y: 12 }
                    }
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={
                      reduceMotion
                        ? { opacity: 0 }
                        : { opacity: 0, scale: 0.96, y: 8 }
                    }
                    transition={
                      reduceMotion
                        ? { duration: 0 }
                        : { duration: 0.36, ease: EXPAND_EASE }
                    }
                  >
                    <div className="relative">
                      {expandedVideo ? (
                        <video
                          ref={expandedVideoRef}
                          key={expandedVideo}
                          src={expandedVideo}
                          poster={expanded.imageFull ?? expanded.image}
                          muted
                          loop
                          playsInline
                          autoPlay
                          preload="auto"
                          aria-label={expanded.title}
                          className="aspect-[16/10] w-full rounded-xl object-cover"
                        />
                      ) : (
                        <img
                          src={expanded.imageFull ?? expanded.image}
                          alt={expanded.title}
                          decoding="async"
                          fetchPriority="high"
                          sizes="(max-width: 768px) 96vw, min(46.8rem, 96vw)"
                          className="aspect-[16/10] w-full rounded-xl object-cover"
                        />
                      )}

                      {showProductMusic &&
                        PRODUCT_DESIGN_MUSIC.spots.map((spot, index) => (
                          <button
                            key={`play-hotspot-${index}`}
                            type="button"
                            aria-label={
                              isPreviewPlaying
                                ? "Pause Butterfly Effect preview"
                                : "Play Butterfly Effect preview"
                            }
                            aria-pressed={isPreviewPlaying}
                            onClick={(event) => {
                              event.stopPropagation()
                              void togglePreview()
                            }}
                            className="absolute z-10 flex cursor-pointer items-center justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/80 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent"
                            style={{
                              top: spot.top,
                              left: spot.left,
                              width: spot.width,
                              height: spot.height,
                            }}
                          >
                            <MorphPlayPause
                              playing={isPreviewPlaying}
                              className="size-[70%] drop-shadow-[0_1px_1px_rgba(0,0,0,0.25)]"
                            />
                          </button>
                        ))}

                      {showProductMusic && (
                        <audio
                          ref={audioRef}
                          preload="metadata"
                          src={PRODUCT_DESIGN_MUSIC.previewUrl}
                          className="pointer-events-none absolute h-px w-px opacity-0"
                          tabIndex={-1}
                          aria-hidden
                        />
                      )}
                    </div>

                    <button
                      type="button"
                      aria-label="Close preview"
                      onClick={closeExpanded}
                      className="absolute bottom-0 left-1/2 z-10 flex size-9 translate-y-[calc(100%+0.75rem)] -translate-x-1/2 cursor-pointer items-center justify-center text-foreground transition-opacity hover:opacity-70"
                    >
                      <X className="size-6" strokeWidth={2.5} aria-hidden />
                    </button>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          </>,
          document.body,
        )}
    </div>
  )
}
