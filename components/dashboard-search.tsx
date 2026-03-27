'use client'

import { Search, X } from 'lucide-react'
import { cn } from '@/lib/utils'

interface DashboardSearchProps {
    value: string
    onChange: (value: string) => void
    placeholder?: string
    className?: string
}

export function DashboardSearch({ value, onChange, placeholder = "Search database...", className }: DashboardSearchProps) {
    const handleClear = () => {
        onChange('')
    }

    return (
        <div className={cn("relative flex items-center w-full max-w-xs", className)}>
            <Search className="absolute left-3 h-3.5 w-3.5 text-muted-foreground/50 pointer-events-none" />
            <input
                type="text"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                className="w-full h-9 pl-9 pr-8 rounded-xl bg-secondary/30 dark:bg-white/5 border border-border/40 text-sm font-medium text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:border-primary/50 focus:bg-white dark:focus:bg-white/10 transition-all duration-200"
            />
            {value && (
                <button
                    type="button"
                    onClick={handleClear}
                    className="absolute right-2.5 text-muted-foreground/40 hover:text-foreground transition-colors"
                >
                    <X className="h-3.5 w-3.5" />
                </button>
            )}
        </div>
    )
}
