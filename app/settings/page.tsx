'use client'

import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/components/auth-provider'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { toast } from 'sonner'
import { cn, compressImage } from '@/lib/utils'
import {
    Camera, User as UserIcon, Mail, GraduationCap,
    ShieldCheck, Save, Loader2, ArrowLeft, Image as ImageIcon
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { FadeIn, SlideIn, ScaleIn } from '@/components/motion-wrapper'
import { Breadcrumbs } from '@/components/breadcrumbs'

export default function SettingsPage() {
    const { user } = useAuth()
    const router = useRouter()
    const fileInputRef = useRef<HTMLInputElement>(null)
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)

    // Profile State
    const [profile, setProfile] = useState({
        full_name: '',
        email: '',
        year: '',
        bio: '',
        avatar_url: '',
        role: ''
    })

    const [uploading, setUploading] = useState(false)

    useEffect(() => {
        async function loadProfile() {
            if (!user) return

            try {
                const { data, error } = await supabase
                    .from('profiles')
                    .select('*')
                    .eq('id', user.id)
                    .single()

                if (error) throw error

                setProfile({
                    full_name: data.full_name || '',
                    email: data.email || '',
                    year: data.year?.toString() || '',
                    bio: data.bio || '',
                    avatar_url: data.avatar_url || '',
                    role: data.role || ''
                })
            } catch (err: any) {
                console.error("Error loading profile:", err.message)
                toast.error("Failed to load profile data")
            } finally {
                setLoading(false)
            }
        }

        loadProfile()
    }, [user])

    const deleteFileFromStorage = async (url: string) => {
        if (!url) return
        try {
            // Extract path from public URL
            // Format: .../storage/v1/object/public/resources/avatars/filename.jpg
            const path = url.split('/resources/')[1]
            if (path) {
                const { error } = await supabase.storage.from('resources').remove([path])
                if (error) console.error("Error deleting old file:", error)
            }
        } catch (err) {
            console.error("Cleanup error:", err)
        }
    }

    const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        let file = e.target.files?.[0]
        if (!file || !user) return

        try {
            setUploading(true)

            // Validate and Compress Image
            if (!file.type.startsWith('image/')) {
                toast.error("Please upload an image file")
                return
            }

            // Delete old photo first to save space
            if (profile.avatar_url) {
                await deleteFileFromStorage(profile.avatar_url)
            }

            // Compress to ~600x600 for profile pics (Saves significant space)
            try {
                file = await compressImage(file, { maxWidth: 600, maxHeight: 600, quality: 0.8 })
            } catch (err) {
                console.error("Compression skipped:", err)
            }

            // Upload to Supabase Storage
            const fileExt = file.name.split('.').pop()
            const fileName = `${user.id}-${Date.now()}.${fileExt}`
            const filePath = `avatars/${fileName}`

            // Ensure bucket exists or handle error (Assuming 'avatars' bucket exists)
            const { error: uploadError } = await supabase.storage
                .from('resources') // Reusing resources bucket if avatars one doesn't exist
                .upload(filePath, file)

            if (uploadError) {
                console.error("Supabase Storage Error:", uploadError)
                throw uploadError
            }

            // Get Public URL
            const { data: { publicUrl } } = supabase.storage
                .from('resources')
                .getPublicUrl(filePath)

            // Update state and DB
            setProfile(prev => ({ ...prev, avatar_url: publicUrl }))

            const { error: updateError } = await supabase
                .from('profiles')
                .update({ avatar_url: publicUrl })
                .eq('id', user.id)

            if (updateError) {
                console.error("Profile Update Error:", updateError)
                throw updateError
            }

            toast.success("Profile photo updated")
        } catch (err: any) {
            console.error("Detailed Upload Error:", err)
            toast.error(err.message || "Failed to upload photo", {
                description: "Ensure the 'resources' bucket exists and has correct permissions."
            })
        } finally {
            setUploading(false)
        }
    }

    const handleUpdateProfile = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!user) return

        try {
            setSaving(true)

            const { error } = await supabase
                .from('profiles')
                .update({
                    full_name: profile.full_name,
                    year: profile.year ? parseInt(profile.year) : null,
                    bio: profile.bio,
                    avatar_url: profile.avatar_url || null
                })
                .eq('id', user.id)

            if (error) throw error

            toast.success("Profile Updated", {
                description: "Your changes have been saved successfully."
            })

            // Redirect to dashboard
            const redirectPath = profile.role === 'admin' ? '/admin' : '/dashboard'
            router.push(redirectPath)
        } catch (err: any) {
            console.error("Update error:", err.message)
            toast.error("Update failed", { description: err.message })
        } finally {
            setSaving(false)
        }
    }

    if (loading) {
        return (
            <div className="min-h-screen flex flex-col justify-center items-center gap-4 bg-slate-50 dark:bg-[#0B1120]">
                <div className="h-20 w-20 rounded-full border-t-2 border-primary animate-spin" />
                <p className="text-sm font-medium animate-pulse text-muted-foreground">Synchronizing Workspace...</p>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-[#0B1120] pb-20 relative overflow-hidden">
            {/* Background elements */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px]" />
                <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-indigo-500/5 rounded-full blur-[100px]" />
            </div>

            <div className="max-w-3xl mx-auto px-4 mt-12 relative z-10 pb-20">
                <FadeIn delay={0.1}>
                    <div className="flex flex-col gap-6 mb-12">
                        <Breadcrumbs />
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                            <div className="space-y-2">
                                <h1 className="text-4xl md:text-5xl font-black tracking-tighter text-slate-900 dark:text-white leading-tight">
                                    Profile <span className="text-primary">Settings</span>
                                </h1>
                                <p className="text-muted-foreground font-medium uppercase tracking-widest text-[10px] italic">
                                    Manage your personal information and profile picture.
                                </p>
                            </div>
                            <Button
                                variant="outline"
                                onClick={() => router.back()}
                                className="h-10 px-4 rounded-xl border-border/40 hover:bg-slate-100 dark:hover:bg-white/5 font-black text-[9px] uppercase tracking-widest self-start md:self-center"
                            >
                                <ArrowLeft className="mr-2 h-3.5 w-3.5" />
                                Back
                            </Button>
                        </div>
                    </div>
                </FadeIn>

                <SlideIn direction="up" delay={0.3}>
                    <form onSubmit={handleUpdateProfile} className="space-y-8">
                        <Card className="relative overflow-hidden group border-border/40 bg-white/60 dark:bg-card/40 backdrop-blur-3xl rounded-[2.5rem] p-8 shadow-[0_20px_50px_rgba(0,0,0,0.03)]">
                            <CardHeader className="p-0 mb-10">
                                <CardTitle className="text-[10px] font-black uppercase tracking-[0.2em] text-primary mb-2">Personal Information</CardTitle>
                                <CardDescription className="text-xl font-bold text-slate-900 dark:text-white leading-none tracking-tight">Public Profile Details</CardDescription>
                            </CardHeader>

                            <CardContent className="p-0 space-y-10">
                                {/* Avatar Selection */}
                                <div className="flex flex-col md:flex-row items-center gap-10 bg-slate-50/50 dark:bg-white/5 p-8 rounded-[2rem] border border-dashed border-border/40">
                                    <div className="relative group">
                                        <div className="absolute inset-0 bg-primary/20 rounded-full blur-2xl group-hover:bg-primary/40 transition-all duration-700 opacity-0 group-hover:opacity-100" />
                                        <Avatar className="h-32 w-32 border-4 border-white dark:border-slate-900 shadow-2xl relative z-10">
                                            <AvatarImage src={profile.avatar_url || undefined} />
                                            <AvatarFallback className="bg-primary/10 text-primary text-4xl font-black italic">
                                                {profile.full_name?.charAt(0) || 'U'}
                                            </AvatarFallback>
                                        </Avatar>
                                        <button
                                            type="button"
                                            onClick={() => fileInputRef.current?.click()}
                                            className="absolute bottom-1 right-1 h-10 w-10 rounded-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 flex items-center justify-center hover:scale-110 active:scale-95 transition-all shadow-xl z-20 border-2 border-white dark:border-slate-900 group/btn"
                                        >
                                            {uploading ? (
                                                <Loader2 className="h-4 w-4 animate-spin" />
                                            ) : (
                                                <Camera className="h-4 w-4 group-hover/btn:rotate-12 transition-transform" />
                                            )}
                                        </button>
                                        <input
                                            type="file"
                                            ref={fileInputRef}
                                            onChange={handleAvatarUpload}
                                            className="hidden"
                                            accept="image/*"
                                        />
                                    </div>

                                    <div className="flex-1 space-y-4 text-center md:text-left">
                                        <div className="space-y-1">
                                            <h3 className="text-lg font-black tracking-tight text-slate-900 dark:text-white uppercase">Profile Picture</h3>
                                            <p className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-widest italic">Images only. Max size 2MB.</p>
                                        </div>
                                        <div className="flex flex-wrap gap-3 justify-center md:justify-start">
                                            <Button
                                                type="button"
                                                onClick={() => fileInputRef.current?.click()}
                                                disabled={uploading}
                                                className="h-10 px-6 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-black text-[9px] uppercase tracking-widest shadow-lg hover:bg-primary hover:text-white transition-all active:scale-95 border-none"
                                            >
                                                <ImageIcon className="mr-2 h-3.5 w-3.5" />
                                                Change Photo
                                            </Button>
                                            <Button
                                                type="button"
                                                onClick={async () => {
                                                    if (!user) return
                                                    try {
                                                        // Delete from storage first
                                                        if (profile.avatar_url) {
                                                            await deleteFileFromStorage(profile.avatar_url)
                                                        }

                                                        const { error } = await supabase
                                                            .from('profiles')
                                                            .update({ avatar_url: null })
                                                            .eq('id', user.id)
                                                        if (error) throw error
                                                        setProfile(prev => ({ ...prev, avatar_url: '' }))
                                                        toast.success("Profile photo removed")
                                                    } catch (err: any) {
                                                        toast.error("Failed to remove photo")
                                                    }
                                                }}
                                                variant="outline"
                                                className="h-10 px-6 rounded-xl border-border/40 font-black text-[9px] uppercase tracking-widest hover:bg-red-500/5 hover:text-red-500 transition-all hover:border-red-500/20"
                                            >
                                                Remove
                                            </Button>
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div className="space-y-2.5">
                                        <Label htmlFor="full_name" className="text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground/40 ml-4">Full Name</Label>
                                        <div className="relative">
                                            <UserIcon className="absolute left-5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/40" />
                                            <Input
                                                id="full_name"
                                                value={profile.full_name}
                                                onChange={(e) => setProfile(prev => ({ ...prev, full_name: e.target.value }))}
                                                placeholder="Your Name"
                                                className="h-14 pl-14 pr-6 rounded-[1.5rem] bg-slate-100/50 dark:bg-white/5 border-border/40 focus:border-primary/40 focus:ring-4 focus:ring-primary/5 font-bold text-sm tracking-tight"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2.5">
                                        <Label htmlFor="year" className="text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground/40 ml-4">Current Year</Label>
                                        <div className="relative">
                                            <GraduationCap className="absolute left-5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/40 z-10" />
                                            <Select value={profile.year} onValueChange={(val) => setProfile(prev => ({ ...prev, year: val }))}>
                                                <SelectTrigger className="h-14 pl-14 pr-6 rounded-[1.5rem] bg-slate-100/50 dark:bg-white/5 border-border/40 focus:border-primary/40 focus:ring-4 focus:ring-primary/5 font-bold text-sm tracking-tight outline-none ring-0">
                                                    <SelectValue placeholder="Select Year" />
                                                </SelectTrigger>
                                                <SelectContent className="rounded-2xl border-border/40 shadow-2xl p-2">
                                                    {[1, 2, 3, 4, 5].map((num) => (
                                                        <SelectItem key={num} value={num.toString()} className="rounded-xl h-11 font-bold text-sm uppercase tracking-widest focus:bg-primary/5 focus:text-primary">
                                                            Year {num}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>

                                    <div className="md:col-span-2 space-y-2.5">
                                        <Label htmlFor="email" className="text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground/40 ml-4">Email Address</Label>
                                        <div className="relative">
                                            <Mail className="absolute left-5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/40" />
                                            <Input
                                                id="email"
                                                value={profile.email}
                                                disabled
                                                className="h-14 pl-14 pr-6 rounded-[1.5rem] bg-slate-100/30 dark:bg-white/[0.02] border-border/40 text-muted-foreground/40 cursor-not-allowed font-bold text-sm tracking-tight"
                                            />
                                        </div>
                                    </div>

                                    <div className="md:col-span-2 space-y-2.5">
                                        <Label htmlFor="bio" className="text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground/40 ml-4">About You / Bio</Label>
                                        <Textarea
                                            id="bio"
                                            value={profile.bio}
                                            onChange={(e) => setProfile(prev => ({ ...prev, bio: e.target.value }))}
                                            placeholder="Short bio about your clinical interests..."
                                            className="min-h-[140px] p-6 rounded-[1.5rem] bg-slate-100/50 dark:bg-white/5 border-border/40 focus:border-primary/40 focus:ring-4 focus:ring-primary/5 font-bold text-sm leading-relaxed"
                                        />
                                    </div>
                                </div>

                                <div className="pt-6 border-t border-border/40 flex flex-col md:flex-row items-center justify-between gap-6">
                                    <div className="flex items-center gap-4">
                                        <div className="flex items-center gap-2 px-4 py-2 bg-primary/5 rounded-full border border-primary/20">
                                            <ShieldCheck className="h-3.5 w-3.5 text-primary" />
                                            <span className="text-[8px] font-black uppercase tracking-[0.2em] text-primary">{profile.role === 'admin' ? 'Admin' : 'Member'} Account</span>
                                        </div>
                                        <p className="text-[9px] font-bold text-muted-foreground/40 uppercase tracking-widest italic">Your data is secure</p>
                                    </div>

                                    <Button
                                        type="submit"
                                        disabled={saving}
                                        className="w-full md:w-auto h-14 px-12 rounded-2xl bg-primary text-white font-black text-[11px] uppercase tracking-[0.2em] shadow-[0_15px_30px_rgba(var(--primary-rgb),0.2)] hover:scale-[1.02] active:scale-[0.98] transition-all border-none group overflow-hidden relative"
                                    >
                                        <span className="relative z-10 flex items-center gap-3">
                                            {saving ? (
                                                <>
                                                    <Loader2 className="h-4 w-4 animate-spin" />
                                                    Saving...
                                                </>
                                            ) : (
                                                <>
                                                    <Save className="h-4 w-4 group-hover:rotate-12 transition-transform" />
                                                    Save Changes
                                                </>
                                            )}
                                        </span>
                                        <motion.div
                                            className="absolute inset-0 bg-white/20"
                                            initial={{ x: '-100%' }}
                                            whileHover={{ x: '100%' }}
                                            transition={{ duration: 0.6 }}
                                        />
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </form>
                </SlideIn>
            </div>
        </div>
    )
}
