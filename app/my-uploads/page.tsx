'use client'

export const dynamic = 'force-dynamic'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/components/auth-provider'
import { Resource } from '@/components/resource-card'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
    DialogClose,
} from '@/components/ui/dialog'
import { Breadcrumbs } from '@/components/breadcrumbs'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
    Eye, 
    FileText, 
    TrendingUp, 
    Plus,
    Archive,
    Trash2
} from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { toast } from 'sonner'
import { FadeIn, ScaleIn } from '@/components/motion-wrapper'
import { cn } from '@/lib/utils'

export default function MyUploadsPage() {
    const { user } = useAuth()
    const [uploads, setUploads] = useState<Resource[]>([])
    const [loading, setLoading] = useState(true)

    const [selectedDocument, setSelectedDocument] = useState<Resource | null>(null)
    const [isDialogOpen, setIsDialogOpen] = useState(false)

    const handleOpenDialog = (doc: Resource) => {
        setSelectedDocument(doc)
        setIsDialogOpen(true)
    }

    useEffect(() => {
        async function loadUploads() {
            if (!user) return

            const { data } = await supabase
                .from('resources')
                .select('*')
                .eq('uploaded_by', user.id)
                .order('created_at', { ascending: false })

            if (data) {
                setUploads(data as unknown as Resource[])
            }
            setLoading(false)
        }

        loadUploads()
    }, [user])

    const handleDeleteResource = async (resource: Resource) => {
        if (!confirm(`Are you sure you want to delete "${resource.title}"? This cannot be undone.`)) return

        try {
            // 1. Delete from Storage
            const fileUrl = resource.file_url
            if (fileUrl) {
                const path = fileUrl.split('/resources/')[1]
                if (path) {
                    await supabase.storage.from('resources').remove([path])
                }
            }

            // 2. Delete from DB
            const { error } = await supabase
                .from('resources')
                .delete()
                .eq('id', resource.id)

            if (error) throw error

            // 3. Update State
            setUploads(prev => prev.filter(r => r.id !== resource.id))
            toast.success("Document deleted successfully")
            setIsDialogOpen(false)
        } catch (err) {
            console.error("Delete error:", err)
            toast.error("Failed to delete document")
        }
    }



    return (
        <div className="min-h-screen bg-slate-50 dark:bg-[#0B1120]/50">
            {/* Premium Header Background Blob */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden">
                <div className="absolute top-[10%] right-[10%] w-[40rem] h-[40rem] bg-primary/5 rounded-full blur-[120px] animate-pulse" />
                <div className="absolute bottom-[10%] left-[5%] w-[30rem] h-[30rem] bg-indigo-500/5 rounded-full blur-[100px]" />
            </div>

            <div className="container py-10 space-y-10 pl-8 pr-4 relative z-10 max-w-7xl mx-auto">
                <Breadcrumbs />

                {/* Page Title Section */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-border/40 pb-10">
                    <FadeIn className="space-y-4">
                        <div className="flex items-center gap-3">
                            <Badge variant="outline" className="text-primary border-primary/20 bg-primary/5 uppercase tracking-[0.2em] text-[10px] py-1 px-4 rounded-full font-bold">
                                Member Workspace
                            </Badge>
                        </div>
                        <h1 className="text-5xl font-bold tracking-tighter text-slate-900 dark:text-white flex items-center gap-4">
                            <Archive className="h-10 w-10 text-primary" />
                            My <span className="text-primary">Documents</span>
                        </h1>
                        <p className="text-muted-foreground font-medium text-lg max-w-lg leading-relaxed">
                            Manage your shared study materials and track their review status.
                        </p>
                    </FadeIn>
                    
                    <ScaleIn delay={0.2}>
                        <Link href="/upload">
                            <Button className="h-10 px-5 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 border-none font-bold text-[10px] uppercase tracking-[0.2em] shadow-lg hover:shadow-primary/20 transition-all hover:-translate-y-0.5 active:scale-95 group relative overflow-hidden">
                                <span className="relative z-10 flex items-center gap-2">
                                    <Plus className="h-3.5 w-3.5" />
                                    Publish New
                                </span>
                                <div className="absolute inset-0 bg-primary opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                            </Button>
                        </Link>
                    </ScaleIn>
                </div>



                {/* Table Section */}
                <FadeIn delay={0.4} className="space-y-6">
                    <div className="flex items-center justify-between px-2">
                        <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-primary flex items-center gap-3">
                            <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                            Material Inventory
                        </h2>
                    </div>

                    <div className="rounded-[2.5rem] border border-border/40 bg-white/30 dark:bg-slate-900/30 backdrop-blur-xl overflow-hidden shadow-2xl">
                        <Table>
                            <TableHeader className="bg-slate-50/50 dark:bg-white/5">
                                <TableRow className="border-border/40 hover:bg-transparent">
                                    <TableHead className="py-4 px-6 text-[9px] font-black uppercase tracking-widest text-muted-foreground">Document Details</TableHead>
                                    <TableHead className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">Status</TableHead>
                                    <TableHead className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">Uploaded</TableHead>
                                    <TableHead className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">Reach</TableHead>
                                    <TableHead className="text-right px-6 text-[9px] font-black uppercase tracking-widest text-muted-foreground">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {loading ? (
                                    Array(3).fill(0).map((_, i) => (
                                        <TableRow key={i} className="animate-pulse">
                                            <TableCell colSpan={5} className="py-8 px-6">
                                                <div className="flex items-center gap-4">
                                                    <div className="h-10 w-10 rounded-2xl bg-muted/50" />
                                                    <div className="space-y-2">
                                                        <div className="h-3 w-40 bg-muted/50 rounded-full" />
                                                        <div className="h-2 w-24 bg-muted/30 rounded-full" />
                                                    </div>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : uploads.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={5} className="py-24 px-6">
                                            <div className="flex flex-col items-center justify-center text-center space-y-6">
                                                <div className="h-16 w-16 rounded-[1.5rem] bg-indigo-500/5 flex items-center justify-center border border-indigo-500/10">
                                                    <Archive className="h-8 w-8 text-indigo-500 opacity-40" />
                                                </div>
                                                <div className="space-y-2">
                                                    <h3 className="text-lg font-bold">No Documents Yet</h3>
                                                    <p className="text-muted-foreground text-xs max-w-xs mx-auto font-medium">Your uploaded study materials will appear here once you start sharing.</p>
                                                </div>
                                                <Link href="/upload">
                                                    <Button variant="outline" className="rounded-xl px-6 h-10 border-border/60 font-bold text-[10px] uppercase tracking-widest">
                                                        Start Sharing
                                                    </Button>
                                                </Link>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    uploads.map((resource) => (
                                        <TableRow 
                                            key={resource.id} 
                                            className="border-border/40 hover:bg-white/50 dark:hover:bg-white/5 transition-colors group"
                                        >
                                            <TableCell className="py-4 px-6">
                                                <div className="flex items-center gap-4">
                                                    <div className="h-10 w-10 rounded-xl bg-primary/5 flex items-center justify-center border border-primary/10 group-hover:scale-110 group-hover:bg-primary group-hover:text-white transition-all duration-500">
                                                        <FileText className="h-4 w-4" />
                                                    </div>
                                                    <div>
                                                        <p className="font-bold text-slate-900 dark:text-white text-sm tracking-tight line-clamp-1">{resource.title}</p>
                                                        <div className="flex items-center gap-2 mt-0.5">
                                                            <span className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground/60">{resource.subject}</span>
                                                            <span className="h-1 w-1 rounded-full bg-border" />
                                                            <span className="text-[9px] font-bold uppercase tracking-widest text-primary">{resource.department}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Badge 
                                                    variant="outline"
                                                    className={cn(
                                                        "uppercase tracking-widest text-[8px] py-0.5 px-3 rounded-full font-bold border-none",
                                                        resource.status === 'approved' ? 'bg-green-500/10 text-green-600' :
                                                        resource.status === 'rejected' ? 'bg-red-500/10 text-red-600' : 
                                                        'bg-orange-500/10 text-orange-600'
                                                    )}
                                                >
                                                    {resource.status === 'rejected' ? 'Declined' : resource.status}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="font-medium text-[11px] text-muted-foreground">
                                                {formatDistanceToNow(new Date(resource.created_at))} ago
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    <div className="h-7 w-7 rounded-lg bg-secondary/50 flex items-center justify-center border border-border/50">
                                                        <TrendingUp className="h-3 w-3 text-muted-foreground" />
                                                    </div>
                                                    <span className="font-black tabular-nums text-sm">{resource.download_count}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-right px-6">
                                                <div className="flex items-center justify-end gap-1.5">
                                                    <Button 
                                                        variant="ghost" 
                                                        size="icon" 
                                                        onClick={() => handleOpenDialog(resource)}
                                                        className="h-9 w-9 rounded-xl hover:bg-primary/5 hover:text-primary transition-all active:scale-90 border border-transparent hover:border-primary/20"
                                                    >
                                                        <Eye className="h-4 w-4" />
                                                    </Button>
                                                    <Button 
                                                        variant="ghost" 
                                                        size="icon" 
                                                        onClick={() => handleDeleteResource(resource)}
                                                        className="h-9 w-9 rounded-xl hover:bg-red-500/5 hover:text-red-500 transition-all active:scale-90 border border-transparent hover:border-red-500/20"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </FadeIn>

                {/* Status Tracking Dialog */}
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogContent showCloseButton={false} className="max-w-md rounded-[2rem] sm:rounded-[2.5rem] border-border/40 bg-white/90 dark:bg-slate-900/90 backdrop-blur-2xl p-0 overflow-hidden shadow-2xl">
                        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent pointer-events-none" />
                        
                        <div className="p-6 sm:p-8 md:p-10 relative z-10 space-y-6 sm:space-y-8">
                            <DialogHeader>
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="p-3 bg-primary/10 rounded-2xl border border-primary/20">
                                        <Archive className="h-6 w-6 text-primary" />
                                    </div>
                                    <div className="text-left">
                                        <DialogTitle className="text-2xl font-bold tracking-tight">Material Status</DialogTitle>
                                        <DialogDescription className="text-xs font-bold uppercase tracking-widest text-muted-foreground/60 mt-1">
                                            #{selectedDocument?.id.slice(0, 8)}
                                        </DialogDescription>
                                    </div>
                                </div>
                            </DialogHeader>

                            {/* Document Info Card */}
                            <div className="bg-slate-50 dark:bg-white/5 rounded-3xl p-6 border border-border/20">
                                <p className="font-bold text-lg mb-1">{selectedDocument?.title}</p>
                                <div className="flex items-center gap-2">
                                    <span className="text-[10px] font-bold uppercase tracking-widest text-primary">{selectedDocument?.department}</span>
                                    <span className="h-1 w-1 rounded-full bg-border" />
                                    <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{selectedDocument?.subject}</span>
                                </div>
                            </div>

                            {/* Simplified Linear Tracker */}
                            <div className="relative pt-4 pb-8">
                                <div className="absolute top-[38px] left-0 right-0 h-[2px] bg-border/40" />
                                <div className="grid grid-cols-3 relative z-10">
                                    {/* Step 1 */}
                                    <div className="flex flex-col items-center gap-3 text-center">
                                        <div className="h-4 w-4 rounded-full bg-green-500 border-2 border-background shadow-lg shadow-green-500/20" />
                                        <div className="space-y-1 px-2">
                                            <p className="font-bold text-[9px] tracking-tight uppercase">Submitted</p>
                                        </div>
                                    </div>

                                    {/* Step 2 */}
                                    <div className="flex flex-col items-center gap-3 text-center">
                                        <div className={cn(
                                            "h-4 w-4 rounded-full border-2 border-background shadow-lg transition-colors duration-500",
                                            selectedDocument?.status !== 'pending' ? "bg-green-500 shadow-green-500/20" : "bg-orange-500 animate-pulse shadow-orange-500/40"
                                        )} />
                                        <div className="space-y-1 px-2">
                                            <p className="font-bold text-[9px] tracking-tight uppercase text-foreground">Review</p>
                                        </div>
                                    </div>

                                    {/* Step 3 */}
                                    <div className="flex flex-col items-center gap-3 text-center">
                                        <div className={cn(
                                            "h-4 w-4 rounded-full border-2 border-background shadow-lg transition-colors duration-500",
                                            selectedDocument?.status === 'approved' ? "bg-green-500 shadow-green-500/20" : 
                                            selectedDocument?.status === 'rejected' ? "bg-red-500 shadow-red-500/20" : 
                                            "bg-slate-200 dark:bg-slate-800"
                                        )} />
                                        <div className="space-y-1 px-2">
                                            <p className="font-bold text-[9px] tracking-tight uppercase text-foreground line-clamp-1">
                                                {selectedDocument?.status === 'approved' ? 'Live' : 
                                                 selectedDocument?.status === 'rejected' ? 'Declined' : 'Result'}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <DialogFooter className="pt-2">
                                <DialogClose asChild>
                                    <Button variant="ghost" className="w-full h-11 rounded-2xl font-bold hover:bg-slate-100 dark:hover:bg-white/5 transition-all text-xs uppercase tracking-widest text-muted-foreground/60">
                                        Dismiss
                                    </Button>
                                </DialogClose>
                            </DialogFooter>
                        </div>
                    </DialogContent>
                </Dialog>
            </div>
        </div>
    )
}
