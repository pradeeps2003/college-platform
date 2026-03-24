'use client'

import { useState } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { AlertCircle, CheckCircle2, ArrowLeft, Mail } from 'lucide-react'
import { FadeIn, ScaleIn, SlideIn } from '@/components/motion-wrapper'
import { Breadcrumbs } from '@/components/breadcrumbs'

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [success, setSuccess] = useState(false)

    const handleReset = async (e: React.FormEvent) => {
        e.preventDefault()
        
        // Rate limiting check
        const today = new Date().toISOString().split('T')[0]
        const limitKey = `reset_limit_${email}`
        const attemptsStr = localStorage.getItem(limitKey)
        const attempts = attemptsStr ? JSON.parse(attemptsStr) : { date: today, count: 0 }
        
        if (attempts.date === today && attempts.count >= 3) {
            setError("You've reached the daily limit of 3 reset requests for this email. Please wait until tomorrow.")
            return
        }

        setLoading(true)
        setError(null)
        setSuccess(false)

        try {
            const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
                redirectTo: `${window.location.origin}/auth/callback?next=/auth/reset-password`,
            })

            if (resetError) throw resetError

            // Update rate limit
            const newCount = (attempts.date === today ? attempts.count : 0) + 1
            localStorage.setItem(limitKey, JSON.stringify({ date: today, count: newCount }))
            
            setSuccess(true)
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
                        Forgot Password
                    </h1>
                    <p className="text-muted-foreground text-xs mt-1">Don't worry, we'll help you get back in.</p>
                </div>

                <ScaleIn delay={0.1}>
                    <Card className="border shadow-lg rounded-xl overflow-hidden transition-all duration-300 hover:shadow-2xl hover:shadow-primary/5 hover:border-primary/20">
                        <CardHeader className="pb-2 pt-4">
                            <CardTitle className="text-base font-semibold text-center flex items-center justify-center gap-2">
                                <Mail className="h-4 w-4 text-primary" />
                                Reset Password
                            </CardTitle>
                            <CardDescription className="text-[10px] text-center italic">
                                We'll send you a link to reset your password
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="pb-4">
                            {!success ? (
                                <form onSubmit={handleReset} className="space-y-3">
                                    {error && (
                                        <SlideIn direction="right" className="rounded-lg bg-destructive/10 p-2 text-[10px] text-destructive border border-destructive/20 flex items-center gap-2">
                                            <AlertCircle className="h-3 w-3 shrink-0" />
                                            <span className="font-medium leading-tight">{error}</span>
                                        </SlideIn>
                                    )}
                                    <div className="space-y-1.5 group">
                                        <Label htmlFor="email" className="text-xs font-medium ml-1 transition-colors group-hover:text-primary">Your Email</Label>
                                        <Input
                                            id="email"
                                            type="email"
                                            placeholder="your.email@example.com"
                                            className="h-9 rounded-lg bg-background border-input transition-all duration-300 hover:border-primary/50 focus:border-primary focus:ring-4 focus:ring-primary/10 text-sm"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            required
                                        />
                                    </div>
                                    <Button type="submit" className="w-full h-9 rounded-lg bg-foreground text-background hover:bg-foreground/90 font-semibold shadow-sm transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] text-sm" disabled={loading}>
                                        {loading ? 'Sending...' : 'Send Reset Link'}
                                    </Button>
                                </form>
                            ) : (
                                <SlideIn direction="up" className="text-center py-4 space-y-3">
                                    <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-2">
                                        <CheckCircle2 className="h-6 w-6 text-primary" />
                                    </div>
                                    <div className="space-y-1">
                                        <h3 className="text-sm font-bold tracking-tight">Email Sent</h3>
                                        <p className="text-[10px] text-muted-foreground font-medium px-4">
                                            We sent a link to <span className="text-foreground font-bold">{email}</span>. Please check your email.
                                        </p>
                                    </div>
                                    <p className="text-[9px] text-muted-foreground/50 italic pt-2">
                                        Please check your spam folder if you don't see it.
                                    </p>
                                </SlideIn>
                            )}
                        </CardContent>
                        <CardFooter className="bg-muted/30 py-3 flex justify-center border-t border-border/50">
                            <Link href="/auth/login" className="text-[10px] text-muted-foreground font-medium flex items-center gap-2 hover:text-primary transition-colors">
                                <ArrowLeft className="h-3 w-3" />
                                Back to Login
                            </Link>
                        </CardFooter>
                    </Card>
                </ScaleIn>
            </FadeIn>
        </div>
    )
}


