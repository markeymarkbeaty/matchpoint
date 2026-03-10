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
    ResponsiveContainer
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

        // Reset state
        setJoined(false)
        setAvailable(0)
        setInvested(0)
        setActiveBets([])

        setLeaving(false)

        // Re-run initialization to allow rejoin
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

    const chartData = [
        { name: 'Start', value: 100 },
        { name: 'Invested', value: invested },
        { name: 'Available', value: available },
        { name: 'Total', value: available + invested }
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

            <div className="relative max-w-4xl mx-auto">

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
                                Turn your predictions into a savings habit. Correct picks invest
                                funds while incorrect picks simply return your money.
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

                        <section className="grid md:grid-cols-3 gap-8 mb-20">

                            <Feature
                                title="Allocate to Picks"
                                description="Choose how much to invest on predictions."
                            />

                            <Feature
                                title="Correct Picks Invest"
                                description="Winning predictions automatically invest funds."
                            />

                            <Feature
                                title="Incorrect Picks Return"
                                description="If you're wrong, your original funds return."
                            />

                        </section>

                    </>
                )}

                {joined && (

                    <div className="space-y-10">

                        {/* PORTFOLIO */}

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

                        {/* GRAPH */}

                        <section>

                            <h2 className="text-sm uppercase text-zinc-500 mb-3">
                                Portfolio Performance
                            </h2>

                            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 h-60">

                                <ResponsiveContainer width="100%" height="100%">
                                    <LineChart data={chartData}>
                                        <XAxis dataKey="name" stroke="#888" />
                                        <YAxis stroke="#888" />
                                        <Tooltip />
                                        <Line
                                            type="monotone"
                                            dataKey="value"
                                            stroke="#4ade80"
                                            strokeWidth={3}
                                        />
                                    </LineChart>
                                </ResponsiveContainer>

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

                        {/* OPT OUT */}

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