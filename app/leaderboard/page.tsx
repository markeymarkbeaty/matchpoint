'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import BottomNav from '../../components/BottomNav'
import { createClient } from '@supabase/supabase-js'

type Leader = {
  user_id: string
  username: string | null
  wins: number
  losses: number
}

type Profile = {
  id: string
  username: string | null
}

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default function LeaderboardPage() {

  const [leaders, setLeaders] = useState<Leader[]>([])
  const [unranked, setUnranked] = useState<Profile[]>([])
  const [loading, setLoading] = useState(true)
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)

  useEffect(() => {

    async function load() {

      const { data: { user } } = await supabase.auth.getUser()
      setCurrentUserId(user?.id || null)

      const res = await fetch('/api/leaderboard')
      const data = await res.json()
      setLeaders(data || [])

      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, username')

      const rankedIds = new Set((data || []).map((l: Leader) => l.user_id))

      const unrankedUsers =
        (profiles || []).filter(p => !rankedIds.has(p.id))

      setUnranked(unrankedUsers)

      setLoading(false)
    }

    load()

  }, [])

  function medal(rank: number) {
    if (rank === 0) return '🥇'
    if (rank === 1) return '🥈'
    if (rank === 2) return '🥉'
    return null
  }

  return (

    <div className="min-h-screen bg-black text-white px-5 pt-14 pb-32">

      <h1 className="text-3xl font-semibold tracking-tight mb-6">
        Global Leaderboard
      </h1>

      {loading && (
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 text-zinc-400">
          Loading...
        </div>
      )}

      {/* ================= RANKED ================= */}

      <div className="space-y-4">

        {leaders.map((leader, index) => {

          const wins = leader.wins || 0
          const losses = leader.losses || 0
          const total = wins + losses

          const accuracy =
            total > 0
              ? Math.round((wins / total) * 100)
              : 0

          const isCurrentUser =
            leader.user_id === currentUserId

          const medalIcon = medal(index)

          return (

            <motion.div
              key={leader.user_id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className={`
                rounded-2xl p-6 border transition
                hover:border-green-400 hover:shadow-[0_0_14px_rgba(74,222,128,0.25)]
                ${isCurrentUser ? 'bg-zinc-800 border-green-500' : 'bg-zinc-900 border-zinc-800'}
              `}
            >

              <div className="flex justify-between items-center">

                <div>

                  <p className="text-xs text-zinc-500 mb-1">
                    Rank #{index + 1}
                  </p>

                  <p className="text-lg font-semibold flex items-center gap-2">

                    {medalIcon && <span className="text-xl">{medalIcon}</span>}

                    {leader.username || 'User'}

                    {isCurrentUser && (
                      <span className="text-xs text-green-400 ml-2">
                        (You)
                      </span>
                    )}

                  </p>

                  <p className="text-sm text-zinc-300 mt-1">
                    {wins} correct picks, {losses} incorrect
                  </p>

                </div>

                <div className="text-right">

                  <p className="text-2xl font-bold text-white">
                    {accuracy}%
                  </p>

                  <p className="text-xs text-zinc-500 mt-1">
                    Pick Accuracy
                  </p>

                  <p className="text-xs text-zinc-500">
                    {total} Picks
                  </p>

                </div>

              </div>

            </motion.div>

          )

        })}

      </div>

      {/* ================= UNRANKED ================= */}

      {unranked.length > 0 && (

        <div className="mt-8">

          <h2 className="text-lg font-semibold text-zinc-400 mb-1">
            Unranked Players
          </h2>

          {/* ✅ Now styled as disclaimer */}
          <p className="text-xs text-zinc-500 mb-4">
            Predict 5 matches to appear on the ranked leaderboard.
          </p>

          <div className="space-y-3">

            {unranked.map((user) => (

              <div
                key={user.id}
                className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 text-zinc-400 flex justify-between"
              >
                <span>{user.username || 'User'}</span>
                <span className="text-xs text-zinc-500">
                  Not enough picks
                </span>
              </div>

            ))}

          </div>

        </div>

      )}

      <BottomNav />

    </div>
  )
}