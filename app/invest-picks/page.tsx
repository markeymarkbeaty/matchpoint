'use client'

import { useEffect, useState, Suspense } from 'react'
import { supabase } from '@/lib/supabase'
import BottomNav from '@/components/BottomNav'

type Match = {
    id: string
    home_team: string
    away_team: string
    home_logo: string | null
    away_logo: string | null
    stadium: string | null
    city: string | null
    state: string | null
    date: string
    result: string | null
}

export default function InvestPicksPage() {
    return (
        <Suspense>
            <InvestPicksInner />
        </Suspense>
    )
}

function InvestPicksInner() {

    const [user, setUser] = useState<any>(null)

    const [matches, setMatches] = useState<Match[]>([])
    const [picks, setPicks] = useState<any>({})

    const [bets, setBets] = useState<any>({})
    const [available, setAvailable] = useState(0)

    const [tab, setTab] = useState<'upcoming' | 'results'>('upcoming')

    useEffect(() => {
        initialize()
    }, [])

    async function initialize() {

        const { data } = await supabase.auth.getUser()
        if (!data?.user) return

        setUser(data.user)

        await ensureStartingBalance(data.user.id)
        await loadMatches()
        await loadPicks(data.user.id)
        await loadBets(data.user.id)
    }

    async function ensureStartingBalance(userId: string) {
        const { data } = await supabase
            .from('user_investment_accounts')
            .select('*')
            .eq('user_id', userId)
            .single()

        if (!data) {
            await supabase.from('user_investment_accounts').insert({
                user_id: userId,
                balance_available: 1000
            })
            return
        }

        if (data.balance_available === 100) {
            await supabase
                .from('user_investment_accounts')
                .update({ balance_available: 1000 })
                .eq('user_id', userId)
        }
    }

    async function loadMatches() {
        const { data } = await supabase
            .from('matches')
            .select('*')
            .order('date', { ascending: true })

        if (data) setMatches(data)
    }

    async function loadPicks(userId: string) {
        const { data } = await supabase
            .from('picks')
            .select('*')
            .eq('user_id', userId)

        const map: any = {}
        data?.forEach(p => {
            map[p.match_id] = p
        })

        setPicks(map)
    }

    async function loadBets(userId: string) {

        const { data: account } = await supabase
            .from('user_investment_accounts')
            .select('balance_available')
            .eq('user_id', userId)
            .single()

        const baseBalance = account?.balance_available || 0

        const { data } = await supabase
            .from('prediction_investments')
            .select('*')
            .eq('user_id', userId)

        const map: any = {}
        let total = 0

        data?.forEach(b => {
            if (!map[b.match_id]) map[b.match_id] = { HYSA: 0, ETF: 0 }
            map[b.match_id][b.account_type] = b.amount
            total += Number(b.amount)
        })

        setBets(map)
        setAvailable(baseBalance - total)
    }

    async function toggleBet(matchId: string, amount: number, type: 'HYSA' | 'ETF') {

        const pick = picks[matchId]
        if (!pick) {
            alert('Make a pick first.')
            return
        }

        const current = bets[matchId]?.[type] || 0
        let balance = available

        if (current === amount) {
            await supabase
                .from('prediction_investments')
                .delete()
                .eq('user_id', user.id)
                .eq('match_id', matchId)
                .eq('account_type', type)

            setBets({
                ...bets,
                [matchId]: {
                    ...(bets[matchId] || {}),
                    [type]: 0
                }
            })

            setAvailable(balance + amount)
            return
        }

        if (balance < amount) return

        await supabase
            .from('prediction_investments')
            .upsert({
                user_id: user.id,
                match_id: matchId,
                pick_id: pick.id,
                amount,
                account_type: type,
                status: 'pending'
            }, {
                onConflict: 'user_id,match_id,account_type'
            })

        setBets({
            ...bets,
            [matchId]: {
                ...(bets[matchId] || {}),
                [type]: amount
            }
        })

        if (current) balance += current
        balance -= amount

        setAvailable(balance)
    }

    function formatDate(dateString: string) {
        return new Date(dateString).toLocaleString('en-US', {
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
        return Math.max(1, Math.floor(diff / (7 * 24 * 60 * 60 * 1000)) + 1)
    }

    const now = new Date()

    const displayedMatches = matches.filter(m =>
        tab === 'upcoming'
            ? new Date(m.date) > now
            : new Date(m.date) <= now
    )

    const groupedMatches = displayedMatches.reduce((acc: any, match) => {
        const week = getMatchWeek(match.date)
        if (!acc[week]) acc[week] = []
        acc[week].push(match)
        return acc
    }, {})

    // ✅ ADDITIVE COUNTER LOGIC
    let hysaTotal = 0
    let etfTotal = 0
    let investedTotal = 0
    let returnedTotal = 0

    displayedMatches.forEach(match => {
        const bet = bets[match.id]
        if (!bet) return

        const hysa = bet.HYSA || 0
        const etf = bet.ETF || 0

        hysaTotal += hysa
        etfTotal += etf

        const pick = picks[match.id]?.selected_team
        const correct =
            pick &&
            match.result &&
            pick === match.result

        if (tab === 'results') {
            if (correct) investedTotal += hysa + etf
            else returnedTotal += hysa + etf
        }
    })

    const totalBet = hysaTotal + etfTotal

    function MatchCard(match: Match) {

        const userPick = picks[match.id]?.selected_team

        const hysa = bets[match.id]?.HYSA || 0
        const etf = bets[match.id]?.ETF || 0

        const correct =
            userPick &&
            match.result &&
            userPick === match.result

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

                <div className="grid grid-cols-3 items-center mb-4">
                    <div className="flex items-center gap-3">
                        {match.home_logo && <img src={match.home_logo} className="w-9 h-9" />}
                        <span className="font-semibold">{match.home_team}</span>
                    </div>

                    <div className="text-center text-zinc-500 text-sm">VS</div>

                    <div className="flex items-center justify-end gap-3">
                        <span className="font-semibold">{match.away_team}</span>
                        {match.away_logo && <img src={match.away_logo} className="w-9 h-9" />}
                    </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                    {['home', 'draw', 'away'].map(team => {

                        const selected = userPick === team
                        const isWinner = match.result === team

                        return (
                            <button
                                key={team}
                                disabled={tab === 'results'}
                                className={`relative py-2 rounded-xl border text-white ${selected
                                    ? 'border-green-400 text-green-300 shadow-[0_0_10px_rgba(74,222,128,0.6)]'
                                    : 'border-zinc-700'
                                    } ${tab === 'results' && isWinner
                                        ? 'bg-green-500/10'
                                        : ''
                                    }`}
                            >
                                {team}

                                {selected && (
                                    <span className="absolute right-2 top-1 text-green-300">✓</span>
                                )}

                                {tab === 'results' && isWinner && (
                                    <span className="absolute left-2 top-1 text-green-400">★</span>
                                )}
                            </button>
                        )
                    })}
                </div>

                {tab === 'upcoming' && (
                    <div className="space-y-3 mt-4">

                        <div className="flex items-center justify-center gap-3">
                            <span className="text-xs text-white">HYSA</span>
                            {[5, 10, 20].map(amount => {
                                const active = hysa === amount
                                return (
                                    <button
                                        key={`h-${amount}`}
                                        onClick={() => toggleBet(match.id, amount, 'HYSA')}
                                        className={`px-4 py-2 rounded-xl border ${active
                                            ? 'border-blue-400 text-blue-300 shadow-[0_0_10px_rgba(96,165,250,0.6)]'
                                            : 'border-zinc-700'
                                            }`}
                                    >
                                        ${amount}
                                    </button>
                                )
                            })}
                        </div>

                        <div className="flex items-center justify-center gap-3">
                            <span className="text-xs text-white">ETF</span>
                            {[5, 10, 20].map(amount => {
                                const active = etf === amount
                                return (
                                    <button
                                        key={`e-${amount}`}
                                        onClick={() => toggleBet(match.id, amount, 'ETF')}
                                        className={`px-4 py-2 rounded-xl border ${active
                                            ? 'border-purple-400 text-purple-300 shadow-[0_0_10px_rgba(192,132,252,0.6)]'
                                            : 'border-zinc-700'
                                            }`}
                                    >
                                        ${amount}
                                    </button>
                                )
                            })}
                        </div>

                    </div>
                )}

                {tab === 'results' && match.result && (
                    <div className="space-y-2 mt-4 text-center text-sm">

                        <div className={`font-medium ${correct ? 'text-green-400' : 'text-red-400'}`}>
                            {correct ? '✓ Correct Pick' : '✕ Incorrect Pick'}
                        </div>

                        <div>
                            HYSA: {hysa > 0
                                ? correct ? `$${hysa} Invested` : `$${hysa} Returned`
                                : 'No bet'}
                        </div>

                        <div>
                            ETF: {etf > 0
                                ? correct ? `$${etf} Invested` : `$${etf} Returned`
                                : 'No bet'}
                        </div>

                    </div>
                )}

            </div>
        )
    }

    return (
        <div className="min-h-screen bg-black text-white px-6 pt-14 pb-32">

            <h1 className="text-3xl font-semibold mb-2">Invest</h1>

            {/* ✅ NEW COUNTER UI */}
            <div className="text-zinc-400 text-sm mb-6 space-y-1">
                <div>HYSA: ${hysaTotal}</div>
                <div>ETF: ${etfTotal}</div>
                <div>Total Bet: ${totalBet}</div>

                {tab === 'results' && (
                    <>
                        <div className="text-green-400">Invested: ${investedTotal}</div>
                        <div>Returned: ${returnedTotal}</div>
                    </>
                )}
            </div>

            <div className="flex gap-3 mb-6">
                {['upcoming', 'results'].map(t => (
                    <button
                        key={t}
                        onClick={() => setTab(t as any)}
                        className={`px-4 py-2 rounded-xl border ${tab === t
                            ? 'border-green-400 text-green-300 shadow-[0_0_10px_rgba(74,222,128,0.6)]'
                            : 'border-zinc-700'
                            }`}
                    >
                        {t === 'upcoming' ? 'Upcoming' : 'Results'}
                    </button>
                ))}
            </div>

            {Object.keys(groupedMatches).map((week) => (
                <div key={week}>
                    <h2 className="text-lg font-semibold text-zinc-400 mb-4">
                        Matchweek {week}
                    </h2>

                    <div className="space-y-6 mb-10">
                        {groupedMatches[week].map((match: Match) => (
                            <MatchCard key={match.id} {...match} />
                        ))}
                    </div>
                </div>
            ))}

            <BottomNav />

        </div>
    )
}