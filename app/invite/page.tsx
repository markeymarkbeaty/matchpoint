'use client'

import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import BottomNav from '../../components/BottomNav'

export default function InvitePage() {
  const [leagues, setLeagues] = useState<any[]>([])
  const [selectedLeague, setSelectedLeague] = useState('')
  const [inviteCode, setInviteCode] = useState('')
  const [joinCode, setJoinCode] = useState('')
  const [message, setMessage] = useState('')

  useEffect(() => {
    loadLeagues()
  }, [])

  const loadLeagues = async () => {
    const { data } = await supabase
      .from('leagues')
      .select('*')
      .order('created_at', { ascending: false })

    if (data) setLeagues(data)
  }

  const generateCode = () => {
    return Math.random().toString(36).substring(2, 8).toUpperCase()
  }

  const createInvite = async () => {
    const { data } = await supabase.auth.getUser()
    const user = data.user

    if (!user || !selectedLeague) return

    const code = generateCode()

    const { error } = await supabase.from('league_invites').insert({
      league_id: selectedLeague,
      invite_code: code,
      created_by: user.id
    })

    if (!error) {
      setInviteCode(code)
      setMessage('Invite code created!')
    }
  }

  const joinLeague = async () => {
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

    setMessage('You joined the league!')
    setJoinCode('')
  }

  return (
    <div className="min-h-screen bg-black text-white px-6 pt-14 pb-32">

      <h1 className="text-3xl font-semibold mb-10">
        Invite Friends
      </h1>

      {/* CREATE INVITE */}

      <div className="mb-12">

        <h2 className="text-sm uppercase text-zinc-500 mb-4">
          Create Invite
        </h2>

        <select
          value={selectedLeague}
          onChange={(e) => setSelectedLeague(e.target.value)}
          className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-3 mb-4"
        >
          <option value="">Select league</option>

          {leagues.map((league) => (
            <option key={league.id} value={league.id}>
              {league.name}
            </option>
          ))}

        </select>

        <button
          onClick={createInvite}
          className="w-full bg-green-500 text-black py-3 rounded-xl"
        >
          Generate Invite Code
        </button>

        {inviteCode && (
          <div className="mt-4 bg-zinc-900 border border-zinc-800 rounded-xl p-4 text-center">
            <p className="text-zinc-400 text-sm mb-1">
              Share this code
            </p>
            <p className="text-2xl font-bold tracking-widest">
              {inviteCode}
            </p>
          </div>
        )}

      </div>

      {/* JOIN LEAGUE */}

      <div>

        <h2 className="text-sm uppercase text-zinc-500 mb-4">
          Join League
        </h2>

        <input
          value={joinCode}
          onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
          placeholder="Enter invite code"
          className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-3 mb-4 text-center tracking-widest"
        />

        <button
          onClick={joinLeague}
          className="w-full bg-green-500 text-black py-3 rounded-xl"
        >
          Join League
        </button>

      </div>

      {message && (
        <p className="mt-6 text-center text-green-400">
          {message}
        </p>
      )}

      <BottomNav />

    </div>
  )
}