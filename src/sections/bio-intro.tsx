import { useMemo, type ReactNode } from "react"
import { motion, useReducedMotion } from "motion/react"

import { useTypewriter } from "@/components/ui/typewriter"
import { scrollElementIntoCenter } from "@/lib/programmatic-scroll"
import { cn } from "@/lib/utils"

type BioSegment =
  | { kind: "text"; content: string }
  | {
      kind: "link"
      content: string
      href?: string
      onClick?: () => void
    }

const BIO_LINK_CLASS =
  "font-semibold text-foreground underline underline-offset-[3px] transition-opacity duration-200 hover:opacity-70 motion-reduce:transition-none"

const BIO_BODY_CLASS =
  "max-w-md space-y-4 text-base font-normal leading-relaxed"

const PARAGRAPHS: BioSegment[][] = [
  [
    {
      kind: "text",
      content:
        "I'm a solo builder - I design and ship mobile products end to end, and some web stuff here and ",
    },
    {
      kind: "link",
      content: "there",
      href: "https://www.siteassist.com/",
    },
    {
      kind: "text",
      content: ". On client work and stealth projects right now.",
    },
  ],
  [
    { kind: "text", content: "I studied " },
    {
      kind: "link",
      content: "History and Political Economy",
      href: "https://www.kcl.ac.uk/",
    },
    {
      kind: "text",
      content:
        " and competed for England U20 in track and field - then spent time at ",
    },
    {
      kind: "text",
      content:
        "1000heads working with Google and Amazon before deciding I'd rather build the ",
    },
    {
      kind: "link",
      content: "products myself",
      href: "#my-work",
    },
    { kind: "text", content: "." },
  ],
]

function segmentLength(segments: BioSegment[]) {
  return segments.reduce((total, segment) => total + segment.content.length, 0)
}

function renderFullSegments(segments: BioSegment[]) {
  return segments.map((segment, index) => {
    if (segment.kind === "link") {
      return (
        <span key={`${segment.content}-${index}`} className={BIO_LINK_CLASS}>
          {segment.content}
        </span>
      )
    }

    return <span key={`text-${index}`}>{segment.content}</span>
  })
}

function renderSegments(segments: BioSegment[], visibleLength: number) {
  let remaining = visibleLength
  const nodes: ReactNode[] = []

  for (const [index, segment] of segments.entries()) {
    if (remaining <= 0) break

    const take = Math.min(remaining, segment.content.length)
    const visible = segment.content.slice(0, take)
    remaining -= take

    if (segment.kind === "link") {
      const isComplete = take === segment.content.length

      if (segment.href?.startsWith("#")) {
        nodes.push(
          <a
            key={`${segment.content}-${index}`}
            href={segment.href}
            className={cn(BIO_LINK_CLASS, !isComplete && "pointer-events-none")}
            onClick={(event) => {
              if (!isComplete) {
                event.preventDefault()
                return
              }
              event.preventDefault()
              segment.onClick?.()
            }}
          >
            {visible}
          </a>,
        )
      } else {
        nodes.push(
          <a
            key={`${segment.content}-${index}`}
            href={segment.href}
            className={cn(BIO_LINK_CLASS, !isComplete && "pointer-events-none")}
            target="_blank"
            rel="noreferrer"
            tabIndex={isComplete ? 0 : -1}
            aria-disabled={!isComplete}
          >
            {visible}
          </a>,
        )
      }
    } else {
      nodes.push(<span key={`text-${index}`}>{visible}</span>)
    }
  }

  return nodes
}

function scrollToMyWork() {
  const section = document.getElementById("my-work")
  if (!section) return

  scrollElementIntoCenter(section)
}

function getActiveParagraphIndex(
  visibleLength: number,
  offsets: number[],
  lengths: number[],
) {
  for (let index = 0; index < lengths.length; index += 1) {
    const offset = offsets[index] ?? 0
    const length = lengths[index] ?? 0
    if (visibleLength > offset && visibleLength <= offset + length) {
      return index
    }
  }

  return -1
}

export function BioIntro() {
  const reduceMotion = useReducedMotion()

  const paragraphs = useMemo(() => {
    return PARAGRAPHS.map((segments) => ({
      segments: segments.map((segment) =>
        segment.kind === "link" && segment.content === "products myself"
          ? { ...segment, onClick: scrollToMyWork }
          : segment,
      ),
      length: segmentLength(segments),
    }))
  }, [])

  const fullText = paragraphs.map(({ segments }) =>
    segments.map((segment) => segment.content).join(""),
  )

  const paragraphOffsets = [0, paragraphs[0]?.length ?? 0]

  const combinedText = fullText.join("")
  const { visibleLength, complete } = useTypewriter({
    text: combinedText,
    speed: 12,
    initialDelay: 280,
    enabled: !reduceMotion,
  })

  const paragraphLengths = paragraphs.map(({ length }) => length)
  const activeParagraphIndex = getActiveParagraphIndex(
    visibleLength,
    paragraphOffsets,
    paragraphLengths,
  )

  const typedParagraphs = paragraphs.map(({ segments, length }, paragraphIndex) => {
    const offset = paragraphOffsets[paragraphIndex] ?? 0
    const localVisible = Math.max(0, Math.min(length, visibleLength - offset))
    const isPending =
      !reduceMotion && paragraphIndex > 0 && visibleLength <= offset

    if (isPending) return null

    return (
      <p key={paragraphIndex}>
        {renderSegments(segments, reduceMotion ? length : localVisible)}
        {!complete && paragraphIndex === activeParagraphIndex && (
          <motion.span
            aria-hidden
            className="ml-0.5 inline-block font-normal text-foreground/40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{
              duration: 0.01,
              repeat: Infinity,
              repeatDelay: 0.4,
              repeatType: "reverse",
            }}
          >
            |
          </motion.span>
        )}
      </p>
    )
  })

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
      className="w-full pt-24 sm:pt-28"
    >
      <h1 className="text-xl font-semibold tracking-tight">Alexander Walters</h1>
      <p className="mt-1 text-base font-normal text-foreground/50">
        App Developer &amp; Designer
      </p>

      <div id="bio-intro" className="relative mt-4">
        {!reduceMotion && (
          <div
            aria-hidden
            className={cn(BIO_BODY_CLASS, "invisible pointer-events-none select-none")}
          >
            {paragraphs.map(({ segments }, paragraphIndex) => (
              <p key={`ghost-${paragraphIndex}`}>{renderFullSegments(segments)}</p>
            ))}
          </div>
        )}

        <div
          className={cn(
            BIO_BODY_CLASS,
            !reduceMotion && "absolute inset-0",
          )}
        >
          {reduceMotion
            ? paragraphs.map(({ segments, length }, paragraphIndex) => (
                <p key={paragraphIndex}>{renderSegments(segments, length)}</p>
              ))
            : typedParagraphs}
        </div>
      </div>
    </motion.div>
  )
}
