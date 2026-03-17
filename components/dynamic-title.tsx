'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const phrases = [
    { text: 'Medical Minds.', color: 'from-primary via-primary/70 to-primary' },
    { text: 'Expert Doctors.', color: 'from-blue-600 via-blue-400 to-blue-600' },
    { text: 'Clinical Research.', color: 'from-emerald-600 via-emerald-400 to-emerald-600' },
    { text: 'Healthcare Pros.', color: 'from-indigo-600 via-indigo-400 to-indigo-600' },
]

const browsePhrases = [
    { text: 'Resource Library.', color: 'from-primary via-primary/70 to-primary' },
    { text: 'Knowledge Base.', color: 'from-blue-600 via-blue-400 to-blue-600' },
    { text: 'Academic Records.', color: 'from-emerald-600 via-emerald-400 to-emerald-600' },
    { text: 'Expert Insights.', color: 'from-indigo-600 via-indigo-400 to-indigo-600' },
]

interface Phrase {
    text: string
    color: string
}

const defaultPhrases: Phrase[] = [
    { text: 'Medical Minds.', color: 'from-primary via-primary/70 to-primary' },
    { text: 'Expert Doctors.', color: 'from-blue-600 via-blue-400 to-blue-600' },
    { text: 'Clinical Research.', color: 'from-emerald-600 via-emerald-400 to-emerald-600' },
    { text: 'Healthcare Pros.', color: 'from-indigo-600 via-indigo-400 to-indigo-600' },
]

export function DynamicHeroTitle({ 
    baseText = "The Hub for", 
    phrases = defaultPhrases,
    className = "text-6xl md:text-8xl"
}: { 
    baseText?: string
    phrases?: Phrase[]
    className?: string
}) {
    const [index, setIndex] = useState(0)

    useEffect(() => {
        const timer = setInterval(() => {
            setIndex((prev) => (prev + 1) % phrases.length)
        }, 3000)
        return () => clearInterval(timer)
    }, [phrases.length])

    return (
        <h1 className={`${className} font-bold tracking-tight leading-[0.85] text-foreground mb-8 min-h-[1.7em]`}>
            {baseText} <br />
            <div className="relative inline-block mt-2">
                <AnimatePresence mode="wait">
                    <motion.span
                        key={phrases[index].text}
                        initial={{ y: 20, opacity: 0, rotateX: -90 }}
                        animate={{ y: 0, opacity: 1, rotateX: 0 }}
                        exit={{ y: -20, opacity: 0, rotateX: 90 }}
                        transition={{ duration: 0.6, ease: "circOut" }}
                        className={`bg-gradient-to-r ${phrases[index].color} bg-clip-text text-transparent tracking-tighter pb-4 inline-block drop-shadow-sm`}
                    >
                        {phrases[index].text}
                    </motion.span>
                </AnimatePresence>
            </div>
        </h1>
    )
}
