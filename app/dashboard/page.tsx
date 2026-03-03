'use client'

import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import BottomNav from '../../components/BottomNav'

export default function Dashboard() {
  const router = useRouter()

  const [matches, setMatches] = useState<any[]>([])
  const [stats, setStats] = useState<{
    totalUnits: number
    totalPicks: number
    wins: number
    losses: number
    winRate: number
  } | null>(null)

  const unitsColor =
    stats && stats.totalUnits > 0
      ? 'text-green-400'
      : stats && stats.totalUnits < 0
      ? 'text-red-400'
      : 'text-white'

  useEffect(() => {
    const init = async () => {
      // Auth check
      const { data } = await supabase.auth.getUser()
      if (!data.user) {
        router.push('/login')
        return
      }

      // Fetch scored pick performance
      const { data: sessionData } = await supabase.auth.getSession()
      const token = sessionData.session?.access_token

      if (token) {
        const res = await fetch('/api/dashboard', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        const dashboardData = await res.json()
        setStats(dashboardData)
      }

      // Fetch matches (for display cards only)
      const { data: matchData } = await supabase
        .from('matches')
        .select('*')
        .order('date', { ascending: true })

      if (matchData) setMatches(matchData)
    }

    init()
  }, [router])

  return (
    <div className="min-h-screen bg-black text-white px-5 pt-14 pb-32">
      <h1 className="text-3xl font-semibold tracking-tight mb-10">
        MatchPoint
      </h1>

      {/* PERFORMANCE CARD */}
      <div className="sticky top-0 z-40 bg-black pb-6">
        <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 mb-6">
          <p className="text-xs text-zinc-500 mb-4">
            Performance
          </p>

          {!stats ? (
            <p className="text-zinc-500 text-sm">
              Loading performance...
            </p>
          ) : (
            <div className="grid grid-cols-3 text-center">
              <div>
                <motion.p
                  key={stats.totalUnits}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4 }}
                  className={`text-lg font-semibold ${unitsColor}`}
                >
                  {stats.totalUnits.toFixed(1)}
                </motion.p>
                <p className="text-xs text-zinc-500 mt-1">
                  Units
                </p>
              </div>

              <div>
                <motion.p
                  key={stats.winRate}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4 }}
                  className="text-lg font-semibold"
                >
                  {stats.winRate}%
                </motion.p>
                <p className="text-xs text-zinc-500 mt-1">
                  Win Rate
                </p>
              </div>

              <div>
                <p className="text-lg font-semibold">
                  {stats.totalPicks}
                </p>
                <p className="text-xs text-zinc-500 mt-1">
                  Picks
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* MATCH CARDS */}
      {matches.length === 0 ? (
        <p className="text-zinc-500">
          No matches yet.
        </p>
      ) : (
        <div className="space-y-8">
          {matches.map((match) => {
            const edge = match.home_win_prob

            return (
              <div
                key={match.id}
                className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 transition-all duration-300 active:scale-[0.98]"
              >
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <p className="text-lg font-semibold">
                      {match.home_team}
                    </p>
                    <p className="text-xs text-zinc-500">
                      Home
                    </p>
                  </div>

                  <span className="text-zinc-600 text-xs">
                    VS
                  </span>

                  <div className="text-right">
                    <p className="text-lg font-semibold">
                      {match.away_team}
                    </p>
                    <p className="text-xs text-zinc-500">
                      Away
                    </p>
                  </div>
                </div>

                <div className="mb-6">
                  <p className="text-xs text-zinc-500 mb-2">
                    Model Edge
                  </p>

                  <div className="flex items-end gap-3">
                    <p className="text-4xl font-bold text-green-400">
                      {edge}%
                    </p>
                    <p className="text-sm text-zinc-500 mb-1">
                      Home Win
                    </p>
                  </div>

                  <div className="mt-3 h-2 w-full bg-zinc-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-green-500 transition-all duration-700"
                      style={{ width: `${edge}%` }}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6 text-sm text-zinc-400">
                  <div>
                    <p>Draw</p>
                    <p className="text-white font-medium mt-1">
                      {match.draw_prob}%
                    </p>
                  </div>
                  <div>
                    <p>Away Win</p>
                    <p className="text-white font-medium mt-1">
                      {match.away_win_prob}%
                    </p>
                  </div>
                </div>

                <div className="mt-6 bg-green-500/10 border border-green-500/30 rounded-2xl p-4">
                  <p className="text-green-400 font-semibold text-lg">
                    {match.recommended_bet}
                  </p>
                  <p className="text-green-300 text-sm mt-1">
                    Confidence {match.confidence}/10
                  </p>
                </div>
              </div>
            )
          })}
        </div>
      )}

      <BottomNav />
    </div>
  )
}