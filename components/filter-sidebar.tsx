'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { motion } from 'framer-motion'
import { 
    Stethoscope, 
    GraduationCap, 
    FilterX, 
    Activity, 
    HeartPulse, 
    Dna, 
    Microscope, 
    Pill, 
    FlaskConical, 
    Syringe, 
    Baby, 
    Brain, 
    Radiation,
    FileText,
    Image as ImageIcon,
    Video,
    Music,
    Search,
    ChevronDown,
    LayoutGrid,
    BookOpen,
    Tags,
    Sparkles,
    Fingerprint,
    SlidersHorizontal
} from 'lucide-react'
import { AnatomicalHeart } from '@/components/icons/anatomical-heart'

interface FilterSidebarProps {
    dynamicDepartments?: { name: string; icon: React.ReactNode }[]
}

const resourceTypes = [
    { id: 'pdf', label: 'Documents', icon: <FileText className="h-3.5 w-3.5" /> },
    { id: 'image', label: 'Images', icon: <ImageIcon className="h-3.5 w-3.5" /> },
]

export function FilterSidebar({ dynamicDepartments = [] }: FilterSidebarProps) {
    const router = useRouter()
    const searchParams = useSearchParams()

    const currentDept = searchParams.get('dept') || 'all'
    const currentSort = searchParams.get('sort') || 'newest'
    const currentSem = searchParams.get('sem') || ''
    const currentType = searchParams.get('type') || 'all'


    const updateFilter = (key: string, value: string) => {
        const params = new URLSearchParams(searchParams.toString())
        if (!value || value === 'all') {
            params.delete(key)
        } else {
            params.set(key, value)
        }
        router.push(`/browse?${params.toString()}`, { scroll: false })
    }

    const hasFilters = searchParams.toString().length > 0

    return (
        <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6 h-full"
        >
            <div className="bg-white/50 dark:bg-card/30 backdrop-blur-xl p-6 rounded-[2.5rem] border border-border/40 shadow-xl shadow-black/[0.02] overflow-hidden relative group">
                <div className="absolute -top-24 -right-24 w-48 h-48 bg-primary/5 rounded-full blur-3xl group-hover:bg-primary/10 transition-colors duration-500" />
                
                <div className="relative z-10 space-y-7">
                    {/* Header */}
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="relative">
                                <Fingerprint className="h-4 w-4 text-primary animate-pulse" />
                                <Sparkles className="h-2 w-2 text-primary absolute -top-1 -right-1 animate-bounce" />
                            </div>
                            <h3 className="font-bold text-[12px] uppercase tracking-[0.2em] text-foreground flex items-center gap-2">
                                Filters
                            </h3>
                        </div>
                        {hasFilters && (
                            <button 
                                onClick={() => router.push('/browse')}
                                className="flex items-center gap-1.5 py-1.5 px-3 rounded-xl bg-secondary/50 dark:bg-white/5 text-[9px] font-bold uppercase tracking-widest text-foreground dark:text-white/90 hover:text-red-500 hover:bg-red-500/10 transition-all border border-border/40 dark:border-white/10 backdrop-blur-md group/reset"
                            >
                                <FilterX className="h-3 w-3 group-hover/reset:rotate-12 transition-transform" />
                                RESET
                            </button>
                        )}
                    </div>

                    {/* Sorting Section */}
                    <div className="space-y-2.5">
                        <label className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground/50 ml-1">Sort Order</label>
                        <div className="grid grid-cols-2 gap-2">
                            {[
                                { id: 'newest', label: 'Recent' },
                                { id: 'popular', label: 'Popular' }
                            ].map((s) => (
                                <button
                                    key={s.id}
                                    onClick={() => updateFilter('sort', s.id)}
                                    className={`py-2 px-3 rounded-xl text-[10px] font-bold transition-all border ${currentSort === s.id ? 'bg-primary text-white border-transparent' : 'bg-secondary/30 dark:bg-white/5 border-transparent text-muted-foreground hover:text-primary'}`}
                                >
                                    {s.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Academic Year/Semester Section */}
                    <div className="space-y-3">
                        <label className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground/50 ml-1">Academic Year</label>
                        <div className="flex flex-wrap gap-2">
                            {['all', '1', '2', '3', '4', '5'].map(y => (
                                <button
                                    key={y}
                                    onClick={() => updateFilter('sem', y)}
                                    className={`h-10 min-w-[40px] px-3 flex items-center justify-center rounded-xl text-[11px] font-bold transition-all border ${currentSem === y || (y === 'all' && !currentSem) ? 'bg-primary text-white border-transparent shadow-md' : 'bg-secondary/30 dark:bg-white/5 border-transparent text-muted-foreground hover:text-primary'}`}
                                >
                                    {y === 'all' ? 'All' : `Y${y}`}
                                </button>
                            ))}
                        </div>
                    </div>

                    <Separator className="opacity-40" />

                    {/* Resource Type Section */}
                    <div className="space-y-3">
                        <label className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground/50 ml-1">File Type</label>
                        <div className="grid grid-cols-2 gap-2">
                            <button
                                onClick={() => updateFilter('type', 'all')}
                                className={`flex items-center gap-2 py-2 px-3 rounded-xl text-[10px] font-bold transition-all border ${currentType === 'all' ? 'bg-primary text-white border-transparent shadow-sm' : 'bg-secondary/30 dark:bg-white/5 border-transparent text-muted-foreground hover:text-primary'}`}
                            >
                                <LayoutGrid className="h-3.5 w-3.5" />
                                All
                            </button>
                            {resourceTypes.map((type) => (
                                <button
                                    key={type.id}
                                    onClick={() => updateFilter('type', type.id)}
                                    className={`flex items-center gap-2 py-2 px-3 rounded-xl text-[10px] font-bold transition-all border ${currentType === type.id ? 'bg-primary text-white border-transparent shadow-sm' : 'bg-secondary/30 dark:bg-white/5 border-transparent text-muted-foreground hover:text-primary'}`}
                                >
                                    {type.icon}
                                    {type.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    <Separator className="opacity-40" />

                    {/* Domain Grid Section */}
                    <div className="space-y-3">
                        <div className="flex items-center justify-between ml-1">
                            <label className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground/50">Department</label>
                            <span className="text-[9px] font-bold text-primary/60">{dynamicDepartments.length} Subjects</span>
                        </div>
                        <div className="space-y-1 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                            <button
                                onClick={() => updateFilter('dept', 'all')}
                                className={`w-full text-left px-4 py-2.5 rounded-xl text-[11px] font-bold transition-all flex items-center gap-3 group ${currentDept === 'all' ? 'bg-primary text-white shadow-sm' : 'hover:bg-primary/5 text-muted-foreground hover:text-primary'}`}
                            >
                                <div className={`p-1.5 rounded-lg border ${currentDept === 'all' ? 'bg-white/20 border-white/20' : 'bg-secondary border-border/50 group-hover:bg-primary/10 transition-colors'}`}>
                                    <LayoutGrid className="h-3.5 w-3.5" />
                                </div>
                                All Materials
                            </button>
                            
                            {dynamicDepartments.map((dept) => (
                                <button
                                    key={dept.name}
                                    onClick={() => updateFilter('dept', dept.name)}
                                    className={`w-full text-left px-4 py-2.5 rounded-xl text-[11px] font-bold transition-all flex items-center gap-3 group ${currentDept === dept.name ? 'bg-primary text-white shadow-sm' : 'hover:bg-primary/5 text-muted-foreground hover:text-primary'}`}
                                >
                                    <div className={`p-1.5 rounded-lg border ${currentDept === dept.name ? 'bg-white/20 border-white/20' : 'bg-secondary border-border/50 group-hover:bg-primary/10 transition-colors'}`}>
                                        {dept.icon}
                                    </div>
                                    <span className="truncate">{dept.name}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                </div>
            </div>
        </motion.div>
    )
}
