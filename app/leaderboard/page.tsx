'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
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
  const [loading, setLoading] = useState(true)
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)

  useEffect(() => {
    async function load() {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      setCurrentUserId(user?.id || null)

      const res = await fetch('/api/leaderboard')
      const data = await res.json()

      setLeaders(data || [])
      setLoading(false)
    }

    load()
  }, [])

  return (
    <div className="min-h-screen bg-black text-white px-5 pt-14 pb-32">
      <h1 className="text-3xl font-semibold tracking-tight mb-10">
        Leaderboard
      </h1>

      {loading && (
        <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 text-zinc-400">
          Loading...
        </div>
      )}

      {!loading && leaders.length === 0 && (
        <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 text-zinc-400">
          No players yet.
        </div>
      )}

      <div className="space-y-6">
        {leaders.map((leader, index) => {
          const units = Number(leader.total_units || 0)
          const totalBets = leader.wins + leader.losses
          const winRate =
            totalBets > 0 ? Math.round((leader.wins / totalBets) * 100) : 0

          const isFirst = index === 0
          const isCurrentUser = leader.user_id === currentUserId

          const unitsColor =
            units > 0
              ? 'text-green-400'
              : units < 0
              ? 'text-red-400'
              : 'text-white'

          return (
            <motion.div
              key={leader.user_id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className={`
                rounded-3xl p-6 border
                ${isFirst ? 'border-yellow-500 shadow-lg shadow-yellow-500/10' : 'border-zinc-800'}
                ${isCurrentUser ? 'bg-zinc-800' : 'bg-zinc-900'}
              `}
            >
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-xs text-zinc-500 mb-2">
                    Rank #{index + 1}
                    {isFirst && ' 🏆'}
                  </p>

                  <p className="text-lg font-semibold">
                    {leader.username}
                    {isCurrentUser && (
                      <span className="ml-2 text-xs text-green-400">
                        (You)
                      </span>
                    )}
                  </p>
                </div>

                <div className="text-right">
                  <p className={`text-xl font-semibold ${unitsColor}`}>
                    {units > 0 ? '+' : ''}
                    {units.toFixed(1)}
                  </p>

                  <p className="text-xs text-zinc-500 mt-1">
                    {totalBets} Bets
                  </p>

                  <p className="text-xs text-zinc-500">
                    {winRate}% Win Rate
                  </p>
                </div>
              </div>
            </motion.div>
          )
        })}
      </div>

      <BottomNav />
    </div>
  )
}