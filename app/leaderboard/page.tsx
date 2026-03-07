'use client'

import { useEffect, useState } from 'react'
import BottomNav from '../../components/BottomNav'
import { createClient } from '@supabase/supabase-js'

type Leader = {
  user_id: string
  username: string
  total_units: number
  wins: number
  losses: number
}

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default function LeaderboardPage() {

  const [leaders, setLeaders] = useState<Leader[]>([])
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)

  useEffect(() => {

    async function load() {

      const { data: { user } } = await supabase.auth.getUser()

      setCurrentUserId(user?.id || null)

      const res = await fetch('/api/leaderboard')
      const data = await res.json()

      setLeaders(data || [])

    }

    load()

  }, [])

  const topThree = leaders.slice(0, 3)
  const rest = leaders.slice(3)

  return (

    <div className="min-h-screen bg-black text-white px-6 pt-14 pb-32">

      <h1 className="text-3xl font-semibold mb-10">
        Global Leaderboard
      </h1>

      {/* PODIUM */}

      <div className="grid grid-cols-3 gap-4 mb-10 text-center">

        {topThree.map((player, i) => {

          const medals = ['🥇', '🥈', '🥉']

          return (

            <div
              key={player.user_id}
              className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6"
            >

              <div className="text-3xl mb-2">
                {medals[i]}
              </div>

              <div className="font-semibold">
                {player.username}
              </div>

              <div className="text-sm text-zinc-400 mt-2">
                {Number(player.total_units).toFixed(1)} units
              </div>

            </div>

          )

        })}

      </div>

      {/* REST OF LEADERBOARD */}

      <div className="space-y-4">

        {rest.map((leader, index) => {

          const rank = index + 4

          const units = Number(leader.total_units || 0)

          const totalBets = leader.wins + leader.losses

          const winRate =
            totalBets > 0
              ? Math.round((leader.wins / totalBets) * 100)
              : 0

          const isCurrentUser =
            leader.user_id === currentUserId

          const unitsColor =
            units > 0
              ? 'text-green-400'
              : units < 0
                ? 'text-red-400'
                : 'text-white'

          return (

            <div
              key={leader.user_id}
              className={`rounded-2xl p-6 border ${isCurrentUser
                  ? 'bg-zinc-800 border-green-400'
                  : 'bg-zinc-900 border-zinc-800'
                }`}
            >

              <div className="flex justify-between items-center">

                <div>

                  <p className="text-xs text-zinc-500">
                    Rank #{rank}
                  </p>

                  <p className="font-semibold">
                    {leader.username}
                    {isCurrentUser && (
                      <span className="ml-2 text-xs text-green-400">
                        (You)
                      </span>
                    )}
                  </p>

                </div>

                <div className="text-right">

                  <p className={`text-lg font-semibold ${unitsColor}`}>
                    {units > 0 ? '+' : ''}
                    {units.toFixed(1)}
                  </p>

                  <p className="text-xs text-zinc-500">
                    {totalBets} Picks
                  </p>

                  <p className="text-xs text-zinc-500">
                    {winRate}% Win Rate
                  </p>

                </div>

              </div>

            </div>

          )

        })}

      </div>

      <BottomNav />

    </div>

  )
}