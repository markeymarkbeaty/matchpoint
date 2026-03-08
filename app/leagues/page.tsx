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
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadLeagues()
  }, [])

  async function loadLeagues() {

    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      setLoading(false)
      return
    }

    const { data: memberships } = await supabase
      .from('league_members')
      .select('league_id')
      .eq('user_id', user.id)

    if (!memberships || memberships.length === 0) {
      setLeagues([])
      setLoading(false)
      return
    }

    const leagueIds = memberships.map(m => m.league_id)

    const { data: leaguesData } = await supabase
      .from('leagues')
      .select('*')
      .in('id', leagueIds)

    setLeagues(leaguesData || [])
    setLoading(false)
  }

  async function createLeague() {

    const { data: { user } } = await supabase.auth.getUser()

    if (!user || !leagueName) return

    const { data: league } = await supabase
      .from('leagues')
      .insert({
        name: leagueName,
        owner_id: user.id
      })
      .select()
      .single()

    if (!league) return

    await supabase.from('league_members').insert({
      league_id: league.id,
      user_id: user.id
    })

    router.push(`/leagues/${league.id}`)
  }

  async function joinLeague() {

    const { data: { user } } = await supabase.auth.getUser()

    if (!user || !joinCode) return

    const { data: invite } = await supabase
      .from('league_invites')
      .select('*')
      .eq('invite_code', joinCode)
      .single()

    if (!invite) return

    await supabase.from('league_members').insert({
      league_id: invite.league_id,
      user_id: user.id
    })

    router.push(`/leagues/${invite.league_id}`)
  }

  return (

    <div className="min-h-screen bg-black text-white px-6 pt-14 pb-32">

      <h1 className="text-3xl font-semibold mb-10">
        My Leagues
      </h1>

      {/* CREATE */}

      <div className="mb-10">

        <input
          value={leagueName}
          onChange={(e) => setLeagueName(e.target.value)}
          placeholder="League name"
          className="w-full bg-zinc-900 border border-zinc-800 p-3 rounded-xl mb-3"
        />

        <button
          onClick={createLeague}
          className="w-full py-3 rounded-xl border border-green-400 text-green-300 hover:border-green-400 hover:shadow-[0_0_14px_rgba(74,222,128,0.4)] transition"
        >
          Create League
        </button>

      </div>

      {/* JOIN */}

      <div className="mb-10">

        <input
          value={joinCode}
          onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
          placeholder="Enter invite code"
          className="w-full bg-zinc-900 border border-zinc-800 p-3 rounded-xl mb-3 text-center"
        />

        <button
          onClick={joinLeague}
          className="w-full py-3 rounded-xl border border-green-400 text-green-300 hover:border-green-400 hover:shadow-[0_0_14px_rgba(74,222,128,0.4)] transition"
        >
          Join League
        </button>

      </div>

      {/* LEAGUE LIST */}

      {loading && (
        <div className="text-zinc-400">Loading...</div>
      )}

      <div className="space-y-4">

        {leagues.map((league) => (

          <div
            key={league.id}
            onClick={() => router.push(`/leagues/${league.id}`)}
            className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 cursor-pointer hover:border-green-400 hover:shadow-[0_0_14px_rgba(74,222,128,0.4)] transition"
          >

            <div className="font-semibold text-lg">
              {league.name}
            </div>

          </div>

        ))}

      </div>

      <BottomNav />

    </div>

  )
}