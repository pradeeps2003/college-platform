'use client'

import { useRef, useState, useEffect } from 'react'
import { motion, useMotionValue, useSpring } from 'framer-motion'
import { cn } from '@/lib/utils'

interface MagneticProps {
  children: React.ReactElement
  className?: string
  springOptions?: { stiffness: number; damping: number; mass: number }
  intensity?: number
}

export function Magnetic({
  children,
  className,
  springOptions = { stiffness: 150, damping: 15, mass: 0.1 },
  intensity = 0.3
}: MagneticProps) {
  const ref = useRef<HTMLDivElement>(null)
  const [isHovered, setIsHovered] = useState(false)

  const x = useMotionValue(0)
  const y = useMotionValue(0)

  const springX = useSpring(x, springOptions)
  const springY = useSpring(y, springOptions)

  useEffect(() => {
    if (!isHovered) {
      x.set(0)
      y.set(0)
    }
  }, [isHovered, x, y])

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!ref.current) return
    const { clientX, clientY } = e
    const { height, width, left, top } = ref.current.getBoundingClientRect()

    // Calculate distance from center (using intensity scale)
    const middleX = clientX - (left + width / 2)
    const middleY = clientY - (top + height / 2)

    x.set(middleX * intensity)
    y.set(middleY * intensity)
  }

  const handleMouseEnter = () => setIsHovered(true)
  const handleMouseLeave = () => setIsHovered(false)

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={cn("relative inline-block z-10", className)}
      style={{ x: springX, y: springY }}
    >
      {children}
    </motion.div>
  )
}
