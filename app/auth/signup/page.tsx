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
import { AlertCircle, Eye, EyeOff } from 'lucide-react'
import { FadeIn, SlideIn, ScaleIn } from '@/components/motion-wrapper'
import { Breadcrumbs } from '@/components/breadcrumbs'

export default function SignupPage() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [showPassword, setShowPassword] = useState(false)
    const [fullName, setFullName] = useState('')
    const [year, setYear] = useState('')
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
        } catch (error) {
            setError(error instanceof Error ? error.message : String(error))
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

                            <div className="relative my-4">
                                <div className="absolute inset-0 flex items-center">
                                    <span className="w-full border-t border-border/50" />
                                </div>
                                <div className="relative flex justify-center text-[10px] uppercase">
                                    <span className="bg-card px-2 text-muted-foreground font-medium">Or continue with</span>
                                </div>
                            </div>

                            <Button 
                                type="button" 
                                variant="outline" 
                                className="w-full h-9 rounded-lg border-border bg-secondary/50 hover:bg-secondary/80 text-secondary-foreground hover:text-secondary-foreground transition-all duration-310 flex items-center justify-center gap-2 text-sm font-semibold shadow-sm active:scale-[0.98]"
                                onClick={async () => {
                                    try {
                                        const { error: googleError } = await supabase.auth.signInWithOAuth({
                                            provider: 'google',
                                            options: {
                                                redirectTo: `${window.location.origin}/auth/callback`,
                                            },
                                        })
                                        if (googleError) throw googleError
                                    } catch (error) {
                                        setError(error instanceof Error ? error.message : String(error))
                                    }
                                }}
                            >
                                <svg className="h-4 w-4" viewBox="0 0 24 24">
                                    <path
                                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                        fill="#4285F4"
                                    />
                                    <path
                                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                        fill="#34A853"
                                    />
                                    <path
                                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.25.81-.62z"
                                        fill="#FBBC05"
                                    />
                                    <path
                                        d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                                        fill="#EA4335"
                                    />
                                </svg>
                                Google
                            </Button>
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
