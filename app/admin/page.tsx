'use client'

import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import BottomNav from '../../components/BottomNav'

export default function PicksPage() {
  const [upcomingMatches, setUpcomingMatches] = useState<any[]>([])
  const [pastMatches, setPastMatches] = useState<any[]>([])
  const [userPicks, setUserPicks] = useState<Record<string, string>>({})
  const [loadingMatchId, setLoadingMatchId] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    const init = async () => {
      const { data } = await supabase.auth.getUser()
      const user = data.user

      if (!user) {
        router.push('/login')
        return
      }

      const now = new Date().toISOString()

      const { data: upcoming } = await supabase
        .from('matches')
        .select('*')
        .gte('date', now)
        .order('date', { ascending: true })

      const { data: past } = await supabase
        .from('matches')
        .select('*')
        .lt('date', now)
        .order('date', { ascending: false })

      const { data: picks } = await supabase
        .from('picks')
        .select('match_id, selected_team')
        .eq('user_id', user.id)

      const picksMap: Record<string, string> = {}
      picks?.forEach((p) => {
        picksMap[p.match_id] = p.selected_team
      })

      if (upcoming) setUpcomingMatches(upcoming)
      if (past) setPastMatches(past)
      setUserPicks(picksMap)
    }

    init()
  }, [router])

  const handlePick = async (matchId: string, team: string) => {
    setLoadingMatchId(matchId)

    const { data: userData } = await supabase.auth.getUser()
    const user = userData.user
    if (!user) return

    const { error } = await supabase
      .from('picks')
      .upsert(
        {
          user_id: user.id,
          match_id: matchId,
          selected_team: team
        },
        { onConflict: 'user_id,match_id' }
      )

    if (!error) {
      setUserPicks((prev) => ({
        ...prev,
        [matchId]: team
      }))
    }

    setLoadingMatchId(null)
  }

  const getOrdinal = (n: number) => {
    if (n > 3 && n < 21) return 'th'
    switch (n % 10) {
      case 1: return 'st'
      case 2: return 'nd'
      case 3: return 'rd'
      default: return 'th'
    }
  }

  const formatMatchDate = (dateString: string) => {
    const date = new Date(dateString)
    const weekday = date.toLocaleDateString('en-US', { weekday: 'long' })
    const month = date.toLocaleDateString('en-US', { month: 'long' })
    const day = date.getDate()
    const hours = date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      timeZoneName: 'short'
    })
    return `${weekday}, ${month} ${day}${getOrdinal(day)}, ${hours}`
  }

  const renderMatchCard = (match: any, isLocked: boolean) => {
    const selected = userPicks[match.id]

    return (
      <div
        key={match.id}
        className="bg-zinc-900 border border-zinc-800 rounded-3xl overflow-hidden"
      >
        <div className="bg-zinc-800 px-6 py-4 border-b border-zinc-700">
          <p className="text-base italic font-medium text-zinc-300 tracking-tight">
            {formatMatchDate(match.date)}
          </p>
        </div>

        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <p className="text-xl font-semibold">{match.home_team}</p>
            <span className="text-zinc-500 text-sm">VS</span>
            <p className="text-xl font-semibold">{match.away_team}</p>
          </div>

          <div className="grid grid-cols-3 gap-3">
            {['home', 'draw', 'away'].map((team) => {
              const isSelected = selected === team

              return (
                <button
                  key={team}
                  disabled={isLocked || loadingMatchId === match.id}
                  onClick={() => handlePick(match.id, team)}
                  className={`relative py-2 rounded-2xl text-sm font-medium transition-all duration-200 ${
                    isSelected
                      ? 'bg-green-500/10 border border-green-400 text-green-400 shadow-[0_0_15px_rgba(34,197,94,0.5)]'
                      : isLocked
                      ? 'bg-zinc-800 text-zinc-600 cursor-not-allowed'
                      : 'bg-zinc-800 border border-zinc-700 text-zinc-400 hover:border-green-500/50 hover:text-green-400'
                  }`}
                >
                  {team}

                  {isSelected && (
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-green-400">
                      ✓
                    </span>
                  )}
                </button>
              )
            })}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black text-white px-5 pt-14 pb-32">
      <h1 className="text-3xl font-semibold mb-10">Picks</h1>

      <div className="space-y-8 mb-14">
        <h2 className="text-lg font-semibold text-green-400">Upcoming</h2>
        {upcomingMatches.map((match) =>
          renderMatchCard(match, false)
        )}
      </div>

      <div className="space-y-8">
        <h2 className="text-lg font-semibold text-zinc-500">
          Past Matches
        </h2>
        {pastMatches.map((match) =>
          renderMatchCard(match, true)
        )}
      </div>

      <BottomNav />
    </div>
  )
}