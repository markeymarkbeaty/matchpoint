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

  const buttonStyle =
    "w-full bg-zinc-900 border border-zinc-800 rounded-xl py-3 transition hover:border-green-400 hover:shadow-[0_0_12px_rgba(74,222,128,0.6)]"

  return (

    <div className="min-h-screen bg-black text-white px-6 pt-14 pb-32">

      <h1 className="text-3xl font-semibold mb-10">
        MatchPoint
      </h1>

      {/* SOCIAL */}

      <div className="mb-10">

        <h2 className="text-sm uppercase text-zinc-500 mb-4">
          Social
        </h2>

        <div className="space-y-3">

          <button
            onClick={() => router.push('/leagues')}
            className={buttonStyle}
          >
            My Leagues
          </button>

          <button
            onClick={() => router.push('/friends')}
            className={buttonStyle}
          >
            My Friends
          </button>

          <button
            onClick={() => router.push('/invite')}
            className={buttonStyle}
          >
            Invite Friends
          </button>

        </div>

      </div>

      {/* SPORTS */}

      <div className="mb-10">

        <h2 className="text-sm uppercase text-zinc-500 mb-4">
          Sports
        </h2>

        <div className="space-y-3">

          <button
            onClick={() => router.push('/favorite-teams')}
            className={buttonStyle}
          >
            🤍 Teams
          </button>

          <button
            onClick={() => router.push('/standings')}
            className={buttonStyle}
          >
            Standings
          </button>

          <button
            onClick={() => router.push('/matches')}
            className={buttonStyle}
          >
            Matches
          </button>

        </div>

      </div>

      {/* ACCOUNT */}

      <div className="mb-10">

        <h2 className="text-sm uppercase text-zinc-500 mb-4">
          Account
        </h2>

        <div className="space-y-3">

          <button
            onClick={() => router.push('/notifications')}
            className={buttonStyle}
          >
            Notification Settings
          </button>

          <button
            onClick={() => router.push('/username')}
            className={buttonStyle}
          >
            Update Username
          </button>

          <button
            onClick={() => router.push('/reset-password')}
            className={buttonStyle}
          >
            Reset Password
          </button>

        </div>

      </div>

      {/* BETA */}

      <div className="mb-10">

        <h2 className="text-sm uppercase text-zinc-500 mb-4">
          Beta
        </h2>

        <div className="space-y-3">

          <button
            onClick={() => router.push('/dev-progress')}
            className={buttonStyle}
          >
            Developer Goals & Progress
          </button>

          <button
            onClick={() => router.push('/feedback')}
            className={buttonStyle}
          >
            Send Feedback
          </button>

        </div>

      </div>

      {/* FUTURE */}

      <div>

        <h2 className="text-sm uppercase text-zinc-500 mb-4">
          Future
        </h2>

        <button
          onClick={() => router.push('/invest')}
          className={buttonStyle}
        >
          Investing
        </button>

      </div>

      <BottomNav />

    </div>

  )

}