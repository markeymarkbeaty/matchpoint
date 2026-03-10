'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { supabase } from '@/lib/supabase'
import BottomNav from '@/components/BottomNav'

import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer,
    Legend
} from 'recharts'

export default function InvestPage() {

    const [joined, setJoined] = useState(false)
    const [loading, setLoading] = useState(true)

    const [available, setAvailable] = useState(0)
    const [invested, setInvested] = useState(0)

    const [joining, setJoining] = useState(false)
    const [leaving, setLeaving] = useState(false)

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
            .upsert({
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

        initialize()
    }

    async function loadActiveBets(userId: string) {

        const { data } = await supabase
            .from('prediction_investments')
            .select(`
        id,
        amount,
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

    const portfolioData = [
        { month: 'Start', HYSA: 100, ETF: 100 },
        { month: 'Month 1', HYSA: 101, ETF: 105 },
        { month: 'Month 2', HYSA: 102, ETF: 110 },
        { month: 'Month 3', HYSA: 103, ETF: 118 },
        { month: 'Month 4', HYSA: 104, ETF: 130 }
    ]

    if (loading) {
        return (
            <div className="min-h-screen bg-black text-white px-6 pt-14">
                Loading...
            </div>
        )
    }

    return (

        <main className="relative min-h-screen bg-black text-zinc-100 px-6 py-16 pb-32 overflow-hidden">

            <div className="max-w-4xl mx-auto">

                {!joined && (

                    <>
                        {/* HERO */}

                        <section className="text-center mb-16">

                            <motion.h1
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.4 }}
                                className="text-4xl md:text-6xl font-bold mb-6"
                            >
                                Bet Against Yourself
                            </motion.h1>

                            <p className="text-zinc-400 text-lg md:text-xl max-w-2xl mx-auto mb-8">
                                MatchPoint Investing turns predictions into a disciplined
                                investing habit. Correct picks invest funds, incorrect picks
                                simply return your money.
                            </p>

                            <button
                                onClick={joinInvesting}
                                disabled={joining}
                                className="bg-zinc-900 border border-green-400 text-green-300 font-semibold px-6 py-3 rounded-xl transition hover:shadow-[0_0_12px_rgba(74,222,128,0.6)]"
                            >
                                {joining ? 'Joining...' : 'Join Investing'}
                            </button>

                        </section>

                        {/* DIVIDER */}

                        <div className="h-px w-full bg-gradient-to-r from-transparent via-green-400 to-transparent mb-16 opacity-40" />

                        {/* FEATURES */}

                        <section className="grid md:grid-cols-3 gap-8 mb-16">

                            <Feature
                                title="Allocate to Picks"
                                description="Choose optional amounts to invest on predictions."
                            />

                            <Feature
                                title="Correct Picks Invest"
                                description="Winning predictions invest funds into your portfolio."
                            />

                            <Feature
                                title="Incorrect Picks Return"
                                description="Wrong picks return your original money."
                            />

                        </section>

                        {/* EXAMPLE CARD */}

                        <section className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8 mb-16">

                            <h2 className="text-xl font-semibold text-green-400 mb-4">
                                Example Prediction
                            </h2>

                            <div className="flex justify-between text-sm text-zinc-400 mb-2">
                                <span>Washington Spirit</span>
                                <span>vs</span>
                                <span>Portland Thorns</span>
                            </div>

                            <div className="text-sm text-zinc-500 mb-4">
                                Pick: Washington Spirit — Invest $10
                            </div>

                            <div className="grid grid-cols-2 gap-4 text-sm">

                                <div className="bg-zinc-800 rounded-xl p-4">
                                    <div className="text-green-400 font-semibold mb-1">
                                        Correct Pick
                                    </div>
                                    <div className="text-zinc-400">
                                        $10 invested into portfolio
                                    </div>
                                </div>

                                <div className="bg-zinc-800 rounded-xl p-4">
                                    <div className="text-red-400 font-semibold mb-1">
                                        Incorrect Pick
                                    </div>
                                    <div className="text-zinc-400">
                                        $10 returned to your balance
                                    </div>
                                </div>

                            </div>

                        </section>

                        {/* EXAMPLE GRAPH */}

                        <section className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8">

                            <h2 className="text-xl font-semibold text-green-400 mb-6">
                                Example Portfolio Growth
                            </h2>

                            <div className="h-64">

                                <ResponsiveContainer width="100%" height="100%">

                                    <LineChart data={portfolioData}>

                                        <XAxis dataKey="month" stroke="#aaa" />
                                        <YAxis stroke="#aaa" />

                                        <Tooltip />
                                        <Legend />

                                        <Line
                                            type="monotone"
                                            dataKey="HYSA"
                                            stroke="#4ade80"
                                            strokeWidth={3}
                                        />

                                        <Line
                                            type="monotone"
                                            dataKey="ETF"
                                            stroke="#60a5fa"
                                            strokeWidth={3}
                                        />

                                    </LineChart>

                                </ResponsiveContainer>

                            </div>

                        </section>

                    </>
                )}

                {joined && (

                    <div className="space-y-10">

                        <section className="grid grid-cols-2 gap-4">

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

                        </section>

                        {/* ACTIVE BETS */}

                        <section>

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

                        </section>

                        {/* INVESTMENT TYPE */}

                        <section>

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

                        </section>

                        <button
                            onClick={leaveInvesting}
                            disabled={leaving}
                            className="w-full py-3 rounded-xl border border-red-500 text-red-400 hover:shadow-[0_0_16px_rgba(239,68,68,0.6)] transition"
                        >
                            {leaving ? 'Leaving...' : 'Opt Out of Investing'}
                        </button>

                    </div>

                )}

            </div>

            <BottomNav />

        </main>

    )
}

function Feature({ title, description }: { title: string; description: string }) {

    return (
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 transition hover:border-green-400 hover:shadow-[0_0_14px_rgba(74,222,128,0.3)]">
            <h3 className="text-lg font-semibold mb-2 text-green-400">
                {title}
            </h3>
            <p className="text-zinc-400 text-sm leading-relaxed">
                {description}
            </p>
        </div>
    )
}