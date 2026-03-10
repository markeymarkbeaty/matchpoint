'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { supabase } from '@/lib/supabase'
import BottomNav from '@/components/BottomNav'

import {
    ResponsiveContainer,
    AreaChart,
    Area,
    XAxis,
    YAxis,
    Tooltip,
    CartesianGrid
} from 'recharts'

export default function InvestPage() {

    const STARTING_CAPITAL = 100

    const [joined, setJoined] = useState(false)
    const [loading, setLoading] = useState(true)

    const [available, setAvailable] = useState(0)
    const [invested, setInvested] = useState(0)

    const [joining, setJoining] = useState(false)
    const [leaving, setLeaving] = useState(false)

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

            loadActiveBets(user.id)

        }

        setLoading(false)
    }

    async function joinInvesting() {

        setJoining(true)

        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
            console.log("No user")
            return
        }

        const { data, error } = await supabase
            .from('user_investment_accounts')
            .upsert({
                user_id: user.id,
                balance_available: STARTING_CAPITAL,
                balance_invested: 0
            })
            .select()

        if (error) {
            console.error("Join investing error:", error)
            setJoining(false)
            return
        }

        if (data) {
            setJoined(true)
            setAvailable(STARTING_CAPITAL)
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

    const portfolioValue = available + invested
    const gain = portfolioValue - STARTING_CAPITAL
    const gainPercent = ((gain / STARTING_CAPITAL) * 100).toFixed(2)

    const chartData = [
        { week: 'Start', value: 100 },
        { week: 'Week 2', value: 102 },
        { week: 'Week 4', value: 105 },
        { week: 'Week 6', value: 108 },
        { week: 'Week 8', value: 112 },
        { week: 'Week 10', value: 118 }
    ]

    if (loading) {
        return (
            <div className="min-h-screen bg-black text-white px-6 pt-14">
                Loading...
            </div>
        )
    }

    return (

        <main className="relative min-h-screen bg-black text-zinc-100 px-6 py-16 pb-32">

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
                                Turn predictions into a disciplined investing habit.
                                Correct picks invest funds while incorrect picks return your money.
                            </p>

                            <button
                                onClick={joinInvesting}
                                disabled={joining}
                                className="bg-zinc-900 border border-green-400 text-green-300 font-semibold px-6 py-3 rounded-xl transition hover:shadow-[0_0_12px_rgba(74,222,128,0.6)]"
                            >
                                {joining ? 'Joining...' : 'Join Investing'}
                            </button>

                        </section>

                        {/* Example Chart */}

                        <section className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8">

                            <h2 className="text-xl font-semibold text-green-400 mb-6">
                                Example Portfolio Growth
                            </h2>

                            <div className="h-72 min-h-[280px]">

                                <ResponsiveContainer width="100%" height="100%">

                                    <AreaChart data={chartData}>

                                        <defs>
                                            <linearGradient id="gain" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#4ade80" stopOpacity={0.8} />
                                                <stop offset="95%" stopColor="#4ade80" stopOpacity={0} />
                                            </linearGradient>
                                        </defs>

                                        <CartesianGrid strokeDasharray="3 3" stroke="#222" />

                                        <XAxis dataKey="week" stroke="#888" />
                                        <YAxis stroke="#888" />

                                        <Tooltip />

                                        <Area
                                            type="monotone"
                                            dataKey="value"
                                            stroke="#4ade80"
                                            fillOpacity={1}
                                            fill="url(#gain)"
                                            strokeWidth={3}
                                        />

                                    </AreaChart>

                                </ResponsiveContainer>

                            </div>

                        </section>

                    </>
                )}

                {joined && (

                    <div className="space-y-10">

                        {/* STARTING CAPITAL */}

                        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 text-center">

                            <div className="text-sm text-zinc-500 mb-1">
                                Starting Capital
                            </div>

                            <div className="text-2xl font-semibold text-zinc-200">
                                ${STARTING_CAPITAL}
                            </div>

                        </div>

                        {/* PORTFOLIO VALUE */}

                        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8 text-center">

                            <div className="text-sm text-zinc-500 mb-1">
                                Portfolio Value
                            </div>

                            <div className="text-4xl font-bold text-green-400 mb-2">
                                ${portfolioValue.toFixed(2)}
                            </div>

                            <div className={`text-sm ${gain >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                {gain >= 0 ? '+' : ''}{gain.toFixed(2)} ({gainPercent}%)
                            </div>

                        </div>

                        {/* PERFORMANCE CHART */}

                        <section>

                            <h2 className="text-sm uppercase text-zinc-500 mb-3">
                                Portfolio Performance
                            </h2>

                            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 h-72 min-h-[280px]">

                                <ResponsiveContainer width="100%" height="100%">

                                    <AreaChart data={chartData}>

                                        <defs>
                                            <linearGradient id="gainReal" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#4ade80" stopOpacity={0.8} />
                                                <stop offset="95%" stopColor="#4ade80" stopOpacity={0} />
                                            </linearGradient>
                                        </defs>

                                        <CartesianGrid strokeDasharray="3 3" stroke="#222" />

                                        <XAxis dataKey="week" stroke="#888" />
                                        <YAxis stroke="#888" />

                                        <Tooltip />

                                        <Area
                                            type="monotone"
                                            dataKey="value"
                                            stroke="#4ade80"
                                            fillOpacity={1}
                                            fill="url(#gainReal)"
                                            strokeWidth={3}
                                        />

                                    </AreaChart>

                                </ResponsiveContainer>

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