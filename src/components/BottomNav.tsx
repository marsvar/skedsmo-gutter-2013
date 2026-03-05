'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Clock, CalendarDays, LayoutGrid, BookOpen, Trophy } from 'lucide-react'
import { motion } from 'framer-motion'

const tabs = [
  {
    href: '/',
    label: 'I dag',
    Icon: Clock,
  },
  {
    href: '/week',
    label: 'Uke',
    Icon: CalendarDays,
  },
  {
    href: '/matches',
    label: 'Kamper',
    Icon: Trophy,
  },
  {
    href: '/season',
    label: 'Sesong',
    Icon: LayoutGrid,
  },
  {
    href: '/referanse',
    label: 'Referanse',
    Icon: BookOpen,
  },
]

export default function BottomNav() {
  const pathname = usePathname()

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 z-50 pb-safe">
      <div className="flex">
        {tabs.map(({ href, label, Icon }) => {
          const isActive =
            href === '/' ? pathname === '/'
            : href === '/season' ? pathname.startsWith('/season') || pathname.startsWith('/block')
            : pathname.startsWith(href)
          return (
            <Link
              key={href}
              href={href}
              className={`relative flex-1 flex flex-col items-center gap-0.5 pt-3 pb-2 transition-colors ${
                isActive ? 'text-skedsmo-red' : 'text-gray-400'
              }`}
            >
              {isActive && (
                <motion.div
                  layoutId="nav-indicator"
                  className="absolute top-0 left-3 right-3 h-0.5 bg-skedsmo-red rounded-full"
                  transition={{ type: 'spring', stiffness: 600, damping: 45 }}
                />
              )}
              <Icon className="w-5 h-5" strokeWidth={isActive ? 2.5 : 1.5} />
              <span className={`text-[10px] font-heading tracking-wider uppercase ${
                isActive ? 'font-bold' : 'font-medium'
              }`}>
                {label}
              </span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}

