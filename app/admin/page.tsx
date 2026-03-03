'use client'

import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import BottomNav from '../../components/BottomNav'

export default function PicksPage() {
  const [upcomingMatches, setUpcomingMatches] = useState<any[]>([])
  const [pastMatches, setPastMatches] = useState<any[]>([])
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [loadingMatchId, setLoadingMatchId] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    const init = async () => {
      const { data } = await supabase.auth.getUser()
      if (!data.user) {
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

      if (upcoming) setUpcomingMatches(upcoming)
      if (past) setPastMatches(past)
    }

    init()
  }, [router])

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

  const handlePick = async (matchId: string, team: string) => {
    setErrorMessage(null)
    setLoadingMatchId(matchId)

    const { data: userData } = await supabase.auth.getUser()
    const user = userData.user

    if (!user) {
      setErrorMessage('Not authenticated')
      setLoadingMatchId(null)
      return
    }

    const { error } = await supabase
      .from('picks')
      .upsert(
        {
          user_id: user.id,
          match_id: matchId,
          selected_team: team
        },
        {
          onConflict: 'user_id,match_id'
        }
      )

    setLoadingMatchId(null)

    if (error) {
      console.error(error)
      setErrorMessage(error.message)
    }
  }

  const renderMatchCard = (match: any, isLocked: boolean) => (
    <div
      key={match.id}
      className="bg-zinc-900 border border-zinc-800 rounded-3xl overflow-hidden"
    >
      {/* SPORTS STYLE DATE HEADER */}
      <div className="bg-zinc-800 px-6 py-4 border-b border-zinc-700">
        <p className="text-lg font-bold tracking-tight">
          {formatMatchDate(match.date)}
        </p>
      </div>

      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <p className="text-xl font-semibold">
              {match.home_team}
            </p>
            <p className="text-xs text-zinc-500">Home</p>
          </div>

          <span className="text-zinc-600 text-sm font-semibold">
            VS
          </span>

          <div className="text-right">
            <p className="text-xl font-semibold">
              {match.away_team}
            </p>
            <p className="text-xs text-zinc-500">Away</p>
          </div>
        </div>

        {isLocked && (
          <p className="text-xs text-red-400 mb-4">
            Locked
          </p>
        )}

        <div className="grid grid-cols-3 gap-3">
          {['home', 'draw', 'away'].map((team) => (
            <button
              key={team}
              disabled={isLocked || loadingMatchId === match.id}
              onClick={() => handlePick(match.id, team)}
              className={`py-2 rounded-2xl text-sm font-medium transition ${
                isLocked
                  ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
                  : 'bg-green-500/10 border border-green-500/30 text-green-400 hover:bg-green-500/20'
              }`}
            >
              {team.charAt(0).toUpperCase() + team.slice(1)}
            </button>
          ))}
        </div>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-black text-white px-5 pt-14 pb-32">
      <h1 className="text-3xl font-semibold tracking-tight mb-10">
        Picks
      </h1>

      {errorMessage && (
        <motion.div
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-red-500/10 border border-red-500/30 text-red-400 rounded-3xl p-6 mb-8"
        >
          {errorMessage}
        </motion.div>
      )}

      {/* Upcoming */}
      <div className="space-y-8 mb-14">
        <h2 className="text-lg font-semibold text-green-400">
          Upcoming
        </h2>

        {upcomingMatches.map((match) =>
          renderMatchCard(match, false)
        )}
      </div>

      {/* Past */}
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