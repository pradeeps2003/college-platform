'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ChevronRight, Home } from 'lucide-react'
import { cn } from '@/lib/utils'

export function Breadcrumbs() {
    const pathname = usePathname()
    if (pathname === '/') return null

    const segments = pathname.split('/').filter(Boolean)
    
    // Map of path segments to readable names
    const segmentMap: Record<string, string> = {
        'dashboard': 'Dashboard',
        'browse': 'Browse',
        'upload': 'Upload',
        'my-uploads': 'My Uploads',
        'admin': 'Admin',
        'resources': 'Resources',
        'favorites': 'Favorites',
        'auth': 'Auth',
        'login': 'Login',
        'signup': 'Sign Up',
        'forgot-password': 'Forgot Password',
        'reset-password': 'Reset Password',
    }

    return (
        <nav className="flex items-center space-x-2 text-[10px] font-bold uppercase tracking-[0.15em] text-muted-foreground/60 mb-6">
            <Link 
                href="/" 
                className="flex items-center gap-1.5 hover:text-primary transition-colors group"
            >
                <Home className="h-3 w-3" />
                <span>Home</span>
            </Link>

            {segments.map((segment, index) => {
                const href = `/${segments.slice(0, index + 1).join('/')}`
                const isLast = index === segments.length - 1
                const isId = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(segment) || (!isNaN(Number(segment)) && segment.length > 5)
                const label = segmentMap[segment] || (isId ? 'Detail' : segment.charAt(0).toUpperCase() + segment.slice(1))

                return (
                    <div key={href} className="flex items-center space-x-2">
                        <ChevronRight className="h-3 w-3 opacity-30" />
                        {isLast ? (
                            <span className="text-primary font-black tracking-[0.2em]">
                                {label}
                            </span>
                        ) : (
                            <Link 
                                href={href} 
                                className="hover:text-primary transition-colors"
                            >
                                {label}
                            </Link>
                        )}
                    </div>
                )
            })}
        </nav>
    )
}
