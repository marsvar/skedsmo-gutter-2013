'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Clock, CalendarDays, LayoutGrid, BookOpen, Trophy } from 'lucide-react'

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
    label: 'Info',
    Icon: BookOpen,
  },
]

export default function BottomNav() {
  const pathname = usePathname()

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50 pb-safe">
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
              className={`flex-1 flex flex-col items-center gap-0.5 py-2 text-xs transition-colors ${
                isActive ? 'text-skedsmo-red' : 'text-gray-400'
              }`}
            >
              <Icon
                className="w-6 h-6"
                strokeWidth={isActive ? 2.5 : 1.5}
              />
              <span className={isActive ? 'font-semibold' : ''}>{label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}

