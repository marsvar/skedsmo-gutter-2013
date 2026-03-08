import type { Metadata, Viewport } from 'next'
import { Barlow_Condensed, DM_Sans } from 'next/font/google'
import './globals.css'

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
          {children}
      </body>
    </html>
  )
}
