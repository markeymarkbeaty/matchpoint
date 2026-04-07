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
    const [currentUserId, setCurrentUserId] = useState<string | null>(null)

    const [inviteCode, setInviteCode] = useState<string | null>(null)
    const [creatingInvite, setCreatingInvite] = useState(false)
    const [showInvite, setShowInvite] = useState(false)

    useEffect(() => {
        loadLeague()
        loadInvite()
        loadUser()
    }, [])

    async function loadUser() {
        const { data: { user } } = await supabase.auth.getUser()
        setCurrentUserId(user?.id || null)
    }

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

        if (!user) {
            setCreatingInvite(false)
            return
        }

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

        try {

            const res = await fetch(`/api/league-leaderboard?leagueId=${leagueId}`)
            const data = await res.json()

            setMembers(data || [])

        } catch (err) {
            console.error('Failed to load league leaderboard', err)
            setMembers([])
        }

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

        return null
    }

    return (

        <div className="min-h-screen bg-black text-white px-5 pt-14 pb-32">

            <h1 className="text-3xl font-semibold mb-6">
                {leagueName || 'League'}
            </h1>

            {loading && (
                <div className="text-zinc-400 mb-8">
                    Loading league...
                </div>
            )}

            <div className="space-y-4 mb-12">

                {members.map((member: any, index: number) => {

                    const wins = member.wins || 0
                    const losses = member.losses || 0
                    const total = wins + losses

                    const accuracy =
                        total > 0
                            ? Math.round((wins / total) * 100)
                            : 0

                    const isCurrentUser =
                        member.user_id === currentUserId

                    const medalIcon = medal(index)

                    return (

                        <div
                            key={member.user_id || index}
                            className={`
                                rounded-2xl p-6 border transition
                                hover:border-green-400 hover:shadow-[0_0_14px_rgba(74,222,128,0.25)]
                                ${isCurrentUser ? 'bg-zinc-800 border-green-500' : 'bg-zinc-900 border-zinc-800'}
                            `}
                        >

                            <div className="flex justify-between items-center">

                                <div>

                                    <p className="text-xs text-zinc-500 mb-1">
                                        Rank #{index + 1}
                                    </p>

                                    <p className="text-lg font-semibold flex items-center gap-2">

                                        {medalIcon && (
                                            <span className="text-xl">
                                                {medalIcon}
                                            </span>
                                        )}

                                        {member.username || 'User'}

                                        {isCurrentUser && (
                                            <span className="text-xs text-green-400 ml-2">
                                                (You)
                                            </span>
                                        )}

                                    </p>

                                    <p className="text-sm text-zinc-300 mt-1">
                                        {wins} correct picks, {losses} incorrect
                                    </p>

                                </div>

                                <div className="text-right">

                                    <p className="text-2xl font-bold text-white">
                                        {accuracy}%
                                    </p>

                                    <p className="text-xs text-zinc-500 mt-1">
                                        Pick Accuracy
                                    </p>

                                    <p className="text-xs text-zinc-500">
                                        {total} Picks
                                    </p>

                                </div>

                            </div>

                        </div>

                    )

                })}

            </div>

            {/* ✅ MOVED INVITE SECTION TO BOTTOM */}

            <div className="mb-6 space-y-3">

                <button
                    onClick={() => setShowInvite(!showInvite)}
                    className="
                        w-full bg-zinc-900 border border-zinc-800 rounded-xl py-3
                        hover:border-green-400
                        hover:shadow-[0_0_12px_rgba(74,222,128,0.6)]
                        transition
                    "
                >
                    Invite to League
                </button>

                {showInvite && (

                    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 space-y-3">

                        {!inviteCode && (
                            <button
                                onClick={createInvite}
                                disabled={creatingInvite}
                                className="w-full bg-black border border-zinc-700 rounded-lg py-2 hover:border-green-400"
                            >
                                {creatingInvite ? 'Creating...' : 'Generate Invite Code'}
                            </button>
                        )}

                        {inviteCode && (
                            <>
                                <div className="text-center text-lg font-semibold tracking-widest">
                                    {inviteCode}
                                </div>

                                <button
                                    onClick={copyCode}
                                    className="w-full bg-black border border-zinc-700 rounded-lg py-2 hover:border-green-400"
                                >
                                    Copy Code
                                </button>
                            </>
                        )}

                    </div>

                )}

            </div>

            <BottomNav />

        </div>

    )
}