'use client'

import { useEffect, useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/components/auth-provider'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import {
    Check, X, FileText, Users, AlertCircle, ExternalLink,
    Stethoscope, ShieldCheck, Activity, Trash2,
    Clock, Eye, Search, UserPlus,
    ShieldAlert, Mail, GraduationCap, LayoutGrid, Plus, Pencil,
    Dna, Microscope, Baby, Brain, Radiation, Pill, FlaskConical,
    HeartPulse, Syringe, Archive, Sparkles, ChevronRight
} from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { toast } from 'sonner'
import { motion, AnimatePresence } from 'framer-motion'
import { FadeIn, ScaleIn } from '@/components/motion-wrapper'
import { Breadcrumbs } from '@/components/breadcrumbs'
import { DashboardSearch } from '@/components/dashboard-search'

import { Resource } from '@/components/resource-card'
import { cn } from '@/lib/utils'

const SPECIALTY_ICONS: Record<string, React.ElementType> = {
    Stethoscope, GraduationCap, HeartPulse, Dna, Microscope,
    Pill, FlaskConical, Syringe, Baby, Brain, Radiation, Activity, Archive
}

interface Profile {
    id: string
    full_name: string
    email: string
    role: string
    year?: number
    bio?: string
    avatar_url?: string
    created_at: string
    resources?: { count: number }[]
}

export default function AdminDashboard() {
    const { user } = useAuth()
    const router = useRouter()
    const [isAdmin, setIsAdmin] = useState(false)
    const [loading, setLoading] = useState(true)

    const [pendingResources, setPendingResources] = useState<Resource[]>([])
    const [allUsers, setAllUsers] = useState<Profile[]>([])
    const [specialties, setSpecialties] = useState<{ id: string; name: string; description: string; icon_name: string; is_active?: boolean; created_at: string }[]>([])
    const [stats, setStats] = useState({ totalUsers: 0, pending: 0, totalResources: 0, specialties: 0 })

    // UI State
    const [searchQuery, setSearchQuery] = useState('')

    // User Pagination State
    const [userPage, setUserPage] = useState(1)
    const usersPerPage = 5

    // Specialty Modal State
    const [isSpecialtyModalOpen, setIsSpecialtyModalOpen] = useState(false)
    const [isEditingSpecialty, setIsEditingSpecialty] = useState(false)
    const [editingSpecialtyId, setEditingSpecialtyId] = useState<string | null>(null)
    const [newSpecialtyName, setNewSpecialtyName] = useState('')
    const [newSpecialtyDesc, setNewSpecialtyDesc] = useState('')
    const [newSpecialtyIcon, setNewSpecialtyIcon] = useState('Stethoscope')

    // Rejection Modal State
    const [isRejectModalOpen, setIsRejectModalOpen] = useState(false)
    const [selectedResourceId, setSelectedResourceId] = useState<string | null>(null)
    const [rejectionReason, setRejectionReason] = useState('')

    // Delete Confirmation State
    const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false)
    const [deletingSpec, setDeletingSpec] = useState<{ id: string, name: string } | null>(null)

    // Approval Confirmation State
    const [isApproveConfirmOpen, setIsApproveConfirmOpen] = useState(false)
    const [approvingResource, setApprovingResource] = useState<{ id: string, title: string } | null>(null)

    // User Detail Modal State
    const [isUserDetailOpen, setIsUserDetailOpen] = useState(false)
    const [selectedUploader, setSelectedUploader] = useState<Profile | null>(null)

    const handleUploaderClick = (uploader: Profile) => {
        setSelectedUploader(uploader)
        setIsUserDetailOpen(true)
    }





    useEffect(() => {
        async function checkAdminAndLoadData() {
            if (!user) return

            // Check role
            const { data: profile } = await supabase
                .from('profiles')
                .select('role')
                .eq('id', user.id)
                .single()

            if (profile?.role !== 'admin') {
                router.push('/dashboard')
                return
            }

            setIsAdmin(true)

            try {
                // Load Pending Resources
                const { data: pending, error: pendingError } = await supabase
                    .from('resources')
                    .select('*, profiles:profiles!resources_uploaded_by_fkey(*, resources:resources!resources_uploaded_by_fkey(count))')
                    .eq('status', 'pending')
                    .order('created_at', { ascending: false })

                if (pendingError) throw pendingError
                setPendingResources(pending || [])

                // Load All Users with upload count
                const { data: profiles, error: profilesError } = await supabase
                    .from('profiles')
                    .select('*, resources:resources!resources_uploaded_by_fkey(count)')
                    .order('created_at', { ascending: false })

                if (profilesError) throw profilesError
                setAllUsers(profiles as unknown as Profile[])

                // Load Stats
                const { count: usersCount } = await supabase.from('profiles').select('*', { count: 'exact', head: true })
                const { count: resourcesCount } = await supabase.from('resources').select('*', { count: 'exact', head: true })

                // Load Specialties
                const { data: specData } = await supabase
                    .from('specialties')
                    .select('*')
                    .order('name')

                setSpecialties(specData || [])

                setStats({
                    totalUsers: usersCount || 0,
                    pending: pending?.length || 0,
                    totalResources: resourcesCount || 0,
                    specialties: specData?.length || 0
                })


            } catch (err) {
                const message = err instanceof Error ? err.message : String(err)
                console.error("Data load error:", message)
                toast.error("Network issue. Some stats may be missing.")
            } finally {
                setLoading(false)
            }
        }

        checkAdminAndLoadData()
    }, [user, router])

    const handleAddSpecialty = async () => {
        if (!newSpecialtyName.trim()) return

        if (isEditingSpecialty && editingSpecialtyId) {
            const { data, error } = await supabase
                .from('specialties')
                .update({
                    name: newSpecialtyName,
                    description: newSpecialtyDesc,
                    icon_name: newSpecialtyIcon
                })
                .eq('id', editingSpecialtyId)
                .select()

            if (!error) {
                setSpecialties(prev => prev.map(s => s.id === editingSpecialtyId ? data[0] : s))
                setIsSpecialtyModalOpen(false)
                setIsEditingSpecialty(false)
                setEditingSpecialtyId(null)
                setNewSpecialtyName('')
                setNewSpecialtyDesc('')
                toast.success("Category Updated")
            } else {
                toast.error("Update failed", { description: error.message })
            }
            return
        }

        const { data, error } = await supabase
            .from('specialties')
            .insert({
                name: newSpecialtyName,
                description: newSpecialtyDesc,
                icon_name: newSpecialtyIcon,
                is_active: true
            })
            .select()

        if (!error) {
            setSpecialties(prev => [...prev, data[0]].sort((a, b) => a.name.localeCompare(b.name)))
            setStats(prev => ({ ...prev, specialties: prev.specialties + 1 }))
            setIsSpecialtyModalOpen(false)
            setNewSpecialtyName('')
            setNewSpecialtyDesc('')
            toast.success("Added Successfully", {
                description: `${newSpecialtyName} is now live.`
            })
        } else {
            toast.error("Action failed", {
                description: error.message
            })
        }
    }

    const handleToggleSpecialty = async (id: string, currentStatus: boolean) => {
        const { error } = await supabase
            .from('specialties')
            .update({ is_active: !currentStatus })
            .eq('id', id)

        if (!error) {
            setSpecialties(prev => prev.map(s => s.id === id ? { ...s, is_active: !currentStatus } : s))
            toast.success(currentStatus ? "Deactivated" : "Activated", {
                description: currentStatus ? "Category hidden from students." : "Category is now visible."
            })
        } else {
            console.error("Toggle error:", error)
            toast.error("Failed to update status", { description: error.message })
        }
    }

    const openEditModal = (spec: { id: string; name: string; description: string; icon_name: string }) => {
        setIsEditingSpecialty(true)
        setEditingSpecialtyId(spec.id)
        setNewSpecialtyName(spec.name)
        setNewSpecialtyDesc(spec.description)
        setNewSpecialtyIcon(spec.icon_name)
        setIsSpecialtyModalOpen(true)
    }

    const handleDeleteSpecialty = (id: string, name: string) => {
        setDeletingSpec({ id, name })
        setIsDeleteConfirmOpen(true)
    }

    const confirmDeleteSpecialty = async () => {
        if (!deletingSpec) return

        const { error } = await supabase
            .from('specialties')
            .delete()
            .eq('id', deletingSpec.id)

        if (!error) {
            setSpecialties(prev => prev.filter(s => s.id !== deletingSpec.id))
            setStats(prev => ({ ...prev, specialties: prev.specialties - 1 }))
            toast.info("Specialty Deleted", {
                description: `${deletingSpec.name} has been removed from the directory.`
            })
            setIsDeleteConfirmOpen(false)
            setDeletingSpec(null)
        } else {
            toast.error("Deletetion failed", { description: error.message })
        }
    }

    const handleApprove = (id: string, title: string) => {
        setApprovingResource({ id, title })
        setIsApproveConfirmOpen(true)
    }

    const confirmApprove = async () => {
        if (!user || !approvingResource) return

        const { error } = await supabase
            .from('resources')
            .update({
                status: 'approved',
                approved_at: new Date().toISOString(),
                approved_by: user.id
            })
            .eq('id', approvingResource.id)

        if (!error) {
            setPendingResources(prev => prev.filter(r => r.id !== approvingResource.id))
            setStats(prev => ({ ...prev, pending: prev.pending - 1 }))
            toast.success("Resource Approved", {
                description: `${approvingResource.title} is now live.`
            })
            setIsApproveConfirmOpen(false)
            setApprovingResource(null)
        } else {
            toast.error("Approval failed. Check permissions.")
        }
    }

    const handleDeleteResource = async (resource: Resource) => {
        if (!confirm(`Are you sure you want to PERMANENTLY delete "${resource.title}"? This will also remove the file from storage.`)) return

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
            setPendingResources(prev => prev.filter(r => r.id !== resource.id))
            setStats(prev => ({ ...prev, totalResources: prev.totalResources - 1 }))
            if (resource.status === 'pending') {
                setStats(prev => ({ ...prev, pending: prev.pending - 1 }))
            }
            
            toast.success("Resource permanently deleted")
        } catch (err) {
            console.error("Delete error:", err)
            toast.error("Failed to delete resource")
        }
    }

    const handleRejectClick = (id: string) => {
        setSelectedResourceId(id)
        setIsRejectModalOpen(true)
    }

    const confirmReject = async () => {
        if (!selectedResourceId || !rejectionReason.trim()) return

        const { error } = await supabase
            .from('resources')
            .update({
                status: 'rejected',
                rejection_reason: rejectionReason
            })
            .eq('id', selectedResourceId)

        if (!error) {
            setPendingResources(prev => prev.filter(r => r.id !== selectedResourceId))
            setStats(prev => ({ ...prev, pending: prev.pending - 1 }))
            setIsRejectModalOpen(false)
            setRejectionReason('')
            setSelectedResourceId(null)
            toast.info("Resource Rejected", {
                description: "Contributor will be notified of the feedback."
            })
        }
    }




    const filteredUsers = useMemo(() => {
        // Reset to first page when search query changes
        return allUsers.filter(u =>
            u.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            u.email?.toLowerCase().includes(searchQuery.toLowerCase())
        )
    }, [allUsers, searchQuery])

    // Effect to reset page when searching
    useEffect(() => {
        setUserPage(1)
    }, [searchQuery])

    const paginatedUsers = useMemo(() => {
        const start = (userPage - 1) * usersPerPage
        return filteredUsers.slice(start, start + usersPerPage)
    }, [filteredUsers, userPage])

    const totalUserPages = Math.ceil(filteredUsers.length / usersPerPage)

    const filteredResources = useMemo(() => pendingResources.filter(r =>
        r.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.department.toLowerCase().includes(searchQuery.toLowerCase())
    ), [pendingResources, searchQuery])

    const filteredSpecialties = useMemo(() => specialties.filter(s =>
        s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.description?.toLowerCase().includes(searchQuery.toLowerCase())
    ), [specialties, searchQuery])

    if (loading) return (
        <div className="min-h-screen flex flex-col justify-center items-center gap-4 bg-slate-50 dark:bg-[#0B1120]">
            <div className="relative">
                <div className="h-20 w-20 rounded-full border-t-2 border-primary animate-spin" />
                <Stethoscope className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-8 w-8 text-primary animate-pulse" />
            </div>
            <p className="text-sm font-medium animate-pulse text-muted-foreground">Verifying Admin Access...</p>
        </div>
    )

    if (!isAdmin) return null

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-[#0B1120] pb-20 relative overflow-hidden">
            {/* Premium Background Elements */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden">
                <div className="absolute top-[5%] right-[10%] w-[50rem] h-[50rem] bg-primary/5 rounded-full blur-[140px] animate-pulse" />
                <div className="absolute bottom-[20%] left-[-5%] w-[40rem] h-[40rem] bg-indigo-500/5 rounded-full blur-[120px]" />
                <div className="absolute top-[40%] left-[30%] w-[30rem] h-[30rem] bg-emerald-500/5 rounded-full blur-[100px]" />
            </div>

            {/* Premium Header */}
            <div className="w-full bg-white/40 dark:bg-slate-900/40 backdrop-blur-3xl border-b border-border/40 py-16 px-4 relative z-10 overflow-visible">
                <div className="max-w-7xl mx-auto flex flex-col lg:flex-row lg:items-end justify-between gap-10">
                    <FadeIn delay={0.1}>
                        <div className="space-y-6">
                            <div className="flex flex-col gap-5">
                                <Breadcrumbs />
                                <div className="flex items-center gap-4">
                                    <Badge variant="outline" className="text-primary border-primary/20 bg-primary/5 uppercase tracking-[0.3em] text-[9px] py-1.5 px-5 rounded-full font-black">
                                        Admin Panel
                                    </Badge>
                                    <div className="flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-green-500/10 border border-green-500/20">
                                        <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                                        <span className="text-[9px] font-black uppercase tracking-[0.2em] text-green-600">System Active</span>
                                    </div>
                                </div>
                            </div>
                            <h1 className="text-5xl md:text-7xl font-black tracking-tighter text-slate-900 dark:text-white leading-[1.1] mb-6">
                                Platform <span className="text-primary">Management</span>
                            </h1>
                            <p className="text-lg md:text-xl text-muted-foreground/90 max-w-2xl font-medium leading-relaxed">
                                Control center for reviewing materials, managing members, and organizing study categories.
                            </p>
                        </div>
                    </FadeIn>





                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 mt-12">
                {/* Visual Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16 relative z-20">
                    <ScaleIn delay={0.4}>
                        <Card className="relative overflow-hidden group hover:shadow-[0_20px_50px_rgba(0,0,0,0.04)] transition-all duration-500 border-border/40 bg-white dark:bg-card rounded-[2.5rem] p-6">
                            <div className="absolute top-0 right-0 p-10 opacity-5 group-hover:opacity-20 transition-all duration-1000 group-hover:rotate-12 group-hover:scale-150">
                                <AlertCircle className="h-32 w-32 text-orange-500" />
                            </div>
                            <CardHeader className="pb-4">
                                <CardTitle className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/40">Pending Approvals</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="text-7xl font-black text-slate-900 dark:text-white tabular-nums tracking-tighter">{stats.pending}</div>
                                <div className="flex items-center gap-3 bg-orange-500/10 border border-orange-500/20 px-5 py-2.5 rounded-2xl w-fit">
                                    <Clock className="h-4 w-4 text-orange-500" />
                                    <span className="text-[10px] font-black uppercase tracking-widest text-orange-600">Waiting Review</span>
                                </div>
                            </CardContent>
                        </Card>
                    </ScaleIn>

                    <ScaleIn delay={0.5}>
                        <Card className="relative overflow-hidden group hover:shadow-[0_20px_50px_rgba(0,0,0,0.04)] transition-all duration-500 border-border/40 bg-white dark:bg-card rounded-[2.5rem] p-6">
                            <div className="absolute top-0 right-0 p-10 opacity-5 group-hover:opacity-20 transition-all duration-1000 group-hover:rotate-12 group-hover:scale-150">
                                <Archive className="h-32 w-32 text-primary" />
                            </div>
                            <CardHeader className="pb-4">
                                <CardTitle className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/40">Total Documents</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="text-7xl font-black text-slate-900 dark:text-white tabular-nums tracking-tighter">{stats.totalResources}</div>
                                <div className="flex items-center gap-3 bg-primary/10 border border-primary/20 px-5 py-2.5 rounded-2xl w-fit">
                                    <FileText className="h-4 w-4 text-primary" />
                                    <span className="text-[10px] font-black uppercase tracking-widest text-primary">Live Materials</span>
                                </div>
                            </CardContent>
                        </Card>
                    </ScaleIn>

                    <ScaleIn delay={0.6}>
                        <Card className="relative overflow-hidden group hover:shadow-[0_20px_50px_rgba(0,0,0,0.04)] transition-all duration-500 border-border/40 bg-white dark:bg-card rounded-[2.5rem] p-6">
                            <div className="absolute top-0 right-0 p-10 opacity-5 group-hover:opacity-20 transition-all duration-1000 group-hover:rotate-12 group-hover:scale-150">
                                <Users className="h-32 w-32 text-indigo-500" />
                            </div>
                            <CardHeader className="pb-4">
                                <CardTitle className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/40">Total Members</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="text-7xl font-black text-slate-900 dark:text-white tabular-nums tracking-tighter">{stats.totalUsers}</div>
                                <div className="flex items-center gap-3 bg-indigo-500/10 border border-indigo-500/20 px-5 py-2.5 rounded-2xl w-fit">
                                    <UserPlus className="h-4 w-4 text-indigo-500" />
                                    <span className="text-[10px] font-black uppercase tracking-widest text-indigo-500">Platform Users</span>
                                </div>
                            </CardContent>
                        </Card>
                    </ScaleIn>
                </div>

                <div className="space-y-8">
                    <Tabs defaultValue="approvals" className="w-full">
                        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-10 mb-16 relative">
                            <div className="flex flex-col gap-8 w-full max-w-[100vw] sm:max-w-full">
                                <div className="w-full overflow-x-auto pb-4 -mb-4 snap-x scrollbar-hide">
                                    <TabsList className="bg-slate-100/50 dark:bg-white/5 backdrop-blur-md h-auto p-1.5 gap-2 rounded-[2rem] border border-border/40 flex w-max min-w-min">
                                        <TabsTrigger value="approvals" className="px-6 md:px-10 py-4 rounded-[1.5rem] font-black text-[10px] uppercase tracking-[0.2em] transition-all data-[state=active]:bg-slate-900 data-[state=active]:text-white dark:data-[state=active]:bg-white dark:data-[state=active]:text-slate-900 border-none shrink-0 snap-start">
                                            Document Reviews
                                        </TabsTrigger>
                                        <TabsTrigger value="specialties" className="px-6 md:px-10 py-4 rounded-[1.5rem] font-black text-[10px] uppercase tracking-[0.2em] transition-all data-[state=active]:bg-slate-900 data-[state=active]:text-white dark:data-[state=active]:bg-white dark:data-[state=active]:text-slate-900 border-none shrink-0 snap-start">
                                            Subjects
                                        </TabsTrigger>
                                        <TabsTrigger value="users" className="px-6 md:px-10 py-4 rounded-[1.5rem] font-black text-[10px] uppercase tracking-[0.2em] transition-all data-[state=active]:bg-slate-900 data-[state=active]:text-white dark:data-[state=active]:bg-white dark:data-[state=active]:text-slate-900 border-none shrink-0 snap-start">
                                            Members
                                        </TabsTrigger>
                                    </TabsList>
                                </div>
                            </div>

                            <div className="flex items-center gap-6 max-w-sm w-full">
                                <DashboardSearch 
                                    value={searchQuery}
                                    onChange={setSearchQuery}
                                    placeholder="Search entries..."
                                    className="max-w-full"
                                />
                            </div>
                        </div>

                        <TabsContent value="approvals" className="mt-0 outline-none">
                            <ScaleIn delay={0.2}>
                                <div className="space-y-4">
                                    {filteredResources.length === 0 ? (
                                        <div className="bg-white dark:bg-card border border-border/40 rounded-[3rem] p-40 text-center shadow-[0_20px_60px_rgba(0,0,0,0.03)]">
                                            <div className="flex flex-col items-center gap-8">
                                                <div className="bg-primary/5 p-12 rounded-full border-2 border-dashed border-primary/20 animate-pulse">
                                                    <ShieldCheck className="h-16 w-16 text-primary/30" />
                                                </div>
                                                <div className="space-y-3">
                                                    <p className="text-3xl font-black tracking-tighter uppercase">No Pending Files</p>
                                                    <p className="text-[11px] font-bold text-muted-foreground/60 max-w-xs mx-auto uppercase tracking-widest italic">Everything has been reviewed and processed.</p>
                                                </div>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="grid gap-4">
                                            {filteredResources.map((resource: Resource) => (
                                                <motion.div
                                                    key={resource.id}
                                                    layout
                                                    initial={{ opacity: 0, y: 10 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    className="group relative bg-white dark:bg-slate-900/40 backdrop-blur-3xl border border-border/40 rounded-2xl p-4 px-6 hover:border-primary/40 transition-all duration-500 hover:shadow-xl hover:shadow-primary/5"
                                                >
                                                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                                                        <div className="flex items-center gap-5 flex-1">
                                                            <div className="h-12 w-12 rounded-2xl bg-slate-100 dark:bg-white/5 border border-border/40 flex items-center justify-center group-hover:bg-primary/10 group-hover:border-primary/20 transition-all duration-500 shrink-0">
                                                                <FileText className="h-6 w-6 text-muted-foreground/40 group-hover:text-primary transition-colors" />
                                                            </div>
                                                            <div className="space-y-1.5 overflow-hidden">
                                                                <div className="flex items-center gap-3">
                                                                    <h3 className="text-lg font-black tracking-tighter uppercase text-slate-900 dark:text-white group-hover:text-primary transition-colors truncate">
                                                                        {resource.title}
                                                                    </h3>
                                                                    <Badge variant="outline" className="font-black text-[8px] text-primary border-primary/20 bg-primary/5 rounded-full px-2 py-0 uppercase tracking-widest shrink-0">
                                                                        {resource.department}
                                                                    </Badge>
                                                                </div>
                                                                <div className="flex items-center gap-4 text-[9px] font-black text-muted-foreground/40 uppercase tracking-widest">
                                                                    <button 
                                                                        onClick={() => resource.profiles && handleUploaderClick(resource.profiles as unknown as Profile)}
                                                                        className="flex items-center gap-1.5 hover:text-primary transition-colors group/user"
                                                                    >
                                                                        <Users className="h-3 w-3 group-hover/user:scale-110 transition-transform" />
                                                                        <span className="underline decoration-dotted underline-offset-4">{resource.profiles?.full_name}</span>
                                                                    </button>
                                                                    <div className="h-1 w-1 rounded-full bg-border" />
                                                                    <div className="flex items-center gap-1.5">
                                                                        <Clock className="h-3 w-3" />
                                                                        {formatDistanceToNow(new Date(resource.created_at))}
                                                                    </div>
                                                                    <div className="h-1 w-1 rounded-full bg-border" />
                                                                    <span>LVL {resource.semester}</span>
                                                                </div>
                                                            </div>
                                                        </div>

                                                        <div className="flex items-center gap-3">
                                                            <div className="flex gap-2">
                                                                <Link href={`/resources/${resource.id}`} className="h-10 px-4 inline-flex items-center gap-2 rounded-xl bg-white dark:bg-white/5 border border-border/40 text-[9px] font-black text-muted-foreground uppercase tracking-widest hover:bg-slate-50 dark:hover:bg-white/10 transition-all active:scale-95 group/link">
                                                                    <Eye className="h-3.5 w-3.5" />
                                                                    View
                                                                </Link>
                                                                <a href={resource.file_url} target="_blank" className="h-10 px-4 inline-flex items-center gap-2 rounded-xl bg-white dark:bg-white/5 border border-border/40 text-[9px] font-black text-muted-foreground uppercase tracking-widest hover:bg-slate-50 dark:hover:bg-white/10 transition-all active:scale-95">
                                                                    <ExternalLink className="h-3.5 w-3.5" />
                                                                    Link
                                                                </a>
                                                            </div>
                                                            <div className="h-6 w-[1px] bg-border/40 mx-1" />
                                                            <div className="flex gap-2">
                                                                 <Button
                                                                     variant="ghost"
                                                                     size="icon"
                                                                     className="h-10 w-10 rounded-xl hover:bg-red-500/10 hover:text-red-500 text-muted-foreground/20 border border-transparent hover:border-red-500/20 transition-all active:scale-90"
                                                                     onClick={() => handleRejectClick(resource.id)}
                                                                 >
                                                                     <X className="h-4 w-4" />
                                                                 </Button>
                                                                 <Button
                                                                     variant="ghost"
                                                                     size="icon"
                                                                     className="h-10 w-10 rounded-xl hover:bg-red-500/10 hover:text-red-500 text-muted-foreground/20 border border-transparent hover:border-red-500/20 transition-all active:scale-90"
                                                                     onClick={() => handleDeleteResource(resource)}
                                                                 >
                                                                     <Trash2 className="h-4 w-4" />
                                                                 </Button>
                                                                 <Button
                                                                     className="h-10 px-6 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-black text-[9px] uppercase tracking-[0.2em] shadow-lg hover:bg-primary hover:text-white transition-all active:scale-95 border-none"
                                                                     onClick={() => handleApprove(resource.id, resource.title)}
                                                                 >
                                                                     <Check className="mr-2 h-3.5 w-3.5" />
                                                                     Approve
                                                                 </Button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </motion.div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </ScaleIn>
                        </TabsContent>

                        <TabsContent value="specialties" className="mt-0 outline-none">
                            <FadeIn delay={0.7}>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                    {/* Add New Specialty Card */}
                                    {searchQuery === '' && (
                                        <button
                                            onClick={() => {
                                                setIsEditingSpecialty(false)
                                                setEditingSpecialtyId(null)
                                                setNewSpecialtyName('')
                                                setNewSpecialtyDesc('')
                                                setNewSpecialtyIcon('Stethoscope')
                                                setIsSpecialtyModalOpen(true)
                                            }}
                                            className="group relative flex flex-col items-center justify-center gap-4 p-8 rounded-[2.5rem] bg-white dark:bg-slate-900 border-2 border-dashed border-border/40 hover:border-primary/40 transition-all duration-500 hover:bg-white dark:hover:bg-slate-800 shadow-sm hover:shadow-xl min-h-[180px]"
                                        >
                                            <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center group-hover:scale-110 group-hover:bg-primary group-hover:text-white transition-all duration-500 border border-primary/20">
                                                <Plus className="h-6 w-6" />
                                            </div>
                                            <div className="text-center">
                                                <p className="text-sm font-bold text-slate-900 dark:text-white">Add Category</p>
                                                <p className="text-[10px] text-muted-foreground/60 font-bold uppercase tracking-widest mt-1">New study area</p>
                                            </div>
                                        </button>
                                    )}

                                    {filteredSpecialties.map((spec) => {
                                        const IconComponent = SPECIALTY_ICONS[spec.icon_name] || LayoutGrid

                                        const isActive = spec.is_active !== false

                                        return (
                                            <div key={spec.id} className="group h-full">
                                                <div className={cn(
                                                    "h-full p-6 rounded-[2.5rem] bg-white dark:bg-card border border-border/40 hover:border-primary/40 hover:shadow-[0_20px_50px_rgba(0,0,0,0.04)] transition-all duration-500 relative overflow-hidden flex flex-col min-h-[180px]",
                                                    !isActive && "opacity-60 grayscale-[0.5]"
                                                )}>
                                                    {/* Hover Glow */}
                                                    <div className="absolute inset-0 bg-gradient-to-br from-primary/[0.03] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                                                    <div className="relative z-10">
                                                        <div className="flex items-start justify-between mb-4">
                                                            <div className="bg-gradient-to-br from-primary/20 via-primary/5 to-transparent border border-primary/20 text-primary w-11 h-11 rounded-2xl flex items-center justify-center group-hover:scale-110 group-hover:shadow-lg group-hover:shadow-primary/10 transition-all duration-500 shadow-inner">
                                                                <IconComponent className="h-5 w-5" />
                                                            </div>
                                                            <div className="flex items-center gap-2">                                                                 <button
                                                                onClick={() => handleToggleSpecialty(spec.id, !!spec.is_active)}
                                                                className={cn(
                                                                    "h-5 w-9 rounded-full relative transition-all duration-500 border border-border/20 shrink-0",
                                                                    spec.is_active ? "bg-green-500 border-green-600/20" : "bg-slate-200 dark:bg-white/5"
                                                                )}
                                                            >
                                                                <div className={cn(
                                                                    "absolute top-0.5 h-3.5 w-3.5 rounded-full bg-white shadow-md transition-all duration-500",
                                                                    spec.is_active ? "left-[18px]" : "left-0.5"
                                                                )} />
                                                            </button>

                                                                <div className="h-4 w-[1px] bg-border/40 mx-1" />                                                                 <Button
                                                                    variant="ghost"
                                                                    size="icon"
                                                                    className="h-8 w-8 rounded-lg hover:bg-primary/10 hover:text-primary text-muted-foreground/30"
                                                                    onClick={() => openEditModal(spec)}
                                                                >
                                                                    <Pencil className="h-3.5 w-3.5" />
                                                                </Button>
                                                                <Button
                                                                    variant="ghost"
                                                                    size="icon"
                                                                    className="h-8 w-8 rounded-lg hover:bg-red-500/10 hover:text-red-500 text-muted-foreground/30"
                                                                    onClick={() => handleDeleteSpecialty(spec.id, spec.name)}
                                                                >
                                                                    <Trash2 className="h-3.5 w-3.5" />
                                                                </Button>

                                                            </div>
                                                        </div>

                                                        <h3 className="text-lg font-black text-foreground mb-1 group-hover:text-primary transition-colors tracking-tight uppercase leading-none">
                                                            {spec.name}
                                                        </h3>
                                                        <p className="text-[10px] text-muted-foreground/60 leading-relaxed font-bold uppercase tracking-widest italic line-clamp-2">
                                                            {spec.description || 'Verified resources.'}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        )
                                    })}
                                </div>
                            </FadeIn>
                        </TabsContent>

                        <TabsContent value="users" className="mt-0 outline-none">
                            <FadeIn delay={0.7}>
                                <div className="space-y-8">


                                    {filteredUsers.length === 0 ? (
                                        <div className="bg-white dark:bg-card border border-border/40 rounded-[3rem] p-40 text-center shadow-[0_20px_60px_rgba(0,0,0,0.03)]">
                                            <div className="flex flex-col items-center gap-8">
                                                <div className="bg-slate-100 dark:bg-slate-900 p-12 rounded-full w-28 h-28 flex items-center justify-center mx-auto border border-dashed border-border">
                                                    <Search className="h-10 w-10 text-muted-foreground/20" />

                                                </div>
                                                <p className="text-3xl font-black tracking-tighter uppercase whitespace-nowrap">Directory Empty</p>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="grid gap-4">
                                            {paginatedUsers.map((profile: Profile) => (
                                                <motion.div
                                                    key={profile.id}
                                                    layout
                                                    className="group bg-white dark:bg-slate-900/40 backdrop-blur-3xl border border-border/40 rounded-xl p-2.5 px-6 hover:border-primary/40 transition-all duration-500"
                                                >
                                                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                                                        <div className="flex items-center gap-4">
                                                            <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-primary/20 via-primary/5 to-transparent border border-primary/20 flex items-center justify-center font-black text-primary text-base shadow-inner group-hover:scale-105 transition-all duration-500 shrink-0">
                                                                {profile.full_name?.charAt(0) || 'U'}
                                                            </div>
                                                            <div className="space-y-0.5">
                                                                <div className="flex items-center gap-3">
                                                                    <div className="flex items-center gap-2.5">
                                                                        <h3 className="text-base font-black tracking-tighter uppercase text-slate-900 dark:text-white group-hover:text-primary transition-colors flex items-center gap-2">
                                                                            <span>{profile.full_name || 'Anonymous User'}</span>
                                                                            {profile.year ? (
                                                                                <Badge variant="secondary" className="bg-primary/5 text-primary border-primary/10 text-[8px] h-4 px-1.5 font-bold uppercase tracking-widest shrink-0">
                                                                                    YR-{profile.year}
                                                                                </Badge>
                                                                            ) : (
                                                                                <span className="text-[7px] font-black text-muted-foreground/10 uppercase tracking-widest shrink-0">
                                                                                    --
                                                                                </span>
                                                                            )}
                                                                        </h3>
                                                                    </div>
                                                                    <Badge variant="outline" className={cn(
                                                                        "font-black text-[7px] border-none rounded-full px-1.5 py-0 uppercase tracking-widest",
                                                                        profile.role === 'admin'
                                                                            ? "bg-primary text-white"
                                                                            : "bg-slate-100 dark:bg-white/5 text-muted-foreground/60"
                                                                    )}>
                                                                        {profile.role === 'admin' ? 'Root' : 'Member'}
                                                                    </Badge>
                                                                </div>
                                                                <div className="flex items-center gap-2 text-[8px] font-black text-muted-foreground/30 uppercase tracking-widest">
                                                                    <Mail className="h-2.5 w-2.5" />
                                                                    {profile.email}
                                                                </div>
                                                            </div>
                                                        </div>

                                                        <div className="flex items-center gap-6">
                                                            <div className="hidden lg:flex flex-col gap-0.5 items-end">
                                                                <span className="text-[7px] font-black text-muted-foreground/25 uppercase tracking-[0.2em]">Joined</span>
                                                                <span className="text-[8px] font-black text-muted-foreground/50 tracking-widest uppercase tabular-nums">
                                                                    {new Date(profile.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'short' })}
                                                                </span>
                                                            </div>

                                                            <div className="h-5 w-[1px] bg-border/20" />

                                                            <div className="flex items-center gap-4">
                                                                <div className="flex items-center gap-2 px-2.5 py-1 bg-green-500/5 rounded-lg border border-green-500/10">
                                                                    <div className="h-1 w-1 rounded-full bg-green-500 animate-pulse" />
                                                                    <span className="text-[7px] font-black text-green-600 uppercase tracking-widest">Active</span>
                                                                </div>
                                                                {/* Removed MoreVertical menu as requested */}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </motion.div>
                                            ))}

                                            {/* User Pagination Controls */}
                                            {totalUserPages > 1 && (
                                                <div className="flex items-center justify-between pt-8 px-2">
                                                    <div className="text-[10px] font-black text-muted-foreground/40 uppercase tracking-widest">
                                                        Showing <span className="text-foreground">{(userPage - 1) * usersPerPage + 1}</span> - <span className="text-foreground">{Math.min(userPage * usersPerPage, filteredUsers.length)}</span> of <span className="text-foreground">{filteredUsers.length}</span> members
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            disabled={userPage === 1}
                                                            onClick={() => setUserPage(p => Math.max(1, p - 1))}
                                                            className="h-10 px-5 rounded-xl border-border/40 text-[9px] font-black uppercase tracking-widest hover:bg-slate-50 dark:hover:bg-white/5 transition-all active:scale-95 disabled:opacity-30"
                                                        >
                                                            Prev
                                                        </Button>
                                                        <div className="flex items-center gap-1 mx-2">
                                                            {Array.from({ length: totalUserPages }, (_, i) => i + 1).map((p) => (
                                                                <button
                                                                    key={p}
                                                                    onClick={() => setUserPage(p)}
                                                                    className={cn(
                                                                        "h-8 w-8 rounded-lg text-[10px] font-black transition-all",
                                                                        userPage === p 
                                                                            ? "bg-primary text-white shadow-lg shadow-primary/20 scale-110" 
                                                                            : "text-muted-foreground/40 hover:bg-slate-100 dark:hover:bg-white/5"
                                                                    )}
                                                                >
                                                                    {p}
                                                                </button>
                                                            ))}
                                                        </div>
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            disabled={userPage === totalUserPages}
                                                            onClick={() => setUserPage(p => Math.min(totalUserPages, p + 1))}
                                                            className="h-10 px-5 rounded-xl border-border/40 text-[9px] font-black uppercase tracking-widest hover:bg-slate-50 dark:hover:bg-white/5 transition-all active:scale-95 disabled:opacity-30"
                                                        >
                                                            Next
                                                        </Button>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </FadeIn>
                        </TabsContent>
                    </Tabs>
                </div>
            </div>

            {/* Specialty Modal */}
            <Dialog open={isSpecialtyModalOpen} onOpenChange={setIsSpecialtyModalOpen}>
                <DialogContent showCloseButton={false} className="max-w-md rounded-[2.5rem] border-border/40 bg-white dark:bg-slate-900 p-0 overflow-hidden shadow-2xl">

                    <div className="p-10 space-y-8">
                        <DialogHeader>
                            <div className="flex items-center gap-4 mb-2">
                                <div className="p-3 bg-primary/10 rounded-2xl border border-primary/20">
                                    <Activity className="h-6 w-6 text-primary" />
                                </div>
                                <div className="text-left">
                                    <DialogTitle className="text-xl font-bold text-foreground">
                                        {isEditingSpecialty ? 'Edit Category' : 'Add Category'}
                                    </DialogTitle>
                                    <DialogDescription className="text-sm text-muted-foreground mt-1">
                                        {isEditingSpecialty ? 'Update existing study area' : 'Create a new study area'}
                                    </DialogDescription>
                                </div>
                            </div>
                        </DialogHeader>

                        <div className="space-y-6">
                            <div className="space-y-2">
                                <Label htmlFor="categoryName" className="text-sm font-bold text-muted-foreground/80 pl-1">Category Name</Label>
                                <Input
                                    id="categoryName"
                                    placeholder="Cardiology, Surgery, etc."
                                    value={newSpecialtyName}
                                    onChange={(e) => setNewSpecialtyName(e.target.value)}
                                    className="h-12 rounded-xl bg-slate-50 dark:bg-white/5 border-border/20 focus:ring-2 focus:ring-primary/20 px-4 transition-all text-sm font-medium"
                                />
                            </div>

                            <div className="space-y-3">
                                <Label className="text-sm font-bold text-muted-foreground/80 pl-1">Select Icon</Label>
                                <div className="grid grid-cols-5 gap-2 p-3 bg-slate-50 dark:bg-white/5 rounded-2xl border border-border/10">
                                    {['Stethoscope', 'GraduationCap', 'HeartPulse', 'Dna', 'Microscope', 'Pill', 'FlaskConical', 'Syringe', 'Baby', 'Brain', 'Radiation', 'Activity', 'Archive'].map(iconName => {
                                        const Icon = {
                                            Stethoscope, GraduationCap, HeartPulse, Dna, Microscope,
                                            Pill, FlaskConical, Syringe, Baby, Brain, Radiation, Activity, Archive
                                        }[iconName] || LayoutGrid
                                        const isSelected = newSpecialtyIcon === iconName
                                        return (
                                            <button
                                                key={iconName}
                                                type="button"
                                                onClick={() => setNewSpecialtyIcon(iconName)}
                                                className={cn(
                                                    "h-10 w-10 rounded-lg flex items-center justify-center transition-all",
                                                    isSelected
                                                        ? "bg-primary text-white shadow-lg scale-110"
                                                        : "bg-white dark:bg-white/5 text-muted-foreground/30 hover:bg-primary/5 hover:text-primary"
                                                )}
                                            >
                                                <Icon className="h-4 w-4" />
                                            </button>
                                        )
                                    })}
                                </div>
                            </div>

                            <div className="space-y-3">
                                <Label htmlFor="categoryDesc" className="text-sm font-bold text-muted-foreground/80 pl-1">Description (Optional)</Label>
                                <Input
                                    id="categoryDesc"
                                    placeholder="Short summary..."
                                    value={newSpecialtyDesc}
                                    onChange={(e) => setNewSpecialtyDesc(e.target.value)}
                                    className="h-12 rounded-xl bg-slate-50 dark:bg-white/5 border-border/20 focus:ring-2 focus:ring-primary/20 px-4 transition-all text-sm font-medium"
                                />
                            </div>
                        </div>

                        <DialogFooter className="flex-col sm:flex-col gap-3">
                            <Button
                                onClick={handleAddSpecialty}
                                className="w-full h-14 rounded-xl font-bold bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:bg-primary hover:text-white shadow-xl transition-all active:scale-95 group"
                            >
                                {isEditingSpecialty ? 'Update Category' : 'Add Category'}
                                <ChevronRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                            </Button>
                            <Button
                                variant="ghost"
                                onClick={() => setIsSpecialtyModalOpen(false)}
                                className="w-full h-12 rounded-xl font-bold text-muted-foreground hover:text-foreground"
                            >
                                Cancel
                            </Button>
                        </DialogFooter>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Rejection Modal */}
            <Dialog open={isRejectModalOpen} onOpenChange={setIsRejectModalOpen}>
                <DialogContent showCloseButton={false} className="max-w-md rounded-[2.5rem] border-border/40 bg-white dark:bg-slate-900 p-0 overflow-hidden shadow-2xl">
                    <div className="p-10 space-y-8">
                        <DialogHeader>
                            <div className="flex items-center gap-4 mb-2">
                                <div className="p-3 bg-red-500/10 rounded-2xl">
                                    <ShieldAlert className="h-6 w-6 text-red-600" />
                                </div>
                                <div className="text-left">
                                    <DialogTitle className="text-xl font-bold text-foreground">Reject Document</DialogTitle>
                                    <DialogDescription className="text-sm text-muted-foreground mt-1">
                                        Why are you rejecting this?
                                    </DialogDescription>
                                </div>
                            </div>
                        </DialogHeader>

                        <div className="space-y-4">
                            <Label htmlFor="reason" className="text-sm font-bold text-muted-foreground/80 pl-1">Reason for Rejection</Label>
                            <Input
                                id="reason"
                                placeholder="E.g., missing pages, incorrect category..."
                                value={rejectionReason}
                                onChange={(e) => setRejectionReason(e.target.value)}
                                className="h-14 rounded-xl bg-slate-50 dark:bg-white/5 border-border/20 focus:ring-2 focus:ring-red-500/20 px-6 transition-all font-medium text-red-600 placeholder:text-red-500/30"
                            />
                        </div>

                        <DialogFooter className="flex-col sm:flex-col gap-3">
                            <Button
                                variant="destructive"
                                className="w-full h-12 rounded-xl font-bold bg-red-600 hover:bg-red-700 shadow-xl shadow-red-500/20 border-none"
                                onClick={confirmReject}
                            >
                                Reject Document
                            </Button>
                            <Button
                                variant="ghost"
                                className="w-full h-12 rounded-xl font-bold text-muted-foreground hover:text-foreground"
                                onClick={() => setIsRejectModalOpen(false)}
                            >
                                Cancel
                            </Button>
                        </DialogFooter>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Approval Confirmation Modal */}
            <Dialog open={isApproveConfirmOpen} onOpenChange={setIsApproveConfirmOpen}>
                <DialogContent showCloseButton={false} className="max-w-md rounded-[2.5rem] border-border/40 bg-white dark:bg-slate-900 p-0 overflow-hidden shadow-2xl">
                    <div className="p-10 space-y-8">
                        <DialogHeader>
                            <div className="flex items-center gap-4 mb-2">
                                <div className="p-3 bg-green-500/10 rounded-2xl">
                                    <Check className="h-6 w-6 text-green-600" />
                                </div>
                                <div className="text-left">
                                    <DialogTitle className="text-xl font-bold text-foreground">Approve Document</DialogTitle>
                                    <DialogDescription className="text-sm text-muted-foreground mt-1">
                                        Ready to make this live?
                                    </DialogDescription>
                                </div>
                            </div>
                        </DialogHeader>

                        <div className="space-y-4">
                            <p className="text-sm text-muted-foreground leading-relaxed">
                                You are about to approve <span className="font-bold text-foreground">&quot;{approvingResource?.title}&quot;</span>. It will be immediately available to all students.
                            </p>
                        </div>

                        <DialogFooter className="flex-col sm:flex-col gap-3">
                            <Button
                                className="w-full h-14 rounded-xl font-bold bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:bg-primary hover:text-white shadow-xl transition-all active:scale-95 group"
                                onClick={confirmApprove}
                            >
                                Confirm Approval
                                <ChevronRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                            </Button>
                            <Button
                                variant="ghost"
                                className="w-full h-12 rounded-xl font-bold text-muted-foreground hover:text-foreground"
                                onClick={() => {
                                    setIsApproveConfirmOpen(false)
                                    setApprovingResource(null)
                                }}
                            >
                                Cancel
                            </Button>
                        </DialogFooter>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Delete Specialty Confirmation Modal */}
            <Dialog open={isDeleteConfirmOpen} onOpenChange={setIsDeleteConfirmOpen}>
                <DialogContent showCloseButton={false} className="max-w-md rounded-[2.5rem] border-border/40 bg-white dark:bg-slate-900 p-0 overflow-hidden shadow-2xl">
                    <div className="p-10 space-y-8">
                        <DialogHeader>
                            <div className="flex items-center gap-4 mb-2">
                                <div className="p-3 bg-red-500/10 rounded-2xl">
                                    <AlertCircle className="h-6 w-6 text-red-600" />
                                </div>
                                <div className="text-left">
                                    <DialogTitle className="text-xl font-bold text-foreground">Delete Category</DialogTitle>
                                    <DialogDescription className="text-sm text-muted-foreground mt-1">
                                        Are you sure you want to delete this?
                                    </DialogDescription>
                                </div>
                            </div>
                        </DialogHeader>

                        <div className="space-y-4">
                            <p className="text-sm text-muted-foreground leading-relaxed">
                                You are about to permanently delete <span className="font-bold text-foreground">&quot;{deletingSpec?.name}&quot;</span>. This action cannot be undone.
                            </p>
                        </div>

                        <DialogFooter className="flex-col sm:flex-col gap-3">
                            <Button
                                variant="destructive"
                                className="w-full h-12 rounded-xl font-bold bg-red-600 hover:bg-red-700"
                                onClick={confirmDeleteSpecialty}
                            >
                                Delete Category
                            </Button>
                            <Button
                                variant="ghost"
                                className="w-full h-12 rounded-xl font-bold text-muted-foreground hover:text-foreground"
                                onClick={() => {
                                    setIsDeleteConfirmOpen(false)
                                    setDeletingSpec(null)
                                }}
                            >
                                Cancel
                            </Button>
                        </DialogFooter>
                    </div>
                </DialogContent>
            </Dialog>

            {/* User Detail Dialog */}
            <Dialog open={isUserDetailOpen} onOpenChange={setIsUserDetailOpen}>
                <DialogContent className="max-w-[380px] rounded-[2rem] p-0 overflow-hidden border-border/40 bg-white dark:bg-slate-900 shadow-2xl">
                    <div className="relative p-8 space-y-6">
                        {/* Background Decoration */}
                        <div className="absolute top-0 right-0 p-16 opacity-5 pointer-events-none">
                            <Users className="h-32 w-32 text-primary" />
                        </div>
                        
                        <div className="flex flex-col items-center text-center space-y-4 relative z-10">
                            <div className="relative group">
                                <div className="h-24 w-24 rounded-3xl bg-primary/10 border-2 border-primary/20 flex items-center justify-center overflow-hidden transition-all group-hover:scale-105 group-hover:border-primary/40">
                                    {selectedUploader?.avatar_url ? (
                                        <img src={selectedUploader.avatar_url} alt={selectedUploader.full_name} className="h-full w-full object-cover" />
                                    ) : (
                                        <Users className="h-10 w-10 text-primary/40" />
                                    )}
                                </div>
                                <div className="absolute -bottom-1 -right-1 h-6 w-6 rounded-full bg-green-500 border-4 border-white dark:border-slate-900 shadow-lg" />
                            </div>

                            <div className="space-y-1">
                                <h3 className="text-xl font-black tracking-tighter uppercase text-slate-900 dark:text-white leading-none">
                                    {selectedUploader?.full_name}
                                </h3>
                                <div className="flex items-center justify-center gap-2">
                                    <Badge variant="outline" className="text-[8px] font-black uppercase tracking-widest text-primary border-primary/20 bg-primary/5 px-2.5 py-0.5 rounded-full">
                                        Member since {selectedUploader?.created_at ? new Date(selectedUploader.created_at).getFullYear() : '2024'}
                                    </Badge>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3 relative z-10">
                            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-white/5 border border-border/40 text-center">
                                <p className="text-[7px] font-black text-muted-foreground/40 uppercase tracking-[0.2em] mb-1">Study Level</p>
                                <p className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-tighter">Year {selectedUploader?.year || 'N/A'}</p>
                            </div>
                            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-white/5 border border-border/40 text-center">
                                <p className="text-[7px] font-black text-muted-foreground/40 uppercase tracking-[0.2em] mb-1">Uploads</p>
                                <p className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-tighter">{selectedUploader?.resources?.[0]?.count || 0} Materials</p>
                            </div>
                        </div>

                        <div className="space-y-2.5 relative z-10">
                            <p className="text-[7px] font-black text-muted-foreground/40 uppercase tracking-[0.2em] px-2 flex items-center gap-2">
                                <FileText className="h-2.5 w-2.5" />
                                Member Biography
                            </p>
                            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-white/5 border border-border/40">
                                <p className="text-[10px] font-bold text-muted-foreground/80 leading-relaxed italic line-clamp-3">
                                    "{selectedUploader?.bio || 'This member hasn\'t shared a bio yet.'}"
                                </p>
                            </div>
                        </div>

                        <Button 
                            variant="ghost" 
                            className="w-full h-10 rounded-xl font-black text-[9px] uppercase tracking-widest text-muted-foreground hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5 transition-all"
                            onClick={() => setIsUserDetailOpen(false)}
                        >
                            Close Profile
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    )
}

