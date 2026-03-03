'use client'

import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import BottomNav from '../../components/BottomNav'

export default function Results() {
  const [matches, setMatches] = useState<any[]>([])
  const router = useRouter()

  useEffect(() => {
    const checkUser = async () => {
      const { data } = await supabase.auth.getUser()
      if (!data.user) router.push('/login')
    }

    const fetchResults = async () => {
      const { data } = await supabase
        .from('matches')
        .select('*')
        .not('result', 'is', null)
        .order('date', { ascending: false })

      if (data) setMatches(data)
    }

    checkUser()
    fetchResults()
  }, [router])

  function formatDate(dateString: string) {
    return new Date(dateString).toLocaleDateString(undefined, {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    })
  }

  return (
    <div className="min-h-screen bg-black text-white px-5 pt-14 pb-32">
      <h1 className="text-3xl font-semibold tracking-tight mb-10">
        Results
      </h1>

      {matches.length === 0 ? (
        <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 text-zinc-500">
          No completed matches yet.
        </div>
      ) : (
        <div className="space-y-8">
          {matches.map((match) => {
            const pnl = Number(match.profit_loss) || 0

            const pnlColor =
              pnl > 0
                ? 'text-green-400'
                : pnl < 0
                ? 'text-red-400'
                : 'text-white'

            const resultGlow =
              pnl > 0
                ? 'bg-green-500/10 border-green-500/30'
                : pnl < 0
                ? 'bg-red-500/10 border-red-500/30'
                : 'bg-zinc-800 border-zinc-700'

            return (
              <motion.div
                key={match.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6"
              >
                <div className="flex justify-between items-center mb-4">
                  <div>
                    <p className="text-lg font-semibold">
                      {match.home_team}
                    </p>
                    <p className="text-xs text-zinc-500">
                      vs {match.away_team}
                    </p>
                  </div>

                  <div className="text-right">
                    <p className={`text-lg font-semibold ${pnlColor}`}>
                      {pnl.toFixed(1)}u
                    </p>
                    <p className="text-xs text-zinc-500">
                      {formatDate(match.date)}
                    </p>
                  </div>
                </div>

                <div
                  className={`rounded-2xl p-4 border ${resultGlow}`}
                >
                  <p className="text-sm text-zinc-400 mb-1">
                    Final Result
                  </p>
                  <p className="text-lg font-semibold">
                    {match.result}
                  </p>
                </div>
              </motion.div>
            )
          })}
        </div>
      )}

      <BottomNav />
    </div>
  )
}