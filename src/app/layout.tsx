import type { Metadata, Viewport } from 'next'
import { Barlow_Condensed, DM_Sans } from 'next/font/google'
import './globals.css'
import BottomNav from '@/components/BottomNav'
import { Analytics } from '@vercel/analytics/next'
import { SpeedInsights } from '@vercel/speed-insights/next'

const barlowCondensed = Barlow_Condensed({
  subsets: ['latin'],
  weight: ['500', '600', '700', '800'],
  variable: '--font-barlow',
  display: 'swap',
})

const dmSans = DM_Sans({
  subsets: ['latin'],
  variable: '--font-dm-sans',
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
    <html lang="no" className={`${barlowCondensed.variable} ${dmSans.variable}`}>
      <body className="bg-[#0b0b0b] text-[#f3f4f6] font-sans antialiased">
        {/* App header */}
        <header className="bg-[#0b0b0b] border-b border-skedsmo-red sticky top-0 z-40">
          <div className="max-w-2xl mx-auto px-4 py-3 flex items-center gap-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="https://skedsmofk.no/images/logo.png"
              alt="Skedsmo FK"
              className="w-8 h-8 object-contain"
            />
            <div>
              <div className="font-heading text-xl font-extrabold tracking-widest uppercase text-white leading-none">Skedsmo</div>
              <div className="font-heading text-[10px] tracking-widest uppercase mt-0.5" style={{ color: '#6b7280' }}>G2013 · Treningsapp</div>
            </div>
            <div className="ml-auto w-1.5 h-5 rounded-full" style={{ background: '#c6180e' }} />
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
