'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useState } from 'react'
import { Search, X } from 'lucide-react'

export function BrowseSearch() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const [query, setQuery] = useState(searchParams.get('q') || '')

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        const params = new URLSearchParams(searchParams.toString())
        if (query.trim()) {
            params.set('q', query.trim())
        } else {
            params.delete('q')
        }
        router.push(`/browse?${params.toString()}`)
    }

    const handleClear = () => {
        setQuery('')
        const params = new URLSearchParams(searchParams.toString())
        params.delete('q')
        router.push(`/browse?${params.toString()}`)
    }

    return (
        <form key={searchParams.get('q') || 'browse-search'} onSubmit={handleSubmit} className="relative flex items-center w-full max-w-xs">
            <Search className="absolute left-3 h-3.5 w-3.5 text-muted-foreground/50 pointer-events-none" />
            <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search materials..."
                className="w-full h-9 pl-9 pr-8 rounded-xl bg-secondary/30 dark:bg-white/5 border border-border/40 text-sm font-medium text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:border-primary/50 focus:bg-white dark:focus:bg-white/10 transition-all duration-200"
            />
            {query && (
                <button
                    type="button"
                    onClick={handleClear}
                    className="absolute right-2.5 text-muted-foreground/40 hover:text-foreground transition-colors"
                >
                    <X className="h-3.5 w-3.5" />
                </button>
            )}
        </form>
    )
}
