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
    const otherMode = mode === 'HYSA' ? 'ETF' : 'HYSA'

    const [user, setUser] = useState<any>(null)

    const [matches, setMatches] = useState<any[]>([])
    const [picks, setPicks] = useState<any>({})

    const [bets, setBets] = useState<any>({})
    const [hysaBets, setHysaBets] = useState<any>({})
    const [etfBets, setEtfBets] = useState<any>({})

    const [modeTotal, setModeTotal] = useState(0)

    const [available, setAvailable] = useState(0)
    const [otherTotal, setOtherTotal] = useState(0)

    useEffect(() => {
        initialize()
    }, [])

    async function initialize() {

        const { data } = await supabase.auth.getUser()

        if (!data?.user) return

        setUser(data.user)

        await loadMatches()
        await loadPicks(data.user.id)
        await loadBalanceAndBets(data.user.id)
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

    async function loadBalanceAndBets(userId: string) {

        const { data: account } = await supabase
            .from('user_investment_accounts')
            .select('balance_available')
            .eq('user_id', userId)
            .single()

        const baseBalance = account?.balance_available || 0

        const { data: allBets } = await supabase
            .from('prediction_investments')
            .select('*')
            .eq('user_id', userId)

        let totalBet = 0
        let otherModeTotal = 0
        let currentModeTotal = 0

        const hysaMap: any = {}
        const etfMap: any = {}

        allBets?.forEach(b => {

            const amt = Number(b.amount)

            totalBet += amt

            if (b.account_type === 'HYSA') {
                hysaMap[b.match_id] = amt
            }

            if (b.account_type === 'ETF') {
                etfMap[b.match_id] = amt
            }

            if (b.account_type === mode) {
                currentModeTotal += amt
            }

            if (b.account_type === otherMode) {
                otherModeTotal += amt
            }

        })

        setHysaBets(hysaMap)
        setEtfBets(etfMap)

        setBets(mode === 'HYSA' ? hysaMap : etfMap)

        setModeTotal(currentModeTotal)

        setOtherTotal(otherModeTotal)
        setAvailable(baseBalance - totalBet)
    }

    async function toggleBet(matchId: string, amount: number) {

        if (!user) return

        const current = bets[matchId] || 0
        let balance = available

        if (current === amount) {

            await supabase
                .from('prediction_investments')
                .delete()
                .eq('user_id', user.id)
                .eq('match_id', matchId)
                .eq('account_type', mode)

            const updated = { ...bets }
            delete updated[matchId]
            setBets(updated)

            // 🔧 UPDATE CHIP STATE
            if (mode === 'HYSA') {
                const updatedHysa = { ...hysaBets }
                delete updatedHysa[matchId]
                setHysaBets(updatedHysa)
            } else {
                const updatedEtf = { ...etfBets }
                delete updatedEtf[matchId]
                setEtfBets(updatedEtf)
            }

            balance += amount
            setAvailable(balance)

            return
        }

        if (balance < amount) return

        const pick = picks[matchId]
        if (!pick) return

        await supabase
            .from('prediction_investments')
            .upsert(
                {
                    user_id: user.id,
                    match_id: matchId,
                    pick_id: pick.id,
                    amount,
                    account_type: mode,
                    status: 'pending'
                },
                {
                    onConflict: 'user_id,match_id,account_type'
                }
            )

        setBets({
            ...bets,
            [matchId]: amount
        })

        // 🔧 UPDATE CHIP STATE
        if (mode === 'HYSA') {
            setHysaBets({
                ...hysaBets,
                [matchId]: amount
            })
        } else {
            setEtfBets({
                ...etfBets,
                [matchId]: amount
            })
        }

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

    const now = new Date()

    const upcomingMatches = matches.filter(
        m => new Date(m.date) > now
    )

    function MatchCard(match: any) {

        const userPick = picks[match.id]?.selected_team
        const betAmount = bets[match.id]

        const hysaBet = hysaBets[match.id] || 0
        const etfBet = etfBets[match.id] || 0

        return (

            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">

                <div className="text-center mb-5">

                    <div className="text-lg italic font-semibold text-zinc-300">
                        {formatDate(match.date)}
                    </div>

                </div>

                <div className="grid grid-cols-3 items-center mb-4">

                    <div className="flex items-center gap-2">
                        {match.home_logo && (
                            <img src={match.home_logo} className="w-8 h-8" />
                        )}
                        {match.home_team}
                    </div>

                    <div className="text-center text-zinc-500">VS</div>

                    <div className="flex items-center justify-end gap-2">
                        {match.away_team}
                        {match.away_logo && (
                            <img src={match.away_logo} className="w-8 h-8" />
                        )}
                    </div>

                </div>

                {(hysaBet > 0 || etfBet > 0) && (

                    <div className="flex justify-center gap-3 mb-4">

                        {hysaBet > 0 && (
                            <div className="px-3 py-1 rounded-full text-xs border border-green-400 text-green-300 shadow-[0_0_10px_rgba(74,222,128,0.6)]">
                                HYSA ${hysaBet.toFixed(2)}
                            </div>
                        )}

                        {etfBet > 0 && (
                            <div className="px-3 py-1 rounded-full text-xs border border-green-400 text-green-300 shadow-[0_0_10px_rgba(74,222,128,0.6)]">
                                ETF ${etfBet.toFixed(2)}
                            </div>
                        )}

                    </div>

                )}

                <div className="flex gap-3 justify-center">

                    {[5, 25, 50, 100].map(amount => {

                        const active = betAmount === amount

                        return (

                            <button
                                key={amount}
                                onClick={() => toggleBet(match.id, amount)}
                                className={`px-4 py-2 rounded-xl border ${active
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

            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 mb-8 flex justify-between">

                <div>
                    <div className="text-xs text-zinc-500">Bet Mode</div>
                    <div className="text-green-400 font-semibold">{mode}</div>
                    <div className="text-xs text-zinc-500">
                        ${modeTotal.toFixed(2)} currently bet
                    </div>
                </div>

                <div className="text-right">
                    <div className="text-xs text-zinc-500">Available</div>
                    <div className="text-green-400 font-bold">
                        ${available.toFixed(2)}
                    </div>
                    <div className="text-xs text-zinc-500">
                        ({otherMode}: ${otherTotal.toFixed(2)})
                    </div>
                </div>

            </div>

            <div className="space-y-6">

                {upcomingMatches.map(match => (
                    <MatchCard key={match.id} {...match} />
                ))}

            </div>

            <BottomNav />

        </div>

    )
}