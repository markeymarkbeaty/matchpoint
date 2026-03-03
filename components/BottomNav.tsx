'use client'

import { useRouter, usePathname } from 'next/navigation'

export default function BottomNav() {
  const router = useRouter()
  const pathname = usePathname()

  function navClass(path: string) {
    return pathname === path
      ? 'text-green-400 font-semibold'
      : 'text-zinc-500'
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-zinc-950/80 backdrop-blur-xl border-t border-zinc-800 flex justify-around py-5 text-sm">
      <button
        onClick={() => router.push('/dashboard')}
        className={navClass('/dashboard')}
      >
        Dashboard
      </button>

      <button
        onClick={() => router.push('/admin')}
        className={navClass('/admin')}
      >
        Picks
      </button>

      <button
        onClick={() => router.push('/results')}
        className={navClass('/results')}
      >
        Results
      </button>

      <button
        onClick={() => router.push('/leaderboard')}
        className={navClass('/leaderboard')}
      >
        Leaderboard
      </button>

      <button
        onClick={() => router.push('/account')}
        className={navClass('/account')}
      >
        Account
      </button>
    </div>
  )
}