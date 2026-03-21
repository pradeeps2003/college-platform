'use client'

import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
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
                                <DialogContent className="sm:max-w-md rounded-[2.5rem] border-border/40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl shadow-2xl p-8 overflow-hidden">
                                    <div className="absolute top-0 left-0 w-full h-40 bg-gradient-to-b from-primary/10 via-primary/5 to-transparent pointer-events-none" />
                                                                        <DialogHeader className="mb-8 relative z-10">
                                        <div className="flex items-center gap-3 mb-5">
                                            <div className="bg-primary/10 text-primary text-[9px] font-bold uppercase tracking-[0.2em] px-3 py-1.5 rounded-lg flex items-center gap-2">
                                                <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                                                {resource.department}
                                            </div>
                                            <div className="bg-secondary/50 dark:bg-white/5 text-muted-foreground text-[9px] font-bold uppercase tracking-[0.2em] px-3 py-1.5 rounded-lg border border-border/40">
                                                Year {resource.semester}
                                            </div>
                                        </div>
                                        <DialogTitle className="text-xl md:text-2xl font-bold tracking-tight leading-[1.1] text-left line-clamp-2">
                                            {resource.title}
                                        </DialogTitle>
                                    </DialogHeader>
                                    
                                    <div className="space-y-8 relative z-10">
                                         <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-[10px] font-bold uppercase tracking-widest text-muted-foreground border-y border-border/40 py-5">
                                            <div className="flex items-center gap-4">
                                                <div className="p-3 bg-primary/5 rounded-2xl border border-primary/10 shadow-sm">
                                                    <User className="h-4 w-4 text-primary" />
                                                </div>
                                                <div className="flex flex-col gap-0.5">
                                                    <span className="text-[8px] opacity-60">Shared By</span>
                                                    <span className="text-foreground tracking-tight line-clamp-1">{resource.profiles?.full_name || 'Verified Member'}</span>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-4 sm:text-right">
                                                <div className="flex flex-col gap-0.5 sm:order-1 order-2">
                                                    <span className="text-[8px] opacity-60">Uploaded On</span>
                                                    <span className="text-foreground tracking-tight whitespace-nowrap">{format(new Date(resource.created_at), 'MMM d, yyyy')}</span>
                                                </div>
                                                <div className="p-3 bg-primary/5 rounded-2xl border border-primary/10 shadow-sm sm:order-2 order-1">
                                                    <Calendar className="h-4 w-4 text-primary" />
                                                </div>
                                            </div>
                                        </div>

                                         <div className="grid grid-cols-2 gap-4 md:gap-6">
                                            <div className="bg-slate-50 dark:bg-slate-800/40 p-5 md:p-6 rounded-[1.5rem] border border-border/40 hover:border-primary/20 transition-colors group/stat shadow-sm">
                                                <div className="flex items-center gap-2 mb-3">
                                                    <BookOpen className="h-3.5 w-3.5 text-primary/50 group-hover/stat:text-primary transition-colors" />
                                                    <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest opacity-80">Subject</p>
                                                </div>
                                                <p className="font-bold text-sm md:text-base tracking-tight text-foreground line-clamp-1">{resource.subject}</p>
                                            </div>
                                            <div className="bg-slate-50 dark:bg-slate-800/40 p-5 md:p-6 rounded-[1.5rem] border border-border/40 hover:border-primary/20 transition-colors group/stat shadow-sm">
                                                <div className="flex items-center gap-2 mb-3">
                                                    <Hash className="h-3.5 w-3.5 text-primary/50 group-hover/stat:text-primary transition-colors" />
                                                    <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest opacity-80">Topic</p>
                                                </div>
                                                <p className="font-bold text-sm md:text-base tracking-tight text-foreground line-clamp-1">{resource.topic || 'General'}</p>
                                            </div>
                                        </div>

                                        <div className="bg-primary/5 p-6 md:p-8 rounded-[2rem] border-l-4 border-primary/80 shadow-[inset_0_0_20px_rgba(0,0,0,0.02)]">
                                            <h3 className="flex items-center gap-2 text-[9px] font-bold uppercase tracking-[0.3em] text-primary mb-3 opacity-90">
                                                <Microscope className="h-3.5 w-3.5" />
                                                Description
                                            </h3>
                                            <p className="text-xs md:text-sm text-foreground/90 leading-relaxed font-medium">
                                                {resource.description || 'No specific description has been provided for this material.'}
                                            </p>
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
