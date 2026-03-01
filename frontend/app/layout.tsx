import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { ClerkProvider, UserButton, SignedIn, SignedOut, SignInButton } from '@clerk/nextjs'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'MapExtract Pro',
  description: 'Google Maps Scraper & Export SaaS - No API Key Required',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body className={`${inter.className} min-h-screen bg-slate-50 text-slate-900`}>
          <nav className="border-b bg-white border-slate-200">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded bg-blue-600 flex items-center justify-center text-white font-bold text-xl">M</div>
                <span className="font-bold text-xl tracking-tight">MapExtract Pro</span>
              </div>
              <div className="flex items-center gap-4">
                <SignedOut>
                  <SignInButton mode="modal">
                    <button className="text-sm font-semibold hover:text-blue-600 transition-colors">Sign In</button>
                  </SignInButton>
                </SignedOut>
                <SignedIn>
                  <a href="/dashboard" className="text-sm font-medium text-slate-600 hover:text-slate-900 mr-2">Dashboard</a>
                  <UserButton afterSignOutUrl="/" />
                </SignedIn>
              </div>
            </div>
          </nav>
          {children}
        </body>
      </html>
    </ClerkProvider>
  )
}
