'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import BottomNav from '@/components/BottomNav'

type Match = {
  id: string
  home_team: string
  away_team: string
  home_logo: string | null
  away_logo: string | null
  stadium: string | null
  city: string | null
  state: string | null
  date: string
  result: string | null
}

type PickMap = Record<string, string>

export default function PicksPage() {
  const [matches, setMatches] = useState<Match[]>([])
  const [picks, setPicks] = useState<PickMap>({})
  const [tab, setTab] = useState<'upcoming' | 'results'>('upcoming')

  useEffect(() => {
    loadMatches()
    loadPicks()
  }, [])

  async function loadMatches() {
    const { data } = await supabase
      .from('matches')
      .select('*')
      .order('date', { ascending: true })

    if (data) setMatches(data)
  }

  async function loadPicks() {
    const { data: userData } = await supabase.auth.getUser()
    const user = userData.user
    if (!user) return

    const { data } = await supabase
      .from('picks')
      .select('*')
      .eq('user_id', user.id)

    const map: PickMap = {}
    data?.forEach((p) => {
      map[p.match_id] = p.selected_team
    })

    setPicks(map)
  }

  async function makePick(matchId: string, team: string, matchDate: string) {
    const now = new Date()
    const kickoff = new Date(matchDate)
    if (now >= kickoff) return

    const { data } = await supabase.auth.getUser()
    const user = data.user
    if (!user) return

    const currentPick = picks[matchId]

    if (currentPick === team) {
      await supabase
        .from('picks')
        .delete()
        .eq('user_id', user.id)
        .eq('match_id', matchId)

      const updated = { ...picks }
      delete updated[matchId]
      setPicks(updated)
      return
    }

    await supabase
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

    setPicks({
      ...picks,
      [matchId]: team
    })
  }

  function formatDate(dateString: string) {
    return new Date(dateString).toLocaleString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    })
  }

  function getMatchWeek(dateString: string) {
    const SEASON_START = new Date('2026-03-15')
    const matchDate = new Date(dateString)
    const diff = matchDate.getTime() - SEASON_START.getTime()
    return Math.max(1, Math.floor(diff / (7 * 24 * 60 * 60 * 1000)) + 1)
  }

  const now = new Date()

  const upcomingMatches = matches.filter(m => new Date(m.date) > now)
  const pastMatches = matches.filter(m => new Date(m.date) <= now)

  const displayedMatches =
    tab === 'upcoming' ? upcomingMatches : pastMatches

  const groupedMatches = displayedMatches.reduce((acc: Record<number, Match[]>, match) => {
    const week = getMatchWeek(match.date)
    if (!acc[week]) acc[week] = []
    acc[week].push(match)
    return acc
  }, {})

  // ✅ NEW: pick counter
  const pickCount = Object.keys(picks).length

  function MatchCard(match: Match) {

    const userPick = picks[match.id]

    const correct =
      userPick &&
      match.result &&
      userPick === match.result

    const pickedTeam =
      userPick === 'home'
        ? match.home_team
        : userPick === 'away'
          ? match.away_team
          : 'Draw'

    const winningTeam =
      match.result === 'home'
        ? match.home_team
        : match.result === 'away'
          ? match.away_team
          : 'Draw'

    return (
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
        {/* unchanged */}
        <div className="text-center mb-5">
          <div className="text-lg italic font-semibold text-zinc-300">
            {formatDate(match.date)}
          </div>

          {match.stadium && (
            <div className="text-xs text-zinc-500 mt-1">
              {match.stadium}
              {match.city && ` — ${match.city}${match.state ? `, ${match.state}` : ''}`}
            </div>
          )}
        </div>

        <div className="grid grid-cols-3 items-center mb-4">
          <div className="flex items-center gap-3">
            {match.home_logo && <img src={match.home_logo} className="w-9 h-9" />}
            <span className="font-semibold">{match.home_team}</span>
          </div>

          <div className="text-center text-zinc-500 text-sm">VS</div>

          <div className="flex items-center justify-end gap-3">
            <span className="font-semibold">{match.away_team}</span>
            {match.away_logo && <img src={match.away_logo} className="w-9 h-9" />}
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3">
          {['home', 'draw', 'away'].map((team) => {

            const selected = picks[match.id] === team
            const isWinner = match.result === team

            return (
              <button
                key={team}
                onClick={
                  tab === 'upcoming'
                    ? () => makePick(match.id, team, match.date)
                    : undefined
                }
                disabled={tab === 'results'}
                className={`relative py-2 rounded-xl border text-white ${selected
                  ? 'border-green-400 text-green-300 shadow-[0_0_10px_rgba(74,222,128,0.6)]'
                  : 'border-zinc-700'
                  } ${tab === 'results' && isWinner
                    ? 'bg-green-500/10'
                    : ''
                  }`}
              >
                {team}

                {selected && (
                  <span className="absolute right-2 top-1 text-green-300">✓</span>
                )}

                {tab === 'results' && isWinner && (
                  <span className="absolute left-2 top-1 text-green-400">★</span>
                )}
              </button>
            )
          })}
        </div>

        {tab === 'results' && match.result && (
          <div className="space-y-2 mt-4 text-center">
            <div className="text-green-400 font-semibold">
              Your Pick: {pickedTeam}
            </div>
            <div className="text-zinc-300">
              Winner: {winningTeam}
            </div>
            <div className={`text-sm font-medium ${correct ? 'text-green-400' : 'text-red-400'}`}>
              {correct ? '✓ Correct Pick' : '✕ Incorrect Pick'}
            </div>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black text-white px-6 pt-14 pb-32">

      <h1 className="text-3xl font-semibold mb-6">Picks</h1>

      <div className="flex gap-3 mb-6">
        {['upcoming', 'results'].map(t => (
          <button
            key={t}
            onClick={() => setTab(t as any)}
            className={`px-4 py-2 rounded-xl border ${tab === t
              ? 'border-green-400 text-green-300 shadow-[0_0_10px_rgba(74,222,128,0.6)]'
              : 'border-zinc-700'
              }`}
          >
            {t === 'upcoming' ? 'Upcoming' : 'Results'}
          </button>
        ))}
      </div>

      {Object.keys(groupedMatches).map((week) => (
        <div key={week}>
          <h2 className="text-lg font-semibold text-zinc-400 mb-4">
            Matchweek {week}
          </h2>

          <div className="space-y-6 mb-10">
            {groupedMatches[Number(week)].map((match) => (
              <MatchCard key={match.id} {...match} />
            ))}
          </div>
        </div>
      ))}

      {/* ✅ pass count */}
      <BottomNav pickCount={pickCount} />

    </div>
  )
}