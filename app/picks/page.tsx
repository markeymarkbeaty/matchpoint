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

  async function makePick(matchId: string, team: string) {

    const { data } = await supabase.auth.getUser()
    const user = data.user

    if (!user) return

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

  return (

    <div className="min-h-screen bg-black text-white px-6 pt-14 pb-32">

      <h1 className="text-3xl font-semibold mb-8">
        Picks
      </h1>

      <div className="space-y-6">

        {matches.map((match) => (

          <div
            key={match.id}
            className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6"
          >

            {/* TEAM ROW */}

            <div className="grid grid-cols-3 items-center mb-6">

              {/* HOME */}

              <div className="flex items-center gap-3">

                {match.home_logo && (
                  <img
                    src={match.home_logo}
                    alt={match.home_team}
                    className="w-8 h-8 object-contain"
                  />
                )}

                <span className="font-semibold">
                  {match.home_team}
                </span>

              </div>

              {/* VS */}

              <div className="text-center text-zinc-500 text-sm">
                VS
              </div>

              {/* AWAY */}

              <div className="flex items-center justify-end gap-3">

                <span className="font-semibold">
                  {match.away_team}
                </span>

                {match.away_logo && (
                  <img
                    src={match.away_logo}
                    alt={match.away_team}
                    className="w-8 h-8 object-contain"
                  />
                )}

              </div>

            </div>

            {/* PICK BUTTONS */}

            <div className="grid grid-cols-3 gap-3">

              <button
                onClick={() => makePick(match.id, 'home')}
                className={`py-2 rounded-xl ${
                  picks[match.id] === 'home'
                    ? 'bg-green-500 text-black'
                    : 'bg-zinc-800'
                }`}
              >
                Home
              </button>

              <button
                onClick={() => makePick(match.id, 'draw')}
                className={`py-2 rounded-xl ${
                  picks[match.id] === 'draw'
                    ? 'bg-green-500 text-black'
                    : 'bg-zinc-800'
                }`}
              >
                Draw
              </button>

              <button
                onClick={() => makePick(match.id, 'away')}
                className={`py-2 rounded-xl ${
                  picks[match.id] === 'away'
                    ? 'bg-green-500 text-black'
                    : 'bg-zinc-800'
                }`}
              >
                Away
              </button>

            </div>

          </div>

        ))}

      </div>

      <BottomNav />

    </div>
  )
}