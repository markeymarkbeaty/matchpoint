'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import BottomNav from '@/components/BottomNav'

export default function LeaguePage({ params }: { params: { id: string } }) {

  const [league, setLeague] = useState<any>(null)
  const [members, setMembers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

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

      {loading && (
        <p className="text-zinc-400">
          Loading leaderboard...
        </p>
      )}

      <div className="space-y-3">

        {members.map((member, index) => (

          <div
            key={index}
            className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 flex justify-between"
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

      <BottomNav />

    </div>

  )
}