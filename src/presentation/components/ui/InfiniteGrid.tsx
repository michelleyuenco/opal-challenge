import { useEffect, useRef } from 'react'
import {
  motion,
  useMotionValue,
  useMotionTemplate,
  useAnimationFrame,
} from 'framer-motion'

const GRID_STYLE: React.CSSProperties = {
  backgroundImage:
    'linear-gradient(to right, currentColor 1px, transparent 1px), linear-gradient(to bottom, currentColor 1px, transparent 1px)',
  backgroundSize: '40px 40px',
}

/** Animated grid background with a cursor-revealed accent layer. */
export function InfiniteGrid() {
  const containerRef = useRef<HTMLDivElement>(null)

  const mouseX = useMotionValue(-1000)
  const mouseY = useMotionValue(-1000)
  const offset = useMotionValue(0)

  // Listen on window so child elements above the grid don't swallow the event
  useEffect(() => {
    const handle = (e: MouseEvent) => {
      const el = containerRef.current
      if (!el) return
      const rect = el.getBoundingClientRect()
      mouseX.set(e.clientX - rect.left)
      mouseY.set(e.clientY - rect.top)
    }
    window.addEventListener('mousemove', handle)
    return () => window.removeEventListener('mousemove', handle)
  }, [mouseX, mouseY])

  useAnimationFrame((t) => {
    offset.set((t / 50) % 40)
  })

  const bgPosition = useMotionTemplate`${offset}px ${offset}px`
  const maskImage = useMotionTemplate`radial-gradient(320px circle at ${mouseX}px ${mouseY}px, black, transparent)`

  return (
    <div ref={containerRef} className="absolute inset-0 overflow-hidden">
      {/* Faint scrolling base grid */}
      <motion.div
        className="absolute inset-0 text-white/40"
        style={{ ...GRID_STYLE, backgroundPosition: bgPosition }}
      />

      {/* Cursor-revealed accent grid */}
      <motion.div
        className="absolute inset-0 text-amber-300"
        style={{
          ...GRID_STYLE,
          backgroundPosition: bgPosition,
          maskImage,
          WebkitMaskImage: maskImage,
        }}
      />

      {/* Color blooms */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute right-[-20%] top-[-20%] h-[40%] w-[40%] rounded-full bg-amber-500/30 blur-[120px]" />
        <div className="absolute right-[10%] top-[-10%] h-[20%] w-[20%] rounded-full bg-purple-500/30 blur-[100px]" />
        <div className="absolute bottom-[-20%] left-[-10%] h-[40%] w-[40%] rounded-full bg-indigo-500/40 blur-[120px]" />
      </div>
    </div>
  )
}
