'use client'

import { useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { useRouter } from 'next/navigation'
import BottomNav from '../../components/BottomNav'

export default function DashboardPage() {
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

      <h1 className="text-3xl font-semibold mb-10">
        Dashboard
      </h1>

      {/* ACCOUNT */}

      <div className="mb-10">

        <h2 className="text-sm uppercase text-zinc-500 mb-4">
          Account
        </h2>

        <div className="space-y-3">

          <button
            onClick={() => router.push('/friends')}
            className="w-full bg-zinc-900 border border-zinc-800 rounded-xl py-3"
          >
            My Friends
          </button>

          <button
            onClick={() => router.push('/favorite-teams')}
            className="w-full bg-zinc-900 border border-zinc-800 rounded-xl py-3"
          >
            Favorite Teams
          </button>

          <button
            onClick={() => router.push('/notifications')}
            className="w-full bg-zinc-900 border border-zinc-800 rounded-xl py-3"
          >
            Notification Settings
          </button>

        </div>

      </div>

      {/* SOCIAL */}

      <div className="mb-10">

        <h2 className="text-sm uppercase text-zinc-500 mb-4">
          Social
        </h2>

        <div className="space-y-3">

          <button
            onClick={() => router.push('/invite')}
            className="w-full bg-zinc-900 border border-zinc-800 rounded-xl py-3"
          >
            Invite Friends
          </button>

          <button
            onClick={() => router.push('/leagues')}
            className="w-full bg-zinc-900 border border-zinc-800 rounded-xl py-3"
          >
            Your Leagues
          </button>

        </div>

      </div>

      {/* FEEDBACK */}

      <div className="mb-10">

        <h2 className="text-sm uppercase text-zinc-500 mb-4">
          Beta
        </h2>

        <button
          onClick={() => router.push('/feedback')}
          className="w-full bg-zinc-900 border border-zinc-800 rounded-xl py-3"
        >
          Send Feedback
        </button>

      </div>

      {/* FUTURE FEATURE */}

      <div>

        <h2 className="text-sm uppercase text-zinc-500 mb-4">
          Future
        </h2>

        <button
          disabled
          className="w-full bg-zinc-900 border border-zinc-800 rounded-xl py-3 text-zinc-500"
        >
          Investment Settings (Coming Soon)
        </button>

      </div>

      <BottomNav />

    </div>
  )
}