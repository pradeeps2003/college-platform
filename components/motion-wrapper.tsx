'use client'

import { motion, HTMLMotionProps } from 'framer-motion'
import { ReactNode } from 'react'

interface MotionWrapperProps extends HTMLMotionProps<'div'> {
    children: ReactNode
    delay?: number
}

export function FadeIn({ children, delay = 0, ...props }: MotionWrapperProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ type: 'spring', stiffness: 100, damping: 15, delay }}
            {...props}
        >
            {children}
        </motion.div>
    )
}

export function ScaleIn({ children, delay = 0, ...props }: MotionWrapperProps) {
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ type: 'spring', stiffness: 200, damping: 15, delay }}
            {...props}
        >
            {children}
        </motion.div>
    )
}

export function SlideIn({ children, delay = 0, direction = 'left', ...props }: MotionWrapperProps & { direction?: 'left' | 'right' | 'up' | 'down' }) {
    const variants = {
        left: { x: -40, opacity: 0 },
        right: { x: 40, opacity: 0 },
        up: { y: 40, opacity: 0 },
        down: { y: -40, opacity: 0 }
    }

    return (
        <motion.div
            initial={variants[direction]}
            whileInView={{ x: 0, y: 0, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ type: 'spring', stiffness: 100, damping: 20, delay }}
            {...props}
        >
            {children}
        </motion.div>
    )
}
