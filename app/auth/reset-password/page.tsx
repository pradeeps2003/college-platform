'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { AlertCircle, CheckCircle2, KeyRound, Lock, Eye, EyeOff, Loader2, ArrowLeft, ShieldCheck } from 'lucide-react'
import { FadeIn, ScaleIn, SlideIn } from '@/components/motion-wrapper'
import { Breadcrumbs } from '@/components/breadcrumbs'

import { useSearchParams } from 'next/navigation'
import { Suspense } from 'react'

function ResetPasswordForm() {
    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [showPassword, setShowPassword] = useState(false)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [success, setSuccess] = useState(false)
    const router = useRouter()
    const searchParams = useSearchParams()
    
    // Get verification data from URL
    const email = searchParams.get('email')
    const otp = searchParams.get('otp')

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!email || !otp) {
            setError("Verification data missing. Please go back and try again.");
            return;
        }

        if (password.length < 6) {
            setError("Password must be at least 6 characters.")
            return
        }

        if (password !== confirmPassword) {
            setError("Passwords do not match.")
            return
        }

        setLoading(true)
        setError(null)

        try {
            // Updated to use our secure custom reset API
            const res = await fetch('/api/auth/reset-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email,
                    otp,
                    newPassword: password
                })
            })

            const data = await res.json()
            if (!res.ok) throw new Error(data.error || 'Failed to reset password.')

            // Sign out to clear any existing sessions (security)
            await supabase.auth.signOut()

            setSuccess(true)
            setTimeout(() => {
                router.push('/auth/login')
            }, 3000)
        } catch (error) {
            setError(error instanceof Error ? error.message : String(error))
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="w-full bg-[radial-gradient(ellipse_at_bottom_right,_var(--tw-gradient-stops))] from-primary/10 via-background to-background flex flex-col items-center justify-center p-4 py-8 min-h-[80vh]">
            <div className="w-full max-w-sm mb-4">
                <Breadcrumbs />
            </div>
            
            <FadeIn className="w-full max-w-sm relative z-10">
                <div className="text-center mb-4">
                    <h1 className="text-2xl font-bold tracking-tight">
                        New Password
                    </h1>
                    <p className="text-muted-foreground text-xs mt-1 max-w-[280px] mx-auto">
                        Your identity has been verified. Please create a strong new password for your account.
                    </p>
                </div>

                <ScaleIn delay={0.1}>
                    <Card className="border shadow-lg rounded-xl overflow-hidden transition-all duration-300 hover:shadow-2xl hover:shadow-primary/5 hover:border-primary/20">
                        <CardHeader className="pb-2 pt-4">
                            <CardTitle className="text-base font-semibold text-center">
                                Security Update
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="pb-4">
                            {!success ? (
                                <form onSubmit={handleUpdate} className="space-y-3">
                                    {error && (
                                        <SlideIn direction="right" className="mb-3 rounded-lg bg-destructive/10 p-2 text-xs text-destructive border border-destructive/20 flex items-center gap-2">
                                            <AlertCircle className="h-3 w-3 shrink-0" />
                                            <span className="font-medium">{error}</span>
                                        </SlideIn>
                                    )}
                                    <div className="space-y-3">
                                        <div className="space-y-1.5 group">
                                            <Label htmlFor="password" className="text-xs font-medium ml-1 transition-colors group-hover:text-primary">New Password</Label>
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
                                                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                                </button>
                                            </div>
                                        </div>
                                        <div className="space-y-1.5 group">
                                            <Label htmlFor="confirmPassword" className="text-xs font-medium ml-1 transition-colors group-hover:text-primary">Confirm Password</Label>
                                            <div className="relative">
                                                <Input
                                                    id="confirmPassword"
                                                    type={showPassword ? "text" : "password"}
                                                    placeholder="••••••••"
                                                    className="h-9 rounded-lg bg-background border-input transition-all duration-300 hover:border-primary/50 focus:border-primary focus:ring-4 focus:ring-primary/10 text-sm pr-10"
                                                    value={confirmPassword}
                                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                                    required
                                                />
                                            </div>
                                        </div>
                                    </div>
                                    <Button type="submit" className="w-full h-9 rounded-lg bg-foreground text-background hover:bg-foreground/90 font-semibold shadow-sm transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] mt-1 text-sm" disabled={loading}>
                                        {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : 'Reset Password'}
                                    </Button>
                                </form>
                            ) : (
                                <SlideIn direction="up" className="text-center py-6 space-y-4">
                                    <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                                        <CheckCircle2 className="h-6 w-6 text-primary" />
                                    </div>
                                    <h3 className="text-lg font-bold">Password Reset!</h3>
                                    <p className="text-xs text-muted-foreground px-4">
                                        Your password has been successfully updated. Redirecting to the login page...
                                    </p>
                                    <div className="flex justify-center pt-4 px-8">
                                        <div className="h-1 w-full bg-muted rounded-full overflow-hidden">
                                            <div className="h-full bg-primary animate-progress-fast" />
                                        </div>
                                    </div>
                                </SlideIn>
                            )}
                        </CardContent>
                    </Card>
                </ScaleIn>

                <div className="mt-8 flex justify-center gap-12 opacity-50 grayscale">
                    <div className="flex items-center gap-2">
                        <ShieldCheck className="h-4 w-4" />
                        <span className="text-[10px] font-bold uppercase tracking-widest">Identity Confirmed</span>
                    </div>
                </div>
            </FadeIn>
        </div>
    )
}

export default function ResetPasswordPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center bg-background">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-primary"></div>
            </div>
        }>
            <ResetPasswordForm />
        </Suspense>
    )
}

