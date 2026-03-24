'use client'

import React, { Suspense } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { SearchBar } from '@/components/search-bar'
import {
  Stethoscope,
  Activity,
  BookOpen,
  Users,
  CloudDownload,
  Microscope,
  HeartPulse,
  Dna,
  Syringe,
  Pill,
  FlaskConical,
  Brain
} from 'lucide-react'
import { FadeIn, SlideIn, ScaleIn } from '@/components/motion-wrapper'
import { DomainGrid } from '@/components/domain-grid'
import { DynamicHeroTitle } from '@/components/dynamic-title'
import { HeroSpotlight } from '@/components/hero-spotlight'

interface Specialty {
    name: string
    icon: React.ReactNode
    desc: string
}

interface HomeClientProps {
    stats: {
        label: string
        value: string
        icon: React.ReactNode
        color: string
    }[]
    mappedSpecialties: Specialty[]
    specialtyCounts: Record<string, number>
}

export function HomeClient({ stats, mappedSpecialties, specialtyCounts }: HomeClientProps) {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative pt-20 pb-32 overflow-hidden">
        {/* Dynamic Background Elements */}
        <HeroSpotlight />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1400px] h-[800px] bg-[radial-gradient(circle_at_center,var(--primary)_0%,transparent_70%)] opacity-[0.05] dark:opacity-[0.1] pointer-events-none blur-[120px]" />
        <div className="absolute -top-20 -right-20 w-[600px] h-[600px] bg-primary/10 rounded-full blur-[140px] pointer-events-none" />
        <div className="absolute -bottom-40 -left-20 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[140px] pointer-events-none" />

        {/* Subtle Grid Pattern */}
        <div className="absolute inset-0 opacity-[0.1] dark:opacity-[0.03] pointer-events-none"
          style={{ backgroundImage: 'radial-gradient(circle, var(--foreground) 1px, transparent 1px)', backgroundSize: '40px 40px' }} />

        <div className="container mx-auto px-4 relative z-10">
          <div className="flex flex-col items-center text-center max-w-4xl mx-auto space-y-12 py-0 lg:py-10 relative">
            {/* Floating Icons around the text */}
            <div className="absolute -top-10 -left-10 md:-top-20 md:-left-64 animate-float opacity-[0.05] md:opacity-10 pointer-events-none">
              <Brain className="h-16 w-16 md:h-24 md:w-24 text-primary" />
            </div>
            <div className="absolute top-20 -right-5 md:top-40 md:-right-64 animate-float-delayed opacity-[0.05] md:opacity-10 pointer-events-none">
              <HeartPulse className="h-14 w-14 md:h-20 md:w-20 text-primary" />
            </div>
            <div className="absolute bottom-5 -left-10 md:bottom-10 md:-left-48 animate-float-delayed opacity-[0.05] md:opacity-10 pointer-events-none">
              <Dna className="h-12 w-12 md:h-16 md:w-16 text-primary" />
            </div>
            <div className="absolute -bottom-20 right-0 md:-bottom-40 md:right-20 animate-float opacity-[0.05] md:opacity-10 pointer-events-none">
              <Microscope className="h-10 w-10 md:h-14 md:w-14 text-primary" />
            </div>
            <div className="absolute top-[-50px] right-[10%] md:top-[-100px] md:right-[25%] animate-float opacity-[0.04] md:opacity-[0.07] pointer-events-none">
              <Stethoscope className="h-12 w-12 md:h-16 md:w-16 text-primary" />
            </div>
            <div className="absolute bottom-[-20%] right-[-20px] md:bottom-[0%] md:right-[-100px] animate-float-delayed opacity-[0.03] md:opacity-[0.05] pointer-events-none">
              <Activity className="h-16 w-16 md:h-24 md:w-24 text-primary" />
            </div>
            <div className="absolute top-[5%] left-[-40px] md:top-[15%] md:left-[-160px] animate-float opacity-[0.04] md:opacity-[0.06] pointer-events-none hidden md:block">
              <FlaskConical className="h-18 w-18 text-primary" />
            </div>
            <div className="absolute bottom-[20%] left-[5%] md:bottom-[-60px] md:left-[10%] animate-float-delayed opacity-[0.05] md:opacity-[0.07] pointer-events-none hidden md:block">
              <Syringe className="h-12 w-12 text-primary rotate-45" />
            </div>
            <div className="absolute bottom-[50%] right-[5%] md:bottom-[70%] md:right-[15%] animate-float opacity-[0.05] md:opacity-[0.08] pointer-events-none hidden md:block">
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
              <Link href="/browse" className="block inline-block">
                <Button
                  size="lg"
                  className="rounded-2xl px-10 h-14 bg-primary hover:bg-primary/90 text-primary-foreground border border-transparent dark:border-white/10 dark:bg-white/5 dark:text-white dark:hover:bg-primary/10 dark:backdrop-blur-md font-bold text-xs shadow-2xl shadow-primary/20 dark:shadow-none transition-all active:scale-95 uppercase tracking-widest relative z-10"
                >
                  Browse Materials
                </Button>
              </Link>

              <Link href="/auth/signup" className="block inline-block">
                <Button
                  size="lg"
                  variant="outline"
                  className="rounded-2xl px-10 h-14 border-border/60 hover:border-primary/50 dark:border-white/10 dark:hover:border-primary/50 bg-white/50 dark:bg-white/5 backdrop-blur-md text-foreground dark:text-white font-bold text-xs transition-all active:scale-95 uppercase tracking-widest hover:bg-primary/5 dark:hover:bg-primary/10 shadow-lg relative z-10"
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
        {/* Animated EKG line behind stats */}
        <div className="absolute inset-0 opacity-[0.1] pointer-events-none flex items-center overflow-hidden">
          <svg width="100%" height="100" viewBox="0 0 1200 100" preserveAspectRatio="none" fill="none" xmlns="http://www.w3.org/2000/svg" className="stroke-primary stroke-[2]">
            <motion.path 
              d="M0 50 L100 50 L110 20 L130 80 L140 50 L300 50 L310 0 L330 100 L340 50 L600 50 L610 30 L630 70 L640 50 L900 50 L910 10 L930 90 L940 50 L1200 50" 
              initial={{ pathLength: 1, pathOffset: 0 }}
              animate={{ pathOffset: [0, 1] }}
              transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
              style={{ strokeDasharray: "20, 20" }}
            />
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
          specialtyCounts={specialtyCounts}
        />
      </section>
    </div>
  )
}
