'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import BottomNav from '@/components/BottomNav'

export default function LeaguesPage() {

    const router = useRouter()

    const [leagues, setLeagues] = useState<any[]>([])
    const [leagueName, setLeagueName] = useState('')
    const [inviteCode, setInviteCode] = useState('')
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        loadLeagues()
    }, [])

    async function loadLeagues() {

        const { data: { user } } = await supabase.auth.getUser()

        if (!user) return

        // leagues you own
        const { data: owned } = await supabase
            .from('leagues')
            .select('*')
            .eq('owner_id', user.id)

        // leagues you joined
        const { data: memberships } = await supabase
            .from('league_members')
            .select('league_id')
            .eq('user_id', user.id)

        let joined: any[] = []

        if (memberships && memberships.length > 0) {

            const ids = memberships.map(m => m.league_id)

            const { data: joinedLeagues } = await supabase
                .from('leagues')
                .select('*')
                .in('id', ids)

            joined = joinedLeagues || []
        }

        const combined = [...(owned || []), ...joined]

        const unique = Object.values(
            combined.reduce((acc: any, league: any) => {
                acc[league.id] = league
                return acc
            }, {})
        )

        setLeagues(unique)
        setLoading(false)
    }

    async function createLeague() {

        const { data: { user } } = await supabase.auth.getUser()

        if (!user || !leagueName) return

        const { data: league } = await supabase
            .from('leagues')
            .insert({
                name: leagueName,
                owner_id: user.id
            })
            .select()
            .single()

        if (!league) return

        await supabase
            .from('league_members')
            .insert({
                league_id: league.id,
                user_id: user.id
            })

        router.push(`/leagues/${league.id}`)
    }

    async function joinLeague() {

        const { data: { user } } = await supabase.auth.getUser()

        if (!user || !inviteCode) return

        const { data: invite } = await supabase
            .from('league_invites')
            .select('*')
            .eq('invite_code', inviteCode)
            .single()

        if (!invite) return

        await supabase
            .from('league_members')
            .insert({
                league_id: invite.league_id,
                user_id: user.id
            })

        router.push(`/leagues/${invite.league_id}`)
    }

    return (

        <div className="min-h-screen bg-black text-white px-5 pt-14 pb-32">

            <h1 className="text-3xl font-semibold mb-10">
                My Leagues
            </h1>

            {loading && (
                <div className="text-zinc-400 mb-8">
                    Loading leagues...
                </div>
            )}

            <div className="space-y-4 mb-12">

                {leagues.map((league) => (

                    <div
                        key={league.id}
                        onClick={() => router.push(`/leagues/${league.id}`)}
                        className="
            rounded-2xl p-6 border bg-zinc-900 border-zinc-800 cursor-pointer
            hover:border-green-400
            hover:shadow-[0_0_16px_rgba(74,222,128,0.5)]
            transition
            "
                    >

                        <div className="text-lg font-semibold">
                            {league.name}
                        </div>

                    </div>

                ))}

            </div>

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
                    className="
          w-full py-3 rounded-xl border border-zinc-700 text-white
          hover:border-green-400 hover:text-green-400
          hover:shadow-[0_0_16px_rgba(74,222,128,0.6)]
          transition
          "
                >
                    Create League
                </button>

            </div>

            {/* JOIN */}

            <div className="mb-12">

                <input
                    value={inviteCode}
                    onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
                    placeholder="Enter invite code"
                    className="w-full bg-zinc-900 border border-zinc-800 p-3 rounded-xl mb-3 text-center"
                />

                <button
                    onClick={joinLeague}
                    className="
          w-full py-3 rounded-xl border border-zinc-700 text-white
          hover:border-green-400 hover:text-green-400
          hover:shadow-[0_0_16px_rgba(74,222,128,0.6)]
          transition
          "
                >
                    Join League
                </button>

            </div>

            <BottomNav />

        </div>

    )
}