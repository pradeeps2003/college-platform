'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Resource } from '@/components/resource-card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Download, User, Calendar, AlertTriangle, Stethoscope, Activity, FileCheck, Info, ChevronLeft, ShieldAlert } from 'lucide-react'
import { AnatomicalHeart } from '@/components/icons/anatomical-heart'
import { formatDistanceToNow } from 'date-fns'
import { useAuth } from '@/components/auth-provider'
import { toast } from 'sonner'
import { FadeIn, ScaleIn, SlideIn } from '@/components/motion-wrapper'
import { Breadcrumbs } from '@/components/breadcrumbs'
import { cn } from '@/lib/utils'
import { FileText, Archive, TrendingUp, Clock, CheckCircle2 } from 'lucide-react'

export default function ResourceDetailPage() {
    const { id } = useParams()
    const router = useRouter()
    const { user } = useAuth()
    const [resource, setResource] = useState<Resource | null>(null)
    const [loading, setLoading] = useState(true)
    const [isAdmin, setIsAdmin] = useState(false)

    useEffect(() => {
        async function loadResource() {
            if (!id) return

            // Check if user is admin
            if (user) {
                const { data: profile } = await supabase
                    .from('profiles')
                    .select('role')
                    .eq('id', user.id)
                    .single()
                setIsAdmin(profile?.role === 'admin')
            }

            const { data, error } = await supabase
                .from('resources')
                .select('*, profiles!resources_uploaded_by_fkey(full_name)')
                .eq('id', id)
                .single()

            if (error) {
                console.error("Resource fetch error:", error.message)
            }

            if (data) {
                setResource(data as unknown as Resource)
            }
            setLoading(false)
        }

        loadResource()
    }, [id, user])

    // Methods for download and save removed.

    if (loading) {
        return (
            <div className="min-h-[60vh] flex flex-col justify-center items-center gap-4">
                <div className="h-12 w-12 rounded-full border-t-2 border-primary animate-spin" />
                <p className="text-sm font-medium animate-pulse text-muted-foreground">Loading Resource...</p>
            </div>
        )
    }

    if (!resource) {
        return (
            <div className="container py-20 text-center space-y-6">
                <div className="bg-red-50 dark:bg-red-950/20 p-6 rounded-full w-24 h-24 flex items-center justify-center mx-auto">
                    <ShieldAlert className="h-10 w-10 text-red-600" />
                </div>
                <div className="space-y-2">
                    <h1 className="text-3xl font-bold tracking-tight">Material Not Found</h1>
                    <p className="text-muted-foreground max-w-sm mx-auto font-medium">This material may be restricted, pending approval, or recently removed.</p>
                </div>
                <Button variant="outline" className="rounded-xl font-bold" onClick={() => router.back()}>
                    <ChevronLeft className="mr-2 h-4 w-4" />
                    Return to Browse
                </Button>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-[#0B1120]/50 pb-20">
            {/* Premium Header Background Blob */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden">
                <div className="absolute top-[10%] right-[10%] w-[40rem] h-[40rem] bg-primary/5 rounded-full blur-[120px] animate-pulse" />
                <div className="absolute bottom-[10%] left-[5%] w-[30rem] h-[30rem] bg-indigo-500/5 rounded-full blur-[100px]" />
            </div>

            <div className="container py-10 space-y-10 pl-8 pr-4 relative z-10 max-w-5xl mx-auto">
                <div className="flex items-center justify-between">
                    <Breadcrumbs />
                    <button
                        onClick={() => router.back()}
                        className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground hover:text-primary transition-all group active:scale-95"
                    >
                        <ChevronLeft className="h-3.5 w-3.5 group-hover:-translate-x-1 transition-transform" />
                        Go Back
                    </button>
                </div>

                {/* Simplified Linear Tracker if not approved */}
                {resource.status !== 'approved' && (
                    <FadeIn>
                        <div className="bg-white/40 dark:bg-slate-900/40 backdrop-blur-3xl border border-border/40 rounded-3xl p-6 mb-8">
                            <div className="flex items-center justify-between mb-6 px-4">
                                <div className="space-y-1">
                                    <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-orange-500">Pipeline Status</h4>
                                    <p className="text-[9px] font-bold text-muted-foreground/60 uppercase tracking-widest">Awaiting clearing house authorization</p>
                                </div>
                                <div className="h-2 w-2 rounded-full bg-orange-500 animate-pulse shadow-[0_0_10px_rgba(249,115,22,0.5)]" />
                            </div>
                            <div className="relative h-1 bg-slate-100 dark:bg-white/5 rounded-full overflow-hidden mx-4">
                                <div 
                                    className={cn(
                                        "absolute inset-y-0 left-0 transition-all duration-1000 ease-out rounded-full",
                                        resource.status === 'pending' ? "w-1/2 bg-orange-500" : "w-full bg-red-500"
                                    )}
                                />
                            </div>
                            <div className="flex justify-between mt-3 px-4">
                                <span className="text-[8px] font-black uppercase tracking-widest text-muted-foreground/40">Initiated</span>
                                <span className="text-[8px] font-black uppercase tracking-widest text-muted-foreground/40">Cleared</span>
                            </div>
                            {resource.status === 'rejected' && resource.rejection_reason && (
                                <SlideIn direction="up" className="mt-6 p-4 bg-red-500/5 border border-red-500/10 rounded-2xl flex gap-3 items-center">
                                    <AlertTriangle className="h-4 w-4 text-red-500" />
                                    <p className="text-[10px] font-black text-red-600 uppercase tracking-widest">Log: {resource.rejection_reason}</p>
                                </SlideIn>
                            )}
                        </div>
                    </FadeIn>
                )}

                {/* Page Title Section */}
                <div className="space-y-8">
                    <FadeIn delay={0.1} className="space-y-4">
                        <div className="flex items-center gap-3">
                            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 border border-primary/20">
                                <Activity className="h-3 w-3 text-primary" />
                                <span className="text-[9px] font-black text-primary uppercase tracking-[0.2em]">{resource.department}</span>
                            </div>
                            {resource.status === 'approved' && (
                                <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-500/10 border border-green-500/20">
                                    <FileCheck className="h-3 w-3 text-green-600" />
                                    <span className="text-[9px] font-black text-green-600 uppercase tracking-[0.2em]">Verified</span>
                                </div>
                            )}
                        </div>
                        <h1 className="text-6xl font-black tracking-tighter text-slate-900 dark:text-white leading-[1] uppercase max-w-4xl">
                            {resource.title}
                        </h1>
                        <div className="flex flex-wrap items-center gap-8 pt-4">
                            <div className="flex items-center gap-3 group">
                                <div className="h-10 w-10 rounded-xl bg-slate-100 dark:bg-white/5 flex items-center justify-center border border-border/40 group-hover:border-primary/40 transition-colors">
                                    <User className="h-5 w-5 text-muted-foreground/40 group-hover:text-primary transition-colors" />
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-[8px] font-black text-muted-foreground/40 uppercase tracking-widest">Contributor</span>
                                    <span className="text-[11px] font-black text-slate-900 dark:text-white uppercase tracking-wider">{resource.profiles?.full_name || 'Verified Member'}</span>
                                </div>
                            </div>
                            <div className="h-8 w-[1px] bg-border/40 hidden md:block" />
                            <div className="flex items-center gap-3 group">
                                <div className="h-10 w-10 rounded-xl bg-slate-100 dark:bg-white/5 flex items-center justify-center border border-border/40 group-hover:border-primary/40 transition-colors">
                                    <Archive className="h-5 w-5 text-muted-foreground/40 group-hover:text-primary transition-colors" />
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-[8px] font-black text-muted-foreground/40 uppercase tracking-widest">Catalog Entry</span>
                                    <span className="text-[11px] font-black text-slate-900 dark:text-white uppercase tracking-wider">{formatDistanceToNow(new Date(resource.created_at))} ago</span>
                                </div>
                            </div>
                            <div className="h-8 w-[1px] bg-border/40 hidden md:block" />
                            <div className="flex items-center gap-3 group">
                                <div className="h-10 w-10 rounded-xl bg-slate-100 dark:bg-white/5 flex items-center justify-center border border-border/40 group-hover:border-primary/40 transition-colors">
                                    <TrendingUp className="h-5 w-5 text-muted-foreground/40 group-hover:text-primary transition-colors" />
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-[8px] font-black text-muted-foreground/40 uppercase tracking-widest">Tier</span>
                                    <span className="text-[11px] font-black text-slate-900 dark:text-white uppercase tracking-wider">Level {resource.semester}</span>
                                </div>
                            </div>
                        </div>
                    </FadeIn>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 space-y-8">
                        {/* Main Content Card */}
                        <FadeIn delay={0.2}>
                            <div className="bg-white/40 dark:bg-slate-900/40 backdrop-blur-3xl rounded-[2rem] border border-border/40 overflow-hidden shadow-2xl shadow-primary/5">
                                <div className="p-8 border-b border-border/40 flex items-center justify-between bg-white/40 dark:bg-white/5">
                                    <div className="flex items-center gap-3">
                                        <div className="h-2 w-2 rounded-full bg-primary shadow-[0_0_8px_rgba(var(--primary),0.5)]" />
                                        <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-900 dark:text-white">Technical Dossier</span>
                                    </div>
                                    <Badge variant="outline" className="text-[8px] font-black uppercase tracking-widest border-border/40 text-muted-foreground/40 px-3">
                                        Version 1.0.4
                                    </Badge>
                                </div>
                                <div className="p-8 space-y-10">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        <div className="p-6 rounded-2xl bg-slate-50 dark:bg-white/5 border border-border/40 group hover:border-primary/20 transition-all">
                                            <p className="text-[9px] font-black text-muted-foreground/40 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                                                <Stethoscope className="h-3 w-3" />
                                                Discipline
                                            </p>
                                            <p className="font-black text-xl tracking-tight text-slate-900 dark:text-white uppercase">{resource.subject}</p>
                                        </div>
                                        <div className="p-6 rounded-2xl bg-slate-50 dark:bg-white/5 border border-border/40 group hover:border-primary/20 transition-all">
                                            <p className="text-[9px] font-black text-muted-foreground/40 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                                                <Info className="h-3 w-3" />
                                                Core Focus
                                            </p>
                                            <p className="font-black text-xl tracking-tight text-slate-900 dark:text-white uppercase">{resource.topic || 'General Material'}</p>
                                        </div>
                                    </div>
                                    
                                    <div className="space-y-6">
                                        <div className="flex items-center gap-3">
                                            <div className="h-[1px] flex-1 bg-border/40" />
                                            <p className="text-[9px] font-black text-muted-foreground/40 uppercase tracking-widest">Document Specimen</p>
                                            <div className="h-[1px] flex-1 bg-border/40" />
                                        </div>
                                        
                                        <div className="group relative rounded-3xl overflow-hidden bg-slate-900 border border-border/40 aspect-[4/3] flex flex-col items-center justify-center gap-6 p-12 transition-all hover:border-primary/40">
                                            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(var(--primary),0.05),transparent)] opacity-0 group-hover:opacity-100 transition-opacity" />
                                            <div className="h-16 w-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-500">
                                                <FileText className="h-8 w-8 text-white/40" />
                                            </div>
                                            <div className="text-center space-y-2 relative z-10">
                                                <h4 className="text-sm font-black text-white uppercase tracking-widest">{resource.title}</h4>
                                                <p className="text-[10px] font-medium text-white/40 uppercase tracking-[0.2em]">Academic Source Material</p>
                                            </div>
                                            <a 
                                                href={resource.file_url} 
                                                target="_blank" 
                                                className="mt-4 px-8 py-4 bg-white text-slate-900 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] hover:bg-primary hover:text-white transition-all active:scale-95 shadow-2xl"
                                            >
                                                Open Full Document
                                            </a>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </FadeIn>
                    </div>

                    <div className="space-y-8">
                        {/* Metadata Sidebar Widget */}
                        <FadeIn delay={0.4}>
                            <div className="bg-white/40 dark:bg-slate-900/40 backdrop-blur-3xl rounded-[2rem] border border-border/40 p-8 space-y-6 shadow-xl">
                                <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-primary">Specifications</h4>
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between pb-4 border-b border-border/40">
                                        <span className="text-[9px] font-black text-muted-foreground/40 uppercase tracking-widest">Registry ID</span>
                                        <span className="text-[10px] font-black uppercase tracking-wider text-slate-900 dark:text-white">#{resource.id.slice(0, 8)}</span>
                                    </div>
                                    <div className="flex items-center justify-between pb-4 border-b border-border/40">
                                        <span className="text-[9px] font-black text-muted-foreground/40 uppercase tracking-widest">Access Tier</span>
                                        <Badge variant="secondary" className="text-[8px] font-black uppercase rounded-full">Level {resource.semester}</Badge>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-[9px] font-black text-muted-foreground/40 uppercase tracking-widest">Verification</span>
                                        <div className="flex items-center gap-2">
                                            <div className="h-1.5 w-1.5 rounded-full bg-green-500" />
                                            <span className="text-[9px] font-black uppercase tracking-widest text-green-600">Secure</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </FadeIn>
                    </div>
                </div>
            </div>
        </div>
    )
}
