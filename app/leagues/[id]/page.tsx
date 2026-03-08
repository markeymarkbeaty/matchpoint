'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import BottomNav from '@/components/BottomNav'
import { useRouter } from 'next/navigation'

export default function LeaguePage({ params }: { params: { id: string } }) {

  const router = useRouter()

  const [leagueName, setLeagueName] = useState('')
  const [members, setMembers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadLeague()
  }, [])

  async function loadLeague() {

    setLoading(true)

    // get league info
    const { data: league } = await supabase
      .from('leagues')
      .select('name')
      .eq('id', params.id)
      .single()

    if (league) {
      setLeagueName(league.name)
    }

    // get members
    const { data: memberRows } = await supabase
      .from('league_members')
      .select('user_id')
      .eq('league_id', params.id)

    if (!memberRows || memberRows.length === 0) {
      setMembers([])
      setLoading(false)
      return
    }

    const userIds = memberRows.map(m => m.user_id)

    // get usernames
    const { data: users } = await supabase
      .from('profiles')
      .select('id,username')
      .in('id', userIds)

    const userMap: any = {}
    users?.forEach(u => {
      userMap[u.id] = u.username
    })

    // get picks
    const { data: picks } = await supabase
      .from('picks')
      .select('user_id,is_correct')
      .in('user_id', userIds)

    const stats: any = {}

    picks?.forEach(p => {

      if (!stats[p.user_id]) {
        stats[p.user_id] = { wins: 0, total: 0 }
      }

      stats[p.user_id].total++

      if (p.is_correct) stats[p.user_id].wins++

    })

    const leaderboard = userIds.map(id => {

      const s = stats[id] || { wins: 0, total: 0 }

      const accuracy =
        s.total > 0
          ? Math.round((s.wins / s.total) * 100)
          : 0

      return {
        username: userMap[id] || 'User',
        wins: s.wins,
        accuracy
      }

    })

    leaderboard.sort((a, b) => b.wins - a.wins)

    setMembers(leaderboard)
    setLoading(false)
  }

  async function leaveLeague() {

    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return

    await supabase
      .from('league_members')
      .delete()
      .eq('league_id', params.id)
      .eq('user_id', user.id)

    router.push('/leagues')
  }

  function medal(rank: number) {

    if (rank === 0) return '🥇'
    if (rank === 1) return '🥈'
    if (rank === 2) return '🥉'

    return `${rank + 1}.`
  }

  return (

    <div className="min-h-screen bg-black text-white px-6 pt-14 pb-32">

      <h1 className="text-3xl font-semibold mb-10">
        {leagueName || 'League'}
      </h1>

      {loading && (
        <div className="text-zinc-400">Loading league...</div>
      )}

      <div className="space-y-4 mb-10">

        {members.map((member, index) => (

          <div
            key={index}
            className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 hover:border-green-400 hover:shadow-[0_0_14px_rgba(74,222,128,0.4)] transition"
          >

            <div className="flex justify-between">

              <div className="flex items-center gap-3">

                <span className="text-xl">
                  {medal(index)}
                </span>

                <span className="font-semibold">
                  {member.username}
                </span>

              </div>

              <div className="text-right">

                <div className="text-green-400 font-semibold">
                  {member.wins} Wins
                </div>

                <div className="text-xs text-zinc-500">
                  {member.accuracy}% Accuracy
                </div>

              </div>

            </div>

          </div>

        ))}

      </div>

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