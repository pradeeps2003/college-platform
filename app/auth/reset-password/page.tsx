'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { AlertCircle, CheckCircle2, KeyRound } from 'lucide-react'
import { FadeIn, ScaleIn, SlideIn } from '@/components/motion-wrapper'
import { Breadcrumbs } from '@/components/breadcrumbs'

export default function ResetPasswordPage() {
    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [success, setSuccess] = useState(false)
    const router = useRouter()

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault()

        if (password !== confirmPassword) {
            setError("Passwords do not match.")
            return
        }

        setLoading(true)
        setError(null)

        try {
            const { error: updateError } = await supabase.auth.updateUser({
                password: password
            })

            if (updateError) throw updateError

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
        <div className="min-h-screen bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary/10 via-background to-background flex flex-col items-center justify-center p-4">
            <div className="w-full max-w-md mb-6 relative z-20">
                <Breadcrumbs />
            </div>
            <FadeIn className="w-full max-w-md relative z-10">
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-bold tracking-tighter">
                        Reset <span className="text-primary italic">Password</span>
                    </h1>
                    <p className="text-muted-foreground font-medium mt-2">Update your account password.</p>
                </div>

                <ScaleIn>
                    <Card className="border-border/50 bg-card/50 backdrop-blur-xl shadow-2xl shadow-primary/10 rounded-[2rem] overflow-hidden">
                        <CardHeader className="pb-4">
                            <CardTitle className="text-lg font-bold flex items-center gap-2">
                                <KeyRound className="h-5 w-5 text-primary" />
                                Password Update
                            </CardTitle>
                            <CardDescription className="font-medium italic">
                                Create a new secure password
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {!success ? (
                                <form onSubmit={handleUpdate} className="space-y-4">
                                    {error && (
                                        <SlideIn direction="right" className="rounded-xl bg-destructive/10 p-3 text-xs text-destructive border border-destructive/20 flex items-center gap-2">
                                            <AlertCircle className="h-4 w-4 shrink-0" />
                                            <span className="font-bold">{error}</span>
                                        </SlideIn>
                                    )}
                                    <div className="space-y-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="password" className="text-xs font-bold uppercase tracking-widest ml-1 text-muted-foreground">New Password</Label>
                                            <Input
                                                id="password"
                                                type="password"
                                                placeholder="••••••••"
                                                className="h-12 rounded-xl bg-background/50 border-border/40 focus:ring-primary/20"
                                                value={password}
                                                onChange={(e) => setPassword(e.target.value)}
                                                required
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="confirmPassword" className="text-xs font-bold uppercase tracking-widest ml-1 text-muted-foreground">Confirm New Password</Label>
                                            <Input
                                                id="confirmPassword"
                                                type="password"
                                                placeholder="••••••••"
                                                className="h-12 rounded-xl bg-background/50 border-border/40 focus:ring-primary/20"
                                                value={confirmPassword}
                                                onChange={(e) => setConfirmPassword(e.target.value)}
                                                required
                                            />
                                        </div>
                                    </div>
                                    <Button type="submit" className="w-full h-12 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-bold shadow-lg shadow-primary/20 transition-all active:scale-[0.98] mt-2" disabled={loading}>
                                        {loading ? 'Updating...' : 'Update Password'}
                                    </Button>
                                </form>
                            ) : (
                                <SlideIn direction="up" className="text-center py-6 space-y-4">
                                    <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                                        <CheckCircle2 className="h-10 w-10 text-primary" />
                                    </div>
                                    <h3 className="text-xl font-bold">Password Updated</h3>
                                    <p className="text-sm text-muted-foreground">
                                        Your password has been successfully updated. Redirecting to login...
                                    </p>
                                    <div className="flex justify-center pt-4">
                                        <div className="h-1.5 w-full max-w-[200px] bg-muted rounded-full overflow-hidden">
                                            <div className="h-full bg-primary animate-progress-fast" />
                                        </div>
                                    </div>
                                </SlideIn>
                            )}
                        </CardContent>
                    </Card>
                </ScaleIn>
            </FadeIn>
        </div>
    )
}
