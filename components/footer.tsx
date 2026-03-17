import Link from 'next/link'
import { Stethoscope } from 'lucide-react'

export function Footer() {
    return (
        <footer className="border-t border-border/40 bg-white dark:bg-card/40 py-6 relative overflow-hidden">
            <div className="container mx-auto px-4">
                <div className="flex flex-col md:flex-row justify-between items-center gap-8">
                    <div className="flex items-center gap-2">
                        <Link href="/" className="flex items-center gap-2 font-black text-xl tracking-tighter text-foreground group">
                            <Stethoscope className="h-5 w-5 text-primary group-hover:rotate-12 transition-transform duration-500" />
                            <span className="italic">Clinical <span className="text-primary not-italic">Repository.</span></span>
                        </Link>
                    </div>

                    <div className="flex flex-col items-center md:items-end gap-2">
                        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/60">
                            © {new Date().getFullYear()} Clinical Repository. All Rights Reserved.
                        </p>
                        <p className="text-[9px] font-medium text-muted-foreground/40 italic">
                            Premium Medical Knowledge Operating System v2.4.0-Alpha
                        </p>
                    </div>
                </div>
            </div>

            {/* Subtle background decorative line */}
            <div className="absolute bottom-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-primary/10 to-transparent" />
        </footer>
    )
}
