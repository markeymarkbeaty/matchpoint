'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import BottomNav from '@/components/BottomNav'
import { useRouter } from 'next/navigation'

export default function LeaguePage({ params }: { params: { id: string } }) {

  const router = useRouter()

  const [league, setLeague] = useState<any>(null)
  const [members, setMembers] = useState<any[]>([])

  useEffect(() => {
    loadLeague()
  }, [])

  async function loadLeague() {

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

    if (!memberData) return

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

      if (pick.is_correct) stats[pick.user_id].wins++

    })

    const leaderboard = memberData.map((member: any) => {

      const s = stats[member.user_id] || { wins: 0, total: 0 }

      const accuracy =
        s.total > 0
          ? Math.round((s.wins / s.total) * 100)
          : 0

      return {
        username: member.profiles?.username || 'User',
        wins: s.wins,
        accuracy
      }

    })

    leaderboard.sort((a, b) => b.wins - a.wins)

    setMembers(leaderboard)
  }

  async function leaveLeague() {

    const { data } = await supabase.auth.getUser()
    const user = data.user

    await supabase
      .from('league_members')
      .delete()
      .eq('league_id', params.id)
      .eq('user_id', user?.id)

    router.push('/leagues')
  }

  return (

    <div className="min-h-screen bg-black text-white px-6 pt-14 pb-32">

      <h1 className="text-3xl font-semibold mb-8">
        {league ? `${league.name} League` : 'League'}
      </h1>

      {/* LEADERBOARD */}

      <div className="space-y-4 mb-10">

        {members.map((member, index) => {

          let medal = `${index + 1}.`

          if (index === 0) medal = '🥇'
          if (index === 1) medal = '🥈'
          if (index === 2) medal = '🥉'

          return (

            <div
              key={index}
              className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 flex justify-between hover:border-green-400 hover:shadow-[0_0_10px_rgba(74,222,128,0.6)] transition"
            >

              <div className="flex gap-3">

                <span>{medal}</span>

                <span>{member.username}</span>

              </div>

              <div className="text-right">

                <div className="text-green-400">
                  {member.wins} wins
                </div>

                <div className="text-zinc-500 text-sm">
                  {member.accuracy}%
                </div>

              </div>

            </div>

          )

        })}

      </div>

      {/* LEAVE */}

      <button
        onClick={leaveLeague}
        className="w-full py-3 rounded-xl border border-red-500 text-red-400 shadow-[0_0_10px_rgba(239,68,68,0.6)]"
      >
        Leave League
      </button>

      <BottomNav />

    </div>

  )
}