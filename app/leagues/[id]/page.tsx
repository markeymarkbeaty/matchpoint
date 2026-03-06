'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import BottomNav from '@/components/BottomNav'
import { useRouter } from 'next/navigation'

export default function LeaguePage({ params }: { params: { id: string } }) {

  const router = useRouter()

  const [league, setLeague] = useState<any>(null)
  const [members, setMembers] = useState<any[]>([])
  const [memberList, setMemberList] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const [inviteCode, setInviteCode] = useState('')
  const [joinCode, setJoinCode] = useState('')
  const [message, setMessage] = useState('')

  const [isOwner, setIsOwner] = useState(false)
  const [editName, setEditName] = useState('')

  useEffect(() => {
    loadLeague()
  }, [])

  async function loadLeague() {

    const { data: userData } = await supabase.auth.getUser()
    const user = userData.user

    const { data: leagueData } = await supabase
      .from('leagues')
      .select('*')
      .eq('id', params.id)
      .single()

    if (!leagueData) return

    setLeague(leagueData)
    setEditName(leagueData.name)

    if (leagueData.owner_id === user?.id) {
      setIsOwner(true)
    }

    const { data: memberData } = await supabase
      .from('league_members')
      .select(`
        user_id,
        profiles (
          username
        )
      `)
      .eq('league_id', params.id)

    if (!memberData) {
      setLoading(false)
      return
    }

    setMemberList(memberData)

    const userIds = memberData.map(m => m.user_id)

    const { data: picks } = await supabase
      .from('picks')
      .select('user_id,is_correct')
      .in('user_id', userIds)

    const stats: any = {}

    picks?.forEach(pick => {

      if (!stats[pick.user_id]) {
        stats[pick.user_id] = { wins: 0, total: 0 }
      }

      stats[pick.user_id].total++

      if (pick.is_correct) {
        stats[pick.user_id].wins++
      }

    })

    const leaderboard = memberData.map((member: any) => {

      const userStats = stats[member.user_id] || { wins: 0, total: 0 }

      const accuracy =
        userStats.total > 0
          ? Math.round((userStats.wins / userStats.total) * 100)
          : 0

      return {
        username: member.profiles?.username || 'User',
        wins: userStats.wins,
        accuracy
      }

    })

    leaderboard.sort((a, b) => b.wins - a.wins)

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

    const { error } = await supabase
      .from('league_invites')
      .insert({
        league_id: params.id,
        invite_code: code,
        created_by: user.id
      })

    if (!error) {
      setInviteCode(code)
      setMessage('Invite code created!')
    }
  }

  async function leaveLeague() {

    const confirmLeave = confirm('Leave this league?')

    if (!confirmLeave) return

    const { data } = await supabase.auth.getUser()
    const user = data.user

    await supabase
      .from('league_members')
      .delete()
      .eq('league_id', params.id)
      .eq('user_id', user?.id)

    router.push('/leagues')
  }

  async function updateLeagueName() {

    await supabase
      .from('leagues')
      .update({ name: editName })
      .eq('id', params.id)

    setLeague({ ...league, name: editName })
  }

  async function archiveLeague() {

    const confirmArchive = confirm('Archive league?')

    if (!confirmArchive) return

    await supabase
      .from('leagues')
      .update({ archived: true })
      .eq('id', params.id)

    router.push('/leagues')
  }

  return (

    <div className="min-h-screen bg-black text-white px-6 pt-14 pb-32">

      <h1 className="text-3xl font-semibold mb-8">
        {league ? `${league.name} League` : 'League'}
      </h1>

      {/* LEADERBOARD */}

      <div className="space-y-4 mb-10">

        <h2 className="text-lg text-zinc-400">
          Leaderboard
        </h2>

        {members.map((member, index) => {

          let rank = `${index + 1}.`

          if (index === 0) rank = '🥇'
          if (index === 1) rank = '🥈'
          if (index === 2) rank = '🥉'

          return (

            <div
              key={index}
              className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 flex justify-between items-center hover:border-green-400 hover:shadow-[0_0_10px_rgba(74,222,128,0.6)] transition"
            >

              <div className="flex items-center gap-3">

                <span className="text-lg">
                  {rank}
                </span>

                <span className="font-medium">
                  {member.username}
                </span>

              </div>

              <div className="text-right text-sm">

                <div className="text-green-400 font-semibold">
                  {member.wins} wins
                </div>

                <div className="text-zinc-500">
                  {member.accuracy}% accuracy
                </div>

              </div>

            </div>

          )

        })}

      </div>

      {/* MEMBERS */}

      <div className="space-y-3 mb-10">

        <h2 className="text-lg text-zinc-400">
          Members
        </h2>

        {memberList.map((member, index) => (

          <div
            key={index}
            className="bg-zinc-900 border border-zinc-800 rounded-xl p-4"
          >
            {member.profiles?.username}
          </div>

        ))}

      </div>

      {/* INVITE */}

      <div className="space-y-4 mb-10">

        <button
          onClick={createInvite}
          className="w-full py-3 rounded-xl border border-green-400 text-green-300 shadow-[0_0_10px_rgba(74,222,128,0.6)]"
        >
          Generate Invite Code
        </button>

        {inviteCode && (

          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 text-center">

            <p className="text-zinc-400 text-sm">
              Share this code
            </p>

            <p className="text-2xl font-bold tracking-widest">
              {inviteCode}
            </p>

          </div>

        )}

      </div>

      {/* SETTINGS */}

      <div className="space-y-3">

        {isOwner && (

          <>
            <input
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-800 p-3 rounded-xl"
            />

            <button
              onClick={updateLeagueName}
              className="w-full py-3 rounded-xl border border-green-400 text-green-300 shadow-[0_0_10px_rgba(74,222,128,0.6)]"
            >
              Update League Name
            </button>

            <button
              onClick={archiveLeague}
              className="w-full py-3 rounded-xl bg-yellow-500 text-black"
            >
              Archive League
            </button>

          </>
        )}

        <button
          onClick={leaveLeague}
          className="w-full py-3 rounded-xl bg-red-500 text-white"
        >
          Leave League
        </button>

      </div>

      <BottomNav />

    </div>
  )
}