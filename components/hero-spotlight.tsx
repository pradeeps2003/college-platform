'use client'

import { useEffect, useState } from 'react'
import { motion, useMotionValue, useSpring, useMotionTemplate } from 'framer-motion'

export function HeroSpotlight() {
  const [isMounted, setIsMounted] = useState(false)
  const mouseX = useMotionValue(0)
  const mouseY = useMotionValue(0)

  // Smooth out the spotlight movement
  const springX = useSpring(mouseX, { stiffness: 50, damping: 20 })
  const springY = useSpring(mouseY, { stiffness: 50, damping: 20 })

  useEffect(() => {
    setIsMounted(true)
    const handleMouseMove = (e: MouseEvent) => {
      // Just track standard clientX/Y. We will center the glow on it.
      mouseX.set(e.clientX)
      mouseY.set(e.clientY)
    }

    // Initialize to slightly off-center initially if not moved
    mouseX.set(typeof window !== 'undefined' ? window.innerWidth / 2 : 0)
    mouseY.set(typeof window !== 'undefined' ? window.innerHeight / 2 : 0)

    window.addEventListener('mousemove', handleMouseMove)
    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
    }
  }, [mouseX, mouseY])

  const background = useMotionTemplate`radial-gradient(800px circle at ${springX}px ${springY}px, var(--primary) 0%, transparent 60%)`

  if (!isMounted) return null

  return (
    <motion.div
      className="pointer-events-none absolute inset-0 z-0 h-full w-full opacity-10 dark:opacity-20 transition-opacity duration-1000 mix-blend-screen"
      style={{
        background,
      }}
    />
  )
}
