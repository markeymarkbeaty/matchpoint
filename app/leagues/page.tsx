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

    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return

    const { data, error } = await supabase
      .from('league_members')
      .select(`
        league_id,
        leagues (
          id,
          name,
          owner_id,
          profiles (
            username
          )
        )
      `)
      .eq('user_id', user.id)

    if (error || !data) {
      setLeagues([])
      return
    }

    const formatted = data.map((row: any) => ({
      id: row.leagues.id,
      name: row.leagues.name,
      owner_name: row.leagues.profiles?.username || 'User'
    }))

    setLeagues(formatted)
  }

  async function createLeague() {

    setMessage('')

    const { data: { user } } = await supabase.auth.getUser()

    if (!user || !leagueName) return

    const { data: league, error } = await supabase
      .from('leagues')
      .insert({
        name: leagueName,
        owner_id: user.id
      })
      .select()
      .single()

    if (error || !league) {
      setMessage('Could not create league')
      return
    }

    await supabase.from('league_members').insert({
      league_id: league.id,
      user_id: user.id
    })

    setLeagueName('')
    loadLeagues()
  }

  async function joinLeague() {

    setMessage('')

    const { data: { user } } = await supabase.auth.getUser()

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

    const { error } = await supabase
      .from('league_members')
      .insert({
        league_id: invite.league_id,
        user_id: user.id
      })

    if (error) {
      setMessage('You are already in this league')
      return
    }

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

      {message && (
        <div className="text-center text-sm text-red-400 mb-6">
          {message}
        </div>
      )}

      {/* LEAGUE LIST */}

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