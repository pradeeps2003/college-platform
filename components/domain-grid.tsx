'use client'

import React, { useEffect, useState, useRef } from 'react'
import Link from 'next/link'
import { cn } from '@/lib/utils'

interface Specialty {
    name: string
    icon: React.ReactNode
    desc: string
}

interface DomainGridProps {
    specialties: Specialty[]
    specialtyCounts: Record<string, number>
    direction?: 'left' | 'right'
    speed?: 'fast' | 'normal' | 'slow'
    pauseOnHover?: boolean
}

export function DomainGrid({ 
    specialties, 
    specialtyCounts,
    direction = 'left',
    speed = 'normal',
    pauseOnHover = true
}: DomainGridProps) {
    const containerRef = useRef<HTMLDivElement>(null)
    const scrollerRef = useRef<HTMLUListElement>(null)
    const [start, setStart] = useState(false)

    useEffect(() => {
        addAnimation()
    }, [])

    function addAnimation() {
        if (containerRef.current && scrollerRef.current) {
            const scrollerContent = Array.from(scrollerRef.current.children)

            scrollerContent.forEach((item) => {
                const duplicatedItem = item.cloneNode(true)
                if (scrollerRef.current) {
                    scrollerRef.current.appendChild(duplicatedItem)
                }
            })

            getDirection()
            getSpeed()
            setStart(true)
        }
    }

    const getDirection = () => {
        if (containerRef.current) {
            if (direction === 'left') {
                containerRef.current.style.setProperty('--animation-direction', 'forwards')
            } else {
                containerRef.current.style.setProperty('--animation-direction', 'reverse')
            }
        }
    }

    const getSpeed = () => {
        if (containerRef.current) {
            if (speed === 'fast') {
                containerRef.current.style.setProperty('--animation-duration', '20s')
            } else if (speed === 'normal') {
                containerRef.current.style.setProperty('--animation-duration', '40s')
            } else {
                containerRef.current.style.setProperty('--animation-duration', '80s')
            }
        }
    }

    return (
        <div className="container mx-auto px-0 md:px-0">
            <div className="flex flex-col items-center text-center mb-16 px-4">
                <h2 className="text-4xl md:text-5xl font-bold tracking-tighter text-foreground mb-3 uppercase">Study Fields</h2>
                <p className="text-muted-foreground font-medium max-w-md text-sm opacity-70">
                    Explore {specialties.length}+ subjects and study areas systematically categorized for easy learning.
                </p>
            </div>

            <div
                ref={containerRef}
                className={cn(
                    "scroller relative z-20 max-w-7xl overflow-hidden [mask-image:linear-gradient(to_right,transparent,white_10%,white_90%,transparent)] mx-auto",
                )}
            >
                <ul
                    ref={scrollerRef}
                    className={cn(
                        "flex min-w-full shrink-0 gap-6 py-4 w-max flex-nowrap",
                        start && "animate-scroll",
                        pauseOnHover && "hover:[animation-play-state:paused]"
                    )}
                >
                    {specialties.map((specialty, idx) => (
                        <li
                            key={specialty.name}
                            className="w-[300px] max-w-full relative shrink-0"
                        >
                            <Link href={`/browse?dept=${encodeURIComponent(specialty.name)}`} className="group block h-full">
                                <div className="h-full p-6 pb-8 rounded-[2rem] bg-white dark:bg-card border border-border/40 hover:border-primary/40 hover:shadow-[0_20px_50px_rgba(0,0,0,0.04)] transition-all duration-500 relative overflow-hidden group">
                                    {/* Hover Glow */}
                                    <div className="absolute inset-0 bg-gradient-to-br from-primary/[0.03] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                                    <div className="relative z-10">
                                        <div className="bg-secondary text-primary w-11 h-11 rounded-xl flex items-center justify-center mb-5 group-hover:scale-110 group-hover:bg-primary/10 transition-all duration-500 shadow-sm border border-border/20">
                                            {specialty.icon}
                                        </div>
                                        <h3 className="text-base font-bold text-foreground mb-3 group-hover:text-primary transition-colors flex justify-between items-center tracking-tight">
                                            {specialty.name}
                                            <span className="text-[10px] font-bold bg-secondary px-2 py-1 rounded-full text-muted-foreground group-hover:text-primary transition-all tabular-nums">
                                                {specialtyCounts[specialty.name] || 0}
                                            </span>
                                        </h3>
                                        <p className="text-[11px] text-muted-foreground leading-relaxed font-medium line-clamp-2">
                                            {specialty.desc}
                                        </p>
                                    </div>
                                </div>
                            </Link>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    )
}
