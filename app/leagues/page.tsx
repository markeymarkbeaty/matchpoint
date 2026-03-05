'use client'

import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import BottomNav from '../../components/BottomNav'

export default function LeaguesPage() {
  const [leagueName, setLeagueName] = useState('')
  const [leagues, setLeagues] = useState<any[]>([])

  const createLeague = async () => {
    const { data } = await supabase.auth.getUser()
    const user = data.user

    if (!user || !leagueName) return

    const { data: league } = await supabase
      .from('leagues')
      .insert({
        name: leagueName,
        owner_id: user.id
      })
      .select()
      .single()

    if (league) {
      await supabase.from('league_members').insert({
        league_id: league.id,
        user_id: user.id
      })
    }

    setLeagueName('')
    loadLeagues()
  }

  const loadLeagues = async () => {
    const { data } = await supabase
      .from('leagues')
      .select('*')
      .order('created_at', { ascending: false })

    if (data) setLeagues(data)
  }

  useEffect(() => {
    loadLeagues()
  }, [])

  return (
    <div className="min-h-screen bg-black text-white px-6 pt-14 pb-32">

      <h1 className="text-3xl font-semibold mb-8">
        Leagues
      </h1>

      <div className="mb-10">

        <input
          value={leagueName}
          onChange={(e) => setLeagueName(e.target.value)}
          placeholder="League name"
          className="w-full bg-zinc-800 p-3 rounded-xl mb-3"
        />

        <button
          onClick={createLeague}
          className="w-full bg-green-500 text-black py-3 rounded-xl"
        >
          Create League
        </button>

      </div>

      <div className="space-y-4">

        {leagues.map((league) => (
          <div
            key={league.id}
            className="bg-zinc-900 border border-zinc-800 rounded-xl p-4"
          >
            {league.name}
          </div>
        ))}

      </div>

      <BottomNav />

    </div>
  )
}