'use client'

import { useRef, useState, ReactNode } from 'react'
import { motion, useMotionValue, useSpring, useMotionTemplate } from 'framer-motion'
import { cn } from '@/lib/utils'

interface SpotlightCardProps {
  children: ReactNode
  className?: string
  spotlightColor?: string
}

export function SpotlightCard({
  children,
  className,
  spotlightColor = 'rgba(var(--primary-rgb, 14, 165, 233), 0.15)', // Default to primary-ish
}: SpotlightCardProps) {
  const boundingRef = useRef<HTMLDivElement>(null)
  const [isHovered, setIsHovered] = useState(false)
  
  const mouseX = useMotionValue(0)
  const mouseY = useMotionValue(0)

  // Smooth out the movement slightly
  const springX = useSpring(mouseX, { stiffness: 400, damping: 28 })
  const springY = useSpring(mouseY, { stiffness: 400, damping: 28 })

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!boundingRef.current) return
    const { left, top } = boundingRef.current.getBoundingClientRect()
    mouseX.set(e.clientX - left)
    mouseY.set(e.clientY - top)
  }

  const background = useMotionTemplate`radial-gradient(400px circle at ${springX}px ${springY}px, ${spotlightColor}, transparent 80%)`

  return (
    <div
      ref={boundingRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={cn(
        'group relative overflow-hidden rounded-[2.5rem] border border-border/40 bg-white/60 dark:bg-card/40 backdrop-blur-xl transition-all duration-500 hover:border-primary/40 hover:shadow-[0_20px_50px_rgba(0,0,0,0.04)]',
        className
      )}
    >
      {/* Dynamic Glow Layer */}
      <motion.div
        className="pointer-events-none absolute inset-0 z-0 transition-opacity duration-500"
        style={{ background }}
        initial={{ opacity: 0 }}
        animate={{ opacity: isHovered ? 1 : 0 }}
      />
      
      {/* Border Glow specific to hover */}
      <motion.div
        className="pointer-events-none absolute inset-0 z-0 transition-opacity duration-500"
        style={{
          background: useMotionTemplate`radial-gradient(300px circle at ${springX}px ${springY}px, rgba(255,255,255,0.1), transparent 80%)`,
        }}
        initial={{ opacity: 0 }}
        animate={{ opacity: isHovered ? 1 : 0 }}
      />

      {/* Content wrapper */}
      <div className="relative z-10 h-full w-full">
        {children}
      </div>
    </div>
  )
}
