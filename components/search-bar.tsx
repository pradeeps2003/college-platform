'use client'

import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Search, Sparkles } from 'lucide-react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

export function SearchBar({ className }: { className?: string }) {
    const router = useRouter()
    const searchParams = useSearchParams()

    const [query, setQuery] = useState(searchParams.get('q') || '')
    const [isFocused, setIsFocused] = useState(false)

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault()
        const params = new URLSearchParams(searchParams.toString())
        
        if (query.trim()) {
            params.set('q', query.trim())
        } else {
            params.delete('q')
        }
        
        router.push(`/browse?${params.toString()}`, { scroll: false })
    }

    return (
        <motion.form
            onSubmit={handleSearch}
            key={searchParams.get('q') || 'search'}
            className={`flex w-full items-center p-1.5 rounded-[1.8rem] bg-white/80 dark:bg-card/40 backdrop-blur-xl border transition-all duration-500 relative ${isFocused ? 'border-primary shadow-[0_0_30px_rgba(var(--primary-rgb),0.1)]' : 'border-border/40 shadow-xl shadow-black/5'} ${className}`}
        >
            {/* Intelligent Glow Background */}
            <AnimatePresence>
                {isFocused && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5 pointer-events-none rounded-[1.8rem]"
                    />
                )}
            </AnimatePresence>

            <div className="relative flex-1 flex items-center">
                <div className={`pl-5 transition-colors duration-500 ${isFocused ? 'text-primary' : 'text-muted-foreground/50'}`}>
                    <Search className="h-4 w-4" />
                </div>
                
                <Input
                    type="search"
                    placeholder="Search study notes, materials, topics..."
                    className="flex-1 h-11 border-none bg-transparent focus-visible:ring-0 text-foreground text-sm font-semibold placeholder:text-muted-foreground/30 placeholder:font-medium pl-3"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                />

                {/* Keyboard Shortcut Hint (Desktop) */}
                <div className="hidden md:flex items-center gap-1 mr-3 px-2 py-1 rounded-md bg-secondary/50 border border-border/40 text-[9px] font-bold text-muted-foreground/50 uppercase tracking-widest pointer-events-none">
                    <span className="text-[11px]">⌘</span> K
                </div>
            </div>

            <Button 
                type="submit" 
                className="rounded-full px-6 h-10 bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-[10px] uppercase tracking-[0.15em] shadow-lg shadow-primary/10 transition-all active:scale-95 group relative overflow-hidden"
            >
                <span className="relative z-10 flex items-center gap-2">
                    Search
                    <Sparkles className="h-3 w-3 group-hover:rotate-12 transition-transform" />
                </span>
                <motion.div 
                    className="absolute inset-0 bg-white/20"
                    initial={{ x: '-100%' }}
                    whileHover={{ x: '100%' }}
                    transition={{ duration: 0.6 }}
                />
            </Button>
        </motion.form>
    )
}
