'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'

interface Specialty {
    name: string
    icon: React.ReactNode
    desc: string
}

interface DomainGridProps {
    specialties: Specialty[]
    specialtyCounts: Record<string, number>
}

export function DomainGrid({ specialties, specialtyCounts }: DomainGridProps) {
    const [showAll] = useState(false)

    const visibleSpecialties = showAll ? specialties : specialties.slice(0, 8)

    return (
        <div className="container mx-auto max-w-7xl">
            <div className="flex flex-col items-center text-center mb-16">
                <h2 className="text-4xl md:text-5xl font-bold tracking-tighter text-foreground mb-3 uppercase">Study Fields</h2>
                <p className="text-muted-foreground font-medium max-w-md text-sm opacity-70">
                    Explore {specialties.length}+ subjects and study areas systematically categorized for easy learning.
                </p>
            </div>

            <motion.div
                layout
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
            >
                <AnimatePresence mode="popLayout">
                    {visibleSpecialties.map((specialty, i) => (
                        <motion.div
                            key={specialty.name}
                            layout
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            transition={{ duration: 0.4, delay: i * 0.05 }}
                        >
                            <Link href={`/browse?dept=${encodeURIComponent(specialty.name)}`} className="group block h-full">
                                <div className="h-full p-6 rounded-[2.5rem] bg-white dark:bg-card border border-border/40 hover:border-primary/40 hover:shadow-[0_20px_50px_rgba(0,0,0,0.04)] transition-all duration-500 relative overflow-hidden group">
                                    {/* Hover Glow */}
                                    <div className="absolute inset-0 bg-gradient-to-br from-primary/[0.03] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                                    <div className="relative z-10">
                                        <div className="bg-secondary text-primary w-11 h-11 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 group-hover:bg-primary/10 transition-all duration-500 shadow-sm border border-border/20">
                                            {specialty.icon}
                                        </div>
                                        <h3 className="text-base font-bold text-foreground mb-2 group-hover:text-primary transition-colors flex justify-between items-center tracking-tight">
                                            {specialty.name}
                                            <span className="text-[10px] font-bold bg-secondary px-2 py-1 rounded-full text-muted-foreground group-hover:text-primary transition-all tabular-nums">
                                                {specialtyCounts[specialty.name] || 0}
                                            </span>
                                        </h3>
                                        <p className="text-[12px] text-muted-foreground leading-relaxed font-medium">
                                            {specialty.desc}
                                        </p>
                                    </div>
                                </div>
                            </Link>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </motion.div>
        </div>
    )
}
