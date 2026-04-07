'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import BottomNav from '@/components/BottomNav'

export default function LeaguesPage() {

    const router = useRouter()

    const [leagues, setLeagues] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    // CREATE
    const [showCreate, setShowCreate] = useState(false)
    const [leagueName, setLeagueName] = useState('')
    const [creating, setCreating] = useState(false)

    // JOIN
    const [showJoin, setShowJoin] = useState(false)
    const [inviteInput, setInviteInput] = useState('')
    const [joining, setJoining] = useState(false)

    useEffect(() => {
        loadLeagues()
    }, [])

    async function loadLeagues() {

        const { data: userData } = await supabase.auth.getUser()
        const user = userData.user

        if (!user) {
            setLeagues([])
            setLoading(false)
            return
        }

        const { data: memberships } = await supabase
            .from('league_members')
            .select('league_id')
            .eq('user_id', user.id)

        if (!memberships) {
            setLeagues([])
            setLoading(false)
            return
        }

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

        if (!leagueName.trim()) return

        setCreating(true)

        const { data: userData } = await supabase.auth.getUser()
        const user = userData.user

        if (!user) {
            setCreating(false)
            return
        }

        const { data: league, error } = await supabase
            .from('leagues')
            .insert({
                name: leagueName,
                owner_id: user.id
            })
            .select()
            .single()

        if (error) {
            console.error(error)
            setCreating(false)
            return
        }

        await supabase
            .from('league_members')
            .insert({
                league_id: league.id,
                user_id: user.id
            })

        setLeagueName('')
        setShowCreate(false)
        setCreating(false)

        loadLeagues()
    }

    async function joinLeague() {

        if (!inviteInput.trim()) return

        setJoining(true)

        const { data: userData } = await supabase.auth.getUser()
        const user = userData.user

        if (!user) {
            setJoining(false)
            return
        }

        const { data: invite } = await supabase
            .from('league_invites')
            .select('league_id')
            .eq('invite_code', inviteInput.toUpperCase())
            .maybeSingle()

        if (!invite) {
            alert('Invalid invite code')
            setJoining(false)
            return
        }

        const { data: existing } = await supabase
            .from('league_members')
            .select('league_id')
            .eq('league_id', invite.league_id)
            .eq('user_id', user.id)
            .maybeSingle()

        if (existing) {
            alert('You are already in this league')
            setJoining(false)
            return
        }

        const { error } = await supabase
            .from('league_members')
            .insert({
                league_id: invite.league_id,
                user_id: user.id
            })

        if (error) {
            console.error(error)
            alert('Error joining league')
            setJoining(false)
            return
        }

        setInviteInput('')
        setShowJoin(false)
        setJoining(false)

        loadLeagues()
    }

    return (

        <div className="min-h-screen bg-black text-white px-6 pt-14 pb-32">

            <h1 className="text-3xl font-semibold mb-8">
                Leagues
            </h1>

            {/* GLOBAL */}

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

            <div className="space-y-4 mb-10">

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

            {/* CREATE */}

            <div className="mb-4 space-y-3">

                <button
                    onClick={() => setShowCreate(!showCreate)}
                    className="
          w-full bg-zinc-900 border border-zinc-800 rounded-xl py-3
          hover:border-green-400
          hover:shadow-[0_0_12px_rgba(74,222,128,0.6)]
          transition
          "
                >
                    Create League
                </button>

                {showCreate && (

                    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 space-y-3">

                        <input
                            value={leagueName}
                            onChange={(e) => setLeagueName(e.target.value)}
                            placeholder="League name"
                            className="w-full bg-black border border-zinc-700 rounded-lg px-3 py-2 text-white outline-none"
                        />

                        <button
                            onClick={createLeague}
                            disabled={creating}
                            className="w-full bg-black border border-zinc-700 rounded-lg py-2 hover:border-green-400"
                        >
                            {creating ? 'Creating...' : 'Create'}
                        </button>

                    </div>

                )}

            </div>

            {/* JOIN */}

            <div className="mb-8 space-y-3">

                <button
                    onClick={() => setShowJoin(!showJoin)}
                    className="
          w-full bg-zinc-900 border border-zinc-800 rounded-xl py-3
          hover:border-green-400
          hover:shadow-[0_0_12px_rgba(74,222,128,0.6)]
          transition
          "
                >
                    Join League
                </button>

                {showJoin && (

                    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 space-y-3">

                        <input
                            value={inviteInput}
                            onChange={(e) => setInviteInput(e.target.value)}
                            placeholder="Enter invite code"
                            className="w-full bg-black border border-zinc-700 rounded-lg px-3 py-2 text-white outline-none uppercase"
                        />

                        <button
                            onClick={joinLeague}
                            disabled={joining}
                            className="w-full bg-black border border-zinc-700 rounded-lg py-2 hover:border-green-400"
                        >
                            {joining ? 'Joining...' : 'Join'}
                        </button>

                    </div>

                )}

            </div>

            <BottomNav />

        </div>

    )
}