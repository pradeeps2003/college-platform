import Link from 'next/link'
import React, { Suspense } from 'react'
import { redirect } from 'next/navigation'
import { Button } from '@/components/ui/button'

import { SearchBar } from '@/components/search-bar'
import {
  Stethoscope,
  Activity,
  BookOpen,
  GraduationCap,
  CloudDownload,
  Users,
  Microscope,
  Baby,
  Brain,
  Syringe,
  Pill,
  ShieldCheck,
  HeartPulse,
  FlaskConical,
  Dna,
  Radiation
} from 'lucide-react'
import { AnatomicalHeart } from '@/components/icons/anatomical-heart'
import { supabase } from '@/lib/supabase'
import { FadeIn, SlideIn, ScaleIn } from '@/components/motion-wrapper'
import { DomainGrid } from '@/components/domain-grid'
import { DynamicHeroTitle } from '@/components/dynamic-title'

// Helper to map icon names to components
const getIconComponent = (iconName: string, className: string = "h-5 w-5 text-primary") => {
  const IconMap: Record<string, any> = {
    Stethoscope, Activity, BookOpen, GraduationCap, Microscope, Baby, Brain, Syringe, Pill, HeartPulse, FlaskConical, Dna, Radiation, AnatomicalHeart
  }
  const Icon = IconMap[iconName] || Stethoscope
  return <Icon className={className} />
}

async function getLanderData() {
  const { data: { user } } = await supabase.auth.getUser()
  
  // If admin, redirect to admin dashboard
  if (user) {
    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
    if (profile?.role === 'admin') {
      redirect('/admin')
    }
  }

  const { count: resourcesCount } = await supabase.from('resources').select('*', { count: 'exact', head: true }).eq('status', 'approved')

  const { count: usersCount } = await supabase.from('profiles').select('*', { count: 'exact', head: true })
  
  // Fetch dynamic specialties
  const { data: specData } = await supabase.from('specialties').select('*').eq('is_active', true).order('name')

  // Sum downloads
  const { data: downloadData } = await supabase.from('resources').select('download_count').eq('status', 'approved')
  const totalDownloads = (downloadData || []).reduce((sum: number, item: any) => sum + (item.download_count || 0), 0)

  // Get counts per specialty
  const specialtyCounts: Record<string, number> = {}
  if (specData) {
    for (const s of specData) {
      const { count } = await supabase.from('resources').select('*', { count: 'exact', head: true }).eq('department', s.name).eq('status', 'approved')
      specialtyCounts[s.name] = count || 0
    }
  }

  return {
    resources: resourcesCount || 0,
    users: usersCount || 0,
    downloads: totalDownloads,
    specialties: specData || [],
    specialtyCounts: specialtyCounts || {}
  }
}

export default async function Home() {
  const data = await getLanderData()

  const stats = [
    { label: 'Study Materials', value: `${data.resources.toLocaleString()}+`, icon: <BookOpen className="h-5 w-5" />, color: 'bg-primary/10 text-primary' },
    { label: 'Verified Students', value: `${data.users.toLocaleString()}+`, icon: <Users className="h-5 w-5" />, color: 'bg-primary/10 text-primary' },
    { label: 'Files Shared', value: `${data.downloads.toLocaleString()}+`, icon: <CloudDownload className="h-5 w-5" />, color: 'bg-primary/10 text-primary' },
    { label: 'Department Hubs', value: `${data.specialties.length}+`, icon: <Activity className="h-5 w-5" />, color: 'bg-primary/10 text-primary' },
  ]

  const mappedSpecialties = data.specialties.map(s => ({
    name: s.name,
    icon: getIconComponent(s.icon_name),
    desc: s.description || 'Collection of verified study materials.'
  }))

  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative pt-20 pb-32 overflow-hidden">
        {/* Dynamic Background Elements */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1400px] h-[800px] bg-[radial-gradient(circle_at_center,var(--primary)_0%,transparent_70%)] opacity-[0.05] dark:opacity-[0.1] pointer-events-none blur-[120px]" />
        <div className="absolute -top-20 -right-20 w-[600px] h-[600px] bg-primary/10 rounded-full blur-[140px] pointer-events-none" />
        <div className="absolute -bottom-40 -left-20 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[140px] pointer-events-none" />

        {/* Subtle Grid Pattern */}
        <div className="absolute inset-0 opacity-[0.1] dark:opacity-[0.03] pointer-events-none"
          style={{ backgroundImage: 'radial-gradient(circle, var(--foreground) 1px, transparent 1px)', backgroundSize: '40px 40px' }} />



        <div className="container mx-auto px-4 relative z-10">
          <div className="flex flex-col items-center text-center max-w-4xl mx-auto space-y-12 py-0 lg:py-10 relative">
            {/* Floating Icons around the text */}
            <div className="absolute -top-20 -left-64 animate-float opacity-10 hidden lg:block">
              <Brain className="h-24 w-24 text-primary" />
            </div>
            <div className="absolute top-40 -right-64 animate-float-delayed opacity-10 hidden lg:block">
              <HeartPulse className="h-20 w-20 text-primary" />
            </div>
            <div className="absolute bottom-10 -left-48 animate-float-delayed opacity-10 hidden lg:block">
              <Dna className="h-16 w-16 text-primary" />
            </div>
            <div className="absolute -bottom-40 right-20 animate-float opacity-10 hidden lg:block">
              <Microscope className="h-14 w-14 text-primary" />
            </div>
            <div className="absolute top-[-100px] right-[25%] animate-float opacity-[0.07] hidden lg:block">
              <Stethoscope className="h-16 w-16 text-primary" />
            </div>
            <div className="absolute bottom-[0%] right-[-100px] animate-float-delayed opacity-[0.05] hidden lg:block">
              <Activity className="h-24 w-24 text-primary" />
            </div>
            <div className="absolute top-[15%] left-[-160px] animate-float opacity-[0.06] hidden lg:block">
              <FlaskConical className="h-18 w-18 text-primary" />
            </div>
            <div className="absolute bottom-[-60px] left-[10%] animate-float-delayed opacity-[0.07] hidden lg:block">
              <Syringe className="h-12 w-12 text-primary rotate-45" />
            </div>
            <div className="absolute bottom-[70%] right-[15%] animate-float opacity-[0.08] hidden lg:block">
              <Pill className="h-10 w-10 text-primary -rotate-12" />
            </div>

            <FadeIn className="flex flex-col items-center">
              <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-primary/10 text-primary text-[11px] font-bold uppercase tracking-[0.25em] mb-8 border border-primary/20 shadow-sm backdrop-blur-md hover:bg-primary/20 transition-colors cursor-default">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                </span>
                Student Platform v2.0
              </div>

              <DynamicHeroTitle className="text-5xl md:text-7xl mb-6" />

              <p className="text-lg md:text-xl text-muted-foreground/90 max-w-2xl font-medium leading-relaxed">
                A premium platform for academic resources, <br className="hidden md:block" /> study materials, and expert collaboration.
              </p>
            </FadeIn>

            <ScaleIn delay={0.2} className="w-full max-w-2xl">
              <Suspense fallback={<div className="h-14 w-full bg-muted/20 animate-pulse rounded-[1.8rem]" />}>
                <SearchBar />
              </Suspense>

              {/* Quick Navigation Tags */}
              <div className="flex flex-wrap items-center justify-center gap-3 mt-8">
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/40 mr-2">Popular:</span>
                {[
                  { label: 'Anatomy Hub', href: '/browse?q=anatomy' },
                  { label: 'Surgery Notes', href: '/browse?q=surgery' },
                  { label: 'Pharmacology Guide', href: '/browse?q=pharmacology' },
                ].map((tag) => (
                  <Link key={tag.label} href={tag.href}>
                    <button className="px-4 py-1.5 rounded-full bg-secondary/50 dark:bg-white/5 border border-border/40 text-[10px] font-bold text-muted-foreground hover:text-primary hover:border-primary/30 transition-all hover:-translate-y-0.5">
                      {tag.label}
                    </button>
                  </Link>
                ))}
              </div>
            </ScaleIn>

            <FadeIn delay={0.4} className="flex flex-wrap gap-5 justify-center">
              <Link href="/browse">
                <Button
                  size="lg"
                  className="rounded-2xl px-10 h-14 bg-primary hover:bg-primary/90 text-primary-foreground border border-transparent dark:border-white/10 dark:bg-white/5 dark:text-white dark:hover:bg-primary/10 dark:backdrop-blur-md font-bold text-xs shadow-2xl shadow-primary/20 dark:shadow-none transition-all hover:-translate-y-1.5 active:scale-95 uppercase tracking-widest"
                >
                  Browse Materials
                </Button>
              </Link>

              <Link href="/auth/signup">
                <Button
                  size="lg"
                  variant="outline"
                  className="rounded-2xl px-10 h-14 border-border/60 hover:border-primary/50 dark:border-white/10 dark:hover:border-primary/50 bg-white/50 dark:bg-white/5 backdrop-blur-md text-foreground dark:text-white font-bold text-xs transition-all hover:-translate-y-1.5 active:scale-95 uppercase tracking-widest hover:bg-primary/5 dark:hover:bg-primary/10 shadow-lg"
                >
                  Join Community
                </Button>
              </Link>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 border-y border-border/40 bg-white/40 dark:bg-card/40 backdrop-blur-sm relative overflow-hidden">
        {/* Decorative EKG line behind stats */}
        <div className="absolute inset-0 opacity-[0.1] pointer-events-none flex items-center">
          <svg width="100%" height="100" viewBox="0 0 1200 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="stroke-primary stroke-[2]">
            <path d="M0 50 L100 50 L110 20 L130 80 L140 50 L300 50 L310 0 L330 100 L340 50 L600 50 L610 30 L630 70 L640 50 L900 50 L910 10 L930 90 L940 50 L1200 50" />
          </svg>
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, i) => (
              <SlideIn key={stat.label} delay={i * 0.1} direction="up" className="flex flex-col items-center text-center space-y-3">
                <div className={`p-2.5 rounded-[1.2rem] ${stat.color} border border-primary/10 shadow-sm`}>
                  {stat.icon}
                </div>
                <div className="space-y-0.5">
                  <h3 className="text-3xl font-bold tracking-tighter text-foreground">{stat.value}</h3>
                  <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-muted-foreground/60">{stat.label}</p>
                </div>
              </SlideIn>
            ))}
          </div>
        </div>
      </section>

      {/* Specialty Grid */}
      <section className="py-24 px-4 bg-[#F8FAFC] dark:bg-background/20 relative">
        <DomainGrid
          specialties={mappedSpecialties}
          specialtyCounts={data.specialtyCounts}
        />
      </section>
    </div>
  )
}

