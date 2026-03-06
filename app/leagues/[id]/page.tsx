'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import BottomNav from '@/components/BottomNav'

export default function LeaguePage({ params }: { params: { id: string } }) {

  const [league, setLeague] = useState<any>(null)
  const [members, setMembers] = useState<any[]>([])
  const [memberList, setMemberList] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const [inviteCode, setInviteCode] = useState('')
  const [joinCode, setJoinCode] = useState('')
  const [message, setMessage] = useState('')

  useEffect(() => {
    loadLeague()
  }, [])

  async function loadLeague() {

    setLoading(true)

    const { data: leagueData } = await supabase
      .from('leagues')
      .select('*')
      .eq('id', params.id)
      .single()

    setLeague(leagueData)

    const { data: memberData } = await supabase
      .from('league_members')
      .select(`
        user_id,
        profiles(username)
      `)
      .eq('league_id', params.id)

    if (!memberData) {
      setLoading(false)
      return
    }

    setMemberList(memberData)

    const userIds = memberData.map((m) => m.user_id)

    const { data: picks } = await supabase
      .from('picks')
      .select('user_id,is_correct')
      .in('user_id', userIds)

    const scoreMap: Record<string, number> = {}

    picks?.forEach((pick) => {
      if (pick.is_correct) {
        scoreMap[pick.user_id] = (scoreMap[pick.user_id] || 0) + 1
      }
    })

    const leaderboard = memberData.map((member: any) => ({
      username: member.profiles?.username || 'User',
      score: scoreMap[member.user_id] || 0
    }))

    leaderboard.sort((a, b) => b.score - a.score)

    setMembers(leaderboard)

    setLoading(false)
  }

  function generateCode() {
    return Math.random().toString(36).substring(2, 8).toUpperCase()
  }

  async function createInvite() {

    const { data } = await supabase.auth.getUser()
    const user = data.user

    if (!user) return

    const code = generateCode()

    const { error } = await supabase.from('league_invites').insert({
      league_id: params.id,
      invite_code: code,
      created_by: user.id
    })

    if (!error) {
      setInviteCode(code)
      setMessage('Invite code created!')
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

    setMessage('You joined the league!')
    setJoinCode('')
  }

  return (

    <div className="min-h-screen bg-black text-white px-6 pt-14 pb-32">

      <h1 className="text-3xl font-semibold mb-8">
        {league?.name || 'League'}
      </h1>

      {/* LEADERBOARD */}

      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 mb-8">

        <h2 className="text-lg font-semibold mb-4">
          Leaderboard
        </h2>

        {loading && (
          <p className="text-zinc-400">
            Loading leaderboard...
          </p>
        )}

        <div className="space-y-3">

          {members.map((member, index) => (

            <div
              key={index}
              className="bg-zinc-800 border border-zinc-700 rounded-xl p-4 flex justify-between"
            >

              <span className="font-medium">
                {index + 1}. {member.username}
              </span>

              <span className="text-green-400 font-semibold">
                {member.score}
              </span>

            </div>

          ))}

        </div>

      </div>

      {/* MEMBERS */}

      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 mb-8">

        <h2 className="text-lg font-semibold mb-4">
          Members
        </h2>

        <div className="space-y-2">

          {memberList.map((member, index) => (

            <div
              key={index}
              className="border-b border-zinc-800 pb-2"
            >
              {member.profiles?.username || 'User'}
            </div>

          ))}

        </div>

      </div>

      {/* INVITE SECTION */}

      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5">

        <h2 className="text-lg font-semibold mb-6">
          Invite
        </h2>

        {/* CREATE INVITE */}

        <button
          onClick={createInvite}
          className="w-full bg-green-500 text-black py-3 rounded-xl mb-6"
        >
          Generate Invite Code
        </button>

        {inviteCode && (

          <div className="bg-zinc-800 border border-zinc-700 rounded-xl p-4 text-center mb-6">

            <p className="text-zinc-400 text-sm mb-1">
              Share this code
            </p>

            <p className="text-2xl font-bold tracking-widest">
              {inviteCode}
            </p>

          </div>

        )}

        {/* JOIN LEAGUE */}

        <input
          value={joinCode}
          onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
          placeholder="Enter invite code"
          className="w-full bg-zinc-800 border border-zinc-700 rounded-xl p-3 mb-4 text-center tracking-widest"
        />

        <button
          onClick={joinLeague}
          className="w-full bg-green-500 text-black py-3 rounded-xl"
        >
          Join League
        </button>

        {message && (
          <p className="mt-6 text-center text-green-400">
            {message}
          </p>
        )}

      </div>

      <BottomNav />

    </div>

  )
}