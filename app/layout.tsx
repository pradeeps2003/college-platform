import type { Metadata } from 'next'
import { Outfit } from 'next/font/google'
import './globals.css'
import { AuthProvider } from '@/components/auth-provider'
import { ThemeProvider } from '@/components/theme-provider'
import { Navbar } from '@/components/navbar'
import { Footer } from '@/components/footer'
import { Toaster } from '@/components/ui/sonner'

const outfit = Outfit({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Clinical Repository | Medical Resource Platform',
  description: 'Premium resource hub for medical students',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={outfit.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <AuthProvider>
            <div className="min-h-screen bg-background flex flex-col transition-colors duration-300 relative">
              {/* Global Medical Grid Pattern */}
              <div className="fixed inset-0 pointer-events-none opacity-[0.05] dark:opacity-[0.1] z-0"
                style={{ backgroundSize: '60px 60px', backgroundImage: 'radial-gradient(circle, var(--primary) 2px, transparent 2px)' }} />

              <Navbar />
              <main className="flex-1 relative z-10">
                {children}
              </main>
              <Footer />
              <Toaster />
            </div>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
