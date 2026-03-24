import React from 'react'
import { redirect } from 'next/navigation'
import {
  BookOpen,
  Users,
  CloudDownload,
  Activity,
  Stethoscope,
  Microscope,
  Baby,
  Brain,
  Syringe,
  Pill,
  HeartPulse,
  FlaskConical,
  Dna,
  Radiation
} from 'lucide-react'
import { AnatomicalHeart } from '@/components/icons/anatomical-heart'
import { supabase } from '@/lib/supabase'
import { HomeClient } from '@/components/home-client'

// Helper to map icon names to components
const getIconComponent = (iconName: string, className: string = "h-5 w-5 text-primary") => {
  const IconMap: Record<string, React.ElementType> = {
    Stethoscope, Activity, BookOpen, Microscope, Baby, Brain, Syringe, Pill, HeartPulse, FlaskConical, Dna, Radiation, AnatomicalHeart
  }
  const Icon = IconMap[iconName] || Stethoscope
  return <Icon className={className} />
}

async function getLanderData() {
  const { data: { user } } = await supabase.auth.getUser()
  
  if (user) {
    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
    if (profile?.role === 'admin') {
      redirect('/admin')
    } else {
      redirect('/dashboard')
    }
  }

  const { count: resourcesCount } = await supabase.from('resources').select('*', { count: 'exact', head: true }).eq('status', 'approved')

  const { count: usersCount } = await supabase.from('profiles').select('*', { count: 'exact', head: true })
  
  // Fetch dynamic specialties
  const { data: specData } = await supabase.from('specialties').select('*').eq('is_active', true).order('name')

  // Sum downloads
  const { data: downloadData } = await supabase.from('resources').select('download_count').eq('status', 'approved')
  const totalDownloads = (downloadData || []).reduce((sum: number, item) => sum + ((item as { download_count: number | null }).download_count || 0), 0)

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
    <HomeClient 
      stats={stats} 
      mappedSpecialties={mappedSpecialties} 
      specialtyCounts={data.specialtyCounts} 
    />
  )
}
