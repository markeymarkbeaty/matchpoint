'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import BottomNav from '@/components/BottomNav'

export default function InvestPage() {

    const [joined, setJoined] = useState(false)
    const [loading, setLoading] = useState(true)
    const [joining, setJoining] = useState(false)
    const [leaving, setLeaving] = useState(false)

    const [available, setAvailable] = useState(0)
    const [invested, setInvested] = useState(0)

    const [investmentType, setInvestmentType] = useState('HYSA')

    const [activeBets, setActiveBets] = useState<any[]>([])

    useEffect(() => {
        initialize()
    }, [])

    async function initialize() {

        const { data: { user } } = await supabase.auth.getUser()

        if (!user) return

        const { data: account } = await supabase
            .from('user_investment_accounts')
            .select('*')
            .eq('user_id', user.id)
            .maybeSingle()

        if (account) {

            setJoined(true)

            setAvailable(account.balance_available)
            setInvested(account.balance_invested)

            if (account.account_type) {
                setInvestmentType(account.account_type)
            }

            loadActiveBets(user.id)
        }

        setLoading(false)
    }

    async function joinInvesting() {

        setJoining(true)

        const { data: { user } } = await supabase.auth.getUser()

        if (!user) return

        const { error } = await supabase
            .from('user_investment_accounts')
            .insert({
                user_id: user.id,
                balance_available: 100,
                balance_invested: 0,
                account_type: 'HYSA'
            })

        if (!error) {
            setJoined(true)
            setAvailable(100)
        }

        setJoining(false)
    }

    async function leaveInvesting() {

        setLeaving(true)

        const { data: { user } } = await supabase.auth.getUser()

        if (!user) return

        await supabase
            .from('user_investment_accounts')
            .delete()
            .eq('user_id', user.id)

        setJoined(false)
        setAvailable(0)
        setInvested(0)
        setActiveBets([])

        setLeaving(false)
    }

    async function loadActiveBets(userId: string) {

        const { data } = await supabase
            .from('prediction_investments')
            .select(`
        id,
        amount,
        match_id,
        matches (
          home_team,
          away_team
        )
      `)
            .eq('user_id', userId)
            .eq('status', 'pending')

        if (data) setActiveBets(data)
    }

    async function changeInvestmentType(type: string) {

        const { data: { user } } = await supabase.auth.getUser()

        if (!user) return

        await supabase
            .from('user_investment_accounts')
            .update({ account_type: type })
            .eq('user_id', user.id)

        setInvestmentType(type)
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-black text-white px-6 pt-14">
                Loading...
            </div>
        )
    }

    return (

        <div className="min-h-screen bg-black text-white px-6 pt-14 pb-32">

            <h1 className="text-3xl font-semibold mb-10">
                Investing
            </h1>

            {!joined && (

                <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 space-y-6">

                    <h2 className="text-xl font-semibold text-green-400">
                        Bet Against Yourself
                    </h2>

                    <p className="text-zinc-400">
                        Allocate money to your predictions. Correct picks invest the money.
                        Incorrect picks return your funds. No money is lost.
                    </p>

                    <ul className="text-zinc-400 text-sm space-y-1">
                        <li>• Optional investing</li>
                        <li>• Correct picks invest funds</li>
                        <li>• Incorrect picks return funds</li>
                        <li>• Learn disciplined investing</li>
                    </ul>

                    <button
                        onClick={joinInvesting}
                        disabled={joining}
                        className="
            w-full py-3 rounded-xl border border-zinc-700
            hover:border-green-400
            hover:shadow-[0_0_16px_rgba(74,222,128,0.5)]
            transition
            "
                    >
                        {joining ? 'Joining...' : 'Join Investing'}
                    </button>

                </div>

            )}

            {joined && (

                <div className="space-y-8">

                    {/* ACCOUNT SUMMARY */}

                    <div className="grid grid-cols-2 gap-4">

                        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">

                            <div className="text-xs text-zinc-500 mb-1">
                                Available Capital
                            </div>

                            <div className="text-xl font-semibold text-green-400">
                                ${available}
                            </div>

                        </div>

                        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">

                            <div className="text-xs text-zinc-500 mb-1">
                                Invested Capital
                            </div>

                            <div className="text-xl font-semibold text-green-400">
                                ${invested}
                            </div>

                        </div>

                    </div>

                    {/* ACTIVE BETS */}

                    <div>

                        <h2 className="text-sm uppercase text-zinc-500 mb-3">
                            Active Bets
                        </h2>

                        <div className="space-y-3">

                            {activeBets.length === 0 && (

                                <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 text-zinc-400 text-sm">
                                    No active bets.
                                </div>

                            )}

                            {activeBets.map((bet, i) => (

                                <div
                                    key={i}
                                    className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 flex justify-between"
                                >

                                    <div className="text-zinc-400 text-sm">
                                        {bet.matches?.home_team} vs {bet.matches?.away_team}
                                    </div>

                                    <div className="text-green-400 font-semibold">
                                        ${bet.amount}
                                    </div>

                                </div>

                            ))}

                        </div>

                    </div>

                    {/* INVESTMENT TYPE */}

                    <div>

                        <h2 className="text-sm uppercase text-zinc-500 mb-3">
                            Investment Type
                        </h2>

                        <div className="grid grid-cols-2 gap-3">

                            {['HYSA', 'ETF'].map((type) => {

                                const selected = investmentType === type

                                return (

                                    <button
                                        key={type}
                                        onClick={() => changeInvestmentType(type)}
                                        className={`py-3 rounded-xl border transition ${selected
                                                ? 'border-green-400 text-green-300 shadow-[0_0_10px_rgba(74,222,128,0.5)]'
                                                : 'border-zinc-700 hover:border-green-400'
                                            }`}
                                    >
                                        {type}
                                    </button>

                                )

                            })}

                        </div>

                    </div>

                    {/* PERFORMANCE GRAPH */}

                    <div>

                        <h2 className="text-sm uppercase text-zinc-500 mb-3">
                            Performance
                        </h2>

                        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 text-center text-zinc-400 text-sm">
                            Portfolio performance graph coming soon.
                        </div>

                    </div>

                    {/* OPT OUT */}

                    <button
                        onClick={leaveInvesting}
                        disabled={leaving}
                        className="
            w-full py-3 rounded-xl border border-red-500 text-red-400
            hover:shadow-[0_0_16px_rgba(239,68,68,0.6)]
            transition
            "
                    >
                        {leaving ? 'Leaving...' : 'Opt Out of Investing'}
                    </button>

                </div>

            )}

            <BottomNav />

        </div>

    )

}