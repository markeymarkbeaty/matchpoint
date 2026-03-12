'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import BottomNav from '@/components/BottomNav'

export default function LeaguesPage() {

    const router = useRouter()

    const [leagues, setLeagues] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        loadLeagues()
    }, [])

    async function loadLeagues() {

        const { data: userData } = await supabase.auth.getUser()
        const user = userData.user

        if (!user) return

        const { data: memberships } = await supabase
            .from('league_members')
            .select('league_id')
            .eq('user_id', user.id)

        if (!memberships) return

        const leagueIds = memberships.map(m => m.league_id)

        if (leagueIds.length === 0) {
            setLeagues([])
            setLoading(false)
            return
        }

        const { data } = await supabase
            .from('leagues')
            .select('*')
            .in('id', leagueIds)

        if (data) setLeagues(data)

        setLoading(false)
    }

    async function createLeague() {

        const name = prompt('Enter league name')

        if (!name) return

        const { data: userData } = await supabase.auth.getUser()
        const user = userData.user

        if (!user) return

        const { data: league, error } = await supabase
            .from('leagues')
            .insert({
                name: name,
                owner_id: user.id
            })
            .select()
            .single()

        if (error) {
            console.error(error)
            return
        }

        await supabase
            .from('league_members')
            .insert({
                league_id: league.id,
                user_id: user.id
            })

        loadLeagues()
    }

    return (

        <div className="min-h-screen bg-black text-white px-6 pt-14 pb-32">

            <h1 className="text-3xl font-semibold mb-8">
                Leagues
            </h1>

            {/* CREATE LEAGUE BUTTON */}

            <div className="mb-4">

                <button
                    onClick={createLeague}
                    className="
          w-full bg-zinc-900 border border-zinc-800 rounded-xl py-3
          hover:border-green-400
          hover:shadow-[0_0_12px_rgba(74,222,128,0.6)]
          transition
          "
                >
                    Create League
                </button>

            </div>

            {/* GLOBAL LEADERBOARD BUTTON */}

            <div className="mb-8">

                <button
                    onClick={() => router.push('/leaderboard')}
                    className="
          w-full bg-zinc-900 border border-zinc-800 rounded-xl py-3
          hover:border-green-400
          hover:shadow-[0_0_12px_rgba(74,222,128,0.6)]
          transition
          "
                >
                    Global Leaderboard
                </button>

            </div>

            {loading && (
                <div className="text-zinc-400 mb-6">
                    Loading leagues...
                </div>
            )}

            <div className="space-y-4">

                {leagues.map((league) => (

                    <button
                        key={league.id}
                        onClick={() => router.push(`/leagues/${league.id}`)}
                        className="
            w-full bg-zinc-900 border border-zinc-800 rounded-xl p-5 text-left
            hover:border-green-400
            hover:shadow-[0_0_12px_rgba(74,222,128,0.5)]
            transition
            "
                    >

                        <div className="font-semibold">
                            {league.name}
                        </div>

                    </button>

                ))}

            </div>

            <BottomNav />

        </div>

    )
}