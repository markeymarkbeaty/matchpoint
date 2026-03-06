'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import BottomNav from '@/components/BottomNav'

export default function LeaguesPage() {

  const router = useRouter()

  const [leagues, setLeagues] = useState<any[]>([])
  const [leagueName, setLeagueName] = useState('')
  const [joinCode, setJoinCode] = useState('')
  const [message, setMessage] = useState('')

  useEffect(() => {
    loadLeagues()
  }, [])

  async function loadLeagues() {

    const { data: userData } = await supabase.auth.getUser()
    const user = userData.user

    if (!user) return

    const { data } = await supabase
      .from('league_members')
      .select(`
        league_id,
        leagues(*)
      `)
      .eq('user_id', user.id)

    if (data) {

      const leagueList = data.map((l: any) => l.leagues)

      setLeagues(leagueList)
    }
  }

  async function createLeague() {

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

      setLeagueName('')
      loadLeagues()
    }
  }

  async function joinLeague() {

    const { data } = await supabase.auth.getUser()
    const user = data.user

    if (!user || !joinCode) return

    const { data: invite } = await supabase
      .from('league_invites')
      .select('*')
      .eq('invite_code', joinCode)
      .single()

    if (!invite) {
      setMessage('Invalid invite code')
      return
    }

    const { error } = await supabase.from('league_members').insert({
      league_id: invite.league_id,
      user_id: user.id
    })

    if (error) {
      setMessage('You are already in this league')
      return
    }

    setMessage('League joined!')
    setJoinCode('')
    loadLeagues()
  }

  return (

    <div className="min-h-screen bg-black text-white px-6 pt-14 pb-32">

      <h1 className="text-3xl font-semibold mb-8">
        My Leagues
      </h1>

      {/* CREATE LEAGUE */}

      <div className="mb-10">

        <h2 className="text-sm uppercase text-zinc-500 mb-3">
          Create League
        </h2>

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

      {/* JOIN LEAGUE */}

      <div className="mb-10">

        <h2 className="text-sm uppercase text-zinc-500 mb-3">
          Join League
        </h2>

        <input
          value={joinCode}
          onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
          placeholder="Enter invite code"
          className="w-full bg-zinc-800 p-3 rounded-xl mb-3 text-center tracking-widest"
        />

        <button
          onClick={joinLeague}
          className="w-full bg-green-500 text-black py-3 rounded-xl"
        >
          Join League
        </button>

        {message && (
          <p className="mt-3 text-green-400 text-center">
            {message}
          </p>
        )}

      </div>

      {/* MY LEAGUES */}

      <div className="space-y-4">

        {leagues.map((league) => (

          <div
            key={league.id}
            onClick={() => router.push(`/leagues/${league.id}`)}
            className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 cursor-pointer hover:border-green-500 transition"
          >
            {league.name}
          </div>

        ))}

      </div>

      <BottomNav />

    </div>

  )
}