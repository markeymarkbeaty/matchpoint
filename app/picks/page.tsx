'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import BottomNav from '@/components/BottomNav'

export default function PicksPage() {

  const [matches, setMatches] = useState<any[]>([])
  const [picks, setPicks] = useState<any>({})
  const [investments, setInvestments] = useState<any>({})
  const [tab, setTab] = useState<'upcoming' | 'past'>('upcoming')

  useEffect(() => {
    loadMatches()
    loadPicks()
    loadInvestments()
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

    const map: any = {}

    data?.forEach((p) => {
      map[p.match_id] = p.selected_team
    })

    setPicks(map)
  }

  async function loadInvestments() {

    const { data: userData } = await supabase.auth.getUser()
    const user = userData.user

    if (!user) return

    const { data } = await supabase
      .from('prediction_investments')
      .select('*')
      .eq('user_id', user.id)

    const map: any = {}

    data?.forEach((i) => {
      map[i.match_id] = i.amount
    })

    setInvestments(map)
  }

  async function invest(matchId: string, amount: number) {

    const { data } = await supabase.auth.getUser()
    const user = data.user

    if (!user) return

    await supabase
      .from('prediction_investments')
      .upsert({
        user_id: user.id,
        match_id: matchId,
        amount: amount
      })

    setInvestments({
      ...investments,
      [matchId]: amount
    })
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
      .upsert({
        user_id: user.id,
        match_id: matchId,
        selected_team: team
      })

    setPicks({
      ...picks,
      [matchId]: team
    })
  }

  function formatDate(dateString: string) {

    const date = new Date(dateString)

    return date.toLocaleString('en-US', {
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

    const week = Math.floor(diff / (7 * 24 * 60 * 60 * 1000)) + 1

    return Math.max(1, week)
  }

  const now = new Date()

  const upcomingMatches = matches.filter(
    (m) => new Date(m.date) > now
  )

  const pastMatches = matches.filter(
    (m) => new Date(m.date) <= now
  )

  const displayedMatches =
    tab === 'upcoming' ? upcomingMatches : pastMatches

  const groupedMatches = displayedMatches.reduce((acc: any, match: any) => {

    const week = getMatchWeek(match.date)

    if (!acc[week]) {
      acc[week] = []
    }

    acc[week].push(match)

    return acc

  }, {})

  function MatchCard({
    id,
    home_team,
    away_team,
    home_logo,
    away_logo,
    stadium,
    city,
    state,
    date,
    result
  }: any) {

    const kickoff = new Date(date)
    const locked = new Date() >= kickoff

    const userPick = picks[id]
    const investment = investments[id]

    const correct =
      userPick !== undefined &&
      result !== null &&
      userPick === result

    return (

      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">

        <div className="text-center mb-5">

          <div className="text-lg italic font-semibold text-zinc-300">
            {formatDate(date)}
          </div>

          {stadium && (
            <div className="text-xs text-zinc-500 mt-1">
              {stadium}
              {city && ` — ${city}${state ? `, ${state}` : ''}`}
            </div>
          )}

        </div>

        <div className="grid grid-cols-3 items-center mb-4">

          <div className="flex items-center gap-3">

            {home_logo && (
              <img
                src={home_logo}
                alt={home_team}
                className="w-9 h-9 object-contain"
              />
            )}

            <span className="font-semibold">
              {home_team}
            </span>

          </div>

          <div className="text-center text-zinc-500 text-sm font-medium">
            VS
          </div>

          <div className="flex items-center justify-end gap-3">

            <span className="font-semibold">
              {away_team}
            </span>

            {away_logo && (
              <img
                src={away_logo}
                alt={away_team}
                className="w-9 h-9 object-contain"
              />
            )}

          </div>

        </div>

        {locked && userPick && result && (

          <div
            className={`text-center text-sm mb-4 font-medium ${correct ? 'text-green-400' : 'text-red-400'
              }`}
          >
            {correct ? '✓ Correct Pick' : '✕ Incorrect Pick'}
          </div>

        )}

        <div className="grid grid-cols-3 gap-3 mb-4">

          {['home', 'draw', 'away'].map((team) => {

            const selected = picks[id] === team

            return (

              <button
                key={team}
                disabled={locked}
                onClick={() => makePick(id, team, date)}
                className={`relative py-2 rounded-xl border transition ${selected
                  ? 'border-green-400 text-green-300 shadow-[0_0_10px_rgba(74,222,128,0.6)]'
                  : 'border-zinc-700 text-white hover:border-green-400 hover:shadow-[0_0_10px_rgba(74,222,128,0.4)]'
                  } ${locked ? 'opacity-40 cursor-not-allowed' : ''}`}
              >

                {team.charAt(0).toUpperCase() + team.slice(1)}

                {selected && (
                  <span className="absolute right-2 top-1 text-sm text-green-300">
                    ✓
                  </span>
                )}

              </button>

            )

          })}

        </div>

        {userPick && !locked && (

          <div className="mt-2">

            <div className="text-xs text-zinc-500 mb-2 text-center">
              Optional Investment
            </div>

            <div className="grid grid-cols-3 gap-2">

              {[5, 10, 25].map((amount) => {

                const selected = investment === amount

                return (

                  <button
                    key={amount}
                    onClick={() => invest(id, amount)}
                    className={`py-1 rounded-lg border text-sm transition ${selected
                      ? 'border-green-400 text-green-300 shadow-[0_0_8px_rgba(74,222,128,0.5)]'
                      : 'border-zinc-700 hover:border-green-400'
                      }`}
                  >
                    ${amount}
                  </button>

                )

              })}

            </div>

          </div>

        )}

      </div>

    )
  }

  return (

    <div className="min-h-screen bg-black text-white px-6 pt-14 pb-32">

      <h1 className="text-3xl font-semibold mb-6">
        Picks
      </h1>

      {Object.keys(groupedMatches).map((week) => (

        <div key={week}>

          <h2 className="text-lg font-semibold text-zinc-400 mb-4">
            Matchweek {week}
          </h2>

          <div className="space-y-6 mb-10">

            {groupedMatches[week].map((match: any) => (
              <MatchCard key={match.id} {...match} />
            ))}

          </div>

        </div>

      ))}

      <BottomNav />

    </div>
  )
}