import { useState, useEffect, useRef, useCallback } from "react";
import { gsap } from "gsap";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { DeviceToggle, type DeviceType } from "@/components/common/device-toggle";
import { AppStoreLogo } from "@/components/common/app-store-logo";
import { Iphone16Pro } from "@/components/ui/iphone-16-pro";
import { Pixel10Pro } from "@/components/ui/pixel-10-pro";
import { ShimmerButton } from "@/components/ui/shimmer-button";
import { scrollElementIntoCenter } from "@/lib/programmatic-scroll";
import statusBarBlack from "@/assets/iphone/status-bar-black.webp";
import statusBarWhite from "@/assets/iphone/status-bar-white.webp";
import "./card-fan-carousel.css";

export type IphoneStatusBar = "black" | "white";

export interface CardItem {
  imgUrl: string;
  alt?: string;
  title?: string;
  logoUrl?: string;
  iosStoreUrl?: string;
  androidStoreUrl?: string;
  linkUrl?: string;
  /** iPhone-only overlay for the centered device frame. */
  statusBar?: IphoneStatusBar;
}

interface SocialCardsProps {
  cards: CardItem[];
}

const MAX_VISIBLE = 7;

/* Outer x/rot/scale must match --fan-spread, --fan-outer-rot, --fan-outer-scale in index.css */
const FAN_POSITIONS = [
  { rot: -21, scale: 0.7756, x: -30, y: 7.3, zIndex: 1 },
  { rot: -14, scale: 0.8498, x: -22, y: 4.0, zIndex: 2 },
  { rot: -7, scale: 0.9346, x: -11, y: 1.3, zIndex: 3 },
  { rot: 0, scale: 1.0, x: 0, y: 0.0, zIndex: 10 },
  { rot: 7, scale: 0.9346, x: 11, y: 1.3, zIndex: 3 },
  { rot: 14, scale: 0.8498, x: 22, y: 4.0, zIndex: 2 },
  { rot: 21, scale: 0.7756, x: 30, y: 7.3, zIndex: 1 },
];

/** Scales hover lift, spread, rotation, and elastic overshoot (1 = original). */
const HOVER_BOUNCE_INTENSITY = 0.78;
const HOVER_BOUNCE_EASE = "elastic.out(1, 0.86)";

function getResponsiveMultiplier() {
  const value = Number.parseFloat(
    getComputedStyle(document.documentElement).getPropertyValue("--fan-multiplier"),
  );
  return Number.isFinite(value) && value > 0 ? value : 1;
}

function getHeightMultiplier(width: number) {
  let idealPx: number;
  if (width < 480) idealPx = 19.5 * 16;
  else if (width < 640) idealPx = 23 * 16;
  else if (width < 768) idealPx = 25 * 16;
  else if (width < 1024) idealPx = 31 * 16;
  else idealPx = 35 * 16;

  const available = window.innerHeight * 0.7;
  if (available >= idealPx) return 1;
  return available / idealPx;
}

function prefersReducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function wrapIndex(value: number, total: number) {
  return ((value % total) + total) % total;
}

function shortestSlotDelta(from: number, to: number, slotCount: number) {
  let delta = to - from;
  if (delta > slotCount / 2) delta -= slotCount;
  if (delta < -slotCount / 2) delta += slotCount;
  return delta;
}

function getSlotConfig(slotCount: number, slot: number) {
  if (slotCount >= MAX_VISIBLE) return FAN_POSITIONS[slot];
  const center = slotCount >> 1;
  const distance = slotCount > 1 ? (slot - center) / center : 0;
  const absDistance = Math.abs(distance);
  return {
    rot: distance * 21,
    scale: 1.0 - 0.2244 * absDistance * absDistance,
    x: distance * 30,
    y: absDistance * absDistance * 7.3,
    zIndex: 10 - Math.abs(slot - center),
  };
}

export default function SocialCards({ cards }: SocialCardsProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const isAnimating = useRef(false);
  const hasEntered = useRef(false);
  const directionRef = useRef<"left" | "right" | null>(null);
  const prevSlots = useRef<Map<number, number>>(new Map());
  const cycleRef = useRef<(direction: "left" | "right") => void>(() => {});
  const scrollAnimRef = useRef<{ stop: () => void } | null>(null);
  const [device, setDevice] = useState<DeviceType>("iphone");
  const reduceTitleMotion = useReducedMotion();

  const totalCards = cards.length;
  const slotCount = Math.min(MAX_VISIBLE, totalCards);
  const half = slotCount >> 1;
  const canCycle = totalCards > 1;
  const [centerIndex, setCenterIndex] = useState(half);

  const getVisibleMap = useCallback(
    (center: number) => {
      const map = new Map<number, number>();
      for (let slot = 0; slot < slotCount; slot++) {
        map.set(wrapIndex(center + slot - half, totalCards), slot);
      }
      return map;
    },
    [totalCards, slotCount, half],
  );

  const cycle = useCallback(
    (direction: "left" | "right") => {
      if (isAnimating.current || !canCycle) return;
      isAnimating.current = true;
      directionRef.current = direction;
      setCenterIndex((prev) =>
        direction === "right" ? wrapIndex(prev + 1, totalCards) : wrapIndex(prev - 1, totalCards),
      );
    },
    [totalCards, canCycle],
  );

  const goTo = useCallback(
    (index: number) => {
      if (isAnimating.current || !canCycle || index === centerIndex) return;
      const forward = wrapIndex(index - centerIndex, totalCards);
      const backward = wrapIndex(centerIndex - index, totalCards);
      directionRef.current = forward <= backward ? "right" : "left";
      isAnimating.current = true;
      setCenterIndex(index);
    },
    [canCycle, centerIndex, totalCards],
  );

  const scrollFanIntoView = useCallback(() => {
    const section = sectionRef.current;
    if (!section) return;

    scrollElementIntoCenter(section, {
      reduceMotion: prefersReducedMotion(),
      animRef: scrollAnimRef,
    });
  }, []);

  cycleRef.current = cycle;

  // Auto-advance right every 3s using the same path as the next control / adjacent click.
  useEffect(() => {
    if (!canCycle) return;

    let timeout: ReturnType<typeof setTimeout> | null = null;
    let readyPoll: ReturnType<typeof setInterval> | null = null;

    const clear = () => {
      if (timeout) clearTimeout(timeout);
      timeout = null;
    };

    const schedule = () => {
      clear();
      timeout = setTimeout(function tick() {
        if (document.hidden || !hasEntered.current || isAnimating.current) {
          timeout = setTimeout(tick, 150);
          return;
        }
        cycleRef.current("right");
      }, 3000);
    };

    if (hasEntered.current) {
      schedule();
    } else {
      readyPoll = setInterval(() => {
        if (!hasEntered.current) return;
        if (readyPoll) clearInterval(readyPoll);
        readyPoll = null;
        schedule();
      }, 100);
    }

    const onVisibility = () => {
      if (document.hidden) {
        clear();
        return;
      }
      if (hasEntered.current) schedule();
    };
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      clear();
      if (readyPoll) clearInterval(readyPoll);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [canCycle, centerIndex]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container || !totalCards) return;

    const cardElements = Array.from(container.querySelectorAll<HTMLElement>(".fan-card"));
    if (!cardElements.length) return;

    const visibleMap = getVisibleMap(centerIndex);
    const previouslySlotted = prevSlots.current;
    const direction = directionRef.current;
    const isFirstMount = !hasEntered.current;
    const multiplier = getResponsiveMultiplier();
    const hMult = getHeightMultiplier(window.innerWidth);
    const reduceMotion = prefersReducedMotion();
    const config = (slot: number) => getSlotConfig(slotCount, slot);

    if (isFirstMount) isAnimating.current = true;

    let completedCount = 0;
    const visibleCount = visibleMap.size;
    const onCardDone = () => {
      if (++completedCount >= visibleCount) {
        isAnimating.current = false;
        if (isFirstMount) hasEntered.current = true;
      }
    };

    cardElements.forEach((card, cardIndex) => {
      const slot = visibleMap.get(cardIndex);
      const oldSlot = previouslySlotted.get(cardIndex);
      const wasVisible = oldSlot !== undefined;

      if (slot !== undefined) {
        const { x, y, rot, scale, zIndex } = config(slot);
        const target = {
          x: `${x * multiplier}rem`,
          y: `${y * hMult}rem`,
          rotation: rot,
          scale,
          opacity: 1,
          zIndex,
        };

        if (reduceMotion) {
          gsap.set(card, target);
          onCardDone();
        } else if (isFirstMount) {
          gsap.set(card, { x: 0, y: `${12 * hMult}rem`, rotation: 0, scale: 0.5, opacity: 0 });
          gsap.to(card, {
            ...target,
            duration: 1.2,
            ease: "elastic.out(1.05,.78)",
            delay: 0.2 + slot * 0.06,
            onComplete: onCardDone,
          });
        } else if (!wasVisible) {
          const enterX = direction === "right" ? 40 : -40;
          gsap.set(card, {
            x: `${enterX}rem`,
            y: `${y * hMult}rem`,
            rotation: direction === "right" ? 30 : -30,
            scale: 0.5,
            opacity: 0,
          });
          gsap.to(card, { ...target, duration: 0.6, ease: "power2.out", onComplete: onCardDone });
        } else {
          const delta = shortestSlotDelta(oldSlot, slot, slotCount);
          const wraps = Math.abs(slot - oldSlot) > Math.abs(delta);

          if (wraps) {
            const movingLeft = delta < 0;
            const exitX = movingLeft ? -40 : 40;
            const enterX = movingLeft ? 40 : -40;
            gsap.to(card, {
              x: `${exitX}rem`,
              opacity: 0,
              scale: 0.5,
              rotation: movingLeft ? -30 : 30,
              duration: 0.32,
              ease: "power2.in",
              zIndex: 0,
              onComplete: () => {
                gsap.set(card, {
                  x: `${enterX}rem`,
                  y: `${y * hMult}rem`,
                  rotation: movingLeft ? 30 : -30,
                  scale: 0.5,
                  opacity: 0,
                  zIndex,
                });
                gsap.to(card, { ...target, duration: 0.45, ease: "power2.out", onComplete: onCardDone });
              },
            });
          } else {
            gsap.to(card, { ...target, duration: 0.5, ease: "power2.out", onComplete: onCardDone });
          }
        }
      } else if (wasVisible) {
        if (reduceMotion) {
          gsap.set(card, { opacity: 0, scale: 0.5, zIndex: 0 });
        } else {
          const exitX = direction === "right" ? -40 : 40;
          gsap.to(card, {
            x: `${exitX}rem`,
            opacity: 0,
            scale: 0.5,
            rotation: direction === "right" ? -30 : 30,
            duration: 0.4,
            ease: "power2.in",
            zIndex: 0,
          });
        }
      } else if (isFirstMount) {
        gsap.set(card, { opacity: 0, scale: 0.3, x: 0, y: 0, zIndex: 0 });
      }
    });

    prevSlots.current = visibleMap;

    const visibleEntries: { el: HTMLElement; slot: number }[] = [];
    cardElements.forEach((el, i) => {
      const slot = visibleMap.get(i);
      if (slot !== undefined) visibleEntries.push({ el, slot });
    });
    visibleEntries.sort((a, b) => a.slot - b.slot);

    let activeSlot: number | null = null;
    let leaveTimer: ReturnType<typeof setTimeout> | null = null;
    const centerSlot = visibleEntries.length >> 1;

    const updateHoverLayout = (hoveredSlot: number | null) => {
      if (prefersReducedMotion()) return;

      const mult = getResponsiveMultiplier();
      const hM = getHeightMultiplier(window.innerWidth);

      visibleEntries.forEach(({ el, slot }) => {
        const base = config(slot);
        let targetX = base.x * mult;
        let targetY = base.y * hM;
        let targetRot = base.rot;
        let targetScale = base.scale;
        let delay = 0;

        if (hoveredSlot !== null) {
          const distance = Math.abs(slot - hoveredSlot);
          delay = distance * 0.02;

          if (slot === hoveredSlot) {
            targetY -= 2.5 * hM * HOVER_BOUNCE_INTENSITY;
            targetScale *= 1 + 0.08 * HOVER_BOUNCE_INTENSITY;
          } else {
            const normalized = centerSlot > 0 ? (slot - centerSlot) / centerSlot : 0;
            const pushStrength =
              8 *
              HOVER_BOUNCE_INTENSITY *
              (1 - Math.abs(normalized)) *
              (1 + 0.2 * Math.max(0, 3 - distance));

            if (slot < hoveredSlot) {
              targetX -= pushStrength * mult;
              targetRot -= (3 * HOVER_BOUNCE_INTENSITY) / (distance + 1);
            } else {
              targetX += pushStrength * mult;
              targetRot += (3 * HOVER_BOUNCE_INTENSITY) / (distance + 1);
            }

            if (slot === visibleEntries.length - 1 && hoveredSlot < centerSlot) {
              targetY -= 1 * hM * HOVER_BOUNCE_INTENSITY;
            }
            if (slot === 0 && hoveredSlot > centerSlot) {
              targetY -= 1 * hM * HOVER_BOUNCE_INTENSITY;
            }
          }
        } else {
          delay = Math.abs(slot - centerSlot) * 0.02;
        }

        gsap.to(el, {
          x: `${targetX}rem`,
          y: `${targetY}rem`,
          rotation: targetRot,
          scale: targetScale,
          duration: 0.5,
          delay,
          ease: HOVER_BOUNCE_EASE,
          overwrite: "auto",
        });
        gsap.set(el, { zIndex: base.zIndex });
      });
    };

    const enterHandlers = visibleEntries.map(({ el, slot }) => {
      const handler = () => {
        if (isAnimating.current) return;
        if (leaveTimer) {
          clearTimeout(leaveTimer);
          leaveTimer = null;
        }
        if (activeSlot !== slot) {
          activeSlot = slot;
          updateHoverLayout(slot);
        }
      };
      el.addEventListener("mouseenter", handler);
      return { el, handler };
    });

    const onMouseLeave = () => {
      if (isAnimating.current) return;
      if (leaveTimer) clearTimeout(leaveTimer);
      leaveTimer = setTimeout(() => {
        activeSlot = null;
        updateHoverLayout(null);
      }, 50);
    };
    container.addEventListener("mouseleave", onMouseLeave);

    const onResize = () => {
      if (!isAnimating.current) updateHoverLayout(activeSlot);
    };
    window.addEventListener("resize", onResize);

    return () => {
      enterHandlers.forEach(({ el, handler }) => el.removeEventListener("mouseenter", handler));
      container.removeEventListener("mouseleave", onMouseLeave);
      window.removeEventListener("resize", onResize);
      if (leaveTimer) clearTimeout(leaveTimer);
    };
  }, [centerIndex, totalCards, getVisibleMap, slotCount]);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    let accumulated = 0;
    let idleTimer: ReturnType<typeof setTimeout> | null = null;

    const onWheel = (event: WheelEvent) => {
      const horizontal = Math.abs(event.deltaX) > Math.abs(event.deltaY);
      const shifted = event.shiftKey && Math.abs(event.deltaY) > Math.abs(event.deltaX);
      if (!horizontal && !shifted) return;

      event.preventDefault();
      if (isAnimating.current) return;

      accumulated += horizontal ? event.deltaX : event.deltaY;
      if (idleTimer) clearTimeout(idleTimer);
      idleTimer = setTimeout(() => {
        accumulated = 0;
      }, 180);

      const threshold = 72;
      if (accumulated >= threshold) {
        accumulated = 0;
        cycleRef.current("right");
      } else if (accumulated <= -threshold) {
        accumulated = 0;
        cycleRef.current("left");
      }
    };

    section.addEventListener("wheel", onWheel, { passive: false });
    return () => {
      section.removeEventListener("wheel", onWheel);
      if (idleTimer) clearTimeout(idleTimer);
      scrollAnimRef.current?.stop();
    };
  }, []);

  if (!totalCards) return null;

  const visibleSlots = getVisibleMap(centerIndex);
  const centerSlot = half;
  const activeTitle = cards[centerIndex]?.title;
  const activeCard = cards[centerIndex];
  const activeStoreUrl =
    device === "iphone" ? activeCard?.iosStoreUrl : activeCard?.androidStoreUrl;

  return (
    <section
      id="my-work"
      ref={sectionRef}
      tabIndex={0}
      aria-roledescription="carousel"
      aria-labelledby="my-work-heading"
      onKeyDown={(event) => {
        if (event.key === "ArrowLeft") {
          event.preventDefault();
          cycle("left");
        }
        if (event.key === "ArrowRight") {
          event.preventDefault();
          cycle("right");
        }
      }}
      className={`fan-work fan-work--${device} relative z-20 mt-8 flex w-full flex-col items-center pb-8 pt-2 outline-none md:mt-10 md:pb-10 lg:pt-3`}
    >
      <h2
        id="my-work-heading"
        className="mb-2 text-center text-sm font-semibold tracking-[0.2em] text-foreground/50 uppercase md:mb-3"
      >
        Things I've made
      </h2>

      <div className="flex w-full items-center justify-center">
        <div
          ref={containerRef}
          className={`fan-layout fan-layout--${device} relative flex w-full items-center justify-center`}
        >
          {cards.map((card, index) => {
            const isCenter = visibleSlots.get(index) === centerSlot;
            const statusBarSrc =
              card.statusBar === "white"
                ? statusBarWhite
                : card.statusBar === "black"
                  ? statusBarBlack
                  : null;
            const image = (
              <img
                src={card.imgUrl}
                loading="lazy"
                alt={card.alt || card.title || `Card ${index}`}
                className="absolute inset-0 w-full h-full object-cover"
              />
            );
            const media = isCenter ? (
              <>
                <div className="device-screen">
                  {image}
                  {device === "iphone" && statusBarSrc ? (
                    <img
                      src={statusBarSrc}
                      alt=""
                      aria-hidden
                      className="device-status-bar"
                      draggable={false}
                    />
                  ) : null}
                </div>
                {device === "iphone" ? (
                  <Iphone16Pro className="device-frame" />
                ) : (
                  <Pixel10Pro className="device-frame" />
                )}
              </>
            ) : (
              <div className="relative h-full w-full overflow-hidden rounded-[inherit]">{image}</div>
            );
            const cardClassName = `fan-card${isCenter ? " fan-card--device" : ""}`;
            return (
              <button
                key={index}
                type="button"
                aria-label={card.title ? `Show ${card.title}` : `Show card ${index + 1}`}
                aria-current={isCenter ? "true" : undefined}
                className={cardClassName}
                onClick={() => {
                  scrollFanIntoView();
                  goTo(index);
                }}
              >
                {media}
              </button>
            );
          })}
        </div>
      </div>

      <div
        className="relative mt-0 flex min-h-[4.5rem] w-full flex-col items-center md:min-h-[5rem]"
        aria-live="polite"
      >
        <AnimatePresence mode="wait">
          {activeTitle ? (
            <motion.div
              key={`${centerIndex}-${device}`}
              initial={reduceTitleMotion ? false : { opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={reduceTitleMotion ? { opacity: 0 } : { opacity: 0, y: -8 }}
              transition={reduceTitleMotion ? { duration: 0 } : { duration: 0.28 }}
              className="flex w-full flex-col items-center"
            >
              {activeCard?.logoUrl ? (
                <AppStoreLogo
                  logoUrl={activeCard.logoUrl}
                  alt={activeCard.alt || activeTitle}
                  storeUrl={activeStoreUrl}
                />
              ) : null}
              <h3
                className={
                  activeCard?.logoUrl
                    ? "mt-2 text-center text-xl font-semibold tracking-tight"
                    : "text-center text-xl font-semibold tracking-tight"
                }
              >
                {activeTitle}
              </h3>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>

      <div className="fan-work-controls z-30 flex items-center justify-center gap-3">
        {canCycle && (
          <ShimmerButton
            type="button"
            aria-label="Previous project"
            shimmer={false}
            onClick={() => {
              scrollFanIntoView();
              cycle("left");
            }}
            className="size-12 shrink-0 px-0 py-0"
          >
            <ChevronLeft className="relative z-[1] size-5" strokeWidth={2} />
          </ShimmerButton>
        )}
        <DeviceToggle
          value={device}
          onChange={(next) => {
            scrollFanIntoView();
            setDevice(next);
          }}
        />
        {canCycle && (
          <ShimmerButton
            type="button"
            aria-label="Next project"
            shimmer={false}
            onClick={() => {
              scrollFanIntoView();
              cycle("right");
            }}
            className="size-12 shrink-0 px-0 py-0"
          >
            <ChevronRight className="relative z-[1] size-5" strokeWidth={2} />
          </ShimmerButton>
        )}
      </div>
    </section>
  );
}
