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
        setLoading(true)
        setError(null)
        setSuccess(false)

        try {
            const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
                redirectTo: `${window.location.origin}/auth/callback?next=/auth/reset-password`,
            })

            if (resetError) throw resetError

            setSuccess(true)
        } catch (error) {
            setError(error instanceof Error ? error.message : String(error))
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-[radial-gradient(ellipse_at_bottom_left,_var(--tw-gradient-stops))] from-primary/10 via-background to-background flex flex-col items-center justify-center p-4">
            <div className="w-full max-w-md mb-6 relative z-20">
                <Breadcrumbs />
            </div>
            <FadeIn className="w-full max-w-md relative z-10">
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-bold tracking-tighter">
                        Reset <span className="text-primary italic">Password</span>
                    </h1>
                    <p className="text-muted-foreground font-medium mt-2">Recover your account access.</p>
                </div>

                <ScaleIn>
                    <Card className="border-border/50 bg-card/50 backdrop-blur-xl shadow-2xl shadow-primary/10 rounded-[2rem] overflow-hidden">
                        <CardHeader className="pb-4">
                            <CardTitle className="text-lg font-bold flex items-center gap-2">
                                <Mail className="h-5 w-5 text-primary" />
                                Password Recovery
                            </CardTitle>
                            <CardDescription className="font-medium italic">
                                Enter your email to receive a reset link
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {!success ? (
                                <form onSubmit={handleReset} className="space-y-4">
                                    {error && (
                                        <SlideIn direction="right" className="rounded-xl bg-destructive/10 p-3 text-xs text-destructive border border-destructive/20 flex items-center gap-2">
                                            <AlertCircle className="h-4 w-4 shrink-0" />
                                            <span className="font-bold">{error}</span>
                                        </SlideIn>
                                    )}
                                    <div className="space-y-2">
                                        <Label htmlFor="email" className="text-xs font-bold uppercase tracking-widest ml-1 text-muted-foreground">Email Address</Label>
                                        <Input
                                            id="email"
                                            type="email"
                                            placeholder="dr.smith@example.com"
                                            className="h-12 rounded-xl bg-background/50 border-border/40 focus:ring-primary/20"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            required
                                        />
                                    </div>
                                    <Button type="submit" className="w-full h-12 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-bold shadow-lg shadow-primary/20 transition-all active:scale-[0.98]" disabled={loading}>
                                        {loading ? 'Processing...' : 'Send Recovery Link'}
                                    </Button>
                                </form>
                            ) : (
                                <SlideIn direction="up" className="text-center py-6 space-y-4">
                                    <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                                        <CheckCircle2 className="h-10 w-10 text-primary" />
                                    </div>
                                    <h3 className="text-xl font-bold">Email Sent</h3>
                                    <p className="text-sm text-muted-foreground px-4">
                                        A recovery link has been sent to <span className="text-foreground font-bold">{email}</span>. Please check your email.
                                    </p>
                                    <Button variant="outline" className="mt-4 rounded-xl border-border/50 font-bold" onClick={() => setSuccess(false)}>
                                        Try another email
                                    </Button>
                                </SlideIn>
                            )}
                        </CardContent>
                        <CardFooter className="bg-muted/30 py-4 flex justify-center border-t border-border/50">
                            <Link href="/auth/login" className="text-xs text-muted-foreground font-bold flex items-center gap-2 hover:text-primary transition-colors">
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
