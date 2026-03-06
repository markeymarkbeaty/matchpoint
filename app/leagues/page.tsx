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

    const { data: membership } = await supabase
      .from('league_members')
      .select('league_id')
      .eq('user_id', user.id)

    if (!membership || membership.length === 0) {
      setLeagues([])
      return
    }

    const leagueIds = membership.map(m => m.league_id)

    const { data: leaguesData } = await supabase
      .from('leagues')
      .select('*')
      .in('id', leagueIds)

    if (!leaguesData) {
      setLeagues([])
      return
    }

    const ownerIds = leaguesData.map(l => l.owner_id)

    const { data: owners } = await supabase
      .from('profiles')
      .select('id, username')
      .in('id', ownerIds)

    const ownerMap: any = {}

    owners?.forEach(o => {
      ownerMap[o.id] = o.username
    })

    const formatted = leaguesData.map(l => ({
      ...l,
      owner_name: ownerMap[l.owner_id] || 'User'
    }))

    setLeagues(formatted)
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

    await supabase.from('league_members').insert({
      league_id: invite.league_id,
      user_id: user.id
    })

    setJoinCode('')
    loadLeagues()
  }

  return (

    <div className="min-h-screen bg-black text-white px-6 pt-14 pb-32">

      <h1 className="text-3xl font-semibold mb-8">
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
          className="w-full py-3 rounded-xl border border-green-400 text-green-300 shadow-[0_0_10px_rgba(74,222,128,0.6)]"
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
          className="w-full py-3 rounded-xl border border-green-400 text-green-300 shadow-[0_0_10px_rgba(74,222,128,0.6)]"
        >
          Join League
        </button>

      </div>

      {/* LIST */}

      <div className="space-y-4">

        {leagues.map((league) => (

          <div
            key={league.id}
            onClick={() => router.push(`/leagues/${league.id}`)}
            className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 cursor-pointer hover:border-green-400 hover:shadow-[0_0_10px_rgba(74,222,128,0.6)] transition"
          >

            <div className="font-semibold">
              {league.name}
            </div>

            <div className="text-sm text-zinc-500">
              Created by {league.owner_name}
            </div>

          </div>

        ))}

      </div>

      <BottomNav />

    </div>

  )
}