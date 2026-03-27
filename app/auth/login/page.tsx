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

    const handleGoogleLogin = async () => {
        try {
            const { error: googleError } = await supabase.auth.signInWithOAuth({
                provider: 'google',
                options: {
                    redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(redirectTo)}`,
                },
            })

            if (googleError) throw googleError
        } catch (error) {
            setError(error instanceof Error ? error.message : String(error))
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
                                className="w-full h-9 rounded-lg border-input bg-background hover:bg-muted/50 transition-all duration-300 flex items-center justify-center gap-2 text-sm font-medium"
                                onClick={handleGoogleLogin}
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
