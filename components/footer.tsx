import Link from 'next/link'
import { Stethoscope, MapPin, Phone, ExternalLink } from 'lucide-react'

export function Footer() {
    return (
        <footer className="border-t border-border/20 bg-slate-50/80 dark:bg-[#06080F]/80 backdrop-blur-3xl relative overflow-hidden">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1200px] h-[300px] bg-[radial-gradient(circle_at_top,var(--primary)_0%,transparent_70%)] opacity-[0.03] dark:opacity-[0.06] pointer-events-none" />

            <div className="container mx-auto px-6 md:px-8 relative z-10 py-5">
                <div className="flex flex-col md:flex-row justify-between items-center gap-4">

                    {/* Left — Brand + Info */}
                    <div className="flex flex-col md:flex-row items-center gap-4 md:gap-6">
                        <Link href="/" className="flex items-center gap-2 font-black text-lg tracking-tighter text-foreground group">
                            <div className="h-7 w-7 rounded-lg bg-primary/10 flex items-center justify-center border border-primary/20 group-hover:bg-primary transition-all duration-500">
                                <Stethoscope className="h-3.5 w-3.5 text-primary group-hover:text-white group-hover:rotate-12 transition-transform duration-500" />
                            </div>
                            <span className="italic text-base">Clinical <span className="text-primary not-italic">Repository.</span></span>
                        </Link>
                        <div className="hidden md:block h-4 w-[1px] bg-border/30" />
                        <div className="flex items-center gap-4 flex-wrap justify-center">
                            <span className="flex items-center gap-1.5 text-[10px] text-muted-foreground/45">
                                <MapPin className="h-2.5 w-2.5 text-primary/50" />
                                Coimbatore — 641014
                            </span>
                            <a href="tel:04222574375" className="flex items-center gap-1.5 text-[10px] text-muted-foreground/45 hover:text-primary transition-colors">
                                <Phone className="h-2.5 w-2.5 text-primary/50" />
                                0422 257 4375
                            </a>
                            <a href="https://cmccbe.ac.in" target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-[10px] text-muted-foreground/45 hover:text-primary transition-colors">
                                <ExternalLink className="h-2.5 w-2.5 text-primary/50" />
                                cmccbe.ac.in
                            </a>
                        </div>
                    </div>

                    {/* Right — Links + Status */}
                    <div className="flex flex-col items-center md:items-end gap-2">
                        <div className="flex items-center gap-5">
                            <Link href="/browse" className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/50 hover:text-primary transition-colors">Catalog</Link>
                            <Link href="/upload" className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/50 hover:text-primary transition-colors">Contribute</Link>
                            <Link href="/feedback" className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/50 hover:text-primary transition-colors">Feedback</Link>
                        </div>
                        <div className="flex items-center gap-3">
                            <p className="text-[9px] font-bold uppercase tracking-[0.15em] text-foreground/50">
                                © {new Date().getFullYear()} CMC Clinical Repository
                            </p>
                            <span className="text-muted-foreground/20">•</span>
                            <p className="text-[9px] font-medium text-muted-foreground/35 italic flex items-center gap-1.5">
                                <span className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse shadow-[0_0_6px_rgba(34,197,94,0.4)]" />
                                v2.4.0-Alpha
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="absolute bottom-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-primary/10 to-transparent" />
        </footer>
    )
}
