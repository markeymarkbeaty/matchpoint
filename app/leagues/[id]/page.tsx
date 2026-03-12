'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import BottomNav from '@/components/BottomNav'

export default function LeaguePage() {

    const params = useParams()
    const router = useRouter()

    const leagueId = params.id as string

    const [leagueName, setLeagueName] = useState('')
    const [members, setMembers] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    const [inviteCode, setInviteCode] = useState<string | null>(null)
    const [creatingInvite, setCreatingInvite] = useState(false)
    const [showInvite, setShowInvite] = useState(false)

    useEffect(() => {
        loadLeague()
        loadInvite()
    }, [])

    async function loadInvite() {

        const { data } = await supabase
            .from('league_invites')
            .select('invite_code')
            .eq('league_id', leagueId)
            .order('created_at', { ascending: false })
            .limit(1)
            .maybeSingle()

        if (data) {
            setInviteCode(data.invite_code)
        }
    }

    function generateCode() {
        return Math.random().toString(36).substring(2, 8).toUpperCase()
    }

    async function createInvite() {

        setCreatingInvite(true)

        const { data: { user } } = await supabase.auth.getUser()

        if (!user) return

        const code = generateCode()

        const { error } = await supabase
            .from('league_invites')
            .insert({
                league_id: leagueId,
                invite_code: code,
                created_by: user.id
            })

        if (!error) {
            setInviteCode(code)
        }

        setCreatingInvite(false)
    }

    function copyCode() {

        if (!inviteCode) return

        navigator.clipboard.writeText(inviteCode)
        alert('Invite code copied!')
    }

    async function loadLeague() {

        setLoading(true)

        const { data: league } = await supabase
            .from('leagues')
            .select('name')
            .eq('id', leagueId)
            .single()

        if (league) {
            setLeagueName(league.name)
        }

        const { data: memberRows } = await supabase
            .from('league_members')
            .select('user_id')
            .eq('league_id', leagueId)

        if (!memberRows || memberRows.length === 0) {
            setMembers([])
            setLoading(false)
            return
        }

        const userIds = memberRows.map(m => m.user_id)

        const { data: users } = await supabase
            .from('profiles')
            .select('id, username')
            .in('id', userIds)

        const usernameMap: any = {}

        users?.forEach(u => {
            usernameMap[u.id] = u.username
        })

        const { data: picks } = await supabase
            .from('picks')
            .select('user_id, is_correct')
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
                username: usernameMap[id] || 'User',
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
            .eq('league_id', leagueId)
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

        <div className="min-h-screen bg-black text-white px-5 pt-14 pb-32">

            <h1 className="text-3xl font-semibold mb-10">
                {leagueName || 'League'}
            </h1>

            {loading && (
                <div className="text-zinc-400 mb-8">
                    Loading league...
                </div>
            )}

            <div className="space-y-4 mb-12">

                {members.map((member, index) => (

                    <div
                        key={index}
                        className="
                        rounded-2xl p-6 border bg-zinc-900 border-zinc-800
                        hover:border-green-400
                        hover:shadow-[0_0_16px_rgba(74,222,128,0.5)]
                        transition
                        "
                    >

                        <div className="flex justify-between items-center">

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

            {/* INVITE SECTION */}

            <div className="mb-10 rounded-2xl border border-zinc-800 bg-zinc-900 p-6">

                <h2 className="text-lg font-semibold mb-4 text-green-400">
                    Invite Friends to League
                </h2>

                {!showInvite && (

                    <button
                        onClick={() => setShowInvite(true)}
                        className="
                        w-full py-3 rounded-xl border border-zinc-700
                        hover:border-green-400
                        hover:shadow-[0_0_16px_rgba(74,222,128,0.5)]
                        transition
                        "
                    >
                        Show Invite Code
                    </button>

                )}

                {showInvite && (

                    <div className="space-y-4">

                        {!inviteCode && (

                            <button
                                onClick={createInvite}
                                disabled={creatingInvite}
                                className="
                                w-full py-3 rounded-xl border border-zinc-700
                                hover:border-green-400
                                hover:shadow-[0_0_16px_rgba(74,222,128,0.5)]
                                transition
                                "
                            >
                                Generate Invite Code
                            </button>

                        )}

                        {inviteCode && (

                            <>
                                <div className="text-center">

                                    <div className="text-zinc-400 text-sm mb-1">
                                        Invite Code
                                    </div>

                                    <div className="text-2xl font-semibold tracking-widest">
                                        {inviteCode}
                                    </div>

                                </div>

                                <button
                                    onClick={copyCode}
                                    className="
                                    w-full py-3 rounded-xl border border-zinc-700
                                    hover:border-green-400
                                    hover:shadow-[0_0_16px_rgba(74,222,128,0.5)]
                                    transition
                                    "
                                >
                                    Copy Invite Code
                                </button>
                            </>
                        )}

                    </div>

                )}

            </div>

            <button
                onClick={leaveLeague}
                className="
                w-full py-3 rounded-xl border border-red-500 text-red-400
                hover:shadow-[0_0_16px_rgba(239,68,68,0.6)]
                transition
                "
            >
                Leave League
            </button>

            <BottomNav />

        </div>

    )
}