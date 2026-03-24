'use client'

export const dynamic = 'force-dynamic';

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/components/auth-provider'
import { supabase } from '@/lib/supabase'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ResourceCard, Resource } from '@/components/resource-card'
import { Button } from '@/components/ui/button'
import { Upload, Download, FileText, Activity, Stethoscope, ShieldCheck } from 'lucide-react'
import { AnatomicalHeart } from '@/components/icons/anatomical-heart'
import Link from 'next/link'
import { FadeIn, ScaleIn } from '@/components/motion-wrapper'
import { Breadcrumbs } from '@/components/breadcrumbs'

export default function DashboardPage() {
    const { user } = useAuth()
    const router = useRouter()
    const [stats, setStats] = useState({ uploads: 0, downloads: 0 })
    const [recentResources, setRecentResources] = useState<Resource[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        async function loadData() {
            if (!user) return

            // Check if user is admin and redirect
            const { data: profile } = await supabase
                .from('profiles')
                .select('role')
                .eq('id', user.id)
                .single()

            if (profile?.role === 'admin') {
                router.push('/admin')
                return
            }

            // Load Stats
            const { count: uploadsCount } = await supabase
                .from('resources')
                .select('*', { count: 'exact', head: true })
                .eq('uploaded_by', user.id)

            const { count: downloadsCount } = await supabase
                .from('downloads')
                .select('*', { count: 'exact', head: true })
                .eq('user_id', user.id)

            setStats({
                uploads: uploadsCount || 0,
                downloads: downloadsCount || 0
            })

            // Load Recent Resources (Approved ones)
            const { data } = await supabase
                .from('resources')
                .select('*, profiles!resources_uploaded_by_fkey(full_name)')
                .eq('status', 'approved')
                .order('created_at', { ascending: false })
                .limit(6)

            if (data) {
                setRecentResources(data as unknown as Resource[])
            }

            setLoading(false)
        }

        loadData()
    }, [user, router])

    if (loading) return (
        <div className="min-h-screen flex flex-col justify-center items-center gap-4 bg-slate-50 dark:bg-[#06080F]">
            <div className="relative">
                <div className="h-20 w-20 rounded-full border-t-2 border-primary animate-spin" />
                <Stethoscope className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-8 w-8 text-primary animate-pulse" />
            </div>
            <p className="text-sm font-medium animate-pulse text-muted-foreground">Initializing Dashboard...</p>
        </div>
    )

    return (
        <div className="min-h-screen bg-white dark:bg-[#02040A] relative overflow-hidden pb-12">
            {/* Premium Background Elements */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-primary/10 rounded-full blur-[120px] dark:bg-primary/20 animate-pulse" />
                <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-500/10 rounded-full blur-[120px] dark:bg-blue-500/15" />
                <div className="absolute top-[20%] left-[5%] w-[40%] h-[40%] bg-indigo-500/10 rounded-full blur-[120px] dark:bg-indigo-500/15" />
                <div className="absolute top-[40%] right-[30%] w-[20%] h-[20%] bg-purple-500/10 rounded-full blur-[80px] dark:bg-purple-500/10" />
            </div>

            {/* Floating Background Icons */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-[0.03] dark:opacity-[0.05]">
                <Activity className="absolute top-[15%] left-[10%] h-32 w-32 rotate-12" />
                <Stethoscope className="absolute bottom-[20%] right-[15%] h-40 w-40 -rotate-12" />
                <AnatomicalHeart className="absolute top-[40%] right-[10%] h-48 w-48 rotate-45" />
                <FileText className="absolute bottom-[10%] left-[20%] h-24 w-24 -rotate-12" />
            </div>

            {/* Subtle Grid Effect */}
            <div className="fixed inset-0 bg-[linear-gradient(to_right,#80808007_1px,transparent_1px),linear-gradient(to_bottom,#80808007_1px,transparent_1px)] bg-[size:60px_60px] pointer-events-none" />

            <div className="container py-10 space-y-8 pl-8 pr-4 relative z-10">
                <Breadcrumbs />
            <FadeIn>
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 border-b border-border/40 pb-6">
                    <div className="space-y-1">
                        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
                            <Activity className="h-6 w-6 text-primary" />
                            Student Dashboard
                        </h1>
                        <p className="text-muted-foreground font-medium text-sm pl-9">Welcome back, {user?.user_metadata?.full_name || user?.email?.split('@')[0]}</p>
                    </div>
                </div>
            </FadeIn>

            {/* Quick Actions & Stats Grid */}
            {/* Main Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <ScaleIn delay={0.1}>
                    <Link href="/upload" className="block h-full">
                        <Card className="h-full border-primary/20 bg-primary/5 hover:bg-primary/10 transition-all cursor-pointer group relative overflow-hidden">
                            <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                            <CardContent className="flex flex-col items-center justify-center h-full py-8 space-y-4 text-center">
                                <div className="p-4 rounded-xl bg-primary/10 group-hover:bg-primary/20 transition-colors">
                                    <Upload className="h-8 w-8 text-primary group-hover:scale-110 transition-transform duration-300" />
                                </div>
                                <div className="space-y-1">
                                    <h3 className="font-bold text-foreground">Upload Material</h3>
                                    <p className="text-xs text-muted-foreground px-4">Share notes with the community</p>
                                </div>
                            </CardContent>
                        </Card>
                    </Link>
                </ScaleIn>

                <ScaleIn delay={0.2}>
                    <Link href="/my-uploads" className="block h-full">
                        <Card className="h-full border-border/50 bg-card/50 backdrop-blur-md shadow-sm hover:shadow-xl hover:border-primary/30 dark:hover:border-primary/20 transition-all duration-300 group cursor-pointer relative overflow-hidden">
                            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0 relative z-10">
                                <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground group-hover:text-primary transition-colors">My Uploads</CardTitle>
                                <FileText className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-3xl font-bold tracking-tight">{stats.uploads}</div>
                                <p className="text-xs text-muted-foreground mt-1">Files shared by you</p>
                            </CardContent>
                        </Card>
                    </Link>
                </ScaleIn>

                <ScaleIn delay={0.3}>
                    <Card className="h-full border-border/50 bg-card/50 backdrop-blur-md shadow-sm hover:shadow-xl hover:border-primary/30 dark:hover:border-primary/20 transition-all duration-300 group relative overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0 relative z-10">
                            <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground group-hover:text-primary transition-colors">Downloads</CardTitle>
                            <Download className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold tracking-tight">{stats.downloads}</div>
                            <p className="text-xs text-muted-foreground mt-1">Materials accessed</p>
                        </CardContent>
                    </Card>
                </ScaleIn>
            </div>

            <div className="space-y-6 pt-2">
                <div className="flex justify-between items-end pl-1">
                    <div>
                        <h2 className="text-xl font-bold tracking-tight flex items-center gap-2">
                            <Stethoscope className="h-5 w-5 text-primary" />
                            Recent Materials
                        </h2>
                        <p className="text-muted-foreground text-xs font-medium pl-7">Latest study materials.</p>
                    </div>
                    <Link href="/browse">
                        <Button variant="ghost" className="font-bold text-primary hover:bg-primary/5 uppercase text-xs tracking-widest px-4 h-8 group">
                            View All
                            <Activity className="ml-2 h-3 w-3 group-hover:rotate-12 transition-transform" />
                        </Button>
                    </Link>
                </div>

                {recentResources.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 px-1">
                        {recentResources.map((resource) => (
                            <ResourceCard key={resource.id} resource={resource} />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-16 bg-muted/20 border-2 border-dashed border-border/50 rounded-2xl mx-1">
                        <div className="bg-muted p-3 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-3">
                            <ShieldCheck className="h-6 w-6 text-muted-foreground/50" />
                        </div>
                        <h3 className="text-lg font-bold">No resources found.</h3>
                        <p className="text-muted-foreground mt-1 text-sm font-medium">Be the first to share your notes!</p>
                    </div>
                )}
            </div>
        </div>
    </div>
    )
}
