import { useEffect, useState } from "react"
import { motion, type Variants } from "motion/react"

import { cn } from "@/lib/utils"

interface TypewriterProps {
  text: string | string[]
  speed?: number
  initialDelay?: number
  waitTime?: number
  deleteSpeed?: number
  loop?: boolean
  className?: string
  showCursor?: boolean
  hideCursorOnType?: boolean
  cursorChar?: string | React.ReactNode
  cursorAnimationVariants?: {
    initial: Variants["initial"]
    animate: Variants["animate"]
  }
  cursorClassName?: string
}

const Typewriter = ({
  text,
  speed = 50,
  initialDelay = 0,
  waitTime = 2000,
  deleteSpeed = 30,
  loop = true,
  className,
  showCursor = true,
  hideCursorOnType = false,
  cursorChar = "|",
  cursorClassName = "ml-1",
  cursorAnimationVariants = {
    initial: { opacity: 0 },
    animate: {
      opacity: 1,
      transition: {
        duration: 0.01,
        repeat: Infinity,
        repeatDelay: 0.4,
        repeatType: "reverse",
      },
    },
  },
}: TypewriterProps) => {
  const [displayText, setDisplayText] = useState("")
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isDeleting, setIsDeleting] = useState(false)
  const [currentTextIndex, setCurrentTextIndex] = useState(0)

  const texts = Array.isArray(text) ? text : [text]

  useEffect(() => {
    let timeout: ReturnType<typeof setTimeout>

    const currentText = texts[currentTextIndex]

    const startTyping = () => {
      if (isDeleting) {
        if (displayText === "") {
          setIsDeleting(false)
          if (currentTextIndex === texts.length - 1 && !loop) {
            return
          }
          setCurrentTextIndex((prev) => (prev + 1) % texts.length)
          setCurrentIndex(0)
          timeout = setTimeout(() => {}, waitTime)
        } else {
          timeout = setTimeout(() => {
            setDisplayText((prev) => prev.slice(0, -1))
          }, deleteSpeed)
        }
      } else if (currentIndex < currentText.length) {
        timeout = setTimeout(() => {
          setDisplayText((prev) => prev + currentText[currentIndex])
          setCurrentIndex((prev) => prev + 1)
        }, speed)
      } else if (texts.length > 1) {
        timeout = setTimeout(() => {
          setIsDeleting(true)
        }, waitTime)
      }
    }

    if (currentIndex === 0 && !isDeleting && displayText === "") {
      timeout = setTimeout(startTyping, initialDelay)
    } else {
      startTyping()
    }

    return () => clearTimeout(timeout)
  }, [
    currentIndex,
    displayText,
    isDeleting,
    speed,
    deleteSpeed,
    waitTime,
    texts,
    currentTextIndex,
    loop,
    initialDelay,
  ])

  return (
    <span className={cn("inline whitespace-pre-wrap tracking-tight", className)}>
      <span>{displayText}</span>
      {showCursor && (
        <motion.span
          variants={cursorAnimationVariants}
          className={cn(
            cursorClassName,
            hideCursorOnType &&
              (currentIndex < texts[currentTextIndex].length || isDeleting)
              ? "hidden"
              : "",
          )}
          initial="initial"
          animate="animate"
        >
          {cursorChar}
        </motion.span>
      )}
    </span>
  )
}

interface UseTypewriterOptions {
  text: string
  speed?: number
  initialDelay?: number
  enabled?: boolean
}

function useTypewriter({
  text,
  speed = 50,
  initialDelay = 0,
  enabled = true,
}: UseTypewriterOptions) {
  const [visibleLength, setVisibleLength] = useState(enabled ? 0 : text.length)
  const [currentIndex, setCurrentIndex] = useState(0)
  const complete = !enabled || visibleLength >= text.length

  useEffect(() => {
    if (!enabled) {
      setVisibleLength(text.length)
      setCurrentIndex(text.length)
      return
    }

    setVisibleLength(0)
    setCurrentIndex(0)
  }, [enabled, text])

  useEffect(() => {
    if (!enabled || currentIndex >= text.length) return

    let timeout: ReturnType<typeof setTimeout>

    if (currentIndex === 0) {
      timeout = setTimeout(() => {
        setVisibleLength(1)
        setCurrentIndex(1)
      }, initialDelay)
    } else {
      timeout = setTimeout(() => {
        setVisibleLength(currentIndex + 1)
        setCurrentIndex((prev) => prev + 1)
      }, speed)
    }

    return () => clearTimeout(timeout)
  }, [currentIndex, enabled, initialDelay, speed, text.length])

  return { visibleLength, complete }
}

export { Typewriter, useTypewriter }
