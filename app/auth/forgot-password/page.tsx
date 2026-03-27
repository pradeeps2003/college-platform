'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { AlertCircle, CheckCircle2, ArrowLeft, Mail, ShieldCheck, KeyRound, Loader2, RefreshCw } from 'lucide-react'
import { FadeIn, ScaleIn, SlideIn } from '@/components/motion-wrapper'
import { Breadcrumbs } from '@/components/breadcrumbs'

type Step = 'email' | 'otp'

export default function ForgotPasswordPage() {
    const [step, setStep] = useState<Step>('email')
    const [email, setEmail] = useState('')
    const [otp, setOtp] = useState(['', '', '', '', '', ''])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [resendCooldown, setResendCooldown] = useState(0)
    const otpRefs = useRef<(HTMLInputElement | null)[]>([])
    const router = useRouter()

    useEffect(() => {
        if (resendCooldown > 0) {
            const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000)
            return () => clearTimeout(timer)
        }
    }, [resendCooldown])

    // Auto-verify when OTP is complete
    useEffect(() => {
        if (otp.every(digit => digit !== '') && step === 'otp') {
            handleVerifyOtp()
        }
    }, [otp, step])

    const handleSendOtp = async (e?: React.FormEvent) => {
        if (e) e.preventDefault()
        setLoading(true)
        setError(null)

        try {
            const res = await fetch('/api/auth/send-otp', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email })
            })

            const data = await res.json()
            if (!res.ok) throw new Error(data.error || 'Failed to send code.')

            setStep('otp')
            setResendCooldown(60)
        } catch (error) {
            setError(error instanceof Error ? error.message : String(error))
        } finally {
            setLoading(false)
        }
    }

    const handleVerifyOtp = async (e?: React.FormEvent) => {
        if (e) e.preventDefault()
        const otpString = otp.join('')
        if (otpString.length !== 6) return

        setLoading(true)
        setError(null)

        try {
            // 1. Verify OTP via our API
            const res = await fetch('/api/auth/verify-otp', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, otp: otpString })
            })

            const data = await res.json()
            if (!res.ok) throw new Error(data.error || 'Verification failed.')

            // 2. On success, move to reset password page with verification details
            router.push(`/auth/reset-password?email=${encodeURIComponent(email)}&otp=${otpString}`)
        } catch (error) {
            setError(error instanceof Error ? error.message : String(error))
        } finally {
            setLoading(false)
        }
    }

    const handleOtpChange = (index: number, value: string) => {
        if (value.length > 1) value = value.slice(-1)
        if (!/^\d*$/.test(value)) return

        const newOtp = [...otp]
        newOtp[index] = value
        setOtp(newOtp)

        // Move to next input
        if (value !== '' && index < 5) {
            otpRefs.current[index + 1]?.focus()
        }

        // Auto verify if all fields filled
        if (newOtp.every(digit => digit !== '')) {
            // Can't easily call handleVerifyOtp here without e, but handled by button
        }
    }

    const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
        if (e.key === 'Backspace' && otp[index] === '' && index > 0) {
            otpRefs.current[index - 1]?.focus()
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
                        {step === 'email' ? 'Forgot Password?' : 'Verify Identity'}
                    </h1>
                    <p className="text-muted-foreground text-xs mt-1 max-w-[280px] mx-auto">
                        {step === 'email' 
                            ? "Enter your email and we'll send you a 6-digit code to reset your password." 
                            : `We've sent a 6-digit code to ${email}`}
                    </p>
                </div>

                <ScaleIn delay={0.1}>
                    <Card className="border shadow-lg rounded-xl overflow-hidden transition-all duration-300 hover:shadow-2xl hover:shadow-primary/5 hover:border-primary/20">
                        <CardHeader className="pb-2 pt-4">
                            <CardTitle className="text-base font-semibold text-center">
                                {step === 'email' ? 'Identification' : 'Enter OTP Code'}
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="pb-4">
                            {error && (
                                <SlideIn direction="right" className="mb-3 rounded-lg bg-destructive/10 p-2 text-xs text-destructive border border-destructive/20 flex items-center gap-2">
                                    <AlertCircle className="h-3 w-3 shrink-0" />
                                    <span className="font-medium leading-tight">{error}</span>
                                </SlideIn>
                            )}

                            {step === 'email' ? (
                                <form onSubmit={handleSendOtp} className="space-y-3">
                                    <div className="space-y-1.5 group">
                                        <Label htmlFor="email" className="text-xs font-medium ml-1 transition-colors group-hover:text-primary">Your Email</Label>
                                        <div className="relative">
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
                                    </div>
                                    <Button type="submit" className="w-full h-9 rounded-lg bg-foreground text-background hover:bg-foreground/90 font-semibold shadow-sm transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] text-sm" disabled={loading}>
                                        {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : 'Send Code'}
                                    </Button>
                                </form>
                            ) : (
                                <form onSubmit={(e) => { e.preventDefault(); handleVerifyOtp(); }} className="space-y-4">
                                    <div className="flex justify-between gap-2 py-2">
                                        {otp.map((digit, index) => (
                                            <Input
                                                key={index}
                                                ref={(el) => { otpRefs.current[index] = el }}
                                                type="text"
                                                inputMode="numeric"
                                                maxLength={1}
                                                className="h-10 w-full text-center text-lg font-bold bg-background border-input rounded-lg focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all"
                                                value={digit}
                                                onChange={(e) => handleOtpChange(index, e.target.value)}
                                                onKeyDown={(e) => handleKeyDown(index, e)}
                                                autoFocus={index === 0}
                                            />
                                        ))}
                                    </div>
                                    <div className="space-y-2">
                                        <Button type="submit" className="w-full h-9 rounded-lg bg-primary text-primary-foreground font-semibold shadow-sm transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] text-sm" disabled={loading || otp.some(d => d === '')}>
                                            {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : 'Verify & Continue'}
                                        </Button>
                                        <Button 
                                            type="button" 
                                            variant="ghost" 
                                            className="w-full text-[10px] font-semibold hover:bg-transparent hover:text-primary h-auto py-1"
                                            onClick={handleSendOtp}
                                            disabled={resendCooldown > 0 || loading}
                                        >
                                            <RefreshCw className={`h-2.5 w-2.5 mr-1.5 ${loading ? 'animate-spin' : ''}`} />
                                            {resendCooldown > 0 ? `Resend code in ${resendCooldown}s` : 'Resend Code'}
                                        </Button>
                                    </div>
                                </form>
                            )}
                        </CardContent>
                        <CardFooter className="bg-muted/30 py-3 flex justify-center border-t border-border/50">
                            <Link href="/auth/login" className="text-[10px] text-muted-foreground font-bold flex items-center gap-1.5 hover:text-primary transition-all">
                                <ArrowLeft className="h-3 w-3" />
                                Back to Login
                            </Link>
                        </CardFooter>
                    </Card>
                </ScaleIn>

                <div className="mt-8 flex justify-center gap-12 opacity-50 grayscale">
                    <div className="flex items-center gap-2">
                        <ShieldCheck className="h-4 w-4" />
                        <span className="text-[10px] font-bold uppercase tracking-widest">End-to-End Secure</span>
                    </div>
                </div>
            </FadeIn>
        </div>
    )
}



