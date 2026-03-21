'use client'

import { useState, Suspense } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { AlertCircle, Eye, EyeOff } from 'lucide-react'
import { FadeIn, SlideIn, ScaleIn } from '@/components/motion-wrapper'
import { Breadcrumbs } from '@/components/breadcrumbs'

function LoginContent() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [showPassword, setShowPassword] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [loading, setLoading] = useState(false)
    const router = useRouter()
    const searchParams = useSearchParams()
    const redirectTo = searchParams.get('next') || '/dashboard'

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError(null)

        try {
            const { error: loginError } = await supabase.auth.signInWithPassword({
                email,
                password,
            })

            if (loginError) throw loginError

            router.push(redirectTo)
            router.refresh()
        } catch (error) {
            setError(error instanceof Error ? error.message : String(error))
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="w-full bg-background flex flex-col items-center justify-center p-4 py-8">
            <div className="w-full max-w-sm mb-4">
                <Breadcrumbs />
            </div>
            <FadeIn className="w-full max-w-sm relative z-10">
                <div className="text-center mb-4">
                    <h1 className="text-2xl font-bold tracking-tight">
                        Welcome Back
                    </h1>
                    <p className="text-muted-foreground text-xs mt-1">Enter your credentials to access your account.</p>
                </div>

                <ScaleIn delay={0.1}>
                    <Card className="border shadow-lg rounded-xl overflow-hidden transition-all duration-300 hover:shadow-2xl hover:shadow-primary/5 hover:border-primary/20">
                        <CardHeader className="pb-2 pt-4">
                            <CardTitle className="text-base font-semibold text-center">
                                Sign In
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3 pb-4">
                            <form onSubmit={handleLogin} className="space-y-3">
                                {error && (
                                    <SlideIn direction="right" className="rounded-lg bg-destructive/10 p-2 text-xs text-destructive border border-destructive/20 flex items-center gap-2">
                                        <AlertCircle className="h-3 w-3 shrink-0" />
                                        <span className="font-medium">{error}</span>
                                    </SlideIn>
                                )}
                                <div className="space-y-1.5 group">
                                    <Label htmlFor="email" className="text-xs font-medium ml-1 transition-colors group-hover:text-primary">Email</Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        placeholder="name@example.com"
                                        className="h-9 rounded-lg bg-background border-input transition-all duration-300 hover:border-primary/50 focus:border-primary focus:ring-4 focus:ring-primary/10 text-sm"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                    />
                                </div>
                                <div className="space-y-1.5 group">
                                    <div className="flex items-center justify-between ml-1">
                                        <Label htmlFor="password" className="text-xs font-medium transition-colors group-hover:text-primary">Password</Label>
                                        <Link href="/auth/forgot-password" className="text-[10px] font-medium text-primary hover:underline underline-offset-4">
                                            Forgot password?
                                        </Link>
                                    </div>
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
                                <Button type="submit" className="w-full h-9 rounded-lg bg-foreground text-background hover:bg-foreground/90 font-semibold shadow-sm transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] text-sm" disabled={loading}>
                                    {loading ? 'Signing in...' : 'Sign In'}
                                </Button>
                            </form>
                        </CardContent>
                        <CardFooter className="bg-muted/30 py-3 flex justify-center border-t border-border/50">
                            <p className="text-[10px] text-muted-foreground font-medium">
                                Don&apos;t have an account?{' '}
                                <Link href={`/auth/signup${redirectTo !== '/dashboard' ? `?next=${encodeURIComponent(redirectTo)}` : ''}`} className="text-primary font-bold hover:underline underline-offset-4">
                                    Sign Up
                                </Link>
                            </p>
                        </CardFooter>
                    </Card>
                </ScaleIn>
            </FadeIn>
        </div>
    )
}

export default function LoginPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center bg-background">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-primary"></div>
            </div>
        }>
            <LoginContent />
        </Suspense>
    )
}
