'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import BottomNav from '@/components/BottomNav'

export default function PicksPage() {

  const [matches, setMatches] = useState<any[]>([])
  const [picks, setPicks] = useState<any>({})
  const [tab, setTab] = useState<'upcoming' | 'past'>('upcoming')

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

    const map: any = {}

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

    const seasonStart = new Date('2026-03-01')
    const matchDate = new Date(dateString)

    const diff = matchDate.getTime() - seasonStart.getTime()

    return Math.floor(diff / (7 * 24 * 60 * 60 * 1000)) + 1
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

  const weeks = displayedMatches.map(m => getMatchWeek(m.date))
  const minWeek = weeks.length ? Math.min(...weeks) : 1

  const groupedMatches = displayedMatches.reduce((acc: any, match: any) => {

    const rawWeek = getMatchWeek(match.date)
    const week = rawWeek - minWeek + 1

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

    const correct =
      userPick !== undefined &&
      result !== null &&
      userPick === result

    return (

      <div
        key={id}
        className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6"
      >

        <div className="text-center mb-5">

          <div className="text-sm text-zinc-400">
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
            className={`text-center text-sm mb-4 font-medium ${
              correct ? 'text-green-400' : 'text-red-400'
            }`}
          >
            {correct ? '✓ Correct Pick' : '✕ Incorrect Pick'}
          </div>

        )}

        <div className="grid grid-cols-3 gap-3">

          {['home','draw','away'].map((team) => {

            const selected = picks[id] === team

            return (

              <button
                key={team}
                disabled={locked}
                onClick={() => makePick(id, team, date)}
                className={`relative py-2 rounded-xl border transition ${
                  selected
                    ? 'border-green-400 text-green-300 shadow-[0_0_10px_rgba(74,222,128,0.6)]'
                    : 'border-zinc-700 text-white'
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

      </div>

    )
  }

  return (

    <div className="min-h-screen bg-black text-white px-6 pt-14 pb-32">

      <h1 className="text-3xl font-semibold mb-6">
        Picks
      </h1>

      <div className="flex mb-6 border-b border-zinc-800">

        <button
          onClick={() => setTab('upcoming')}
          className={`flex-1 pb-3 ${
            tab === 'upcoming'
              ? 'border-b-2 border-green-400 text-green-400'
              : 'text-zinc-500'
          }`}
        >
          Upcoming
        </button>

        <button
          onClick={() => setTab('past')}
          className={`flex-1 pb-3 ${
            tab === 'past'
              ? 'border-b-2 border-green-400 text-green-400'
              : 'text-zinc-500'
          }`}
        >
          Past
        </button>

      </div>

      {Object.keys(groupedMatches).map((week) => (

        <div key={week}>

          <h2 className="text-lg font-semibold text-zinc-400 mb-4">
            Week {week}
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