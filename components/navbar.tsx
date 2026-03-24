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
import { Stethoscope, LogOut, Upload, LayoutDashboard, ShieldCheck, Settings as SettingsIcon } from 'lucide-react'
import { useEffect, useState } from 'react'

export function Navbar() {
    const { user, signOut } = useAuth()
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
            // Use a small delay to avoid synchronous state update in effect
            Promise.resolve().then(() => {
                setProfile({ role: null, full_name: null, avatar_url: null })
            })
        }
    }, [user])

    return (
        <nav className="border-b bg-background/80 backdrop-blur-2xl sticky top-0 z-50 transition-all duration-300 shadow-sm">
            <div className="container flex h-16 items-center justify-between relative px-4 md:px-8">
                <div className="flex items-center gap-2">
                    <Link href={profile.role === 'admin' ? '/admin' : user ? '/dashboard' : '/'} className="flex items-center gap-2.5 font-black text-xl md:text-2xl tracking-tighter text-foreground group">
                        <div className="h-8 w-8 md:h-10 md:w-10 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20 group-hover:bg-primary transition-all duration-500">
                            <Stethoscope className="h-4 w-4 md:h-5 md:w-5 text-primary group-hover:text-white group-hover:rotate-12 transition-transform duration-500" />
                        </div>
                        <span className="italic hidden md:inline">Clinical <span className="text-primary not-italic">Repository.</span></span>
                    </Link>
                </div>

                <div className="absolute bottom-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-primary/20 to-transparent overflow-hidden">
                    <div className="w-1/2 h-full bg-primary/40 animate-[pulse_3s_ease-in-out_infinite]" />
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
