'use client'

import { X, RotateCcw } from 'lucide-react'
import { useRouter, useSearchParams } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'

export function ActiveFilters({ className = '' }: { className?: string }) {
    const router = useRouter()
    const searchParams = useSearchParams()

    const activeFilters: { key: string, label: string, value: string }[] = []

    const dept = searchParams.get('dept')
    const sem = searchParams.get('sem')
    const q = searchParams.get('q')
    const type = searchParams.get('type')

    if (dept && dept !== 'all') activeFilters.push({ key: 'dept', label: 'Domain', value: dept })
    if (sem && sem !== 'all') activeFilters.push({ key: 'sem', label: 'Year', value: `Y${sem}` })
    if (q) activeFilters.push({ key: 'q', label: 'Search', value: `"${q}"` })
    if (type && type !== 'all') activeFilters.push({ key: 'type', label: 'Format', value: type.toUpperCase() })

    const removeFilter = (key: string) => {
        const params = new URLSearchParams(searchParams.toString())
        params.delete(key)
        router.push(`/browse?${params.toString()}`, { scroll: false })
    }

    if (activeFilters.length === 0) return null

    return (
        <div className={`flex flex-wrap items-center gap-2.5 mb-10 ${className}`}>
            <AnimatePresence mode="popLayout">
                {activeFilters.map((filter) => (
                    <motion.div
                        key={`${filter.key}-${filter.value}`}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        layout
                        className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-primary/5 border border-primary/10 text-foreground group transition-colors"
                    >
                        <span className="text-[10px] font-bold uppercase tracking-wider text-primary/60">{filter.label}</span>
                        <div className="h-3 w-[1px] bg-primary/20" />
                        <span className="text-[11px] font-bold">{filter.value}</span>
                        <button
                            onClick={() => removeFilter(filter.key)}
                            className="hover:scale-110 transition-transform ml-1"
                        >
                            <X className="h-3 w-3 text-primary" />
                        </button>
                    </motion.div>
                ))}
            </AnimatePresence>

            <button
                onClick={() => router.push('/browse')}
                className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-foreground dark:text-white/90 hover:text-red-500 transition-all px-4 py-2 rounded-xl border border-border/40 dark:border-white/10 bg-secondary/30 dark:bg-white/5 hover:bg-red-500/5 dark:hover:bg-red-500/10 backdrop-blur-md group/reset shadow-sm"
            >
                <RotateCcw className="h-3 w-3 group-hover/reset:-rotate-45 transition-transform" />
                Clear All
            </button>
        </div>
    )
}
