'use client'

import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
    Download, 
    FileText, 
    FilePieChart,
    FileType,
    Activity,
    ShieldCheck,
    HardDrive,
    Loader2,
    User,
    Calendar,
    BookOpen,
    Hash,
    Microscope
} from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { format } from 'date-fns'
import { motion } from 'framer-motion'
import { useState } from 'react'
import { toast } from 'sonner'

export interface Resource {
    id: string
    title: string
    description?: string
    subject: string
    department: string
    semester?: number
    file_url: string
    file_name: string
    file_type: string
    file_size: number
    status: 'pending' | 'approved' | 'rejected'
    created_at: string
    download_count: number
    uploaded_by: string
    tags?: string[]
    topic?: string
    rejection_reason?: string
    profiles?: {
        full_name: string
    }
}

export function ResourceCard({ resource }: { resource: Resource }) {
    const [isDownloading, setIsDownloading] = useState(false)

    const formatSize = (bytes: number) => {
        if (bytes === 0) return '0 B'
        const k = 1024
        const sizes = ['B', 'KB', 'MB', 'GB']
        const i = Math.floor(Math.log(bytes) / Math.log(k))
        return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]
    }

    const getFileIcon = (type: string) => {
        const lowerType = type.toLowerCase()
        if (lowerType.includes('pdf')) return <FileText className="h-4 w-4 text-rose-500" />
        if (lowerType.includes('image')) return <FilePieChart className="h-4 w-4 text-sky-500" />
        return <FileType className="h-4 w-4 text-primary" />
    }

    const handleDownload = async (e: React.MouseEvent) => {
        e.preventDefault()
        e.stopPropagation()
        
        if (isDownloading) return
        
        setIsDownloading(true)
        const toastId = toast.loading(`Preparing ${resource.file_name}...`)

        try {
            const response = await fetch(resource.file_url)
            if (!response.ok) throw new Error('Network response was not ok')
            
            const blob = await response.blob()
            const url = window.URL.createObjectURL(blob)
            const link = document.createElement('a')
            link.href = url
            // Use the actual filename from the resource
            link.setAttribute('download', resource.file_name || `${resource.title.replace(/\s+/g, '_')}.file`)
            document.body.appendChild(link)
            link.click()
            
            // Cleanup
            link.parentNode?.removeChild(link)
            window.URL.revokeObjectURL(url)
            
            // Increment download count in background (UX only here, actual increments handled via API usually)
            toast.success('Download started', { id: toastId })
        } catch (error) {
            console.error('Download failed:', error)
            toast.error('Download failed. Opening in new tab instead.', { id: toastId })
            // Fallback: Just open the URL in a new tab if the blob trick fails
            window.open(resource.file_url, '_blank')
        } finally {
            setIsDownloading(false)
        }
    }

    return (
        <motion.div
            whileHover={{ y: -5 }}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="group relative h-full"
        >
            {/* Ultra-Refined Compact Cross Badge */}
            <div className="absolute -top-2.5 -left-2 z-30 transition-all duration-500 group-hover:-translate-y-1">
                <div className="bg-slate-900 dark:bg-primary text-white text-[8px] font-bold uppercase tracking-[0.2em] px-3.5 py-1.5 rounded-lg shadow-xl shadow-black/20 flex items-center gap-2 border border-white/10 backdrop-blur-md">
                    <div className="h-1.5 w-1.5 rounded-full bg-green-400" />
                    {resource.department}
                </div>
            </div>

            <Card className="h-full border border-border/40 bg-white/80 dark:bg-slate-900/50 backdrop-blur-xl rounded-[1.5rem] overflow-hidden transition-all duration-500 group-hover:border-primary/30 group-hover:shadow-[0_20px_50px_-20px_rgba(0,0,0,0.1)] dark:group-hover:shadow-[0_20px_50px_-20px_rgba(var(--primary-rgb),0.15)]">
                <div className="flex flex-col h-full p-6">
                    {/* Compact Header */}
                    <div className="flex items-center justify-between mb-4">
                        <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-white/5 border border-border/20">
                            {getFileIcon(resource.file_type)}
                        </div>
                        <div className="flex items-center gap-3">
                            <span className="text-[9px] font-bold text-muted-foreground/40 tracking-widest">#{resource.id.slice(0, 6)}</span>
                            <div className="px-2.5 py-1 rounded-lg bg-slate-50 dark:bg-white/5 border border-border/20 text-[9px] font-bold text-muted-foreground uppercase flex items-center gap-1.5">
                                <HardDrive className="h-2.5 w-2.5" />
                                {formatSize(resource.file_size)}
                            </div>
                        </div>
                    </div>

                    {/* Title & Meta */}
                    <div className="space-y-1.5 mb-6">
                        <h3 className="text-lg font-bold text-foreground group-hover:text-primary transition-colors leading-tight tracking-tight line-clamp-2">
                            {resource.title}
                        </h3>
                        <div className="flex items-center gap-2 text-[9px] font-medium text-muted-foreground/60 uppercase tracking-widest">
                            <Activity className="h-2.5 w-2.5 text-primary/40" />
                            <span>Verified Material</span>
                        </div>
                    </div>

                    {/* Simplified Actions Grid */}
                    <div className="mt-auto space-y-3">
                        <div className="grid grid-cols-2 gap-2">
                             <Button 
                                variant="outline" 
                                className="h-10 rounded-xl border-border/50 hover:border-primary/50 dark:border-white/10 dark:hover:border-primary/50 bg-white/50 dark:bg-white/5 text-foreground dark:text-white backdrop-blur-md font-bold uppercase text-[9px] tracking-widest group/dl relative overflow-hidden transition-all shadow-sm"
                                onClick={handleDownload}
                                disabled={isDownloading}
                            >
                                {isDownloading ? (
                                    <Loader2 className="h-3.5 w-3.5 animate-spin text-primary" />
                                ) : (
                                    <>
                                        <Download className="mr-2 h-3 w-3 group-hover/dl:translate-y-0.5 transition-transform" />
                                        Download
                                    </>
                                )}
                            </Button>
                            
                            <Dialog>
                                <DialogTrigger asChild>
                                    <Button 
                                        className="w-full h-10 rounded-xl bg-primary text-white hover:bg-primary/90 font-bold uppercase text-[9px] tracking-widest shadow-lg shadow-primary/10 border-none group/details"
                                    >
                                        View Details
                                        <ShieldCheck className="ml-2 h-3 w-3 group-hover/details:scale-110 transition-transform" />
                                    </Button>
                                </DialogTrigger>
                                <DialogContent className="max-w-[380px] rounded-[2rem] p-0 overflow-hidden border-border/40 bg-white dark:bg-slate-900 shadow-2xl">
                                    <div className="relative p-8 space-y-6">
                                        <DialogHeader className="relative z-10 space-y-4 text-left">
                                            <div className="flex items-center gap-2">
                                                <Badge variant="outline" className="text-[7px] font-black uppercase tracking-[0.2em] text-primary border-primary/20 bg-primary/5 px-2.5 py-0.5 rounded-full shrink-0">
                                                    {resource.department}
                                                </Badge>
                                                <Badge variant="outline" className="text-[7px] font-black uppercase tracking-[0.2em] text-muted-foreground/40 border-border/40 px-2.5 py-0.5 rounded-full shrink-0">
                                                    Level {resource.semester}
                                                </Badge>
                                            </div>
                                            <DialogTitle className="text-xl font-black tracking-tighter uppercase text-slate-900 dark:text-white leading-[1.1] text-left">
                                                {resource.title}
                                            </DialogTitle>
                                        </DialogHeader>
                                        
                                        <div className="flex items-center justify-between gap-4 text-[8px] font-black uppercase tracking-widest text-muted-foreground/60 border-y border-border/40 py-4 relative z-10">
                                            <div className="flex items-center gap-2.5 min-w-0">
                                                <User className="h-3 w-3 text-primary/40 shrink-0" />
                                                <span className="text-slate-900 dark:text-white tracking-tight truncate">{resource.profiles?.full_name || 'Verified Member'}</span>
                                            </div>
                                            <div className="flex items-center gap-2.5 shrink-0">
                                                <Calendar className="h-3 w-3 text-primary/40" />
                                                <span className="text-slate-900 dark:text-white tracking-tight">{format(new Date(resource.created_at), 'MMM d, yyyy')}</span>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-3 relative z-10">
                                            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-white/5 border border-border/40 hover:border-primary/20 transition-all">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <BookOpen className="h-2.5 w-2.5 text-primary/40" />
                                                    <p className="text-[7px] font-black text-muted-foreground/40 uppercase tracking-widest">Subject</p>
                                                </div>
                                                <p className="font-black text-xs tracking-tighter text-slate-900 dark:text-white uppercase line-clamp-1">{resource.subject}</p>
                                            </div>
                                            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-white/5 border border-border/40 hover:border-primary/20 transition-all">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <Hash className="h-2.5 w-2.5 text-primary/40" />
                                                    <p className="text-[7px] font-black text-muted-foreground/40 uppercase tracking-widest">Topic</p>
                                                </div>
                                                <p className="font-black text-xs tracking-tighter text-slate-900 dark:text-white uppercase line-clamp-1">{resource.topic || 'General'}</p>
                                            </div>
                                        </div>

                                        <div className="p-5 rounded-2xl bg-primary/5 border border-primary/10 relative z-10">
                                            <h3 className="flex items-center gap-2 text-[7px] font-black uppercase tracking-[0.3em] text-primary mb-2">
                                                <Microscope className="h-2.5 w-2.5" />
                                                Material Specs
                                            </h3>
                                            <p className="text-[10px] font-bold text-muted-foreground/80 leading-relaxed italic line-clamp-4">
                                                "{resource.description || 'No specific description provided.'}"
                                            </p>
                                        </div>

                                        <div className="pt-2 relative z-10">
                                            <Button 
                                                variant="ghost" 
                                                className="w-full h-10 rounded-xl font-black text-[9px] uppercase tracking-widest text-muted-foreground hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5 transition-all text-center"
                                                onClick={() => {
                                                    // Dismmiss handled by Radix
                                                }}
                                            >
                                                Close Details
                                            </Button>
                                        </div>
                                    </div>
                                </DialogContent>
                            </Dialog>
                        </div>
                    </div>
                </div>
            </Card>
        </motion.div>
    )
}
