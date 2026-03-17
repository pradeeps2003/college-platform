'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { AlertCircle, ShieldCheck, UserCircle2, GraduationCap, Building2, Eye, EyeOff } from 'lucide-react'
import { FadeIn, SlideIn, ScaleIn } from '@/components/motion-wrapper'
import { Breadcrumbs } from '@/components/breadcrumbs'

export default function SignupPage() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [showPassword, setShowPassword] = useState(false)
    const [fullName, setFullName] = useState('')
    const [year, setYear] = useState('')
    const [role] = useState<'student'>('student')
    const [error, setError] = useState<string | null>(null)
    const [loading, setLoading] = useState(false)
    const router = useRouter()

    const handleSignup = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError(null)

        try {
            const { data: authData, error: authError } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    data: {
                        full_name: fullName,
                        year: parseInt(year),
                        role: 'student'
                    },
                },
            })

            if (authError) throw authError

            if (authData.user) {
                // Send welcome email via API route (non-blocking)
                fetch('/api/welcome', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email, fullName })
                }).catch(err => console.error('Failed to send welcome email:', err));
            }

            router.push('/dashboard')
            router.refresh()
        } catch (error: any) {
            setError(error.message)
        } finally {
            setLoading(false)
        }
    }



    return (
        <div className="w-full bg-[radial-gradient(ellipse_at_bottom_right,_var(--tw-gradient-stops))] from-primary/10 via-background to-background flex flex-col items-center justify-center p-4 py-8">
            <div className="w-full max-w-lg mb-4 relative z-20">
                <Breadcrumbs />
            </div>
            
            <FadeIn className="w-full max-w-lg relative z-10">
                <div className="text-center mb-4">
                    <h1 className="text-2xl font-bold tracking-tight">
                        Create Account
                    </h1>
                    <p className="text-muted-foreground text-xs mt-1">Join the clinical knowledge hub.</p>
                </div>

                <ScaleIn delay={0.1}>
                    <Card className="border shadow-lg rounded-xl overflow-hidden transition-all duration-300 hover:shadow-2xl hover:shadow-primary/5 hover:border-primary/20">
                        <CardHeader className="pb-2 pt-4">
                            <CardTitle className="text-base font-semibold text-center">Sign Up</CardTitle>
                            <CardDescription className="text-center text-xs">Enter your details below to create your account</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-3 pb-4">
                            <form onSubmit={handleSignup} className="space-y-3">
                                {error && (
                                    <SlideIn direction="right" className="rounded-lg bg-destructive/10 p-2 text-xs text-destructive border border-destructive/20 flex items-center gap-2">
                                        <AlertCircle className="h-3 w-3 shrink-0" />
                                        <span className="font-medium">{error}</span>
                                    </SlideIn>
                                )}

                                <div className="space-y-3">
                                    <div className="space-y-1.5 group">
                                        <Label htmlFor="fullName" className="text-xs font-medium ml-1 transition-colors group-hover:text-primary">Full Name</Label>
                                        <Input
                                            id="fullName"
                                            placeholder="John Doe"
                                            className="h-9 rounded-lg bg-background border-input transition-all duration-300 hover:border-primary/50 focus:border-primary focus:ring-4 focus:ring-primary/10 text-sm"
                                            value={fullName}
                                            onChange={(e) => setFullName(e.target.value)}
                                            required
                                        />
                                    </div>
                                    <div className="space-y-1.5 group">
                                        <Label htmlFor="email" className="text-xs font-medium ml-1 transition-colors group-hover:text-primary">Email</Label>
                                        <Input
                                            id="email"
                                            type="email"
                                            placeholder="john@example.com"
                                            className="h-9 rounded-lg bg-background border-input transition-all duration-300 hover:border-primary/50 focus:border-primary focus:ring-4 focus:ring-primary/10 text-sm"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            required
                                        />
                                    </div>
                                    <div className="space-y-1.5 group">
                                        <Label htmlFor="password" className="text-xs font-medium ml-1 transition-colors group-hover:text-primary">Password</Label>
                                        <div className="relative">
                                            <Input
                                                id="password"
                                                type={showPassword ? "text" : "password"}
                                                placeholder="••••••••"
                                                className="h-9 rounded-lg bg-background border-input transition-all duration-300 hover:border-primary/50 focus:border-primary focus:ring-4 focus:ring-primary/10 text-sm pr-10"
                                                value={password}
                                                onChange={(e) => setPassword(e.target.value)}
                                                required
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowPassword(!showPassword)}
                                                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                                            >
                                                {showPassword ? (
                                                    <EyeOff className="h-4 w-4" />
                                                ) : (
                                                    <Eye className="h-4 w-4" />
                                                )}
                                            </button>
                                        </div>
                                    </div>
                                    <div className="space-y-1.5 group">
                                        <Label className="text-xs font-medium ml-1 transition-colors group-hover:text-primary">Year</Label>
                                        <Select onValueChange={setYear} required>
                                            <SelectTrigger className="h-9 rounded-lg bg-background border-input transition-all duration-300 hover:border-primary/50 focus:border-primary focus:ring-4 focus:ring-primary/10 text-sm">
                                                <SelectValue placeholder="Select Year" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {[1, 2, 3, 4, 5].map((num) => (
                                                    <SelectItem key={num} value={num.toString()}>
                                                        Year {num}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>

                                <Button type="submit" className="w-full h-9 rounded-lg bg-foreground text-background hover:bg-foreground/90 font-semibold shadow-sm transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] mt-2 text-sm" disabled={loading}>
                                    {loading ? 'Signing up...' : 'Sign Up'}
                                </Button>
                            </form>
                        </CardContent>
                        <CardFooter className="bg-muted/30 py-3 flex justify-center border-t border-border/50">
                            <p className="text-[10px] text-muted-foreground font-medium">
                                Already have an account?{' '}
                                <Link href="/auth/login" className="text-primary font-bold hover:underline underline-offset-4">
                                    Sign In
                                </Link>
                            </p>
                        </CardFooter>
                    </Card>
                </ScaleIn>
            </FadeIn>
        </div>
    )
}
