'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import BottomNav from '@/components/BottomNav'

export default function PicksPage() {

  const router = useRouter()

  const [matches, setMatches] = useState<any[]>([])
  const [picks, setPicks] = useState<any>({})

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

  const now = new Date()

  const upcomingMatches = matches.filter(
    (m) => new Date(m.date) > now
  )

  const pastMatches = matches.filter(
    (m) => new Date(m.date) <= now
  )

  function MatchCard(match: any) {

    const kickoff = new Date(match.date)
    const locked = new Date() >= kickoff
    const userPick = picks[match.id]
    const result = match.result

    const correct = userPick && result && userPick === result

    return (

      <div
        key={match.id}
        className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6"
      >

        {/* MATCH INFO */}

        <div className="text-center mb-5">

          <div className="text-sm text-zinc-400">
            {formatDate(match.date)}
          </div>

          {match.stadium && (
            <div className="text-xs text-zinc-500 mt-1">
              {match.stadium}
              {match.city && ` — ${match.city}${match.state ? `, ${match.state}` : ''}`}
            </div>
          )}

        </div>

        {/* TEAM ROW */}

        <div className="grid grid-cols-3 items-center mb-4">

          <div className="flex items-center gap-3">

            {match.home_logo && (
              <img
                src={match.home_logo}
                alt={match.home_team}
                className="w-9 h-9 object-contain"
              />
            )}

            <span className="font-semibold">
              {match.home_team}
            </span>

          </div>

          <div className="text-center text-zinc-500 text-sm font-medium">
            VS
          </div>

          <div className="flex items-center justify-end gap-3">

            <span className="font-semibold">
              {match.away_team}
            </span>

            {match.away_logo && (
              <img
                src={match.away_logo}
                alt={match.away_team}
                className="w-9 h-9 object-contain"
              />
            )}

          </div>

        </div>

        {/* SCORE (IF COMPLETE) */}

        {match.home_score !== null && match.away_score !== null && (

          <div className="text-center mb-4 text-lg font-semibold">

            {match.home_score} — {match.away_score}

          </div>

        )}

        {/* RESULT FEEDBACK */}

        {locked && userPick && result && (

          <div className={`text-center text-sm mb-4 font-medium ${
            correct ? 'text-green-400' : 'text-red-400'
          }`}>

            {correct ? '✓ Correct Pick' : '✕ Incorrect Pick'}

          </div>

        )}

        {/* PICK BUTTONS */}

        <div className="grid grid-cols-3 gap-3">

          <button
            disabled={locked}
            onClick={() => makePick(match.id, 'home', match.date)}
            className={`relative py-2 rounded-xl ${
              picks[match.id] === 'home'
                ? 'bg-green-500 text-black ring-2 ring-green-400 shadow-lg shadow-green-500/20'
                : 'bg-zinc-800'
            } ${locked ? 'opacity-40 cursor-not-allowed' : ''}`}
          >
            Home
            {picks[match.id] === 'home' && (
              <span className="absolute right-2 top-1 text-sm">✓</span>
            )}
          </button>

          <button
            disabled={locked}
            onClick={() => makePick(match.id, 'draw', match.date)}
            className={`relative py-2 rounded-xl ${
              picks[match.id] === 'draw'
                ? 'bg-green-500 text-black ring-2 ring-green-400 shadow-lg shadow-green-500/20'
                : 'bg-zinc-800'
            } ${locked ? 'opacity-40 cursor-not-allowed' : ''}`}
          >
            Draw
            {picks[match.id] === 'draw' && (
              <span className="absolute right-2 top-1 text-sm">✓</span>
            )}
          </button>

          <button
            disabled={locked}
            onClick={() => makePick(match.id, 'away', match.date)}
            className={`relative py-2 rounded-xl ${
              picks[match.id] === 'away'
                ? 'bg-green-500 text-black ring-2 ring-green-400 shadow-lg shadow-green-500/20'
                : 'bg-zinc-800'
            } ${locked ? 'opacity-40 cursor-not-allowed' : ''}`}
          >
            Away
            {picks[match.id] === 'away' && (
              <span className="absolute right-2 top-1 text-sm">✓</span>
            )}
          </button>

        </div>

      </div>

    )
  }

  return (

    <div className="min-h-screen bg-black text-white px-6 pt-14 pb-32">

      <h1 className="text-3xl font-semibold mb-8">
        Picks
      </h1>

      <h2 className="text-lg font-semibold mb-4 text-zinc-300">
        Upcoming Matches
      </h2>

      <div className="space-y-6 mb-10">

        {upcomingMatches.map((match) => (
          <MatchCard {...match} />
        ))}

      </div>

      <h2 className="text-lg font-semibold mb-4 text-zinc-500">
        Past Matches
      </h2>

      <div className="space-y-6">

        {pastMatches.map((match) => (
          <MatchCard {...match} />
        ))}

      </div>

      <BottomNav />

    </div>
  )
}