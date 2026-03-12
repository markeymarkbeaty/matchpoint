'use client'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import BottomNav from '@/components/BottomNav'

export default function InvestPicksPage() {
    return (
        <Suspense>
            <InvestPicksInner />
        </Suspense>
    )
}

function InvestPicksInner() {

    const params = useSearchParams()
    const mode = params.get('mode') || 'HYSA'

    const [matches, setMatches] = useState<any[]>([])
    const [picks, setPicks] = useState<any>({})
    const [bets, setBets] = useState<any>({})
    const [available, setAvailable] = useState(0)

    useEffect(() => {
        initialize()
    }, [])

    async function initialize() {
        await loadMatches()
        await loadPicks()
        await loadBalanceAndBets()
    }

    async function loadMatches() {

        const { data } = await supabase
            .from('matches')
            .select('*')
            .order('date', { ascending: true })

        if (data) setMatches(data)
    }

    async function loadPicks() {

        const { data: userData } = await supabase.auth.getUser()
        const user = userData.user
        if (!user) return

        const { data } = await supabase
            .from('picks')
            .select('*')
            .eq('user_id', user.id)

        const map: any = {}

        data?.forEach(p => {
            map[p.match_id] = p
        })

        setPicks(map)
    }

    async function loadBalanceAndBets() {

        const { data: userData } = await supabase.auth.getUser()
        const user = userData.user
        if (!user) return

        const { data: account } = await supabase
            .from('user_investment_accounts')
            .select('balance_available')
            .eq('user_id', user.id)
            .single()

        const baseBalance = account?.balance_available || 0

        const { data: betData } = await supabase
            .from('prediction_investments')
            .select('*')
            .eq('user_id', user.id)

        const betMap: any = {}
        let totalBet = 0

        betData?.forEach(b => {
            betMap[b.match_id] = b.amount
            totalBet += Number(b.amount)
        })

        setBets(betMap)

        setAvailable(baseBalance - totalBet)
    }

    async function toggleBet(matchId: string, amount: number) {

        const { data: userData } = await supabase.auth.getUser()
        const user = userData.user
        if (!user) return

        const current = bets[matchId] || 0
        let balance = available

        if (current === amount) {

            await supabase
                .from('prediction_investments')
                .delete()
                .eq('user_id', user.id)
                .eq('match_id', matchId)

            const updated = { ...bets }
            delete updated[matchId]
            setBets(updated)

            balance += amount
            setAvailable(balance)

            return
        }

        if (balance < amount) return

        const pick = picks[matchId]
        if (!pick) return

        await supabase
            .from('prediction_investments')
            .upsert({
                user_id: user.id,
                match_id: matchId,
                pick_id: pick.id,
                amount,
                status: 'pending'
            })

        setBets({
            ...bets,
            [matchId]: amount
        })

        if (current) balance += current
        balance -= amount

        setAvailable(balance)
    }

    function formatDate(dateString: string) {

        const date = new Date(dateString)

        return date.toLocaleString('en-US', {
            weekday: 'short',
            month: 'short',
            day: 'numeric',
            hour: 'numeric',
            minute: '2-digit'
        })
    }

    function getMatchWeek(dateString: string) {

        const SEASON_START = new Date('2026-03-15')

        const matchDate = new Date(dateString)

        const diff = matchDate.getTime() - SEASON_START.getTime()

        const week = Math.floor(diff / (7 * 24 * 60 * 60 * 1000)) + 1

        return Math.max(1, week)
    }

    const now = new Date()

    const upcomingMatches = matches.filter(
        m => new Date(m.date) > now
    )

    const groupedMatches = upcomingMatches.reduce((acc: any, match: any) => {

        const week = getMatchWeek(match.date)

        if (!acc[week]) acc[week] = []

        acc[week].push(match)

        return acc

    }, {})

    const nextWeeks = Object.keys(groupedMatches).slice(0, 2)

    function MatchCard(match: any) {

        const kickoff = new Date(match.date)
        const locked = new Date() >= kickoff

        const userPick = picks[match.id]?.selected_team
        const betAmount = bets[match.id]

        return (

            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">

                <div className="text-center mb-5">

                    <div className="text-lg italic font-semibold text-zinc-300">
                        {formatDate(match.date)}
                    </div>

                    {match.stadium && (
                        <div className="text-xs text-zinc-500 mt-1">
                            {match.stadium}
                            {match.city && ` — ${match.city}${match.state ? `, ${match.state}` : ''}`}
                        </div>
                    )}

                </div>

                <div className="grid grid-cols-3 gap-3 mb-4">

                    {['home', 'draw', 'away'].map(team => {

                        const selected = userPick === team

                        return (

                            <button
                                key={team}
                                disabled
                                className={`relative py-2 rounded-xl border ${selected
                                        ? 'border-green-400 text-green-300 shadow-[0_0_10px_rgba(74,222,128,0.6)]'
                                        : 'border-zinc-700 text-white'
                                    }`}
                            >

                                {team.charAt(0).toUpperCase() + team.slice(1)}

                                {selected && (
                                    <span className="absolute right-2 top-1 text-sm text-green-300">
                                        ✓
                                    </span>
                                )}

                            </button>

                        )

                    })}

                </div>

                <div className="flex gap-3">

                    {[5, 25, 50, 100].map(amount => {

                        const active = betAmount === amount

                        return (

                            <button
                                key={amount}
                                disabled={locked || !userPick}
                                onClick={() => toggleBet(match.id, amount)}
                                className={`px-4 py-2 rounded-xl border transition ${active
                                        ? 'border-green-400 text-green-300 shadow-[0_0_16px_rgba(74,222,128,0.7)]'
                                        : 'border-zinc-700 hover:border-green-400'
                                    }`}
                            >

                                ${amount}

                            </button>

                        )

                    })}

                </div>

            </div>

        )
    }

    return (

        <div className="min-h-screen bg-black text-white px-6 pt-14 pb-32">

            <div className="sticky top-0 bg-black pb-6 z-40">

                <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 flex justify-between items-center">

                    <div>
                        <div className="text-xs text-zinc-500">Bet Mode</div>
                        <div className="text-green-400 font-semibold text-lg">{mode}</div>
                    </div>

                    <div className="text-right">
                        <div className="text-xs text-zinc-500">Available</div>
                        <div className="text-green-400 font-bold text-xl">
                            ${available.toFixed(2)}
                        </div>
                    </div>

                </div>

            </div>

            {nextWeeks.map((week) => (
                <div key={week}>

                    <h2 className="text-lg font-semibold text-zinc-400 mb-4">
                        Upcoming Matchweek {week}
                    </h2>

                    <div className="space-y-6 mb-10">

                        {groupedMatches[week].map((match: any) => (
                            <MatchCard key={match.id} {...match} />
                        ))}

                    </div>

                </div>
            ))}

            <BottomNav />

        </div>

    )
}