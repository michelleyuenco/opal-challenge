import { useRef } from 'react'
import {
  motion,
  useMotionValue,
  useTransform,
  useMotionTemplate,
  useAnimationFrame,
  type MotionValue,
} from 'framer-motion'

/** Animated grid background with a cursor-revealed accent layer. */
export function InfiniteGrid() {
  const containerRef = useRef<HTMLDivElement>(null)

  const mouseX = useMotionValue(-1000)
  const mouseY = useMotionValue(-1000)

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const { left, top } = e.currentTarget.getBoundingClientRect()
    mouseX.set(e.clientX - left)
    mouseY.set(e.clientY - top)
  }

  const gridOffsetX = useMotionValue(0)
  const gridOffsetY = useMotionValue(0)

  useAnimationFrame(() => {
    gridOffsetX.set((gridOffsetX.get() + 0.5) % 40)
    gridOffsetY.set((gridOffsetY.get() + 0.5) % 40)
  })

  const maskImage = useMotionTemplate`radial-gradient(320px circle at ${mouseX}px ${mouseY}px, black, transparent)`

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      className="absolute inset-0 overflow-hidden"
    >
      {/* Faint base grid */}
      <div className="absolute inset-0 text-white/30 opacity-20">
        <GridPattern offsetX={gridOffsetX} offsetY={gridOffsetY} />
      </div>

      {/* Cursor-revealed accent grid */}
      <motion.div
        className="absolute inset-0 text-amber-200 opacity-90"
        style={{ maskImage, WebkitMaskImage: maskImage }}
      >
        <GridPattern offsetX={gridOffsetX} offsetY={gridOffsetY} />
      </motion.div>

      {/* Color blooms */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute right-[-20%] top-[-20%] h-[40%] w-[40%] rounded-full bg-amber-500/30 blur-[120px]" />
        <div className="absolute right-[10%] top-[-10%] h-[20%] w-[20%] rounded-full bg-purple-500/30 blur-[100px]" />
        <div className="absolute bottom-[-20%] left-[-10%] h-[40%] w-[40%] rounded-full bg-indigo-500/40 blur-[120px]" />
      </div>
    </div>
  )
}

function GridPattern({
  offsetX,
  offsetY,
}: {
  offsetX: MotionValue<number>
  offsetY: MotionValue<number>
}) {
  const x = useTransform(offsetX, (v) => v)
  const y = useTransform(offsetY, (v) => v)
  return (
    <svg className="h-full w-full">
      <defs>
        <motion.pattern
          id="infinite-grid-pattern"
          width="40"
          height="40"
          patternUnits="userSpaceOnUse"
          x={x}
          y={y}
        >
          <path
            d="M 40 0 L 0 0 0 40"
            fill="none"
            stroke="currentColor"
            strokeWidth="1"
          />
        </motion.pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#infinite-grid-pattern)" />
    </svg>
  )
}
