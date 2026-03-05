'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function BottomNav() {
  const pathname = usePathname()

  const navItems = [
    { href: '/home', label: 'Home' },
    { href: '/picks', label: 'Picks' },
    { href: '/results', label: 'Results' },
    { href: '/leagues', label: 'Leagues' },
    { href: '/leaderboard', label: 'Leaderboard' },
    { href: '/dashboard', label: 'Dashboard' }
  ]

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-zinc-900 border-t border-zinc-800">

      <div className="max-w-xl mx-auto grid grid-cols-6">

        {navItems.map((item) => {
          const active = pathname === item.href

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center justify-center py-4 text-base font-medium transition-colors ${
                active
                  ? 'text-green-400'
                  : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              {item.label}
            </Link>
          )
        })}

      </div>

    </div>
  )
}