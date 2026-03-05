'use client'

import { useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { useRouter } from 'next/navigation'
import BottomNav from '../../components/BottomNav'

export default function HomePage() {
  const router = useRouter()

  useEffect(() => {
    const checkUser = async () => {
      const { data } = await supabase.auth.getUser()

      if (!data.user) {
        router.push('/auth')
      }
    }

    checkUser()
  }, [router])

  return (
    <div className="min-h-screen bg-black text-white px-6 pt-14 pb-32">

      <h1 className="text-3xl font-semibold mb-6">
        MatchPoint
      </h1>

      <p className="text-zinc-400 mb-10">
        Welcome back. Ready to make your picks?
      </p>

      <div className="space-y-4">

        <button
          onClick={() => router.push('/picks')}
          className="w-full bg-green-500 text-black py-3 rounded-xl font-medium"
        >
          Make Picks
        </button>

        <button
          onClick={() => router.push('/leaderboard')}
          className="w-full bg-zinc-800 py-3 rounded-xl"
        >
          View Leaderboard
        </button>

        <button
          onClick={() => router.push('/leagues')}
          className="w-full bg-zinc-800 py-3 rounded-xl"
        >
          Your Leagues
        </button>

      </div>

      <BottomNav />

    </div>
  )
}