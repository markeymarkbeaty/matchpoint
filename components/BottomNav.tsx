'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function BottomNav() {
  const pathname = usePathname()

  const navItems = [
    { name: 'Picks', href: '/picks' },
    { name: 'Dashboard', href: '/dashboard' },
    { name: 'Leaderboard', href: '/leaderboard' }
  ]

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-black border-t border-zinc-800 px-6 py-4">
      <div className="flex justify-between max-w-md mx-auto">
        {navItems.map((item) => {
          const active = pathname === item.href

          return (
            <Link
              key={item.name}
              href={item.href}
              className={`text-sm font-medium transition ${
                active
                  ? 'text-green-400'
                  : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              {item.name}
            </Link>
          )
        })}
      </div>
    </div>
  )
}