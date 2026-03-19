'use client'

import Link from 'next/link'
import { useAuth } from '@/components/auth-provider'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { ThemeToggle } from '@/components/theme-toggle'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Stethoscope, Activity, LogOut, Upload, User as UserIcon, LayoutDashboard, Globe, ShieldCheck, Settings as SettingsIcon } from 'lucide-react'
import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'

export function Navbar() {
    const { user, signOut } = useAuth()
    const pathname = usePathname()
    const [profile, setProfile] = useState<{ role: string | null; full_name: string | null; avatar_url: string | null }>({
        role: null,
        full_name: null,
        avatar_url: null
    })

    useEffect(() => {
        if (user) {
            supabase
                .from('profiles')
                .select('role, full_name, avatar_url')
                .eq('id', user.id)
                .single()
                .then(({ data }) => setProfile({
                    role: data?.role || null,
                    full_name: data?.full_name || null,
                    avatar_url: data?.avatar_url || null
                }))
        } else {
            setProfile({ role: null, full_name: null, avatar_url: null })
        }
    }, [user])

    return (
        <nav className="border-b bg-background/80 backdrop-blur-md sticky top-0 z-50 transition-all duration-300">
            <div className="container flex h-14 items-center justify-between relative">
                <div className="flex items-center gap-2 pl-8">
                    <Link href="/" className="flex items-center gap-2 font-black text-2xl tracking-tighter text-foreground group">
                        <Stethoscope className="h-6 w-6 text-primary group-hover:rotate-12 transition-transform duration-500" />
                        <span className="italic">Clinical <span className="text-primary not-italic">Repository.</span></span>
                    </Link>
                </div>

                <div className="absolute bottom-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-primary/30 to-transparent overflow-hidden">
                    <div className="w-1/2 h-full bg-primary/60 animate-pulse" />
                </div>

                <div className="flex items-center gap-2 md:gap-4">
                    <ThemeToggle />

                    {user ? (
                        <div className="flex items-center gap-2 md:gap-4">
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" className="relative h-10 w-10 rounded-full border border-border/50 p-0 hover:bg-primary/5">
                                        <Avatar className="h-9 w-9">
                                            <AvatarImage src={(profile.avatar_url || user.user_metadata?.avatar_url) || undefined} alt={user.email || ''} />
                                            <AvatarFallback className="bg-primary/10 text-primary font-bold">
                                                {(profile.full_name || user.email)?.charAt(0).toUpperCase()}
                                            </AvatarFallback>
                                        </Avatar>
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent className="w-56 mt-2" align="end" forceMount>
                                    <DropdownMenuLabel className="font-normal">
                                        <div className="flex flex-col space-y-1">
                                            <p className="text-sm font-semibold leading-none">{profile.full_name || user.user_metadata?.full_name || 'Medical User'}</p>
                                            <p className="text-xs leading-none text-muted-foreground">
                                                {user.email}
                                            </p>
                                        </div>
                                    </DropdownMenuLabel>
                                    <DropdownMenuSeparator />

                                    {profile.role === 'admin' ? (
                                        <DropdownMenuItem asChild className="cursor-pointer focus:bg-primary/5 focus:text-primary">
                                            <Link href="/admin" className="flex items-center font-bold">
                                                <ShieldCheck className="mr-2 h-4 w-4 text-primary" />
                                                Admin Dashboard
                                            </Link>
                                        </DropdownMenuItem>
                                    ) : (
                                        <DropdownMenuItem asChild className="cursor-pointer focus:bg-primary/5 focus:text-primary">
                                            <Link href="/dashboard" className="flex items-center">
                                                <LayoutDashboard className="mr-2 h-4 w-4" />
                                                Dashboard
                                            </Link>
                                        </DropdownMenuItem>
                                    )}

                                    <DropdownMenuItem asChild className="cursor-pointer focus:bg-primary/5 focus:text-primary">
                                        <Link href="/my-uploads" className="flex items-center">
                                            <Upload className="mr-2 h-4 w-4" />
                                            My Resources
                                        </Link>
                                    </DropdownMenuItem>

                                    <DropdownMenuItem asChild className="cursor-pointer focus:bg-primary/5 focus:text-primary">
                                        <Link href="/settings" className="flex items-center">
                                            <SettingsIcon className="mr-2 h-4 w-4" />
                                            Settings
                                        </Link>
                                    </DropdownMenuItem>

                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem onClick={signOut} className="cursor-pointer text-destructive focus:bg-destructive/5 focus:text-destructive">
                                        <LogOut className="mr-2 h-4 w-4" />
                                        Log out
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    ) : (
                        <div className="flex items-center gap-2">
                            <Link href="/auth/login">
                                <Button className="h-10 px-5 rounded-xl bg-foreground text-background shadow-md hover:bg-foreground/90 font-black uppercase text-[10px] tracking-widest">
                                    Log in
                                </Button>
                            </Link>
                            <Link href="/auth/signup">
                                <Button className="h-10 px-5 rounded-xl bg-foreground text-background shadow-md hover:bg-foreground/90 font-black uppercase text-[10px] tracking-widest">
                                    Sign up
                                </Button>
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </nav>
    )
}
