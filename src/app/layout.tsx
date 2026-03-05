import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import BottomNav from '@/components/BottomNav'
import { Analytics } from '@vercel/analytics/next'
import { SpeedInsights } from '@vercel/speed-insights/next'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Skedsmo Fotball – Treningsappen',
  description: 'Treningsplanlegger for trenere – basert på NFF retningslinjer',
  manifest: '/manifest.webmanifest',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Trening 2013',
  },
  icons: {
    icon: 'https://skedsmofk.no/favicons/favicon-32.png',
    apple: 'https://skedsmofk.no/favicons/favicon-180.png',
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#c6180e',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="no" className={inter.variable}>
      <body className="bg-gray-50 text-gray-900 font-sans antialiased">
        {/* App header */}
        <header className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-40">
          <div className="max-w-2xl mx-auto px-4 py-3 flex items-center gap-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="https://skedsmofk.no/images/logo.png"
              alt="Skedsmo FK"
              className="w-9 h-9 object-contain"
            />
            <div>
              <div className="text-sm font-bold text-gray-900 leading-tight">Skedsmo Fotball</div>
              <div className="text-xs text-gray-400">Treningsappen · 2013-laget</div>
            </div>
          </div>
        </header>

        {/* Main content — padded for bottom nav */}
        <main className="max-w-2xl mx-auto px-4 py-6 pb-24">
          {children}
        </main>

        <BottomNav />
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  )
}
