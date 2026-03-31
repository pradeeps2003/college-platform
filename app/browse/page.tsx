import Link from 'next/link'
import React, { Suspense } from 'react'
import { FilterSidebar } from '@/components/filter-sidebar'
import { ResourceCard, Resource } from '@/components/resource-card'

import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/server'
import { FadeIn, SlideIn } from '@/components/motion-wrapper'
import {
    Stethoscope,
    Activity,
    Syringe,
    Pill,
    Brain,
    HeartPulse,
    Dna,
    Microscope,
    FlaskConical,
    GraduationCap,
    Radiation,
    Baby
} from 'lucide-react'
import { AnatomicalHeart } from '@/components/icons/anatomical-heart'
import { BrowseToolbar } from '@/components/browse-toolbar'
import { ActiveFilters } from '@/components/active-filters'
import { Breadcrumbs } from '@/components/breadcrumbs'

export const dynamic = 'force-dynamic';

const iconMap: Record<string, React.ReactNode> = {
    'anatomy': <GraduationCap className="h-3.5 w-3.5" />,
    'physiology': <HeartPulse className="h-3.5 w-3.5" />,
    'biochemistry': <Dna className="h-3.5 w-3.5" />,
    'pathology': <Microscope className="h-3.5 w-3.5" />,
    'pharmacology': <Pill className="h-3.5 w-3.5" />,
    'microbiology': <FlaskConical className="h-3.5 w-3.5" />,
    'medicine': <AnatomicalHeart className="h-3.5 w-3.5" />,
    'surgery': <Syringe className="h-3.5 w-3.5" />,
    'pediatrics': <Baby className="h-3.5 w-3.5" />,
    'psychiatry': <Brain className="h-3.5 w-3.5" />,
    'radiology': <Radiation className="h-3.5 w-3.5" />,
}

function getCategoryIcon(name: string) {
    const lowerName = name.toLowerCase()
    for (const [key, icon] of Object.entries(iconMap)) {
        if (lowerName.includes(key)) return icon
    }
    return <Stethoscope className="h-3.5 w-3.5" />
}

async function getResources(supabase: any, searchParams: { [key: string]: string | string[] | undefined }) {
    const dept = searchParams.dept as string
    const sem = searchParams.sem as string
    const q = searchParams.q as string
    const type = searchParams.type as string
    const sort = (searchParams.sort as string) || 'newest'

    let query = supabase
        .from('resources')
        .select('*, profiles!resources_uploaded_by_fkey(full_name)')
        .eq('status', 'approved')

    if (dept) query = query.eq('department', dept)
    if (sem) query = query.eq('semester', parseInt(sem))
    if (q) query = query.or(`title.ilike.%${q}%,description.ilike.%${q}%,topic.ilike.%${q}%`)

    if (type && type !== 'all') {
        if (type === 'pdf') {
            query = query.ilike('file_type', '%pdf%')
        } else if (type === 'image') {
            query = query.or('file_type.ilike.%image%,file_type.ilike.%png%,file_type.ilike.%jpg%,file_type.ilike.%jpeg%')
        }
    }

    if (sort === 'popular') {
        query = query.order('download_count', { ascending: false })
    } else {
        query = query.order('created_at', { ascending: false })
    }

    const { data, error } = await query
    if (error) {
        console.error('Error fetching resources:', error)
        return []
    }
    return data as unknown as Resource[]
}

async function getFilterOptions(supabase: any) {
    const { data: specTableData } = await supabase
        .from('specialties')
        .select('name, icon_name')
        .eq('is_active', true)
        .order('name')

    let departments: { name: string; icon: React.ReactNode }[] = []
    if (specTableData && specTableData.length > 0) {
        departments = specTableData.map((spec: { name: string; icon_name: string }) => ({
            name: spec.name,
            icon: getCategoryIcon(spec.name),
        }))
    } else {
        const { data: deptData } = await supabase
            .from('resources')
            .select('department')
            .eq('status', 'approved')
        departments = [...new Set((deptData || []).map((d: any) => d.department))]
            .filter((name): name is string => Boolean(name))
            .sort()
            .map(name => ({ name, icon: getCategoryIcon(name) }))
    }

    return { departments }
}

export default async function BrowsePage({
    searchParams: searchParamsPromise,
}: {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
    const searchParams = await searchParamsPromise
    const supabase = await createClient()
    const resources = await getResources(supabase, searchParams)
    const { departments } = await getFilterOptions(supabase)

    return (
        <div className="min-h-screen bg-background transition-colors duration-500">

            <div className="container mx-auto py-10 px-4">
                <Breadcrumbs />
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-16">
                    <aside className="lg:block relative">
                        <Suspense fallback={
                            <div className="h-96 w-full animate-pulse bg-muted/20 rounded-[2.5rem] flex flex-col items-center justify-center p-8 border border-border/40">
                                <Activity className="h-8 w-8 text-primary/20 mb-4 animate-spin" />
                                <div className="space-y-3 w-full">
                                    <div className="h-4 bg-muted/30 rounded-full w-3/4 mx-auto" />
                                    <div className="h-4 bg-muted/30 rounded-full w-1/2 mx-auto" />
                                </div>
                            </div>
                        }>
                            <FilterSidebar dynamicDepartments={departments} />
                        </Suspense>
                    </aside>

                    <main className="lg:col-span-3 space-y-10">
                        <Suspense fallback={<div className="h-20 w-full animate-pulse bg-muted/10 rounded-2xl" />}>
                            <BrowseToolbar totalResults={resources.length} />
                        </Suspense>
                        <Suspense fallback={<div className="h-10 w-full animate-pulse bg-muted/5 rounded-xl" />}>
                            <ActiveFilters />
                        </Suspense>

                        {resources.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 lg:gap-8">
                                {resources.map((resource, index) => (
                                    <SlideIn key={resource.id} delay={0.03 * (index % 12)} direction="up">
                                        <ResourceCard resource={resource} />
                                    </SlideIn>
                                ))}
                            </div>
                        ) : (
                            <FadeIn delay={0.2} className="relative flex flex-col items-center justify-center py-52 rounded-[4rem] border border-border/10 text-center px-10 overflow-hidden bg-gradient-to-b from-transparent to-secondary/5 mb-20">
                                <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(var(--border) 1px, transparent 1px)', backgroundSize: '32px 32px' }} />
                                <div className="relative z-10 space-y-8">
                                    <div className="bg-white dark:bg-card p-8 rounded-[3rem] shadow-2xl border border-border/50 inline-flex">
                                        <Stethoscope className="h-20 w-20 text-primary" />
                                    </div>
                                    <div className="space-y-2">
                                         <h3 className="text-xl font-bold">No Materials Found</h3>
                                         <p className="text-sm text-muted-foreground">Try adjusting your filters or search query.</p>
                                     </div>
                                    <Link href="/browse">
                                        <Button variant="outline" className="rounded-xl px-8 h-12 bg-white/50 dark:bg-white/5 border-border/40 dark:border-white/10 backdrop-blur-md font-bold text-xs uppercase tracking-widest text-foreground dark:text-white hover:bg-primary/5 dark:hover:bg-primary/10 transition-all">
                                            Clear All Filters
                                        </Button>
                                    </Link>
                                </div>
                            </FadeIn>
                        )}
                    </main>
                </div>
            </div>
        </div>
    )
}
