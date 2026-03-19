'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/components/auth-provider'
import { FileUploader } from '@/components/file-uploader'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from 'sonner'
import { Badge } from '@/components/ui/badge'
import { X, Loader2, UploadCloud, FileText, Paperclip, Activity, Stethoscope, ChevronLeft, ShieldCheck, GraduationCap, Archive } from 'lucide-react'
import { FadeIn, SlideIn, ScaleIn } from '@/components/motion-wrapper'
import Link from 'next/link'
import { Breadcrumbs } from '@/components/breadcrumbs'
import { compressImage } from '@/lib/utils'

export default function UploadPage() {
    const { user } = useAuth()
    const router = useRouter()
    const [file, setFile] = useState<File | null>(null)
    const [loading, setLoading] = useState(false)

    // Form State
    const [title, setTitle] = useState('')
    const [description, setDescription] = useState('')
    const [topic, setTopic] = useState('')
    const [subject, setSubject] = useState('')
    const [department, setDepartment] = useState('')
    const [semester, setSemester] = useState('')
    const [tagInput, setTagInput] = useState('')
    const [tags, setTags] = useState<string[]>([])
    const [specialties, setSpecialties] = useState<{ name: string }[]>([])

    useEffect(() => {
        async function fetchSpecialties() {
            const { data } = await supabase
                .from('specialties')
                .select('name')
                .eq('is_active', true)
                .order('name')
            if (data) setSpecialties(data)
        }
        fetchSpecialties()
    }, [])

    const handleAddTag = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && tagInput.trim()) {
            e.preventDefault()
            const cleanTag = tagInput.trim().replace(/^#/, '')
            if (cleanTag && !tags.includes(cleanTag)) {
                setTags([...tags, cleanTag])
            }
            setTagInput('')
        }
    }

    const removeTag = (tagToRemove: string) => {
        setTags(tags.filter(tag => tag !== tagToRemove))
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!file || !user) {
            toast.error("Please ensure a file is selected and you are logged in.")
            return
        }

        setLoading(true)

        try {
            let fileToUpload = file

            // If it's an image, compress it before upload
            if (fileToUpload.type.startsWith('image/')) {
                try {
                    fileToUpload = await compressImage(fileToUpload, { maxWidth: 1600, maxHeight: 1600, quality: 0.85 })
                } catch (err) {
                    console.error("Compression failed, using original:", err)
                }
            }

            // 0. Ensure Profile Exists
            const { data: existingProfile } = await supabase
                .from('profiles')
                .select('id')
                .eq('id', user.id)
                .single()

            if (!existingProfile) {
                const { error: createError } = await supabase
                    .from('profiles')
                    .insert({
                        id: user.id,
                        email: user.email,
                        full_name: user.user_metadata?.full_name || user.email?.split('@')[0],
                        role: 'student',
                    })

                if (createError) console.warn('Profile creation sync error:', createError.message)
            }

            // 1. Upload to Storage
            const fileExt = fileToUpload.name.split('.').pop()
            const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`

            const { data: uploadData, error: uploadError } = await supabase.storage
                .from('resources')
                .upload(fileName, fileToUpload)

            if (uploadError) throw uploadError

            const { data: { publicUrl } } = supabase.storage
                .from('resources')
                .getPublicUrl(fileName)

            // 2. Insert into Database
            const { error: dbError } = await supabase
                .from('resources')
                .insert({
                    title,
                    description,
                    topic,
                    subject,
                    semester: parseInt(semester),
                    department,
                    file_url: publicUrl,
                    file_name: fileToUpload.name,
                    file_type: fileToUpload.type,
                    file_size: fileToUpload.size,
                    uploaded_by: user.id,
                    status: 'pending',
                    tags,
                    created_at: new Date().toISOString()
                })

            if (dbError) throw dbError

            toast.success('Material Uploaded', {
                description: 'Your material has been submitted and is awaiting review.'
            })
            router.push('/dashboard')
            router.refresh()
        } catch (error: any) {
            console.error('Upload failed:', error)
            toast.error('Upload Failed', {
                description: error.message || 'An error occurred during submission.'
            })
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="w-full min-h-screen bg-slate-50 dark:bg-[#06080F] pb-20 relative overflow-hidden text-slate-900 dark:text-slate-100">
            {/* Premium Background Elements */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/5 rounded-full blur-[120px] dark:bg-primary/10" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-500/5 rounded-full blur-[120px] dark:bg-blue-500/10" />
                <div className="absolute top-[20%] right-[5%] w-[30%] h-[30%] bg-indigo-500/5 rounded-full blur-[120px] dark:bg-indigo-500/10" />
            </div>
            
            {/* Floating Background Icons */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-[0.02] dark:opacity-[0.04]">
                <Archive className="absolute top-[10%] right-[15%] h-48 w-48 -rotate-12" />
                <UploadCloud className="absolute bottom-[15%] left-[10%] h-40 w-40 rotate-12" />
                <GraduationCap className="absolute top-[30%] left-[20%] h-32 w-32 -rotate-45" />
            </div>

            {/* Minimal Background Grid Effect */}
            <div className="fixed inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none" />

            {/* Header Content */}
            <div className="relative pt-10 pb-8 px-4 text-center">
                <div className="max-w-2xl mx-auto">
                    <FadeIn>
                        <div className="space-y-3">
                            <Badge variant="outline" className="text-primary border-primary/20 bg-primary/5 uppercase tracking-[0.2em] text-[8px] py-1 px-3 rounded-full">
                                Material Sharing
                            </Badge>
                            <h1 className="text-3xl font-bold tracking-tight">
                                Upload New Resource
                            </h1>
                            <p className="text-muted-foreground text-xs max-w-lg mx-auto font-medium">
                                Share your materials with the community. Select a file and provide details below.
                            </p>
                        </div>
                    </FadeIn>
                </div>
            </div>

            <div className="max-w-2xl mx-auto px-4 relative z-10">
                <Breadcrumbs />
                <div className="space-y-6">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <FadeIn delay={0.1}>
                            <div className="space-y-3">
                                <div className="flex items-center justify-between px-2">
                                    <Label className="text-[9px] font-bold uppercase tracking-[0.2em] text-muted-foreground/60 flex items-center gap-2">
                                        <Paperclip className="h-3.5 w-3.5 text-primary" />
                                        Step 1: Select File
                                    </Label>
                                    <span className="text-[8px] font-bold text-muted-foreground opacity-30 uppercase tracking-widest">limit 20MB</span>
                                </div>
                                <div className="p-0.5 rounded-[2rem] bg-gradient-to-br from-primary/10 via-transparent to-primary/5 shadow-xl">
                                    <div className="bg-white dark:bg-slate-900 rounded-[1.9rem] overflow-hidden">
                                        <FileUploader
                                            onFileSelect={setFile}
                                            accept=".pdf,.docx,.pptx,.txt,.zip,.jpg,.jpeg,.png,.gif"
                                            maxSizeMB={20}
                                        />
                                    </div>
                                </div>
                            </div>
                        </FadeIn>

                        <ScaleIn delay={0.2}>
                            <div className="space-y-3">
                                <div className="flex items-center gap-3 px-2">
                                    <Label className="text-[9px] font-bold uppercase tracking-[0.2em] text-muted-foreground/60 flex items-center gap-2">
                                        <FileText className="h-3.5 w-3.5 text-primary" />
                                        Step 2: Resource Details
                                    </Label>
                                </div>
                                <Card className="border shadow-xl rounded-[2rem] overflow-hidden bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-border/40">
                                    <CardContent className="p-6 space-y-5">
                                        <div className="grid md:grid-cols-2 gap-4">
                                            <div className="space-y-1.5 group">
                                                <Label htmlFor="title" className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground/60 pl-1">Title</Label>
                                                <Input
                                                    id="title"
                                                    placeholder="Enter a descriptive title"
                                                    value={title}
                                                    onChange={(e) => setTitle(e.target.value)}
                                                    required
                                                    className="h-10 rounded-xl bg-slate-50 dark:bg-slate-800/50 border-none focus:ring-2 focus:ring-primary/20 px-4 transition-all text-sm font-medium"
                                                />
                                            </div>

                                            <div className="space-y-1.5 group">
                                                <Label htmlFor="subject" className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground/60 pl-1">Subject</Label>
                                                <Input
                                                    id="subject"
                                                    placeholder="e.g. Anatomy, Medicine"
                                                    value={subject}
                                                    onChange={(e) => setSubject(e.target.value)}
                                                    required
                                                    className="h-10 rounded-xl bg-slate-50 dark:bg-slate-800/50 border-none focus:ring-2 focus:ring-primary/20 px-4 transition-all text-sm font-medium"
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-1.5 group">
                                            <Label htmlFor="description" className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground/60 pl-1">Description (Optional)</Label>
                                            <Textarea
                                                id="description"
                                                placeholder="What's inside this material?"
                                                value={description}
                                                onChange={(e) => setDescription(e.target.value)}
                                                className="min-h-[80px] rounded-xl bg-slate-50 dark:bg-slate-800/50 border-none focus:ring-2 focus:ring-primary/20 px-4 transition-all resize-none py-3 text-sm font-medium"
                                            />
                                        </div>

                                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                            <div className="space-y-1.5 group">
                                                <Label className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground/60 pl-1">Department</Label>
                                                <Select onValueChange={setDepartment} required>
                                                    <SelectTrigger className="h-10 rounded-xl bg-slate-50 dark:bg-slate-800/50 border-none focus:ring-2 focus:ring-primary/20 px-4 transition-all text-sm font-bold">
                                                        <SelectValue placeholder="Select" />
                                                    </SelectTrigger>
                                                    <SelectContent className="rounded-xl">
                                                        {specialties.length > 0 ? (
                                                            specialties.map((spec) => (
                                                                <SelectItem key={spec.name} value={spec.name} className="text-xs">
                                                                    {spec.name}
                                                                </SelectItem>
                                                            ))
                                                        ) : (
                                                            <SelectItem value="General" className="text-xs">General</SelectItem>
                                                        )}
                                                    </SelectContent>
                                                </Select>
                                            </div>

                                            <div className="space-y-1.5 group">
                                                <Label className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground/60 pl-1">Year</Label>
                                                <Select onValueChange={setSemester} required>
                                                    <SelectTrigger className="h-10 rounded-xl bg-slate-50 dark:bg-slate-800/50 border-none focus:ring-2 focus:ring-primary/20 px-4 transition-all text-sm font-bold">
                                                        <SelectValue placeholder="Select" />
                                                    </SelectTrigger>
                                                    <SelectContent className="rounded-xl">
                                                        {[1, 2, 3, 4, 5].map((num) => (
                                                            <SelectItem key={num} value={num.toString()} className="text-xs">
                                                                Year {num}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </div>

                                            <div className="space-y-1.5 group col-span-2 md:col-span-1">
                                                <Label htmlFor="topic" className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground/60 pl-1">Topic</Label>
                                                <Input
                                                    id="topic"
                                                    placeholder="Specific chapter or topic"
                                                    value={topic}
                                                    onChange={(e) => setTopic(e.target.value)}
                                                    required
                                                    className="h-10 rounded-xl bg-slate-50 dark:bg-slate-800/50 border-none focus:ring-2 focus:ring-primary/20 px-4 transition-all text-sm font-bold"
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-3 group border-t border-border/30 pt-4">
                                            <div className="flex items-center justify-between pl-1">
                                                <Label htmlFor="tags" className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground/60">Tags</Label>
                                                <span className="text-[8px] font-medium text-muted-foreground/40 italic">Press Enter to add</span>
                                            </div>
                                            <Input
                                                id="tags"
                                                placeholder="Exam, MCQ, Diagram..."
                                                value={tagInput}
                                                onChange={(e) => setTagInput(e.target.value)}
                                                onKeyDown={handleAddTag}
                                                className="h-10 rounded-xl bg-slate-50 dark:bg-slate-800/50 border-none focus:ring-2 focus:ring-primary/20 px-4 transition-all text-xs font-medium"
                                            />

                                            <div className="flex flex-wrap gap-1.5 min-h-[32px]">
                                                {tags.map((tag) => (
                                                    <Badge key={tag} className="px-2.5 py-0.5 bg-primary/5 text-primary border-primary/10 font-bold text-[8px] uppercase tracking-widest flex items-center gap-1.5 rounded-lg active:scale-95 transition-transform">
                                                        {tag}
                                                        <button
                                                            type="button"
                                                            onClick={() => removeTag(tag)}
                                                            className="hover:text-red-500 transition-colors"
                                                        >
                                                            <X className="h-2.5 w-2.5" />
                                                        </button>
                                                    </Badge>
                                                ))}
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        </ScaleIn>

                        <FadeIn delay={0.3}>
                            <div className="space-y-4">
                                <Button
                                    type="submit"
                                    className="w-full h-14 rounded-2xl bg-primary text-primary-foreground hover:bg-primary/90 font-bold uppercase text-xs tracking-widest shadow-xl shadow-primary/20 transition-all active:scale-[0.98]"
                                    disabled={!file || loading}
                                >
                                    {loading ? (
                                        <>
                                            <Loader2 className="mr-3 h-5 w-5 animate-spin" />
                                            Processing...
                                        </>
                                    ) : (
                                        <>
                                            Publish Material
                                            <UploadCloud className="ml-3 h-4 w-4" />
                                        </>
                                    )}
                                </Button>
                                <div className="flex items-center justify-center gap-2 text-[8px] font-bold uppercase tracking-widest text-muted-foreground opacity-30">
                                    <ShieldCheck className="h-3 w-3" />
                                    Community Verified Submission
                                </div>
                            </div>
                        </FadeIn>
                        </form>
                </div>
            </div>
        </div>
    )
}
