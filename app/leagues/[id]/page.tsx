'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import BottomNav from '@/components/BottomNav'

export default function LeaguePage({ params }: { params: { id: string } }) {

  const [league, setLeague] = useState<any>(null)
  const [members, setMembers] = useState<any[]>([])
  const [memberList, setMemberList] = useState<any[]>([])
  const [inviteLink, setInviteLink] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    generateInvite()
    loadLeague()
  }, [])

  function generateInvite() {
    if (typeof window !== 'undefined') {
      setInviteLink(`${window.location.origin}/leagues/${params.id}`)
    }
  }

  function copyInvite() {
    navigator.clipboard.writeText(inviteLink)
    alert('Invite link copied!')
  }

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

  return (

    <div className="min-h-screen bg-black text-white px-6 pt-14 pb-32">

      <h1 className="text-3xl font-semibold mb-8">
        {league?.name || 'League'}
      </h1>

      {/* Invite Friends */}

      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 mb-8">

        <h2 className="text-lg font-semibold mb-3">
          Invite Friends
        </h2>

        <p className="text-sm text-zinc-400 mb-3">
          Share this link to invite friends to your league
        </p>

        <div className="flex gap-3">

          <input
            value={inviteLink}
            readOnly
            className="flex-1 bg-zinc-800 rounded-lg px-3 py-2 text-sm"
          />

          <button
            onClick={copyInvite}
            className="bg-green-500 text-black px-4 py-2 rounded-lg font-medium"
          >
            Copy
          </button>

        </div>

      </div>

      {/* Members */}

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

      {/* Leaderboard */}

      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5">

        <h2 className="text-lg font-semibold mb-4">
          League Leaderboard
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

      <BottomNav />

    </div>

  )
}