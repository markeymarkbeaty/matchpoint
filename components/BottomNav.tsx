'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'

export default function BottomNav({ pickCount }: { pickCount?: number }) {
  const pathname = usePathname()

  const navItems = [
    { href: '/home', label: 'Home' },
    { href: '/picks', label: 'Picks' },
    { href: '/leagues', label: 'Leagues' },
    { href: '/invest', label: 'Investing' }
  ]

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-black border-t border-zinc-800">

      {/* ✅ Animated Pick Counter */}
      {typeof pickCount === 'number' && (
        <div className="absolute left-[140px] top-1/2 -translate-y-1/2 text-white text-base font-semibold">

          <AnimatePresence mode="wait">
            <motion.div
              key={pickCount}
              initial={{ scale: 0.85, opacity: 0.6 }}
              animate={{ scale: 1.1, opacity: 1 }}
              exit={{ scale: 0.85, opacity: 0.6 }}
              transition={{ duration: 0.18 }}
            >
              {pickCount} Picks
            </motion.div>
          </AnimatePresence>

        </div>
      )}

      <div className="max-w-xl mx-auto grid grid-cols-4">

        {navItems.map((item) => {
          const active = pathname === item.href

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center justify-center py-4 text-base font-medium transition-colors ${active
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