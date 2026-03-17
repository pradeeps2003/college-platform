'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { Activity } from 'lucide-react'
import { BrowseSearch } from '@/components/browse-search'

interface BrowseToolbarProps {
    totalResults: number
}

export function BrowseToolbar({ totalResults }: BrowseToolbarProps) {
    const searchParams = useSearchParams()
    const currentYear = searchParams.get('sem')
    const currentDept = searchParams.get('dept')
    const currentType = searchParams.get('type')

    return (
        <div className="flex flex-col md:flex-row items-center justify-between pb-8 gap-4 border-b border-border/10 mb-10">
            <div className="flex flex-col gap-1">
                <div className="flex items-baseline gap-4">
                    <h2 className="text-4xl font-bold tracking-tight uppercase text-foreground">
                        Material <span className="text-primary">Archive</span>
                    </h2>
                    <div className="h-4 w-[2px] bg-primary/20 hidden md:block" />
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em] hidden md:block">
                        {currentDept && currentDept !== 'all' ? currentDept : 'Global Archive'}
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                        <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
                        <span className="text-[11px] font-bold text-muted-foreground">
                            {totalResults.toLocaleString()} {currentType && currentType !== 'all' ? `${currentType.toUpperCase()} ` : ''}Results
                            {currentYear ? ` · Year ${currentYear}` : ''}
                        </span>
                    </div>
                </div>
            </div>

            <BrowseSearch />
        </div>
    )
}
